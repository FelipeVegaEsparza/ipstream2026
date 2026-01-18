import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ScriptManager } from "@/lib/services/scriptManager";
import path from "path";

// POST /api/stream/stop - Detener AutoDJ
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { client: true },
    });

    if (!user?.client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const clientId = user.client.id;

    // Obtener configuración
    const config = await prisma.streamConfig.findUnique({
      where: { clientId },
      include: { server: true },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Configuración de streaming no encontrada" },
        { status: 404 }
      );
    }

    if (config.status !== "active") {
      return NextResponse.json(
        { error: "El stream no está activo" },
        { status: 400 }
      );
    }

    console.log(`Deteniendo stream para cliente ${clientId}...`);

    try {
      // 1. Eliminar script de Liquidsoap
      console.log("Eliminando script...");
      const scriptsDir = path.join(process.cwd(), "docker", "liquidsoap", "scripts", "clients");
      const scriptManager = new ScriptManager(scriptsDir);
      await scriptManager.deleteScript(clientId);

      // 2. Reiniciar Liquidsoap para descargar el script
      console.log("Reiniciando Liquidsoap...");
      const restarted = await scriptManager.restartLiquidsoap();

      if (!restarted) {
        throw new Error("No se pudo reiniciar Liquidsoap");
      }

      // 3. Actualizar estado a inactivo
      await prisma.streamConfig.update({
        where: { clientId },
        data: { 
          status: "inactive",
          lastError: null,
        },
      });

      console.log(`Stream detenido exitosamente para cliente ${clientId}`);

      return NextResponse.json({
        success: true,
        message: "Stream detenido exitosamente",
      });
    } catch (stopError) {
      console.error("Error en el proceso de detención:", stopError);

      // Actualizar estado a error
      await prisma.streamConfig.update({
        where: { clientId },
        data: { 
          status: "error",
          lastError: stopError instanceof Error ? stopError.message : "Error desconocido",
        },
      });

      return NextResponse.json(
        { 
          error: "Error al detener el stream",
          details: stopError instanceof Error ? stopError.message : "Error desconocido",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error stopping stream:", error);
    return NextResponse.json(
      { error: "Error al detener stream" },
      { status: 500 }
    );
  }
}

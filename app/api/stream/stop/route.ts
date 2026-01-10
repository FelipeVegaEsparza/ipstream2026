import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LiquidsoapService } from "@/lib/services/liquidsoap";

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

    // Actualizar estado a inactivo
    await prisma.streamConfig.update({
      where: { clientId },
      data: { status: "inactive" },
    });

    // TODO: En producción, aquí se detendría el proceso de Liquidsoap
    // Por ahora solo actualizamos el estado en la base de datos

    return NextResponse.json({
      success: true,
      message: "Stream detenido exitosamente",
    });
  } catch (error) {
    console.error("Error stopping stream:", error);
    return NextResponse.json(
      { error: "Error al detener stream" },
      { status: 500 }
    );
  }
}

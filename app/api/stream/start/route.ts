import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LiquidsoapService } from "@/lib/services/liquidsoap";

// POST /api/stream/start - Iniciar AutoDJ
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

    // Verificar que hay playlist principal
    const mainPlaylist = await prisma.playlist.findFirst({
      where: {
        clientId,
        isMain: true,
      },
      include: {
        items: true,
      },
    });

    if (!mainPlaylist || mainPlaylist.items.length === 0) {
      return NextResponse.json(
        { error: "No hay playlist principal o está vacía" },
        { status: 400 }
      );
    }

    // Verificar que AutoDJ está habilitado
    if (!config.autodjEnabled) {
      return NextResponse.json(
        { error: "AutoDJ no está habilitado" },
        { status: 400 }
      );
    }

    // Actualizar estado a activo
    await prisma.streamConfig.update({
      where: { clientId },
      data: { status: "active" },
    });

    // TODO: En producción, aquí se iniciaría el proceso de Liquidsoap
    // Por ahora solo actualizamos el estado en la base de datos

    return NextResponse.json({
      success: true,
      message: "Stream iniciado exitosamente",
      streamUrl: `http://${config.server.host}:${config.server.port}${config.mountpoint}`,
    });
  } catch (error) {
    console.error("Error starting stream:", error);
    return NextResponse.json(
      { error: "Error al iniciar stream" },
      { status: 500 }
    );
  }
}

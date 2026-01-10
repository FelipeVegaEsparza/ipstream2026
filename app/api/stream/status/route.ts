import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stream/status - Obtener estado del stream
export async function GET(req: NextRequest) {
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

    // Obtener configuración de streaming
    const config = await prisma.streamConfig.findUnique({
      where: { clientId },
      include: {
        server: true,
      },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Configuración de streaming no encontrada" },
        { status: 404 }
      );
    }

    // Obtener playlist principal
    const mainPlaylist = await prisma.playlist.findFirst({
      where: {
        clientId,
        isMain: true,
      },
      include: {
        items: {
          include: {
            audioFile: true,
          },
        },
      },
    });

    // TODO: Obtener estado real de Liquidsoap vía Telnet
    // Por ahora retornamos estado basado en configuración

    return NextResponse.json({
      status: config.status,
      autodjEnabled: config.autodjEnabled,
      liveInputEnabled: config.liveInputEnabled,
      server: {
        host: config.server.host,
        port: config.server.port,
        status: config.server.status,
      },
      mountpoint: config.mountpoint,
      streamUrl: `http://${config.server.host}:${config.server.port}${config.mountpoint}`,
      mainPlaylist: mainPlaylist
        ? {
            id: mainPlaylist.id,
            name: mainPlaylist.name,
            songCount: mainPlaylist.items.length,
          }
        : null,
      config: {
        crossfadeDuration: config.crossfadeDuration,
        normalizeAudio: config.normalizeAudio,
        playbackMode: config.playbackMode,
      },
    });
  } catch (error) {
    console.error("Error fetching stream status:", error);
    return NextResponse.json(
      { error: "Error al obtener estado del stream" },
      { status: 500 }
    );
  }
}

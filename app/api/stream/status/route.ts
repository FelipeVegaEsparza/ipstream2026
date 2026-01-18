import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stream/status - Obtener estado del stream
export async function GET() {
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

    // Obtener información en tiempo real de Icecast
    let currentSong = null;
    let listeners = 0;
    let peakListeners = 0;
    let streamStatus = 'offline';

    if (config.status === 'active') {
      try {
        // Construir URL de Icecast (usar localhost si es el servicio Docker)
        const icecastHost = config.server.host === 'icecast' ? 'localhost' : config.server.host;
        const icecastUrl = `http://${icecastHost}:${config.server.port}/status-json.xsl`;
        
        const response = await fetch(icecastUrl, {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          
          // Buscar el mountpoint del cliente
          const sources = Array.isArray(data.icestats.source) 
            ? data.icestats.source 
            : [data.icestats.source];
          
          const clientSource = sources.find((source: any) => 
            source && source.listenurl && source.listenurl.includes(config.mountpoint)
          );

          if (clientSource) {
            currentSong = clientSource.title || clientSource.server_name || 'Sin información';
            listeners = clientSource.listeners || 0;
            peakListeners = clientSource.listener_peak || 0;
            streamStatus = 'online';
          }
        }
      } catch (error) {
        console.error('Error fetching Icecast status:', error);
        // No lanzar error, solo continuar sin datos de Icecast
      }
    }

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
      // Información en tiempo real
      currentSong,
      listeners,
      peakListeners,
      streamStatus,
    });
  } catch (error) {
    console.error("Error fetching stream status:", error);
    return NextResponse.json(
      { error: "Error al obtener estado del stream" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/[clientId]/stream/now-playing - Canción actual pública
export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: params.clientId },
      select: { name: true },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    // Obtener última estadística
    const latestStat = await prisma.streamStats.findFirst({
      where: { clientId: params.clientId },
      orderBy: { timestamp: "desc" },
    });

    if (!latestStat || !latestStat.currentSong) {
      return NextResponse.json({
        nowPlaying: null,
        radioName: client.name,
      });
    }

    return NextResponse.json({
      nowPlaying: {
        song: latestStat.currentSong,
        timestamp: latestStat.timestamp,
      },
      radioName: client.name,
      listeners: latestStat.listeners,
    });
  } catch (error) {
    console.error("Error fetching public now playing:", error);
    return NextResponse.json(
      { error: "Error al obtener canción actual" },
      { status: 500 }
    );
  }
}

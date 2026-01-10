import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stream/stats/top-songs - Obtener canciones más reproducidas
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

    // Obtener parámetros
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Calcular fecha límite
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Obtener estadísticas con canciones
    const stats = await prisma.streamStats.findMany({
      where: {
        clientId,
        timestamp: { gte: since },
        currentSong: { not: null },
      },
      select: {
        currentSong: true,
        listeners: true,
      },
    });

    // Contar reproducciones y oyentes por canción
    const songMap = new Map<string, { count: number; totalListeners: number }>();

    for (const stat of stats) {
      if (!stat.currentSong) continue;

      const existing = songMap.get(stat.currentSong) || { count: 0, totalListeners: 0 };
      songMap.set(stat.currentSong, {
        count: existing.count + 1,
        totalListeners: existing.totalListeners + stat.listeners,
      });
    }

    // Convertir a array y ordenar
    const topSongs = Array.from(songMap.entries())
      .map(([song, data]) => ({
        song,
        playCount: data.count,
        avgListeners: Math.round(data.totalListeners / data.count),
      }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);

    return NextResponse.json({
      topSongs,
      period: { days, since },
    });
  } catch (error) {
    console.error("Error fetching top songs:", error);
    return NextResponse.json(
      { error: "Error al obtener canciones más reproducidas" },
      { status: 500 }
    );
  }
}

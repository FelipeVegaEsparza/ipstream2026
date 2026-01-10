import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stream/now-playing - Obtener canción actual
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

    // Obtener última estadística (contiene currentSong)
    const latestStat = await prisma.streamStats.findFirst({
      where: { clientId },
      orderBy: { timestamp: "desc" },
    });

    if (!latestStat || !latestStat.currentSong) {
      return NextResponse.json({
        nowPlaying: null,
        message: "No hay canción reproduciéndose",
      });
    }

    // TODO: Parsear currentSong para obtener más información
    // Por ahora retornamos el string completo

    return NextResponse.json({
      nowPlaying: {
        title: latestStat.currentSong,
        timestamp: latestStat.timestamp,
        listeners: latestStat.listeners,
      },
    });
  } catch (error) {
    console.error("Error fetching now playing:", error);
    return NextResponse.json(
      { error: "Error al obtener canción actual" },
      { status: 500 }
    );
  }
}

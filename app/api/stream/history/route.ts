import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stream/history - Obtener historial de reproducción
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
    const limit = parseInt(searchParams.get("limit") || "50");
    const hours = parseInt(searchParams.get("hours") || "24");

    // Calcular fecha límite
    const since = new Date();
    since.setHours(since.getHours() - hours);

    // Obtener estadísticas recientes
    const stats = await prisma.streamStats.findMany({
      where: {
        clientId,
        timestamp: {
          gte: since,
        },
        currentSong: {
          not: null,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
      select: {
        currentSong: true,
        timestamp: true,
        listeners: true,
      },
    });

    // Agrupar canciones consecutivas (eliminar duplicados)
    const history = [];
    let lastSong = "";

    for (const stat of stats) {
      if (stat.currentSong && stat.currentSong !== lastSong) {
        history.push({
          song: stat.currentSong,
          timestamp: stat.timestamp,
          listeners: stat.listeners,
        });
        lastSong = stat.currentSong;
      }
    }

    return NextResponse.json({
      history,
      period: {
        hours,
        since,
      },
    });
  } catch (error) {
    console.error("Error fetching stream history:", error);
    return NextResponse.json(
      { error: "Error al obtener historial" },
      { status: 500 }
    );
  }
}

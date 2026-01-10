import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/[clientId]/stream/stats - Estadísticas públicas
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

    if (!latestStat) {
      return NextResponse.json({
        stats: null,
        radioName: client.name,
      });
    }

    // Obtener pico del día
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await prisma.streamStats.findMany({
      where: {
        clientId: params.clientId,
        timestamp: { gte: today },
      },
      orderBy: { listeners: "desc" },
      take: 1,
    });

    const peakToday = todayStats.length > 0 ? todayStats[0].listeners : 0;

    return NextResponse.json({
      stats: {
        currentListeners: latestStat.listeners,
        peakToday,
        streamStatus: latestStat.streamStatus,
        currentSong: latestStat.currentSong,
      },
      radioName: client.name,
    });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}

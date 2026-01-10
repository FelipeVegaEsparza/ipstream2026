import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stream/stats/peak-hours - Obtener horarios pico
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
    const days = parseInt(searchParams.get("days") || "30");

    // Calcular fecha límite
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Obtener estadísticas
    const stats = await prisma.streamStats.findMany({
      where: {
        clientId,
        timestamp: { gte: since },
      },
      select: {
        timestamp: true,
        listeners: true,
      },
    });

    // Agrupar por hora del día (0-23)
    const hourlyData = Array(24).fill(0).map(() => ({ total: 0, count: 0 }));

    for (const stat of stats) {
      const hour = stat.timestamp.getHours();
      hourlyData[hour].total += stat.listeners;
      hourlyData[hour].count++;
    }

    // Calcular promedios
    const peakHours = hourlyData.map((data, hour) => ({
      hour,
      avgListeners: data.count > 0 ? Math.round(data.total / data.count) : 0,
    }));

    // Ordenar por oyentes
    const topHours = [...peakHours]
      .sort((a, b) => b.avgListeners - a.avgListeners)
      .slice(0, 5);

    return NextResponse.json({
      peakHours,
      topHours,
      period: { days, since },
    });
  } catch (error) {
    console.error("Error fetching peak hours:", error);
    return NextResponse.json(
      { error: "Error al obtener horarios pico" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stream/stats/history - Obtener estadísticas históricas
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
    const period = searchParams.get("period") || "day"; // day, week, month
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let since = new Date();
    let until = new Date();

    // Calcular rango de fechas según período
    if (startDate && endDate) {
      since = new Date(startDate);
      until = new Date(endDate);
    } else {
      switch (period) {
        case "week":
          since.setDate(since.getDate() - 7);
          break;
        case "month":
          since.setMonth(since.getMonth() - 1);
          break;
        case "day":
        default:
          since.setDate(since.getDate() - 1);
          break;
      }
    }

    // Obtener estadísticas
    const stats = await prisma.streamStats.findMany({
      where: {
        clientId,
        timestamp: {
          gte: since,
          lte: until,
        },
      },
      orderBy: { timestamp: "asc" },
    });

    if (stats.length === 0) {
      return NextResponse.json({
        stats: [],
        summary: {
          avgListeners: 0,
          peakListeners: 0,
          totalUptime: 0,
        },
        period: { since, until },
      });
    }

    // Calcular resumen
    const totalListeners = stats.reduce((sum, stat) => sum + stat.listeners, 0);
    const avgListeners = Math.round(totalListeners / stats.length);
    const peakListeners = Math.max(...stats.map((s) => s.listeners));
    const totalUptime = stats.reduce((sum, stat) => sum + stat.uptime, 0);

    // Agrupar por hora para reducir datos
    const groupedStats = [];
    let currentHour = "";
    let hourData = { timestamp: new Date(), listeners: 0, count: 0 };

    for (const stat of stats) {
      const hour = stat.timestamp.toISOString().substring(0, 13); // YYYY-MM-DDTHH
      
      if (hour !== currentHour) {
        if (currentHour !== "") {
          groupedStats.push({
            timestamp: hourData.timestamp,
            listeners: Math.round(hourData.listeners / hourData.count),
          });
        }
        currentHour = hour;
        hourData = { timestamp: stat.timestamp, listeners: stat.listeners, count: 1 };
      } else {
        hourData.listeners += stat.listeners;
        hourData.count++;
      }
    }

    // Agregar última hora
    if (hourData.count > 0) {
      groupedStats.push({
        timestamp: hourData.timestamp,
        listeners: Math.round(hourData.listeners / hourData.count),
      });
    }

    return NextResponse.json({
      stats: groupedStats,
      summary: {
        avgListeners,
        peakListeners,
        totalUptime,
      },
      period: { since, until },
    });
  } catch (error) {
    console.error("Error fetching stats history:", error);
    return NextResponse.json(
      { error: "Error al obtener historial de estadísticas" },
      { status: 500 }
    );
  }
}

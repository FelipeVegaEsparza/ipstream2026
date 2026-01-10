import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stream/stats - Obtener estadísticas en tiempo real
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

    // Obtener última estadística
    const latestStat = await prisma.streamStats.findFirst({
      where: { clientId },
      orderBy: { timestamp: "desc" },
    });

    if (!latestStat) {
      return NextResponse.json({
        stats: null,
        message: "No hay estadísticas disponibles",
      });
    }

    // Obtener pico del día
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await prisma.streamStats.findMany({
      where: {
        clientId,
        timestamp: {
          gte: today,
        },
      },
      orderBy: { listeners: "desc" },
      take: 1,
    });

    const peakToday = todayStats.length > 0 ? todayStats[0].listeners : 0;

    // Obtener estadísticas de últimas 24 horas para gráfico
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);

    const last24hStats = await prisma.streamStats.findMany({
      where: {
        clientId,
        timestamp: {
          gte: last24h,
        },
      },
      orderBy: { timestamp: "asc" },
      select: {
        timestamp: true,
        listeners: true,
      },
    });

    return NextResponse.json({
      current: {
        listeners: latestStat.listeners,
        listeners64: latestStat.listeners64,
        listeners128: latestStat.listeners128,
        listeners320: latestStat.listeners320,
        currentSong: latestStat.currentSong,
        streamStatus: latestStat.streamStatus,
        uptime: latestStat.uptime,
        timestamp: latestStat.timestamp,
      },
      today: {
        peak: peakToday,
      },
      last24h: last24hStats,
    });
  } catch (error) {
    console.error("Error fetching stream stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}

// POST /api/stream/stats - Crear estadística (para job interno)
export async function POST(req: NextRequest) {
  try {
    // TODO: Validar que la petición viene de un job interno
    // Por ahora permitimos cualquier petición autenticada

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
    const body = await req.json();

    // Crear estadística
    const stat = await prisma.streamStats.create({
      data: {
        clientId,
        listeners: body.listeners || 0,
        peakListeners: body.peakListeners || 0,
        currentSong: body.currentSong,
        listeners64: body.listeners64 || 0,
        listeners128: body.listeners128 || 0,
        listeners320: body.listeners320 || 0,
        streamStatus: body.streamStatus || "offline",
        uptime: body.uptime || 0,
      },
    });

    return NextResponse.json({ stat });
  } catch (error) {
    console.error("Error creating stream stat:", error);
    return NextResponse.json(
      { error: "Error al crear estadística" },
      { status: 500 }
    );
  }
}

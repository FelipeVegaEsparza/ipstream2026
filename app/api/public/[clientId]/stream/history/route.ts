import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/[clientId]/stream/history - Historial público de reproducción
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

    // Obtener parámetros
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const hours = parseInt(searchParams.get("hours") || "24");

    // Calcular fecha límite
    const since = new Date();
    since.setHours(since.getHours() - hours);

    // Obtener estadísticas recientes
    const stats = await prisma.streamStats.findMany({
      where: {
        clientId: params.clientId,
        timestamp: { gte: since },
        currentSong: { not: null },
      },
      orderBy: { timestamp: "desc" },
      take: limit * 2, // Obtener más para filtrar duplicados
      select: {
        currentSong: true,
        timestamp: true,
      },
    });

    // Eliminar duplicados consecutivos
    const history = [];
    let lastSong = "";

    for (const stat of stats) {
      if (stat.currentSong && stat.currentSong !== lastSong) {
        history.push({
          song: stat.currentSong,
          timestamp: stat.timestamp,
        });
        lastSong = stat.currentSong;
        
        if (history.length >= limit) break;
      }
    }

    return NextResponse.json({
      history,
      radioName: client.name,
    });
  } catch (error) {
    console.error("Error fetching public history:", error);
    return NextResponse.json(
      { error: "Error al obtener historial" },
      { status: 500 }
    );
  }
}

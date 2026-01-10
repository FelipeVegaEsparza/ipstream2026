import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stream/stats/export - Exportar estadísticas a CSV
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Se requieren startDate y endDate" },
        { status: 400 }
      );
    }

    const since = new Date(startDate);
    const until = new Date(endDate);

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

    // Generar CSV
    const headers = [
      "Fecha",
      "Hora",
      "Oyentes",
      "Oyentes 64kbps",
      "Oyentes 128kbps",
      "Oyentes 320kbps",
      "Pico",
      "Canción Actual",
      "Estado",
      "Uptime (seg)",
    ];

    const rows = stats.map((stat) => [
      stat.timestamp.toISOString().split("T")[0],
      stat.timestamp.toISOString().split("T")[1].split(".")[0],
      stat.listeners,
      stat.listeners64,
      stat.listeners128,
      stat.listeners320,
      stat.peakListeners,
      stat.currentSong || "",
      stat.streamStatus,
      stat.uptime,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="stats_${clientId}_${startDate}_${endDate}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting stats:", error);
    return NextResponse.json(
      { error: "Error al exportar estadísticas" },
      { status: 500 }
    );
  }
}

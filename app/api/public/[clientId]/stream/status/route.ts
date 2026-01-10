import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/[clientId]/stream/status - Estado público del stream
export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // Obtener configuración del cliente
    const config = await prisma.streamConfig.findUnique({
      where: { clientId: params.clientId },
      include: {
        server: true,
        client: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!config) {
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

    return NextResponse.json({
      status: config.status,
      streamUrl: `http://${config.server.host}:${config.server.port}${config.mountpoint}`,
      radioName: config.client.name,
      listeners: latestStat?.listeners || 0,
      streamStatus: latestStat?.streamStatus || "offline",
      bitrates: JSON.parse(config.bitrates),
    });
  } catch (error) {
    console.error("Error fetching public stream status:", error);
    return NextResponse.json(
      { error: "Error al obtener estado del stream" },
      { status: 500 }
    );
  }
}

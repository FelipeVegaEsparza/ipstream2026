import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/schedule/current - Obtener programación actual
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

    // Obtener día y hora actual
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // Buscar schedule activo en este momento
    const currentSchedule = await prisma.schedule.findFirst({
      where: {
        clientId,
        dayOfWeek,
        isActive: true,
        startTime: { lte: currentTime },
        endTime: { gt: currentTime },
      },
      include: {
        playlist: {
          include: {
            items: {
              include: {
                audioFile: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!currentSchedule) {
      // No hay schedule, usar playlist principal
      const mainPlaylist = await prisma.playlist.findFirst({
        where: {
          clientId,
          isMain: true,
        },
        include: {
          items: {
            include: {
              audioFile: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });

      return NextResponse.json({
        currentSchedule: null,
        playlist: mainPlaylist,
        usingMainPlaylist: true,
      });
    }

    return NextResponse.json({
      currentSchedule: {
        id: currentSchedule.id,
        dayOfWeek: currentSchedule.dayOfWeek,
        startTime: currentSchedule.startTime,
        endTime: currentSchedule.endTime,
      },
      playlist: currentSchedule.playlist,
      usingMainPlaylist: false,
    });
  } catch (error) {
    console.error("Error fetching current schedule:", error);
    return NextResponse.json(
      { error: "Error al obtener programación actual" },
      { status: 500 }
    );
  }
}

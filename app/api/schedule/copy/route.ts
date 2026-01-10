import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación
const copyScheduleSchema = z.object({
  fromDay: z.number().int().min(0).max(6),
  toDays: z.array(z.number().int().min(0).max(6)),
});

// POST /api/schedule/copy - Copiar programación entre días
export async function POST(req: NextRequest) {
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

    // Validar datos
    const body = await req.json();
    const { fromDay, toDays } = copyScheduleSchema.parse(body);

    // Obtener schedules del día origen
    const sourceSchedules = await prisma.schedule.findMany({
      where: {
        clientId,
        dayOfWeek: fromDay,
        isActive: true,
      },
    });

    if (sourceSchedules.length === 0) {
      return NextResponse.json(
        { error: "No hay programación en el día origen" },
        { status: 400 }
      );
    }

    const created = [];

    // Copiar a cada día destino
    for (const toDay of toDays) {
      // Eliminar schedules existentes en el día destino
      await prisma.schedule.deleteMany({
        where: {
          clientId,
          dayOfWeek: toDay,
        },
      });

      // Crear nuevos schedules
      for (const schedule of sourceSchedules) {
        const newSchedule = await prisma.schedule.create({
          data: {
            clientId,
            playlistId: schedule.playlistId,
            dayOfWeek: toDay,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isActive: schedule.isActive,
          },
          include: {
            playlist: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        });
        created.push(newSchedule);
      }
    }

    return NextResponse.json({
      success: true,
      created: created.length,
      schedules: created,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error copying schedules:", error);
    return NextResponse.json(
      { error: "Error al copiar programación" },
      { status: 500 }
    );
  }
}

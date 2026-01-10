import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación
const updateScheduleSchema = z.object({
  playlistId: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/schedule/[id] - Obtener detalle de programación
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const schedule = await prisma.schedule.findFirst({
      where: {
        id: params.id,
        clientId: user.client.id,
      },
      include: {
        playlist: true,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Programación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Error al obtener programación" },
      { status: 500 }
    );
  }
}

// PUT /api/schedule/[id] - Actualizar programación
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar que el schedule pertenece al cliente
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: params.id,
        clientId,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Programación no encontrada" },
        { status: 404 }
      );
    }

    // Validar datos
    const body = await req.json();
    const validatedData = updateScheduleSchema.parse(body);

    // Si se actualiza la playlist, verificar que pertenece al cliente
    if (validatedData.playlistId) {
      const playlist = await prisma.playlist.findFirst({
        where: {
          id: validatedData.playlistId,
          clientId,
        },
      });

      if (!playlist) {
        return NextResponse.json(
          { error: "Playlist no encontrada" },
          { status: 404 }
        );
      }
    }

    // Preparar datos para actualización
    const startTime = validatedData.startTime || schedule.startTime;
    const endTime = validatedData.endTime || schedule.endTime;
    const dayOfWeek = validatedData.dayOfWeek ?? schedule.dayOfWeek;

    // Validar que endTime > startTime
    if (endTime <= startTime) {
      return NextResponse.json(
        { error: "La hora de fin debe ser mayor que la hora de inicio" },
        { status: 400 }
      );
    }

    // Verificar solapamiento (excluyendo el schedule actual)
    const overlapping = await prisma.schedule.findFirst({
      where: {
        clientId,
        dayOfWeek,
        isActive: true,
        id: { not: params.id },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: "Ya existe una programación en ese horario" },
        { status: 400 }
      );
    }

    // Actualizar
    const updated = await prisma.schedule.update({
      where: { id: params.id },
      data: validatedData,
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

    return NextResponse.json({ schedule: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Error al actualizar programación" },
      { status: 500 }
    );
  }
}

// DELETE /api/schedule/[id] - Eliminar programación
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar que el schedule pertenece al cliente
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: params.id,
        clientId: user.client.id,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Programación no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar
    await prisma.schedule.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Error al eliminar programación" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación
const createScheduleSchema = z.object({
  playlistId: z.string(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  isActive: z.boolean().default(true),
});

// GET /api/schedule - Listar programación del cliente
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
    const dayOfWeek = searchParams.get("dayOfWeek");

    // Construir filtros
    const where: any = { clientId };
    if (dayOfWeek !== null) {
      where.dayOfWeek = parseInt(dayOfWeek);
    }

    // Obtener schedules
    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        playlist: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Error al obtener programación" },
      { status: 500 }
    );
  }
}

// POST /api/schedule - Crear programación
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
    const validatedData = createScheduleSchema.parse(body);

    // Verificar que la playlist pertenece al cliente
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

    // Validar que endTime > startTime
    if (validatedData.endTime <= validatedData.startTime) {
      return NextResponse.json(
        { error: "La hora de fin debe ser mayor que la hora de inicio" },
        { status: 400 }
      );
    }

    // Verificar solapamiento
    const overlapping = await prisma.schedule.findFirst({
      where: {
        clientId,
        dayOfWeek: validatedData.dayOfWeek,
        isActive: true,
        OR: [
          // Nuevo schedule comienza durante uno existente
          {
            AND: [
              { startTime: { lte: validatedData.startTime } },
              { endTime: { gt: validatedData.startTime } },
            ],
          },
          // Nuevo schedule termina durante uno existente
          {
            AND: [
              { startTime: { lt: validatedData.endTime } },
              { endTime: { gte: validatedData.endTime } },
            ],
          },
          // Nuevo schedule contiene uno existente
          {
            AND: [
              { startTime: { gte: validatedData.startTime } },
              { endTime: { lte: validatedData.endTime } },
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

    // Crear schedule
    const schedule = await prisma.schedule.create({
      data: {
        clientId,
        playlistId: validatedData.playlistId,
        dayOfWeek: validatedData.dayOfWeek,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        isActive: validatedData.isActive,
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

    return NextResponse.json({ schedule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Error al crear programación" },
      { status: 500 }
    );
  }
}

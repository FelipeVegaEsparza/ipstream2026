import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación
const createPlaylistSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["rotation", "special", "jingles"]).default("rotation"),
  description: z.string().optional(),
  isMain: z.boolean().default(false),
});

// GET /api/playlists - Listar playlists del cliente
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
    const type = searchParams.get("type") || "";

    // Construir filtros
    const where: any = { clientId };
    if (type) {
      where.type = type;
    }

    // Obtener playlists con conteo de canciones
    const playlists = await prisma.playlist.findMany({
      where,
      include: {
        items: {
          include: {
            audioFile: {
              select: {
                id: true,
                duration: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        schedules: {
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: [
        { isMain: "desc" },
        { createdAt: "desc" },
      ],
    });

    // Calcular duración total de cada playlist
    const playlistsWithDuration = playlists.map((playlist) => {
      const totalDuration = playlist.items.reduce(
        (sum, item) => sum + (item.audioFile.duration || 0),
        0
      );
      const songCount = playlist.items.length;

      return {
        id: playlist.id,
        name: playlist.name,
        type: playlist.type,
        description: playlist.description,
        isMain: playlist.isMain,
        songCount,
        totalDuration,
        scheduleCount: playlist.schedules.length,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
      };
    });

    return NextResponse.json({ playlists: playlistsWithDuration });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      { error: "Error al obtener playlists" },
      { status: 500 }
    );
  }
}

// POST /api/playlists - Crear playlist
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
    const validatedData = createPlaylistSchema.parse(body);

    // Si se marca como principal, desmarcar las demás
    if (validatedData.isMain) {
      await prisma.playlist.updateMany({
        where: { clientId, isMain: true },
        data: { isMain: false },
      });
    }

    // Crear playlist
    const playlist = await prisma.playlist.create({
      data: {
        clientId,
        ...validatedData,
      },
    });

    return NextResponse.json({ playlist });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating playlist:", error);
    return NextResponse.json(
      { error: "Error al crear playlist" },
      { status: 500 }
    );
  }
}

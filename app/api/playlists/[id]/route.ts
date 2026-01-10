import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación
const updatePlaylistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["rotation", "special", "jingles"]).optional(),
  description: z.string().optional(),
  isMain: z.boolean().optional(),
});

// GET /api/playlists/[id] - Obtener detalle de playlist
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

    const playlist = await prisma.playlist.findFirst({
      where: {
        id: params.id,
        clientId: user.client.id,
      },
      include: {
        items: {
          include: {
            audioFile: true,
          },
          orderBy: { order: "asc" },
        },
        schedules: {
          orderBy: [
            { dayOfWeek: "asc" },
            { startTime: "asc" },
          ],
        },
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist no encontrada" }, { status: 404 });
    }

    // Calcular duración total
    const totalDuration = playlist.items.reduce(
      (sum, item) => sum + (item.audioFile.duration || 0),
      0
    );

    return NextResponse.json({
      playlist: {
        ...playlist,
        totalDuration,
        songCount: playlist.items.length,
      },
    });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return NextResponse.json(
      { error: "Error al obtener playlist" },
      { status: 500 }
    );
  }
}

// PUT /api/playlists/[id] - Actualizar playlist
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

    // Verificar que la playlist pertenece al cliente
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: params.id,
        clientId,
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist no encontrada" }, { status: 404 });
    }

    // Validar datos
    const body = await req.json();
    const validatedData = updatePlaylistSchema.parse(body);

    // Si se marca como principal, desmarcar las demás
    if (validatedData.isMain === true) {
      await prisma.playlist.updateMany({
        where: { clientId, isMain: true, id: { not: params.id } },
        data: { isMain: false },
      });
    }

    // Actualizar
    const updated = await prisma.playlist.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({ playlist: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating playlist:", error);
    return NextResponse.json(
      { error: "Error al actualizar playlist" },
      { status: 500 }
    );
  }
}

// DELETE /api/playlists/[id] - Eliminar playlist
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

    // Verificar que la playlist pertenece al cliente
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: params.id,
        clientId: user.client.id,
      },
      include: {
        schedules: true,
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist no encontrada" }, { status: 404 });
    }

    // Verificar que no esté en uso en programación
    if (playlist.schedules.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar. La playlist está en uso en programación horaria" },
        { status: 400 }
      );
    }

    // Eliminar (los items se eliminan en cascada)
    await prisma.playlist.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json(
      { error: "Error al eliminar playlist" },
      { status: 500 }
    );
  }
}

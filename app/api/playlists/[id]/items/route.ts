import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación
const addItemSchema = z.object({
  audioFileId: z.string(),
});

// POST /api/playlists/[id]/items - Agregar canción a playlist
export async function POST(
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
      include: {
        items: {
          orderBy: { order: "desc" },
          take: 1,
        },
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist no encontrada" }, { status: 404 });
    }

    // Validar datos
    const body = await req.json();
    const { audioFileId } = addItemSchema.parse(body);

    // Verificar que el archivo pertenece al cliente
    const audioFile = await prisma.audioFile.findFirst({
      where: {
        id: audioFileId,
        clientId,
      },
    });

    if (!audioFile) {
      return NextResponse.json({ error: "Archivo de audio no encontrado" }, { status: 404 });
    }

    // Verificar que no esté duplicado
    const existing = await prisma.playlistItem.findFirst({
      where: {
        playlistId: params.id,
        audioFileId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "La canción ya está en la playlist" },
        { status: 400 }
      );
    }

    // Calcular siguiente orden
    const nextOrder = playlist.items.length > 0 ? playlist.items[0].order + 1 : 0;

    // Crear item
    const item = await prisma.playlistItem.create({
      data: {
        playlistId: params.id,
        audioFileId,
        order: nextOrder,
      },
      include: {
        audioFile: true,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error adding item to playlist:", error);
    return NextResponse.json(
      { error: "Error al agregar canción" },
      { status: 500 }
    );
  }
}

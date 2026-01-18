import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación - ahora acepta array de IDs
const addItemsSchema = z.object({
  audioFileIds: z.array(z.string()).min(1, "Debe proporcionar al menos un archivo"),
});

// POST /api/playlists/[id]/items - Agregar canciones a playlist
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
    const { audioFileIds } = addItemsSchema.parse(body);

    // Verificar que todos los archivos pertenecen al cliente
    const audioFiles = await prisma.audioFile.findMany({
      where: {
        id: { in: audioFileIds },
        clientId,
      },
    });

    if (audioFiles.length !== audioFileIds.length) {
      return NextResponse.json(
        { error: "Algunos archivos de audio no fueron encontrados" },
        { status: 404 }
      );
    }

    // Verificar duplicados
    const existingItems = await prisma.playlistItem.findMany({
      where: {
        playlistId: params.id,
        audioFileId: { in: audioFileIds },
      },
    });

    if (existingItems.length > 0) {
      const duplicateIds = existingItems.map(item => item.audioFileId);
      const duplicateFiles = audioFiles.filter(f => duplicateIds.includes(f.id));
      return NextResponse.json(
        { 
          error: `${duplicateFiles.length} canción(es) ya están en la playlist`,
          duplicates: duplicateFiles.map(f => f.title || f.filename)
        },
        { status: 400 }
      );
    }

    // Calcular siguiente orden
    let nextOrder = playlist.items.length > 0 ? playlist.items[0].order + 1 : 0;

    // Crear items en batch
    const itemsToCreate = audioFileIds.map((audioFileId, index) => ({
      playlistId: params.id,
      audioFileId,
      order: nextOrder + index,
    }));

    await prisma.playlistItem.createMany({
      data: itemsToCreate,
    });

    // Obtener items creados con sus archivos
    const createdItems = await prisma.playlistItem.findMany({
      where: {
        playlistId: params.id,
        audioFileId: { in: audioFileIds },
      },
      include: {
        audioFile: true,
      },
    });

    return NextResponse.json({ 
      items: createdItems,
      count: createdItems.length,
      message: `${createdItems.length} canción(es) agregada(s) exitosamente`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error adding items to playlist:", error);
    return NextResponse.json(
      { error: "Error al agregar canciones" },
      { status: 500 }
    );
  }
}

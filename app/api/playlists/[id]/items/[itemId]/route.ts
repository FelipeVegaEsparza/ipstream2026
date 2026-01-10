import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/playlists/[id]/items/[itemId] - Quitar canción de playlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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

    // Verificar que el item existe
    const item = await prisma.playlistItem.findFirst({
      where: {
        id: params.itemId,
        playlistId: params.id,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
    }

    // Eliminar item
    await prisma.playlistItem.delete({
      where: { id: params.itemId },
    });

    // Reordenar items restantes
    const remainingItems = await prisma.playlistItem.findMany({
      where: { playlistId: params.id },
      orderBy: { order: "asc" },
    });

    // Actualizar orden
    for (let i = 0; i < remainingItems.length; i++) {
      await prisma.playlistItem.update({
        where: { id: remainingItems[i].id },
        data: { order: i },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing item from playlist:", error);
    return NextResponse.json(
      { error: "Error al quitar canción" },
      { status: 500 }
    );
  }
}

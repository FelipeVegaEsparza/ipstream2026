import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación
const reorderSchema = z.object({
  itemIds: z.array(z.string()),
});

// PUT /api/playlists/[id]/reorder - Reordenar canciones en playlist
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
      include: {
        items: true,
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist no encontrada" }, { status: 404 });
    }

    // Validar datos
    const body = await req.json();
    const { itemIds } = reorderSchema.parse(body);

    // Verificar que todos los IDs pertenecen a la playlist
    const itemIdsSet = new Set(playlist.items.map((item) => item.id));
    const allValid = itemIds.every((id) => itemIdsSet.has(id));

    if (!allValid || itemIds.length !== playlist.items.length) {
      return NextResponse.json(
        { error: "IDs de items inválidos" },
        { status: 400 }
      );
    }

    // Actualizar orden
    for (let i = 0; i < itemIds.length; i++) {
      await prisma.playlistItem.update({
        where: { id: itemIds[i] },
        data: { order: i },
      });
    }

    // Obtener playlist actualizada
    const updated = await prisma.playlist.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            audioFile: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ playlist: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error reordering playlist:", error);
    return NextResponse.json(
      { error: "Error al reordenar playlist" },
      { status: 500 }
    );
  }
}

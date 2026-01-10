import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/playlists/[id]/duplicate - Duplicar playlist
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

    // Obtener playlist original
    const original = await prisma.playlist.findFirst({
      where: {
        id: params.id,
        clientId,
      },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!original) {
      return NextResponse.json({ error: "Playlist no encontrada" }, { status: 404 });
    }

    // Crear copia
    const duplicate = await prisma.playlist.create({
      data: {
        clientId,
        name: `${original.name} (Copia)`,
        type: original.type,
        description: original.description,
        isMain: false, // La copia nunca es principal
      },
    });

    // Copiar items
    for (const item of original.items) {
      await prisma.playlistItem.create({
        data: {
          playlistId: duplicate.id,
          audioFileId: item.audioFileId,
          order: item.order,
        },
      });
    }

    // Obtener playlist completa
    const result = await prisma.playlist.findUnique({
      where: { id: duplicate.id },
      include: {
        items: {
          include: {
            audioFile: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ playlist: result });
  } catch (error) {
    console.error("Error duplicating playlist:", error);
    return NextResponse.json(
      { error: "Error al duplicar playlist" },
      { status: 500 }
    );
  }
}

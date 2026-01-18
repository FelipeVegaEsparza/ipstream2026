import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

// PATCH - Actualizar locución
export async function PATCH(
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

    const { id } = params;
    const body = await req.json();

    // Verificar que la locución pertenece al cliente
    const announcement = await prisma.timeAnnouncement.findUnique({
      where: { id },
    });

    if (!announcement || announcement.clientId !== user.client.id) {
      return NextResponse.json({ error: "Locución no encontrada" }, { status: 404 });
    }

    // Actualizar
    const updated = await prisma.timeAnnouncement.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating time announcement:", error);
    return NextResponse.json(
      { error: "Error al actualizar locución" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar locución
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

    const { id } = params;

    // Verificar que la locución pertenece al cliente
    const announcement = await prisma.timeAnnouncement.findUnique({
      where: { id },
    });

    if (!announcement || announcement.clientId !== user.client.id) {
      return NextResponse.json({ error: "Locución no encontrada" }, { status: 404 });
    }

    // Eliminar archivo físico
    try {
      const filepath = path.join(process.cwd(), announcement.storagePath);
      await unlink(filepath);
    } catch (error) {
      console.error("Error deleting file:", error);
      // Continuar aunque falle la eliminación del archivo
    }

    // Eliminar de base de datos
    await prisma.timeAnnouncement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting time announcement:", error);
    return NextResponse.json(
      { error: "Error al eliminar locución" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { enabled, playEveryXSongs } = await req.json();

    // Validar datos
    if (typeof enabled !== 'boolean' || typeof playEveryXSongs !== 'number') {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    if (playEveryXSongs < 1 || playEveryXSongs > 20) {
      return NextResponse.json({ error: "playEveryXSongs debe estar entre 1 y 20" }, { status: 400 });
    }

    // Crear o actualizar configuración
    const config = await prisma.announcementConfig.upsert({
      where: { clientId },
      update: {
        enabled,
        playEveryXSongs,
      },
      create: {
        clientId,
        enabled,
        playEveryXSongs,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error saving announcement config:", error);
    return NextResponse.json(
      { error: "Error al guardar configuración" },
      { status: 500 }
    );
  }
}

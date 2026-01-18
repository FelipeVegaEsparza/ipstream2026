import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { processAudioFile } from "@/lib/services/audioProcessing";

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
    const formData = await req.formData();
    
    const file = formData.get("file") as File;
    const description = formData.get("description") as string;
    const hourValue = formData.get("hourValue") ? parseInt(formData.get("hourValue") as string) : null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es demasiado grande (máx. 10MB)" }, { status: 400 });
    }

    // Crear directorio si no existe
    const uploadsDir = path.join(process.cwd(), "public", "audio", clientId, "announcements");
    await mkdir(uploadsDir, { recursive: true });

    // Generar nombre único
    const timestamp = Date.now();
    const hash = Math.random().toString(36).substring(7);
    const ext = path.extname(file.name);
    const filename = `${timestamp}-${hash}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Guardar archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Procesar archivo para obtener metadata
    const storagePath = path.join("public", "audio", clientId, "announcements", filename);
    const metadata = await processAudioFile(storagePath);

    // Crear registro en base de datos
    const announcement = await prisma.timeAnnouncement.create({
      data: {
        clientId,
        filename: file.name,
        storagePath,
        fileSize: file.size,
        duration: metadata.duration,
        description: description || null,
        hourValue,
        status: "ready",
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error uploading time announcement:", error);
    return NextResponse.json(
      { error: "Error al subir locución" },
      { status: 500 }
    );
  }
}

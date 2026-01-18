import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LiquidsoapService } from "@/lib/services/liquidsoap";
import { ScriptManager } from "@/lib/services/scriptManager";
import path from "path";
import fs from "fs/promises";

// POST /api/stream/start - Iniciar AutoDJ
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

    // Obtener configuración
    const config = await prisma.streamConfig.findUnique({
      where: { clientId },
      include: { server: true },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Configuración de streaming no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que hay playlist principal
    const mainPlaylist = await prisma.playlist.findFirst({
      where: {
        clientId,
        isMain: true,
      },
      include: {
        items: {
          include: {
            audioFile: true,
          },
        },
      },
    });

    if (!mainPlaylist || mainPlaylist.items.length === 0) {
      return NextResponse.json(
        { error: "No hay playlist principal o está vacía" },
        { status: 400 }
      );
    }

    // Verificar que todos los archivos están procesados
    const unprocessedFiles = mainPlaylist.items.filter(
      (item) => item.audioFile.status !== "ready"
    );

    if (unprocessedFiles.length > 0) {
      return NextResponse.json(
        { error: "Hay archivos de audio que aún no están procesados" },
        { status: 400 }
      );
    }

    // Verificar que AutoDJ está habilitado
    if (!config.autodjEnabled) {
      return NextResponse.json(
        { error: "AutoDJ no está habilitado" },
        { status: 400 }
      );
    }

    console.log(`Iniciando stream para cliente ${clientId}...`);

    try {
      // 1. Generar script de Liquidsoap
      console.log("Generando script de Liquidsoap...");
      const scriptContent = await LiquidsoapService.generateScript(clientId);

      // 2. Generar archivo M3U principal
      console.log("Generando archivo M3U principal...");
      const m3uContent = await LiquidsoapService.generateM3U(clientId, "main");
      
      // Guardar M3U en public/audio/[clientId]/playlist.m3u
      const audioDir = path.join(process.cwd(), "public", "audio", clientId);
      await fs.mkdir(audioDir, { recursive: true });
      
      const m3uPath = path.join(audioDir, "playlist.m3u");
      await fs.writeFile(m3uPath, m3uContent, "utf-8");
      console.log(`M3U principal guardado en: ${m3uPath}`);

      // 3. Generar archivo M3U de locuciones si están habilitadas
      const announcementConfig = await prisma.announcementConfig.findUnique({
        where: { clientId },
      });

      if (announcementConfig?.enabled) {
        try {
          console.log("Generando archivo M3U de locuciones...");
          const announcementsM3U = await LiquidsoapService.generateAnnouncementsM3U(clientId);
          const announcementsPath = path.join(audioDir, "announcements.m3u");
          await fs.writeFile(announcementsPath, announcementsM3U, "utf-8");
          console.log(`M3U de locuciones guardado en: ${announcementsPath}`);
        } catch (announcementError) {
          console.warn("No se pudieron generar locuciones:", announcementError);
          // No fallar el inicio si no hay locuciones
        }
      }

      // 4. Generar archivo M3U de jingles si están habilitados
      if (config.jinglesEnabled) {
        try {
          console.log("Generando archivo M3U de jingles...");
          const jinglesM3U = await LiquidsoapService.generateM3U(clientId, "jingles");
          const jinglesPath = path.join(audioDir, "jingles.m3u");
          await fs.writeFile(jinglesPath, jinglesM3U, "utf-8");
          console.log(`M3U de jingles guardado en: ${jinglesPath}`);
        } catch (jinglesError) {
          console.warn("No se pudieron generar jingles:", jinglesError);
          // No fallar el inicio si no hay jingles
        }
      }

      // 5. Guardar script en el filesystem
      console.log("Guardando script...");
      const scriptsDir = path.join(process.cwd(), "docker", "liquidsoap", "scripts", "clients");
      const scriptManager = new ScriptManager(scriptsDir);
      await scriptManager.saveScript(clientId, scriptContent);

      // 6. Reiniciar Liquidsoap para cargar el nuevo script
      console.log("Reiniciando Liquidsoap...");
      const restarted = await scriptManager.restartLiquidsoap();

      if (!restarted) {
        throw new Error("No se pudo reiniciar Liquidsoap");
      }

      // 7. Actualizar estado a activo
      await prisma.streamConfig.update({
        where: { clientId },
        data: { 
          status: "active",
          lastError: null,
        },
      });

      console.log(`Stream iniciado exitosamente para cliente ${clientId}`);

      return NextResponse.json({
        success: true,
        message: "Stream iniciado exitosamente. El stream estará disponible en unos segundos.",
        streamUrl: `http://${config.server.host}:${config.server.port}${config.mountpoint}`,
      });
    } catch (scriptError) {
      console.error("Error en el proceso de inicio:", scriptError);

      // Actualizar estado a error
      await prisma.streamConfig.update({
        where: { clientId },
        data: { 
          status: "error",
          lastError: scriptError instanceof Error ? scriptError.message : "Error desconocido",
        },
      });

      return NextResponse.json(
        { 
          error: "Error al iniciar el stream",
          details: scriptError instanceof Error ? scriptError.message : "Error desconocido",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error starting stream:", error);
    return NextResponse.json(
      { error: "Error al iniciar stream" },
      { status: 500 }
    );
  }
}

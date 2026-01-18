import { Socket } from "net";
import { prisma } from "@/lib/prisma";

export class LiquidsoapService {
  private host: string;
  private port: number;

  constructor(host: string = "localhost", port: number = 1234) {
    this.host = host;
    this.port = port;
  }

  /**
   * Conecta al servidor Telnet de Liquidsoap
   */
  private async connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const socket = new Socket();
      
      socket.connect(this.port, this.host, () => {
        resolve(socket);
      });

      socket.on("error", (error) => {
        reject(error);
      });

      socket.setTimeout(5000);
      socket.on("timeout", () => {
        socket.destroy();
        reject(new Error("Connection timeout"));
      });
    });
  }

  /**
   * Envía un comando a Liquidsoap y obtiene la respuesta
   */
  private async sendCommand(command: string): Promise<string> {
    const socket = await this.connect();

    return new Promise((resolve, reject) => {
      let response = "";

      socket.on("data", (data) => {
        response += data.toString();
      });

      socket.on("end", () => {
        resolve(response.trim());
      });

      socket.on("error", (error) => {
        reject(error);
      });

      // Enviar comando
      socket.write(command + "\n");
      
      // Cerrar después de un breve delay para recibir respuesta
      setTimeout(() => {
        socket.end();
      }, 1000);
    });
  }

  /**
   * Obtiene el estado actual de Liquidsoap
   */
  async getStatus(): Promise<string> {
    try {
      const response = await this.sendCommand("status");
      return response;
    } catch (error) {
      console.error("Error getting Liquidsoap status:", error);
      throw new Error("No se pudo conectar a Liquidsoap");
    }
  }

  /**
   * Salta a la siguiente canción
   */
  async skip(): Promise<boolean> {
    try {
      await this.sendCommand("skip");
      return true;
    } catch (error) {
      console.error("Error skipping song:", error);
      return false;
    }
  }

  /**
   * Obtiene la canción actual
   */
  async getCurrentSong(): Promise<string | null> {
    try {
      const response = await this.sendCommand("request.metadata");
      return response;
    } catch (error) {
      console.error("Error getting current song:", error);
      return null;
    }
  }

  /**
   * Genera script de Liquidsoap para un cliente
   */
  static async generateScript(clientId: string): Promise<string> {
    // Obtener configuración
    const config = await prisma.streamConfig.findUnique({
      where: { clientId },
      include: {
        server: true,
        client: true,
      },
    });

    if (!config) {
      throw new Error("Configuración no encontrada");
    }

    // Obtener playlist principal
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
          orderBy: { order: "asc" },
        },
      },
    });

    if (!mainPlaylist || mainPlaylist.items.length === 0) {
      throw new Error("No hay playlist principal o está vacía");
    }

    // Obtener playlist de jingles si está habilitado
    let jinglesPlaylist = null;
    if (config.jinglesEnabled) {
      jinglesPlaylist = await prisma.playlist.findFirst({
        where: {
          clientId,
          type: "jingles",
        },
        include: {
          items: {
            include: {
              audioFile: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });
    }

    // Obtener configuración de locuciones
    const announcementConfig = await prisma.announcementConfig.findUnique({
      where: { clientId },
    });

    // Obtener locuciones activas
    let announcements = null;
    if (announcementConfig?.enabled) {
      announcements = await prisma.timeAnnouncement.findMany({
        where: {
          clientId,
          enabled: true,
          status: "ready",
        },
        orderBy: { createdAt: "asc" },
      });
    }

    // Variables de entorno
    const icecastHost = process.env.ICECAST_HOST || "icecast";
    const icecastPort = process.env.ICECAST_PORT || "8000";
    const icecastPassword = process.env.ICECAST_PASSWORD || "hackme";

    // Convertir rutas de Windows a rutas de contenedor Docker
    const convertPath = (storagePath: string): string => {
      // Extraer solo el nombre del archivo (última parte de la ruta)
      const fileName = storagePath.split(/[/\\]/).pop() || storagePath;
      
      // Construir ruta del contenedor: /audio/[clientId]/[filename]
      return `/audio/${clientId}/${fileName}`;
    };

    // Generar script
    const script = `#!/usr/bin/liquidsoap

# Script generado automáticamente para: ${config.client.name}
# Cliente ID: ${clientId}
# Mountpoint: ${config.mountpoint}

# Variables de entorno
icecast_host = environment.get("ICECAST_HOST", default="${icecastHost}")
icecast_port = int_of_string(default=${icecastPort}, environment.get("ICECAST_PORT", default="${icecastPort}"))
icecast_password = environment.get("ICECAST_PASSWORD", default="${icecastPassword}")

log("Iniciando stream para ${config.client.name} en ${config.mountpoint}")

# Playlist principal - ${mainPlaylist.name}
# Archivos:
${mainPlaylist.items.map((item) => `# - ${convertPath(item.audioFile.storagePath)}`).join("\n")}
main_playlist_${clientId.replace(/-/g, "_")} = playlist(
  mode="${config.playbackMode === "random" ? "randomize" : "normal"}",
  reload_mode="watch",
  "/audio/${clientId}/playlist.m3u"
)

${
  announcementConfig?.enabled && announcements && announcements.length > 0
    ? `
# Locuciones de hora
# Archivos:
${announcements.map((ann) => `# - ${convertPath(ann.storagePath)}`).join("\n")}
announcements_playlist_${clientId.replace(/-/g, "_")} = playlist(
  mode="randomize",
  reload_mode="watch",
  "/audio/${clientId}/announcements.m3u"
)
`
    : ""
}

${
  config.jinglesEnabled && jinglesPlaylist && jinglesPlaylist.items.length > 0
    ? `
# Playlist de jingles
jingles_playlist_${clientId.replace(/-/g, "_")} = playlist(
  mode="randomize",
  reload_mode="watch",
  "/audio/${clientId}/jingles.m3u"
)
`
    : ""
}

${
  // Combinar fuentes según configuración
  (() => {
    const hasAnnouncements = announcementConfig?.enabled && announcements && announcements.length > 0;
    const hasJingles = config.jinglesEnabled && jinglesPlaylist && jinglesPlaylist.items.length > 0;

    if (hasAnnouncements && hasJingles) {
      // Ambos activos: locuciones cada X canciones, jingles cada Y canciones
      return `
# Insertar locuciones cada ${announcementConfig.playEveryXSongs} canciones
radio_with_announcements_${clientId.replace(/-/g, "_")} = rotate(
  weights=[${announcementConfig.playEveryXSongs}, 1],
  [main_playlist_${clientId.replace(/-/g, "_")}, announcements_playlist_${clientId.replace(/-/g, "_")}]
)

# Insertar jingles cada ${config.jinglesFrequency} canciones
radio_${clientId.replace(/-/g, "_")} = rotate(
  weights=[${config.jinglesFrequency}, 1],
  [radio_with_announcements_${clientId.replace(/-/g, "_")}, jingles_playlist_${clientId.replace(/-/g, "_")}]
)
`;
    } else if (hasAnnouncements) {
      // Solo locuciones
      return `
# Insertar locuciones cada ${announcementConfig.playEveryXSongs} canciones
radio_${clientId.replace(/-/g, "_")} = rotate(
  weights=[${announcementConfig.playEveryXSongs}, 1],
  [main_playlist_${clientId.replace(/-/g, "_")}, announcements_playlist_${clientId.replace(/-/g, "_")}]
)
`;
    } else if (hasJingles) {
      // Solo jingles
      return `
# Insertar jingles cada ${config.jinglesFrequency} canciones
radio_${clientId.replace(/-/g, "_")} = rotate(
  weights=[${config.jinglesFrequency}, 1],
  [main_playlist_${clientId.replace(/-/g, "_")}, jingles_playlist_${clientId.replace(/-/g, "_")}]
)
`;
    } else {
      // Sin locuciones ni jingles
      return `
# Radio sin locuciones ni jingles
radio_${clientId.replace(/-/g, "_")} = main_playlist_${clientId.replace(/-/g, "_")}
`;
    }
  })()
}

# Aplicar crossfade
radio_${clientId.replace(/-/g, "_")} = crossfade(
  duration=${config.crossfadeDuration.toFixed(1)},
  radio_${clientId.replace(/-/g, "_")}
)

# Normalizar audio (usar normalize para normalización automática)
radio_${clientId.replace(/-/g, "_")} = ${
  config.normalizeAudio 
    ? `normalize(target=-16.0, window=0.1, radio_${clientId.replace(/-/g, "_")})` 
    : `radio_${clientId.replace(/-/g, "_")}`
}

# Hacer la fuente infallible (fallback a silencio si falla)
radio_${clientId.replace(/-/g, "_")} = mksafe(radio_${clientId.replace(/-/g, "_")})

# Output a Icecast con metadata actualizada
output.icecast(
  %mp3(bitrate=128),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="${config.mountpoint}",
  name="${config.client.name}",
  description="Radio ${config.client.name}",
  genre="Various",
  url="http://#{icecast_host}:#{icecast_port}${config.mountpoint}",
  public=false,
  radio_${clientId.replace(/-/g, "_")}
)

log("Stream ${config.client.name} activo en ${config.mountpoint}")
`;

    return script;
  }

  /**
   * Genera archivo M3U para una playlist
   */
  static async generateM3U(clientId: string, playlistType: "main" | "jingles" = "main"): Promise<string> {
    const playlist = await prisma.playlist.findFirst({
      where: {
        clientId,
        ...(playlistType === "main" ? { isMain: true } : { type: "jingles" }),
      },
      include: {
        items: {
          include: {
            audioFile: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!playlist || playlist.items.length === 0) {
      throw new Error(`No hay playlist de tipo ${playlistType} o está vacía`);
    }

    // Convertir rutas
    const convertPath = (storagePath: string): string => {
      const fileName = storagePath.split(/[/\\]/).pop() || storagePath;
      return `/audio/${clientId}/${fileName}`;
    };

    // Generar contenido M3U
    const m3uContent = playlist.items
      .map((item) => convertPath(item.audioFile.storagePath))
      .join("\n");

    return m3uContent;
  }

  /**
   * Genera archivo M3U para locuciones de hora
   */
  static async generateAnnouncementsM3U(clientId: string): Promise<string> {
    const announcements = await prisma.timeAnnouncement.findMany({
      where: {
        clientId,
        enabled: true,
        status: "ready",
      },
      orderBy: { createdAt: "asc" },
    });

    if (announcements.length === 0) {
      throw new Error("No hay locuciones activas");
    }

    // Convertir rutas
    const convertPath = (storagePath: string): string => {
      const fileName = storagePath.split(/[/\\]/).pop() || storagePath;
      return `/audio/${clientId}/announcements/${fileName}`;
    };

    // Generar contenido M3U
    const m3uContent = announcements
      .map((ann) => convertPath(ann.storagePath))
      .join("\n");

    return m3uContent;
  }

  /**
   * Recarga la configuración de Liquidsoap
   */
  async reload(): Promise<boolean> {
    try {
      await this.sendCommand("reload");
      return true;
    } catch (error) {
      console.error("Error reloading Liquidsoap:", error);
      return false;
    }
  }

  /**
   * Detiene Liquidsoap
   */
  async shutdown(): Promise<boolean> {
    try {
      await this.sendCommand("shutdown");
      return true;
    } catch (error) {
      console.error("Error shutting down Liquidsoap:", error);
      return false;
    }
  }
}

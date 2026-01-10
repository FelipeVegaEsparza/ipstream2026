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

    // Generar lista de archivos
    const audioFiles = mainPlaylist.items
      .map((item) => item.audioFile.storagePath)
      .join("\n");

    // Generar script
    const script = `#!/usr/bin/liquidsoap

# Configuración de logs
settings.log.level.set(3)
settings.log.file.set(true)
settings.log.file.path.set("/var/log/liquidsoap/liquidsoap.log")

# Configuración del servidor
settings.server.telnet.set(true)
settings.server.telnet.bind_addr.set("0.0.0.0")
settings.server.telnet.port.set(1234)

# Playlist de archivos
playlist_files = [
${mainPlaylist.items.map((item) => `  "${item.audioFile.storagePath}",`).join("\n")}
]

# Crear playlist
radio = playlist(
  mode="${config.playbackMode === "random" ? "randomize" : "normal"}",
  reload_mode="watch",
  playlist_files
)

# Aplicar crossfade
radio = crossfade(
  duration=${config.crossfadeDuration},
  radio
)

# Normalizar audio si está habilitado
radio = if ${config.normalizeAudio} then
  amplify(${config.normalizationLevel}, radio)
else
  radio
end

# Output a Icecast
output.icecast(
  %mp3(bitrate=128),
  host="${config.server.host}",
  port=${config.server.port},
  password="${config.liveInputPassword}",
  mount="${config.mountpoint}",
  name="${config.client.name}",
  description="Radio ${config.client.name}",
  genre="Various",
  url="http://${config.server.host}:${config.server.port}${config.mountpoint}",
  radio
)

# Log
log("Radio ${config.client.name} started on ${config.mountpoint}")
`;

    return script;
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

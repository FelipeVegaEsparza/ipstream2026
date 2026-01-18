import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class ScriptManager {
  private scriptsDir: string;

  constructor(scriptsDir: string = "/scripts/clients") {
    this.scriptsDir = scriptsDir;
  }

  /**
   * Guarda un script de Liquidsoap para un cliente
   */
  async saveScript(clientId: string, scriptContent: string): Promise<string> {
    try {
      // Asegurar que el directorio existe
      await fs.mkdir(this.scriptsDir, { recursive: true });

      // Ruta del archivo
      const scriptPath = path.join(this.scriptsDir, `${clientId}.liq`);

      // Guardar el script
      await fs.writeFile(scriptPath, scriptContent, "utf-8");

      console.log(`Script guardado para cliente ${clientId} en ${scriptPath}`);
      return scriptPath;
    } catch (error) {
      console.error(`Error guardando script para cliente ${clientId}:`, error);
      throw new Error("No se pudo guardar el script");
    }
  }

  /**
   * Guarda un archivo M3U de playlist
   */
  async saveM3U(clientId: string, m3uContent: string, type: "playlist" | "jingles" | "announcements" = "playlist"): Promise<string> {
    try {
      // Directorio de audio del cliente
      const audioDir = path.join(process.cwd(), "public", "audio", clientId);
      await fs.mkdir(audioDir, { recursive: true });

      // Nombre del archivo según el tipo
      const fileName = type === "playlist" ? "playlist.m3u" : type === "jingles" ? "jingles.m3u" : "announcements.m3u";
      const m3uPath = path.join(audioDir, fileName);

      // Guardar el archivo
      await fs.writeFile(m3uPath, m3uContent, "utf-8");

      console.log(`M3U ${type} guardado para cliente ${clientId} en ${m3uPath}`);
      return m3uPath;
    } catch (error) {
      console.error(`Error guardando M3U ${type} para cliente ${clientId}:`, error);
      throw new Error(`No se pudo guardar el archivo M3U ${type}`);
    }
  }

  /**
   * Elimina el script de un cliente
   */
  async deleteScript(clientId: string): Promise<boolean> {
    try {
      const scriptPath = path.join(this.scriptsDir, `${clientId}.liq`);

      // Verificar si existe
      try {
        await fs.access(scriptPath);
      } catch {
        console.log(`Script no existe para cliente ${clientId}`);
        return true; // No existe, consideramos éxito
      }

      // Eliminar
      await fs.unlink(scriptPath);
      console.log(`Script eliminado para cliente ${clientId}`);
      return true;
    } catch (error) {
      console.error(`Error eliminando script para cliente ${clientId}:`, error);
      return false;
    }
  }

  /**
   * Verifica si existe un script para un cliente
   */
  async scriptExists(clientId: string): Promise<boolean> {
    try {
      const scriptPath = path.join(this.scriptsDir, `${clientId}.liq`);
      await fs.access(scriptPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reinicia el contenedor de Liquidsoap para cargar nuevos scripts
   */
  async restartLiquidsoap(): Promise<boolean> {
    try {
      console.log("Reiniciando contenedor de Liquidsoap...");
      
      // Reiniciar el contenedor usando docker-compose
      await execAsync("docker-compose -f docker-compose.dev.yml restart liquidsoap");
      
      console.log("Liquidsoap reiniciado exitosamente");
      return true;
    } catch (error) {
      console.error("Error reiniciando Liquidsoap:", error);
      return false;
    }
  }

  /**
   * Obtiene la lista de scripts activos
   */
  async listScripts(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.scriptsDir);
      return files.filter((file) => file.endsWith(".liq"));
    } catch (error) {
      console.error("Error listando scripts:", error);
      return [];
    }
  }
}

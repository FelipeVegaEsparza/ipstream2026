import { exec } from "child_process";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";
import { existsSync } from "fs";

const execAsync = promisify(exec);

interface AudioMetadata {
  duration: number;
  bitrate: number;
  sampleRate: number;
  channels: number;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
}

export class AudioProcessingService {
  /**
   * Verifica si FFmpeg está disponible en el sistema
   */
  static async checkFFmpegAvailable(): Promise<boolean> {
    try {
      await execAsync("ffmpeg -version");
      return true;
    } catch (error) {
      console.warn("FFmpeg no está disponible en el sistema");
      return false;
    }
  }

  /**
   * Extrae metadata de un archivo de audio usando FFmpeg
   */
  static async extractMetadata(filePath: string): Promise<AudioMetadata> {
    try {
      // Verificar que el archivo existe
      if (!existsSync(filePath)) {
        throw new Error(`Archivo no encontrado: ${filePath}`);
      }

      const { stdout } = await execAsync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`
      );

      const data = JSON.parse(stdout);
      const audioStream = data.streams.find((s: any) => s.codec_type === "audio");
      const format = data.format;

      if (!audioStream) {
        throw new Error("No se encontró stream de audio");
      }

      // Extraer metadata
      const metadata: AudioMetadata = {
        duration: parseFloat(format.duration) || 0,
        bitrate: parseInt(format.bit_rate) || parseInt(audioStream.bit_rate) || 128000,
        sampleRate: parseInt(audioStream.sample_rate) || 44100,
        channels: parseInt(audioStream.channels) || 2,
      };

      // Tags opcionales
      if (format.tags) {
        metadata.title = format.tags.title || format.tags.TITLE;
        metadata.artist = format.tags.artist || format.tags.ARTIST;
        metadata.album = format.tags.album || format.tags.ALBUM;
        metadata.genre = format.tags.genre || format.tags.GENRE;
        
        const year = format.tags.date || format.tags.DATE || format.tags.year;
        if (year) {
          metadata.year = parseInt(year.toString().substring(0, 4));
        }
      }

      return metadata;
    } catch (error) {
      console.error("Error extracting metadata:", error);
      throw error;
    }
  }

  /**
   * Valida que el archivo sea un audio válido
   */
  static async validateAudioFile(filePath: string): Promise<boolean> {
    try {
      // Verificar que el archivo existe
      if (!existsSync(filePath)) {
        console.error(`Archivo no encontrado: ${filePath}`);
        return false;
      }

      const { stdout } = await execAsync(
        `ffprobe -v error -select_streams a:0 -show_entries stream=codec_type -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
      );

      return stdout.trim() === "audio";
    } catch (error) {
      console.error("Error validating audio file:", error);
      return false;
    }
  }

  /**
   * Procesa un archivo de audio: extrae metadata y actualiza DB
   * Esta es la función principal que debe llamarse después de subir un archivo
   */
  static async processAudioFile(audioFileId: string): Promise<void> {
    try {
      // Obtener archivo de DB
      const audioFile = await prisma.audioFile.findUnique({
        where: { id: audioFileId },
      });

      if (!audioFile) {
        throw new Error("Archivo no encontrado en la base de datos");
      }

      console.log(`Procesando archivo: ${audioFile.filename} (${audioFileId})`);

      // Verificar si FFmpeg está disponible
      const hasFFmpeg = await this.checkFFmpegAvailable();
      
      if (!hasFFmpeg) {
        console.warn("FFmpeg no disponible. Marcando archivo como listo con metadata básica.");
        
        // Extraer nombre sin extensión para usar como título
        const titleFromFilename = audioFile.filename.replace(/\.[^/.]+$/, "");
        
        // Marcar como listo con metadata básica
        await prisma.audioFile.update({
          where: { id: audioFileId },
          data: {
            title: titleFromFilename,
            duration: 180, // 3 minutos por defecto
            bitrate: 128000,
            sampleRate: 44100,
            channels: 2,
            status: "ready",
          },
        });
        
        console.log(`Archivo ${audioFileId} marcado como listo (sin FFmpeg)`);
        return;
      }

      // Verificar que el archivo existe físicamente
      if (!existsSync(audioFile.storagePath)) {
        throw new Error(`Archivo físico no encontrado: ${audioFile.storagePath}`);
      }

      // Validar que es un archivo de audio válido
      const isValid = await this.validateAudioFile(audioFile.storagePath);
      if (!isValid) {
        await prisma.audioFile.update({
          where: { id: audioFileId },
          data: { status: "error" },
        });
        throw new Error("Archivo de audio inválido o corrupto");
      }

      // Extraer metadata con FFmpeg
      const metadata = await this.extractMetadata(audioFile.storagePath);

      // Extraer título del nombre de archivo si no hay metadata
      const titleFromFilename = audioFile.filename.replace(/\.[^/.]+$/, "");

      // Actualizar en DB con toda la metadata
      await prisma.audioFile.update({
        where: { id: audioFileId },
        data: {
          duration: metadata.duration,
          bitrate: metadata.bitrate,
          sampleRate: metadata.sampleRate,
          channels: metadata.channels,
          title: metadata.title || titleFromFilename,
          artist: metadata.artist,
          album: metadata.album,
          genre: metadata.genre,
          year: metadata.year,
          status: "ready",
        },
      });

      console.log(`Archivo ${audioFileId} procesado exitosamente`);
    } catch (error) {
      console.error(`Error procesando archivo ${audioFileId}:`, error);
      
      // Marcar como error en la base de datos
      try {
        await prisma.audioFile.update({
          where: { id: audioFileId },
          data: { 
            status: "error",
          },
        });
      } catch (dbError) {
        console.error("Error actualizando estado a error:", dbError);
      }

      throw error;
    }
  }

  /**
   * Extrae cover art de un archivo de audio
   */
  static async extractCoverArt(
    filePath: string,
    outputPath: string
  ): Promise<boolean> {
    try {
      await execAsync(
        `ffmpeg -i "${filePath}" -an -vcodec copy "${outputPath}"`
      );
      return true;
    } catch (error) {
      console.error("Error extracting cover art:", error);
      return false;
    }
  }

  /**
   * Convierte un archivo de audio a otro formato
   */
  static async convertAudio(
    inputPath: string,
    outputPath: string,
    format: "mp3" | "aac" | "ogg",
    bitrate: number = 128
  ): Promise<void> {
    try {
      let codec = "libmp3lame";
      if (format === "aac") codec = "aac";
      if (format === "ogg") codec = "libvorbis";

      await execAsync(
        `ffmpeg -i "${inputPath}" -c:a ${codec} -b:a ${bitrate}k "${outputPath}"`
      );
    } catch (error) {
      console.error("Error converting audio:", error);
      throw new Error("Error al convertir audio");
    }
  }
}

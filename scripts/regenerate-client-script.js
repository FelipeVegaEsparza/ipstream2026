// Script para regenerar el script de Liquidsoap de un cliente
// Uso: node scripts/regenerate-client-script.js [clientId]

const fs = require('fs');
const path = require('path');

const clientId = process.argv[2] || 'cmk7r1pzh0003josww1yjse2w';

console.log(`Regenerando script para cliente: ${clientId}`);

// Leer el archivo de audio de la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function regenerateScript() {
  try {
    // Obtener configuración
    const config = await prisma.streamConfig.findUnique({
      where: { clientId },
      include: {
        server: true,
        client: true,
      },
    });

    if (!config) {
      throw new Error('Configuración no encontrada');
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
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!mainPlaylist || mainPlaylist.items.length === 0) {
      throw new Error('No hay playlist principal o está vacía');
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
          status: 'ready',
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    // Convertir rutas
    const convertPath = (storagePath) => {
      const fileName = storagePath.split(/[/\\]/).pop() || storagePath;
      return `/audio/${clientId}/${fileName}`;
    };

    // Variables de entorno
    const icecastHost = process.env.ICECAST_HOST || 'icecast';
    const icecastPort = process.env.ICECAST_PORT || '8000';
    const icecastPassword = process.env.ICECAST_PASSWORD || 'hackme';

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
${mainPlaylist.items.map((item) => `# - ${convertPath(item.audioFile.storagePath)}`).join('\n')}
main_playlist_${clientId.replace(/-/g, '_')} = playlist(
  mode="${config.playbackMode === 'random' ? 'randomize' : 'normal'}",
  reload_mode="watch",
  "/audio/${clientId}/playlist.m3u"
)

${
  announcementConfig?.enabled && announcements && announcements.length > 0
    ? `
# Locuciones de hora
# Archivos:
${announcements.map((ann) => `# - ${convertPath(ann.storagePath)}`).join('\n')}
announcements_playlist_${clientId.replace(/-/g, '_')} = playlist(
  mode="randomize",
  reload_mode="watch",
  "/audio/${clientId}/announcements.m3u"
)

# Insertar locuciones cada ${announcementConfig.playEveryXSongs} canciones
radio_${clientId.replace(/-/g, '_')} = rotate(
  weights=[${announcementConfig.playEveryXSongs}, 1],
  [main_playlist_${clientId.replace(/-/g, '_')}, announcements_playlist_${clientId.replace(/-/g, '_')}]
)
`
    : `
# Radio sin locuciones
radio_${clientId.replace(/-/g, '_')} = main_playlist_${clientId.replace(/-/g, '_')}
`
}

# Aplicar crossfade
radio_${clientId.replace(/-/g, '_')} = crossfade(
  duration=${config.crossfadeDuration}.0,
  radio_${clientId.replace(/-/g, '_')}
)

# Normalizar audio (usar normalize para normalización automática)
radio_${clientId.replace(/-/g, '_')} = ${
  config.normalizeAudio 
    ? `normalize(target=-16.0, window=0.1, radio_${clientId.replace(/-/g, '_')})` 
    : `radio_${clientId.replace(/-/g, '_')}`
}

# Hacer la fuente infallible (fallback a silencio si falla)
radio_${clientId.replace(/-/g, '_')} = mksafe(radio_${clientId.replace(/-/g, '_')})

# Output a Icecast
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
  radio_${clientId.replace(/-/g, '_')}
)

log("Stream ${config.client.name} activo en ${config.mountpoint}")
`;

    // Guardar script
    const scriptPath = path.join(__dirname, '..', 'docker', 'liquidsoap', 'scripts', 'clients', `${clientId}.liq`);
    fs.writeFileSync(scriptPath, script, 'utf-8');

    // Generar archivo M3U principal
    const m3uContent = mainPlaylist.items.map((item) => convertPath(item.audioFile.storagePath)).join('\n');
    const audioDir = path.join(__dirname, '..', 'public', 'audio', clientId);
    
    // Asegurar que el directorio existe
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    const m3uPath = path.join(audioDir, 'playlist.m3u');
    fs.writeFileSync(m3uPath, m3uContent, 'utf-8');

    // Generar archivo M3U de locuciones si están habilitadas
    if (announcementConfig?.enabled && announcements && announcements.length > 0) {
      const announcementsM3U = announcements.map((ann) => {
        const fileName = ann.storagePath.split(/[/\\]/).pop() || ann.storagePath;
        return `/audio/${clientId}/announcements/${fileName}`;
      }).join('\n');
      
      const announcementsPath = path.join(audioDir, 'announcements.m3u');
      fs.writeFileSync(announcementsPath, announcementsM3U, 'utf-8');
      console.log(`✓ Locuciones M3U generadas en: ${announcementsPath}`);
    }

    console.log(`✓ Script regenerado exitosamente en: ${scriptPath}`);
    console.log(`✓ Playlist M3U generada en: ${m3uPath}`);
    console.log(`\nRutas de audio:`);
    mainPlaylist.items.forEach((item) => {
      console.log(`  - ${convertPath(item.audioFile.storagePath)}`);
    });

    if (announcementConfig?.enabled && announcements && announcements.length > 0) {
      console.log(`\nLocuciones (cada ${announcementConfig.playEveryXSongs} canciones):`);
      announcements.forEach((ann) => {
        console.log(`  - ${ann.description || ann.filename}`);
      });
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

regenerateScript();

#!/usr/bin/liquidsoap

# Configuración básica de Liquidsoap para IPStream Panel
# Este es un script de prueba inicial

# Configuración de logs
settings.log.file.set(true)
settings.log.file.path.set("/var/log/liquidsoap/liquidsoap.log")
settings.log.level.set(3)

# Configuración de servidor telnet para control remoto
settings.server.telnet.set(true)
settings.server.telnet.bind_addr.set("0.0.0.0")
settings.server.telnet.port.set(1234)

# Variables de entorno con valores por defecto
icecast_host = environment.get("ICECAST_HOST", default="icecast")
icecast_port = int_of_string(default=8000, environment.get("ICECAST_PORT", default="8000"))
icecast_password = environment.get("ICECAST_PASSWORD", default="hackme")

# Log de inicio
log("IPStream Liquidsoap iniciando...")
log("Icecast host: #{icecast_host}:#{icecast_port}")

# Fuente de prueba: playlist de archivos de audio
# Por ahora usamos una playlist simple de archivos locales
# En producción, esto leerá de la base de datos

# Playlist de prueba (vacía por ahora, se llenará desde el panel)
playlist_source = playlist(
  mode="randomize",
  reload_mode="watch",
  "/audio/playlist.m3u"
)

# Aplicar crossfade (transición suave entre canciones)
playlist_with_crossfade = crossfade(
  duration=3.0,
  playlist_source
)

# Normalizar volumen
normalized = amplify(
  1.0,
  playlist_with_crossfade
)

# Fallback: si no hay playlist, reproducir silencio
safe_source = fallback(
  track_sensitive=false,
  [normalized, blank()]
)

# Output a Icecast - Mountpoint de prueba
output.icecast(
  %mp3(bitrate=128),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/test",
  name="IPStream Test Stream",
  description="Stream de prueba para desarrollo",
  genre="Various",
  url="http://localhost:3000",
  safe_source
)

log("Liquidsoap configurado y listo")
log("Stream disponible en: http://#{icecast_host}:#{icecast_port}/test")

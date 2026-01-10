#!/usr/bin/liquidsoap

# Configuración básica de Liquidsoap para IPStream Panel
# Este es un script de prueba inicial

# Configuración de logs
set("log.file.path", "/var/log/liquidsoap/liquidsoap.log")
set("log.level", 3)

# Configuración de servidor telnet para control remoto
set("server.telnet", true)
set("server.telnet.bind_addr", "0.0.0.0")
set("server.telnet.port", 1234)

# Variables de entorno
icecast_host = getenv("ICECAST_HOST")
icecast_port = int_of_string(getenv("ICECAST_PORT"))
icecast_password = getenv("ICECAST_PASSWORD")

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
normalized = normalize(
  target=-14.0,
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

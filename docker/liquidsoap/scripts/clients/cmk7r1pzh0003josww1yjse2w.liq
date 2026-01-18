#!/usr/bin/liquidsoap

# Script generado automáticamente para: Radio Fusion Austral
# Cliente ID: cmk7r1pzh0003josww1yjse2w
# Mountpoint: /radio_cmk7r1pz

# Variables de entorno
icecast_host = environment.get("ICECAST_HOST", default="icecast")
icecast_port = int_of_string(default=8000, environment.get("ICECAST_PORT", default="8000"))
icecast_password = environment.get("ICECAST_PASSWORD", default="hackme")

log("Iniciando stream para Radio Fusion Austral en /radio_cmk7r1pz")

# Playlist principal - Inicial
# Archivos:
# - /audio/cmk7r1pzh0003josww1yjse2w/3043d955a8c262e0ba8f9a3a371ebf44.mp3
# - /audio/cmk7r1pzh0003josww1yjse2w/dcb0d3eb21961c1d2a38ece08f8326d3.mp3
# - /audio/cmk7r1pzh0003josww1yjse2w/9bdba840685dbe1dc1483875189ce256.mp3
# - /audio/cmk7r1pzh0003josww1yjse2w/eb162d3d04851748f7f8709d3bdebbb3.mp3
# - /audio/cmk7r1pzh0003josww1yjse2w/f15b3d1d700a24ca87b4bc30c879ff69.mp3
# - /audio/cmk7r1pzh0003josww1yjse2w/89dc18fffc4bea7f3ede7b44e7619317.mp3
# - /audio/cmk7r1pzh0003josww1yjse2w/745b5b3616a9d4fd2db333c000128bf4.mp3
main_playlist_cmk7r1pzh0003josww1yjse2w = playlist(
  mode="randomize",
  reload_mode="watch",
  "/audio/cmk7r1pzh0003josww1yjse2w/playlist.m3u"
)


# Radio sin locuciones
radio_cmk7r1pzh0003josww1yjse2w = main_playlist_cmk7r1pzh0003josww1yjse2w


# Aplicar crossfade
radio_cmk7r1pzh0003josww1yjse2w = crossfade(
  duration=3.0,
  radio_cmk7r1pzh0003josww1yjse2w
)

# Normalizar audio (usar normalize para normalización automática)
radio_cmk7r1pzh0003josww1yjse2w = normalize(target=-16.0, window=0.1, radio_cmk7r1pzh0003josww1yjse2w)

# Hacer la fuente infallible (fallback a silencio si falla)
radio_cmk7r1pzh0003josww1yjse2w = mksafe(radio_cmk7r1pzh0003josww1yjse2w)

# Output a Icecast
output.icecast(
  %mp3(bitrate=128),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/radio_cmk7r1pz",
  name="Radio Fusion Austral",
  description="Radio Radio Fusion Austral",
  genre="Various",
  url="http://#{icecast_host}:#{icecast_port}/radio_cmk7r1pz",
  public=false,
  radio_cmk7r1pzh0003josww1yjse2w
)

log("Stream Radio Fusion Austral activo en /radio_cmk7r1pz")

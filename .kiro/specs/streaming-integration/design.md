# Design Document - Sistema de Streaming Integrado

## Database Schema

### Modelos Creados

#### 1. StreamServer
Representa un servidor VPS donde corre Icecast + Liquidsoap.

```prisma
model StreamServer {
  id          String   // ID único
  name        String   // Nombre descriptivo
  host        String   // IP o dominio
  port        Int      // Puerto de Icecast (default: 8000)
  capacity    Int      // Máximo de clientes
  currentLoad Int      // Clientes actualmente asignados
  status      String   // "online" | "offline" | "maintenance"
  region      String?  // Región geográfica
}
```

**Propósito**: Gestionar múltiples servidores de streaming para distribuir la carga.

---

#### 2. StreamConfig
Configuración de streaming por cliente.

```prisma
model StreamConfig {
  id                String
  clientId          String   @unique
  serverId          String
  mountpoint        String   // Mountpoint único
  
  // Calidades
  bitrates          String   // JSON: ["64", "128", "320"]
  maxListeners      Int
  
  // AutoDJ
  autodjEnabled     Boolean
  crossfadeDuration Float
  normalizeAudio    Boolean
  normalizationLevel Float
  playbackMode      String   // "random" | "sequential"
  
  // Live Input
  liveInputEnabled  Boolean
  liveInputPassword String
  
  // Jingles
  jinglesEnabled    Boolean
  jinglesFrequency  Int
  
  status            String   // "active" | "inactive" | "error"
}
```

**Propósito**: Configuración completa del stream de cada cliente.

---

#### 3. AudioFile
Archivos de audio subidos por los clientes.

```prisma
model AudioFile {
  id          String
  clientId    String
  
  // Archivo
  filename    String
  storagePath String
  fileSize    Int
  duration    Float
  
  // Metadata
  title       String?
  artist      String?
  album       String?
  genre       String?
  year        Int?
  coverUrl    String?
  
  // Técnico
  format      String   // "mp3" | "aac" | "ogg"
  bitrate     Int
  sampleRate  Int
  channels    Int
  
  status      String   // "processing" | "ready" | "error"
}
```

**Propósito**: Gestionar la biblioteca de audio de cada cliente.

---

#### 4. Playlist
Listas de reproducción.

```prisma
model Playlist {
  id          String
  clientId    String
  name        String
  type        String   // "rotation" | "special" | "jingles"
  description String?
  isMain      Boolean  // Playlist principal para AutoDJ
}
```

**Propósito**: Organizar archivos de audio en playlists.

---

#### 5. PlaylistItem
Relación muchos a muchos entre Playlist y AudioFile.

```prisma
model PlaylistItem {
  id          String
  playlistId  String
  audioFileId String
  order       Int
}
```

**Propósito**: Definir qué canciones están en cada playlist y su orden.

---

#### 6. Schedule
Programación horaria de playlists.

```prisma
model Schedule {
  id         String
  clientId   String
  playlistId String
  dayOfWeek  Int      // 0=Domingo, 1=Lunes, ..., 6=Sábado
  startTime  String   // "HH:MM"
  endTime    String   // "HH:MM"
  isActive   Boolean
}
```

**Propósito**: Programar diferentes playlists según día y hora.

---

#### 7. StreamStats
Estadísticas de streaming.

```prisma
model StreamStats {
  id              String
  clientId        String
  timestamp       DateTime
  listeners       Int
  peakListeners   Int
  currentSong     String?
  
  // Por calidad
  listeners64     Int
  listeners128    Int
  listeners320    Int
  
  streamStatus    String   // "online" | "offline"
  uptime          Int
}
```

**Propósito**: Almacenar estadísticas históricas de audiencia.

---

#### 8. LiveSession
Sesiones de transmisión en vivo.

```prisma
model LiveSession {
  id            String
  clientId      String
  djName        String?
  startTime     DateTime
  endTime       DateTime?
  duration      Int?
  peakListeners Int
  avgListeners  Int
}
```

**Propósito**: Registrar sesiones de transmisión en vivo de DJs.

---

## Relaciones

```
Client
  ├── StreamConfig (1:1)
  ├── AudioFile[] (1:N)
  ├── Playlist[] (1:N)
  ├── Schedule[] (1:N)
  ├── StreamStats[] (1:N)
  └── LiveSession[] (1:N)

StreamServer
  └── StreamConfig[] (1:N)

Playlist
  ├── PlaylistItem[] (1:N)
  └── Schedule[] (1:N)

AudioFile
  └── PlaylistItem[] (1:N)
```

---

## Flujos de Datos

### 1. Configuración Inicial de un Cliente

```
1. Admin crea StreamServer (si no existe)
2. Admin asigna cliente a StreamServer
3. Sistema crea StreamConfig para el cliente
   - Genera mountpoint único
   - Genera contraseña de live input
   - Configura valores por defecto
4. Cliente puede empezar a subir audio
```

### 2. Subida de Audio

```
1. Cliente sube archivo MP3
2. Sistema guarda en /audio/[clientId]/
3. FFmpeg extrae metadata
4. Se crea registro AudioFile
5. Estado: "processing" → "ready"
6. Cliente puede agregar a playlists
```

### 3. Creación de Playlist

```
1. Cliente crea Playlist
2. Cliente agrega AudioFiles
3. Se crean PlaylistItems con orden
4. Cliente puede marcar como "Main"
5. Liquidsoap lee playlist de DB
```

### 4. Programación Horaria

```
1. Cliente crea Schedule
2. Define día, hora inicio, hora fin
3. Asigna Playlist
4. Liquidsoap cambia playlist según horario
```

### 5. Transmisión en Vivo

```
1. DJ se conecta con credenciales
2. Sistema detecta conexión
3. Crea LiveSession
4. Pausa AutoDJ
5. DJ desconecta
6. Finaliza LiveSession
7. Reanuda AutoDJ
```

### 6. Estadísticas

```
1. Job cada 5 minutos
2. Lee stats de Icecast (XML/JSON)
3. Crea registro StreamStats
4. Calcula picos y promedios
5. Muestra en dashboard
```

---

## APIs a Implementar

### Admin APIs

```
POST   /api/admin/stream-servers          # Crear servidor
GET    /api/admin/stream-servers          # Listar servidores
PUT    /api/admin/stream-servers/[id]     # Actualizar servidor
DELETE /api/admin/stream-servers/[id]     # Eliminar servidor

POST   /api/admin/clients/[id]/assign-server  # Asignar servidor
```

### Client APIs

```
# Configuración
GET    /api/stream/config                 # Obtener configuración
PUT    /api/stream/config                 # Actualizar configuración

# Audio
POST   /api/audio/upload                  # Subir archivo
GET    /api/audio                         # Listar archivos
GET    /api/audio/[id]                    # Obtener detalle
PUT    /api/audio/[id]                    # Editar metadata
DELETE /api/audio/[id]                    # Eliminar archivo

# Playlists
POST   /api/playlists                     # Crear playlist
GET    /api/playlists                     # Listar playlists
GET    /api/playlists/[id]                # Obtener detalle
PUT    /api/playlists/[id]                # Actualizar playlist
DELETE /api/playlists/[id]                # Eliminar playlist

POST   /api/playlists/[id]/items          # Agregar canción
DELETE /api/playlists/[id]/items/[itemId] # Quitar canción
PUT    /api/playlists/[id]/reorder        # Reordenar

# Programación
POST   /api/schedule                      # Crear horario
GET    /api/schedule                      # Listar horarios
PUT    /api/schedule/[id]                 # Actualizar horario
DELETE /api/schedule/[id]                 # Eliminar horario

# Control
POST   /api/stream/start                  # Iniciar stream
POST   /api/stream/stop                   # Detener stream
POST   /api/stream/skip                   # Saltar canción
GET    /api/stream/status                 # Estado actual

# Estadísticas
GET    /api/stream/stats                  # Stats en tiempo real
GET    /api/stream/stats/history          # Stats históricas
GET    /api/stream/now-playing            # Canción actual
GET    /api/stream/history                # Historial de reproducción

# Live Input
GET    /api/stream/live-credentials       # Obtener credenciales
POST   /api/stream/live-credentials/regenerate  # Regenerar
GET    /api/stream/live-sessions          # Historial de sesiones
```

### Public APIs

```
GET /api/public/[clientId]/stream/status      # Estado del stream
GET /api/public/[clientId]/stream/now-playing # Canción actual
GET /api/public/[clientId]/stream/history     # Historial
GET /api/public/[clientId]/stream/stats       # Estadísticas
```

---

## Componentes de UI

### Admin Dashboard

```
/admin/stream-servers
  - Lista de servidores
  - Formulario crear/editar
  - Indicador de carga
  - Estado (online/offline)

/admin/clients
  - Asignar servidor a cliente
  - Ver configuración de streaming
```

### Client Dashboard

```
/dashboard/streaming
  - Overview (oyentes actuales, estado)
  - Configuración rápida (on/off)

/dashboard/streaming/config
  - Configuración completa
  - Calidades, AutoDJ, Live Input, Jingles

/dashboard/streaming/audio
  - Biblioteca de audio
  - Upload con drag & drop
  - Editar metadata
  - Espacio usado/disponible

/dashboard/streaming/playlists
  - Lista de playlists
  - Crear/editar playlist
  - Agregar canciones con drag & drop
  - Reordenar canciones

/dashboard/streaming/schedule
  - Calendario semanal
  - Crear bloques de programación
  - Asignar playlists

/dashboard/streaming/stats
  - Oyentes en tiempo real
  - Gráficos de audiencia
  - Historial de reproducción
  - Top canciones

/dashboard/streaming/live
  - Credenciales de conexión
  - Guías de configuración (Butt, Mixxx)
  - Estado de conexión
  - Historial de sesiones
```

---

## Servicios Backend

### AudioProcessingService
- Validar archivos de audio
- Extraer metadata con FFmpeg
- Convertir formatos si es necesario
- Generar thumbnails de cover art

### LiquidsoapService
- Generar scripts de Liquidsoap dinámicos
- Comunicación vía Telnet
- Controlar reproducción
- Leer estado actual

### IcecastService
- Leer estadísticas de Icecast
- Parsear XML/JSON
- Calcular oyentes totales

### StreamMonitorService
- Job cada 5 minutos
- Recolectar estadísticas
- Detectar caídas
- Enviar alertas

---

## Estado Actual

### ✅ Completado
- [x] Modelos de Prisma diseñados
- [x] Migraciones ejecutadas
- [x] Tablas creadas en MySQL
- [x] Docker Compose funcionando
- [x] Icecast operativo
- [x] Liquidsoap reproduciendo

### ⏳ Siguiente
- [ ] Implementar APIs de StreamServer (Admin)
- [ ] Implementar APIs de StreamConfig (Client)
- [ ] Crear componentes de UI
- [ ] Integrar con Liquidsoap

---

**Fecha**: 2026-01-09  
**Versión**: 1.0  
**Estado**: Fase 1 Completada

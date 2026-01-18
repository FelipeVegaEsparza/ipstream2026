# Sistema de Locuciones de Hora

## Descripción
Sistema que permite agregar locuciones de hora que se reproducen automáticamente entre las canciones del stream.

## Características

### 1. Configuración Global
- **Activar/Desactivar**: Control on/off para el sistema de locuciones
- **Frecuencia**: Configurar cada cuántas canciones se reproduce una locución (1-20 canciones)

### 2. Gestión de Locuciones
- **Subir archivos**: MP3, WAV, OGG (máximo 10MB)
- **Descripción**: Texto descriptivo opcional (ej: "Son las 10 de la mañana")
- **Hora asociada**: Opcional, para indicar qué hora representa (0-23)
- **Activar/Desactivar**: Control individual por locución
- **Eliminar**: Remover locuciones del sistema

### 3. Integración con Liquidsoap

#### Generación de Scripts
El sistema genera automáticamente scripts de Liquidsoap que incluyen:

```liquidsoap
# Playlist principal
main_playlist = playlist(mode="randomize", "/audio/[clientId]/playlist.m3u")

# Playlist de locuciones
announcements_playlist = playlist(mode="randomize", "/audio/[clientId]/announcements.m3u")

# Insertar locuciones cada X canciones
radio = rotate(
  weights=[X, 1],
  [main_playlist, announcements_playlist]
)
```

#### Funcionamiento de `rotate`
- `weights=[5, 1]` significa: 5 canciones, 1 locución, 5 canciones, 1 locución...
- Las locuciones se seleccionan aleatoriamente de la playlist
- Si no hay locuciones activas, solo se reproduce la playlist principal

### 4. Archivos Generados

#### announcements.m3u
Archivo M3U con las rutas de todas las locuciones activas:
```
/audio/[clientId]/announcements/1234567890-abc123.mp3
/audio/[clientId]/announcements/1234567891-def456.mp3
```

#### Estructura de Directorios
```
public/
  audio/
    [clientId]/
      playlist.m3u          # Playlist principal
      announcements.m3u     # Playlist de locuciones
      announcements/        # Archivos de locuciones
        [timestamp]-[hash].mp3
```

## Uso

### 1. Configurar Locuciones
1. Ir a Dashboard > Streaming > Locuciones
2. Hacer clic en "Configurar"
3. Activar locuciones automáticas
4. Configurar frecuencia (cada X canciones)
5. Guardar configuración

### 2. Subir Locuciones
1. Hacer clic en "Nueva Locución"
2. Seleccionar archivo de audio
3. (Opcional) Agregar descripción
4. (Opcional) Indicar hora que representa
5. Subir

### 3. Activar Stream
1. Ir a Dashboard > Streaming
2. Hacer clic en "Iniciar Stream"
3. El sistema generará automáticamente:
   - Script de Liquidsoap con locuciones
   - Archivo M3U de locuciones
   - Configuración de frecuencia

### 4. Gestionar Locuciones
- **Activar/Desactivar**: Click en el botón de play/pause
- **Eliminar**: Click en el botón de eliminar
- Las locuciones desactivadas no se incluyen en el M3U

## Base de Datos

### Tabla: time_announcements
```sql
- id: string (PK)
- clientId: string (FK)
- filename: string
- storagePath: string
- fileSize: int
- duration: float
- description: string (nullable)
- hourValue: int (nullable, 0-23)
- enabled: boolean
- status: string (processing|ready|error)
- createdAt: datetime
- updatedAt: datetime
```

### Tabla: announcement_configs
```sql
- id: string (PK)
- clientId: string (FK, unique)
- enabled: boolean
- playEveryXSongs: int (1-20)
- createdAt: datetime
- updatedAt: datetime
```

## APIs

### POST /api/time-announcements/upload
Sube una nueva locución
- **Body**: FormData con file, description, hourValue
- **Response**: TimeAnnouncement object

### PATCH /api/time-announcements/[id]
Actualiza una locución (activar/desactivar)
- **Body**: { enabled: boolean }
- **Response**: TimeAnnouncement object

### DELETE /api/time-announcements/[id]
Elimina una locución
- **Response**: { success: boolean }

### POST /api/time-announcements/config
Guarda la configuración de locuciones
- **Body**: { enabled: boolean, playEveryXSongs: number }
- **Response**: AnnouncementConfig object

## Regeneración Manual

Para regenerar el script de un cliente con locuciones:

```bash
node scripts/regenerate-client-script.js [clientId]
```

Este script:
1. Lee la configuración de locuciones
2. Genera el script de Liquidsoap con locuciones
3. Genera el archivo M3U de locuciones
4. Muestra información de las locuciones configuradas

## Notas Técnicas

### Conversión de Rutas
Las rutas de Windows se convierten automáticamente a rutas de contenedor Docker:
- Windows: `F:\ipstream2026\public\audio\[clientId]\announcements\file.mp3`
- Docker: `/audio/[clientId]/announcements/file.mp3`

### Normalización de Audio
Las locuciones pasan por el mismo proceso de normalización que las canciones:
```liquidsoap
radio = normalize(target=-16.0, window=0.1, radio)
```

### Crossfade
Las locuciones también tienen crossfade con las canciones según la configuración del cliente.

### Reload Automático
Liquidsoap detecta automáticamente cambios en los archivos M3U gracias a `reload_mode="watch"`.

## Troubleshooting

### Las locuciones no se reproducen
1. Verificar que la configuración está activada
2. Verificar que hay locuciones activas (enabled=true)
3. Verificar que el archivo M3U existe en `public/audio/[clientId]/announcements.m3u`
4. Verificar que los archivos de audio existen en `public/audio/[clientId]/announcements/`
5. Reiniciar el stream

### Error al subir locución
1. Verificar tamaño del archivo (máx 10MB)
2. Verificar formato (MP3, WAV, OGG)
3. Verificar permisos de escritura en `public/audio/[clientId]/announcements/`

### Locuciones se reproducen muy seguido/poco
1. Ajustar el valor de "playEveryXSongs" en la configuración
2. Reiniciar el stream para aplicar cambios

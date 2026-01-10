# Requirements Document - Sistema de Streaming Integrado

## Introduction

Sistema completo de gestión de streaming de audio para radios online, integrado al panel IPStream. Permite a los clientes administrar su contenido de audio, playlists, programación horaria, transmisiones en vivo y estadísticas desde un único panel de control.

## Glossary

- **System**: Panel IPStream con módulo de streaming integrado
- **Client**: Usuario del panel que gestiona una radio online
- **Stream**: Transmisión de audio en tiempo real
- **AutoDJ**: Sistema automático de reproducción de audio
- **Live_Input**: Transmisión en vivo desde un DJ externo
- **Mountpoint**: Punto de acceso único para cada stream en Icecast
- **Liquidsoap**: Motor de procesamiento y automatización de audio
- **Icecast**: Servidor de streaming de audio
- **Playlist**: Lista de archivos de audio para reproducción
- **Bitrate**: Calidad del audio en kbps (64, 128, 320)
- **Listener**: Oyente conectado al stream
- **Jingle**: Audio corto promocional o identificador de la radio
- **Crossfade**: Transición suave entre canciones
- **Fallback**: Sistema de respaldo cuando falla una fuente

## Requirements

### Requirement 1: Gestión de Servidores de Streaming

**User Story:** Como administrador del sistema, quiero gestionar múltiples servidores VPS de streaming, para poder distribuir la carga entre mis clientes.

#### Acceptance Criteria

1. THE System SHALL permitir registrar servidores de streaming con IP, capacidad y estado
2. WHEN un servidor alcanza su capacidad máxima, THE System SHALL marcarlo como no disponible para nuevos clientes
3. THE System SHALL monitorear el estado de cada servidor (online/offline)
4. THE System SHALL mostrar la carga actual de cada servidor (clientes activos)
5. THE System SHALL permitir asignar clientes a servidores específicos manualmente

---

### Requirement 2: Configuración de Streaming por Cliente

**User Story:** Como cliente, quiero configurar mi stream de radio, para que mis oyentes puedan escuchar mi contenido.

#### Acceptance Criteria

1. WHEN un cliente activa el módulo de streaming, THE System SHALL crear una configuración de stream única
2. THE System SHALL asignar un mountpoint único por cliente (ej: /radio_clientid)
3. THE System SHALL permitir configurar múltiples bitrates según el plan (64, 128, 320 kbps)
4. THE System SHALL generar credenciales únicas para live input
5. THE System SHALL permitir habilitar/deshabilitar AutoDJ
6. THE System SHALL permitir habilitar/deshabilitar Live Input
7. THE System SHALL validar que el límite de oyentes no exceda el plan contratado

---

### Requirement 3: Gestión de Biblioteca de Audio

**User Story:** Como cliente, quiero subir y gestionar mis archivos de audio, para construir mi biblioteca musical.

#### Acceptance Criteria

1. WHEN un cliente sube un archivo de audio, THE System SHALL validar el formato (MP3, AAC, OGG)
2. THE System SHALL validar el tamaño máximo del archivo (50MB por archivo)
3. THE System SHALL extraer metadata automáticamente (título, artista, duración, bitrate)
4. THE System SHALL almacenar el archivo en el servidor de streaming asignado
5. THE System SHALL validar que el espacio usado no exceda el límite del plan
6. THE System SHALL permitir editar metadata manualmente
7. THE System SHALL permitir eliminar archivos de audio
8. THE System SHALL mostrar el espacio de almacenamiento usado/disponible
9. WHEN un archivo está en uso en una playlist, THE System SHALL prevenir su eliminación
10. THE System SHALL soportar subida múltiple de archivos (batch upload)

---

### Requirement 4: Gestión de Playlists

**User Story:** Como cliente, quiero crear y gestionar playlists, para organizar mi contenido de audio.

#### Acceptance Criteria

1. THE System SHALL permitir crear playlists con nombre y tipo (rotación, especial, jingles)
2. THE System SHALL permitir agregar archivos de audio a una playlist
3. THE System SHALL permitir reordenar canciones en una playlist mediante drag & drop
4. THE System SHALL permitir eliminar canciones de una playlist
5. THE System SHALL mostrar la duración total de la playlist
6. THE System SHALL permitir duplicar playlists
7. THE System SHALL permitir eliminar playlists vacías
8. WHEN una playlist está en uso en programación, THE System SHALL prevenir su eliminación
9. THE System SHALL permitir marcar una playlist como "Principal" para AutoDJ

---

### Requirement 5: AutoDJ Básico

**User Story:** Como cliente, quiero que mi radio reproduzca música automáticamente, para mantener el stream activo 24/7.

#### Acceptance Criteria

1. WHEN AutoDJ está habilitado, THE System SHALL reproducir canciones de la playlist principal
2. THE System SHALL aplicar crossfade entre canciones (configurable 0-10 segundos)
3. THE System SHALL normalizar el volumen de todas las canciones
4. THE System SHALL actualizar el metadata "Now Playing" en tiempo real
5. THE System SHALL reproducir en modo aleatorio o secuencial (configurable)
6. WHEN la playlist termina, THE System SHALL reiniciar desde el principio
7. THE System SHALL permitir pausar/reanudar el AutoDJ desde el panel
8. THE System SHALL permitir saltar a la siguiente canción manualmente

---

### Requirement 6: Programación Horaria

**User Story:** Como cliente, quiero programar diferentes playlists según el día y hora, para tener contenido variado.

#### Acceptance Criteria

1. THE System SHALL permitir crear bloques de programación con día, hora inicio y hora fin
2. THE System SHALL permitir asignar una playlist a cada bloque
3. THE System SHALL validar que no haya solapamiento de horarios
4. THE System SHALL cambiar automáticamente de playlist según el horario programado
5. THE System SHALL soportar programación diferente para cada día de la semana
6. THE System SHALL permitir copiar programación de un día a otro
7. WHEN no hay programación definida, THE System SHALL usar la playlist principal
8. THE System SHALL mostrar visualmente la programación en un calendario

---

### Requirement 7: Jingles Automáticos

**User Story:** Como cliente, quiero que se reproduzcan jingles automáticamente, para identificar mi radio.

#### Acceptance Criteria

1. THE System SHALL permitir crear una playlist de tipo "Jingles"
2. THE System SHALL permitir configurar frecuencia de jingles (cada X canciones)
3. THE System SHALL reproducir un jingle aleatorio de la playlist de jingles
4. THE System SHALL aplicar crossfade entre jingle y canción
5. THE System SHALL permitir habilitar/deshabilitar jingles automáticos
6. WHEN no hay jingles disponibles, THE System SHALL continuar con música normal

---

### Requirement 8: Live Input (Transmisión en Vivo)

**User Story:** Como cliente, quiero transmitir en vivo desde software externo, para hacer programas en directo.

#### Acceptance Criteria

1. THE System SHALL generar credenciales únicas para live input (usuario/contraseña)
2. THE System SHALL mostrar la URL de conexión para software de DJ (Butt, Mixxx, etc.)
3. WHEN un DJ se conecta, THE System SHALL pausar automáticamente el AutoDJ
4. WHEN un DJ se desconecta, THE System SHALL reanudar automáticamente el AutoDJ
5. THE System SHALL mostrar el estado del live input (conectado/desconectado)
6. THE System SHALL permitir regenerar credenciales de live input
7. THE System SHALL registrar sesiones de live input (inicio, fin, duración)
8. THE System SHALL priorizar live input sobre AutoDJ

---

### Requirement 9: Múltiples Calidades de Stream

**User Story:** Como cliente, quiero ofrecer múltiples calidades de audio, para que oyentes con diferentes conexiones puedan escuchar.

#### Acceptance Criteria

1. THE System SHALL generar múltiples mountpoints según el plan (ej: /radio_64, /radio_128, /radio_320)
2. THE System SHALL transcodificar el audio a cada bitrate configurado
3. THE System SHALL mostrar las URLs de cada calidad en el panel
4. THE System SHALL contabilizar oyentes de todas las calidades en el total
5. WHEN el plan cambia, THE System SHALL ajustar las calidades disponibles

---

### Requirement 10: Estadísticas en Tiempo Real

**User Story:** Como cliente, quiero ver estadísticas de mi stream, para conocer mi audiencia.

#### Acceptance Criteria

1. THE System SHALL mostrar oyentes actuales en tiempo real
2. THE System SHALL mostrar la canción que está sonando actualmente
3. THE System SHALL mostrar el pico de oyentes del día
4. THE System SHALL mostrar gráfico de oyentes de las últimas 24 horas
5. THE System SHALL mostrar historial de reproducción (últimas 20 canciones)
6. THE System SHALL actualizar estadísticas cada 10 segundos
7. THE System SHALL mostrar tiempo de uptime del stream
8. THE System SHALL mostrar distribución de oyentes por calidad (64/128/320)

---

### Requirement 11: Estadísticas Históricas

**User Story:** Como cliente, quiero ver estadísticas históricas, para analizar el crecimiento de mi audiencia.

#### Acceptance Criteria

1. THE System SHALL almacenar estadísticas cada 5 minutos
2. THE System SHALL mostrar gráficos de oyentes por día/semana/mes
3. THE System SHALL mostrar las canciones más reproducidas
4. THE System SHALL mostrar los horarios con más audiencia
5. THE System SHALL permitir exportar estadísticas a CSV
6. THE System SHALL retener estadísticas por 90 días

---

### Requirement 12: Sistema de Planes de Streaming

**User Story:** Como administrador, quiero definir planes de streaming, para ofrecer diferentes niveles de servicio.

#### Acceptance Criteria

1. THE System SHALL permitir crear planes con límites configurables
2. THE System SHALL validar límites de: oyentes simultáneos, almacenamiento, bitrates disponibles
3. WHEN un cliente excede el límite de oyentes, THE System SHALL rechazar nuevas conexiones
4. WHEN un cliente excede el límite de almacenamiento, THE System SHALL prevenir nuevas subidas
5. THE System SHALL mostrar al cliente su uso actual vs límites del plan
6. THE System SHALL permitir upgrade/downgrade de planes

---

### Requirement 13: Monitoreo y Alertas

**User Story:** Como administrador, quiero recibir alertas de problemas, para mantener el servicio funcionando.

#### Acceptance Criteria

1. WHEN un servidor de streaming cae, THE System SHALL enviar alerta al administrador
2. WHEN un stream de cliente cae, THE System SHALL intentar reiniciarlo automáticamente
3. WHEN un cliente excede el 90% de su almacenamiento, THE System SHALL notificar al cliente
4. WHEN un servidor excede el 80% de capacidad, THE System SHALL alertar al administrador
5. THE System SHALL registrar todos los eventos en logs

---

### Requirement 14: Configuración de Audio Avanzada

**User Story:** Como cliente, quiero configurar parámetros de audio, para personalizar el sonido de mi radio.

#### Acceptance Criteria

1. THE System SHALL permitir configurar duración de crossfade (0-10 segundos)
2. THE System SHALL permitir habilitar/deshabilitar normalización de volumen
3. THE System SHALL permitir configurar nivel de normalización (-14 LUFS a -8 LUFS)
4. THE System SHALL permitir configurar modo de reproducción (aleatorio/secuencial)
5. THE System SHALL aplicar cambios sin interrumpir el stream

---

### Requirement 15: Integración con Panel Existente

**User Story:** Como cliente, quiero acceder al módulo de streaming desde mi panel actual, para gestionar todo en un solo lugar.

#### Acceptance Criteria

1. THE System SHALL agregar sección "Streaming" en el menú del dashboard
2. THE System SHALL mostrar estado del stream en el dashboard principal (online/offline)
3. THE System SHALL mostrar oyentes actuales en el dashboard principal
4. THE System SHALL mantener la misma autenticación y sesión del panel
5. THE System SHALL respetar los permisos de rol (ADMIN puede ver todos, CLIENT solo el suyo)

---

### Requirement 16: API Pública de Streaming

**User Story:** Como desarrollador de sitio web, quiero consumir datos del stream vía API, para mostrarlos en el sitio de la radio.

#### Acceptance Criteria

1. THE System SHALL exponer endpoint GET /api/public/[clientId]/stream/status
2. THE System SHALL exponer endpoint GET /api/public/[clientId]/stream/now-playing
3. THE System SHALL exponer endpoint GET /api/public/[clientId]/stream/history
4. THE System SHALL exponer endpoint GET /api/public/[clientId]/stream/stats
5. THE System SHALL incluir URLs de stream en la respuesta
6. THE System SHALL incluir CORS headers para permitir acceso desde cualquier origen

---

### Requirement 17: Reproductor Web Integrado

**User Story:** Como cliente, quiero un reproductor web, para probar mi stream desde el panel.

#### Acceptance Criteria

1. THE System SHALL mostrar un reproductor de audio en el panel
2. THE System SHALL permitir seleccionar la calidad a reproducir
3. THE System SHALL mostrar el estado de reproducción (playing/paused/loading)
4. THE System SHALL mostrar el volumen ajustable
5. THE System SHALL mostrar la canción actual mientras reproduce

---

### Requirement 18: Validación y Procesamiento de Audio

**User Story:** Como sistema, quiero validar y procesar archivos de audio, para garantizar compatibilidad y calidad.

#### Acceptance Criteria

1. WHEN un archivo es subido, THE System SHALL validar que sea un audio válido usando FFmpeg
2. THE System SHALL rechazar archivos corruptos o inválidos
3. THE System SHALL convertir automáticamente archivos a MP3 si están en otro formato
4. THE System SHALL normalizar el bitrate a 320kbps para archivos de alta calidad
5. THE System SHALL generar thumbnail del cover art si existe
6. THE System SHALL mostrar progreso de procesamiento al cliente

---

### Requirement 19: Backup y Recuperación

**User Story:** Como administrador, quiero hacer backups de la configuración, para recuperar datos en caso de fallo.

#### Acceptance Criteria

1. THE System SHALL hacer backup diario de la base de datos de configuración
2. THE System SHALL permitir exportar biblioteca de audio de un cliente
3. THE System SHALL permitir importar biblioteca de audio
4. THE System SHALL permitir exportar playlists en formato M3U
5. THE System SHALL permitir importar playlists desde M3U

---

### Requirement 20: Documentación para Clientes

**User Story:** Como cliente, quiero documentación clara, para configurar mi software de DJ.

#### Acceptance Criteria

1. THE System SHALL mostrar guía de conexión para Butt (Broadcast Using This Tool)
2. THE System SHALL mostrar guía de conexión para Mixxx
3. THE System SHALL mostrar guía de conexión para SAM Broadcaster
4. THE System SHALL mostrar guía de configuración de OBS para streaming
5. THE System SHALL incluir troubleshooting de problemas comunes

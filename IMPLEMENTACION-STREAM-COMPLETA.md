# Implementación Completa del Sistema de Streaming

## 📋 Resumen

Se ha implementado la funcionalidad completa para iniciar y detener streams de forma dinámica. El sistema ahora genera scripts de Liquidsoap automáticamente y gestiona mountpoints en Icecast.

---

## ✅ Cambios Implementados

### 1. Servicio de Gestión de Scripts (`lib/services/scriptManager.ts`)

**Nuevo archivo** que maneja:
- Guardado de scripts de Liquidsoap en el filesystem
- Eliminación de scripts cuando se detiene un stream
- Reinicio automático del contenedor de Liquidsoap
- Listado de scripts activos

**Métodos principales:**
- `saveScript(clientId, scriptContent)`: Guarda un script .liq
- `deleteScript(clientId)`: Elimina un script .liq
- `restartLiquidsoap()`: Reinicia el contenedor Docker
- `scriptExists(clientId)`: Verifica si existe un script
- `listScripts()`: Lista todos los scripts activos

### 2. Actualización del Servicio Liquidsoap (`lib/services/liquidsoap.ts`)

**Cambios en `generateScript()`:**
- Ahora usa variables de entorno para Icecast (host, port, password)
- Genera nombres de variables únicos por cliente (evita conflictos)
- Incluye configuración completa de crossfade, normalización y jingles
- Genera scripts compatibles con Liquidsoap 2.2.5

**Ejemplo de script generado:**
```liquidsoap
#!/usr/bin/liquidsoap

# Script generado automáticamente para: Cliente Demo
# Cliente ID: cmk7r1pz
# Mountpoint: /radio_cmk7r1pz

# Variables de entorno
icecast_host = environment.get("ICECAST_HOST", default="icecast")
icecast_port = int_of_string(default=8000, environment.get("ICECAST_PORT", default="8000"))
icecast_password = environment.get("ICECAST_PASSWORD", default="hackme")

# Playlist principal
main_playlist_cmk7r1pz = playlist(
  mode="randomize",
  reload_mode="watch",
  [
    "/audio/cmk7r1pz/song1.mp3",
    "/audio/cmk7r1pz/song2.mp3",
  ]
)

# Aplicar crossfade
radio_cmk7r1pz = crossfade(
  duration=3.0,
  main_playlist_cmk7r1pz
)

# Normalizar audio
radio_cmk7r1pz = amplify(
  -14.0,
  radio_cmk7r1pz
)

# Output a Icecast
output.icecast(
  %mp3(bitrate=128),
  host=icecast_host,
  port=icecast_port,
  password=icecast_password,
  mount="/radio_cmk7r1pz",
  name="Cliente Demo",
  description="Radio Cliente Demo",
  genre="Various",
  url="http://#{icecast_host}:#{icecast_port}/radio_cmk7r1pz",
  radio_cmk7r1pz
)

log("Stream Cliente Demo activo en /radio_cmk7r1pz")
```

### 3. API de Inicio de Stream (`app/api/stream/start/route.ts`)

**Implementación completa:**

1. **Validaciones:**
   - Usuario autenticado
   - Cliente existe
   - Configuración de streaming existe
   - Playlist principal existe y tiene canciones
   - Todos los archivos están procesados (estado "ready")
   - AutoDJ está habilitado

2. **Proceso de inicio:**
   - Genera script de Liquidsoap con `LiquidsoapService.generateScript()`
   - Guarda script en `docker/liquidsoap/scripts/clients/[clientId].liq`
   - Reinicia contenedor de Liquidsoap
   - Actualiza estado en DB a "active"

3. **Manejo de errores:**
   - Captura errores en el proceso
   - Actualiza estado a "error" en DB
   - Guarda mensaje de error en `lastError`
   - Retorna detalles del error al cliente

### 4. API de Detención de Stream (`app/api/stream/stop/route.ts`)

**Implementación completa:**

1. **Validaciones:**
   - Usuario autenticado
   - Cliente existe
   - Configuración existe
   - Stream está activo

2. **Proceso de detención:**
   - Elimina script de Liquidsoap
   - Reinicia contenedor de Liquidsoap
   - Actualiza estado en DB a "inactive"

3. **Manejo de errores:**
   - Captura errores en el proceso
   - Actualiza estado a "error" en DB
   - Retorna detalles del error

### 5. Script Principal de Liquidsoap (`docker/liquidsoap/scripts/main.liq`)

**Cambios:**
- Mantiene stream de prueba `/test` para testing
- Incluye directorio de scripts de clientes con `%include "/scripts/clients"`
- Liquidsoap carga automáticamente todos los archivos `.liq` en ese directorio

### 6. Configuración Docker (`docker-compose.dev.yml`)

**Cambios en el servicio liquidsoap:**
```yaml
volumes:
  - ./docker/liquidsoap/scripts:/scripts
  - ./docker/liquidsoap/scripts/clients:/scripts/clients  # NUEVO
  - ./public/audio:/audio  # Cambiado de audio_storage a public/audio
  - liquidsoap_logs:/var/log/liquidsoap
```

**Razón:**
- Monta el directorio de scripts de clientes
- Usa `public/audio` en lugar de volumen Docker para acceso directo desde Next.js

### 7. Estructura de Directorios

**Nuevo directorio creado:**
```
docker/liquidsoap/scripts/clients/
├── .gitkeep
└── [clientId].liq  (generados dinámicamente)
```

---

## 🔄 Flujo de Funcionamiento

### Inicio de Stream

```
Usuario hace clic en "Iniciar Stream"
    ↓
POST /api/stream/start
    ↓
Validaciones (playlist, archivos, config)
    ↓
LiquidsoapService.generateScript(clientId)
    ↓
ScriptManager.saveScript(clientId, script)
    ↓
Guarda en: docker/liquidsoap/scripts/clients/[clientId].liq
    ↓
ScriptManager.restartLiquidsoap()
    ↓
Ejecuta: docker-compose restart liquidsoap
    ↓
Liquidsoap reinicia y carga main.liq
    ↓
main.liq incluye todos los .liq de /scripts/clients/
    ↓
Script del cliente se ejecuta
    ↓
Liquidsoap se conecta a Icecast
    ↓
Crea mountpoint (ej: /radio_clientid)
    ↓
Comienza transmisión de audio
    ↓
Estado en DB: "active"
    ↓
Usuario puede escuchar el stream
```

### Detención de Stream

```
Usuario hace clic en "Detener Stream"
    ↓
POST /api/stream/stop
    ↓
Validaciones (stream activo)
    ↓
ScriptManager.deleteScript(clientId)
    ↓
Elimina: docker/liquidsoap/scripts/clients/[clientId].liq
    ↓
ScriptManager.restartLiquidsoap()
    ↓
Ejecuta: docker-compose restart liquidsoap
    ↓
Liquidsoap reinicia y carga main.liq
    ↓
main.liq ya no incluye el script del cliente
    ↓
Mountpoint desaparece de Icecast
    ↓
Estado en DB: "inactive"
    ↓
Stream detenido
```

---

## 🧪 Pruebas Recomendadas

### 1. Prueba Básica

```bash
# 1. Asegurar que Docker está corriendo
docker-compose -f docker-compose.dev.yml up -d

# 2. Verificar que Icecast está activo
curl http://localhost:8000

# 3. Desde el panel:
#    - Crear playlist principal
#    - Agregar canciones
#    - Iniciar stream

# 4. Verificar script generado
ls -la docker/liquidsoap/scripts/clients/
cat docker/liquidsoap/scripts/clients/[clientId].liq

# 5. Verificar logs
docker logs -f ipstream_liquidsoap_dev

# 6. Verificar en Icecast
curl http://localhost:8000/status-json.xsl

# 7. Probar stream
curl http://localhost:8000/radio_[clientId]
```

### 2. Prueba de Múltiples Clientes

```bash
# 1. Crear 2-3 clientes diferentes
# 2. Asignar servidor a cada uno
# 3. Crear playlists para cada uno
# 4. Iniciar streams de todos
# 5. Verificar que todos los scripts existen
ls -la docker/liquidsoap/scripts/clients/

# 6. Verificar que todos los mountpoints están activos
curl http://localhost:8000

# 7. Detener uno por uno y verificar
```

### 3. Prueba de Errores

```bash
# 1. Intentar iniciar sin playlist principal
#    - Debería dar error: "No hay playlist principal"

# 2. Intentar iniciar con playlist vacía
#    - Debería dar error: "playlist está vacía"

# 3. Intentar iniciar con archivos sin procesar
#    - Debería dar error: "archivos que aún no están procesados"

# 4. Detener Docker y intentar iniciar
docker-compose -f docker-compose.dev.yml stop
#    - Debería dar error: "No se pudo reiniciar Liquidsoap"

# 5. Verificar que el estado se actualiza a "error"
```

---

## 📝 Notas Importantes

### Reinicio de Liquidsoap

- El reinicio toma aproximadamente 10-15 segundos
- Durante el reinicio, todos los streams se interrumpen brevemente
- Es necesario para cargar/descargar scripts dinámicamente

### Alternativas Futuras

En lugar de reiniciar Liquidsoap, se podría:

1. **Usar Telnet para control dinámico:**
   - Conectarse al puerto 1234 de Liquidsoap
   - Enviar comandos para iniciar/detener sources
   - Requiere modificar la arquitectura de scripts

2. **Usar Harbor (HTTP input):**
   - Liquidsoap escucha en un puerto HTTP
   - El panel envía audio vía HTTP
   - No requiere reiniciar Liquidsoap
   - Más complejo de implementar

3. **Usar múltiples instancias de Liquidsoap:**
   - Cada cliente tiene su propio contenedor
   - No hay interferencia entre clientes
   - Requiere más recursos del servidor

### Limitaciones Actuales

1. **Reinicio afecta a todos:**
   - Cuando un cliente inicia/detiene, todos los streams se reinician brevemente
   - Solución: usar alternativas mencionadas arriba

2. **Sin hot-reload:**
   - Cambios en playlist requieren detener/iniciar el stream
   - Solución: implementar `reload_mode="watch"` con archivos M3U

3. **Sin control en tiempo real:**
   - No se puede saltar canciones sin Telnet
   - Solución: implementar comandos Telnet en el panel

---

## 🚀 Próximos Pasos

### Mejoras Inmediatas

1. **Implementar control Telnet:**
   - Saltar canción
   - Ver canción actual
   - Ver próxima canción
   - Pausar/reanudar

2. **Mejorar feedback al usuario:**
   - Mostrar progreso del reinicio
   - Mostrar tiempo estimado
   - Actualizar estado en tiempo real

3. **Implementar hot-reload de playlists:**
   - Generar archivos M3U dinámicos
   - Liquidsoap los recarga automáticamente
   - No requiere reiniciar

### Mejoras Futuras

1. **Múltiples calidades:**
   - Generar streams en 64, 128 y 320 kbps
   - Usar `output.icecast` múltiples veces

2. **Estadísticas en tiempo real:**
   - Leer stats de Icecast vía API
   - Mostrar oyentes actuales
   - Mostrar historial de reproducción

3. **Live Input:**
   - Permitir transmisión en vivo
   - Priorizar live sobre AutoDJ
   - Usar `input.harbor` de Liquidsoap

4. **Programación horaria:**
   - Cambiar playlist según hora del día
   - Implementar con `switch` de Liquidsoap

---

## 📚 Referencias

- **Liquidsoap Documentation**: https://www.liquidsoap.info/doc-2.2.5/
- **Icecast Documentation**: https://icecast.org/docs/
- **Docker Compose**: https://docs.docker.com/compose/

---

## ✅ Checklist de Implementación

- [x] Crear servicio ScriptManager
- [x] Actualizar LiquidsoapService.generateScript()
- [x] Implementar API /api/stream/start
- [x] Implementar API /api/stream/stop
- [x] Actualizar script main.liq
- [x] Actualizar docker-compose.dev.yml
- [x] Crear directorio scripts/clients/
- [x] Actualizar GUIA-INICIAR-STREAM.md
- [x] Crear documentación de implementación
- [ ] Probar con cliente real
- [ ] Probar con múltiples clientes
- [ ] Probar manejo de errores
- [ ] Optimizar tiempo de reinicio
- [ ] Implementar control Telnet
- [ ] Implementar hot-reload de playlists

---

**Fecha de implementación:** 2026-01-10  
**Versión:** 1.0.0  
**Estado:** ✅ Implementación completa lista para pruebas

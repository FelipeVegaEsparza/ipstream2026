# Fase 3 Completada - Gestión de Biblioteca de Audio

**Fecha**: 2026-01-10  
**Estado**: ✅ Completada  
**Duración**: ~30 minutos

---

## ✅ APIs Implementadas

### Audio Management APIs (5 endpoints)

#### 1. Listar Archivos de Audio

**GET /api/audio**
- Lista todos los archivos del cliente
- Paginación (page, limit)
- Búsqueda por filename, title, artist, album
- Filtro por status (processing, ready, error)
- Retorna espacio usado/disponible
- Calcula porcentaje de almacenamiento

**Parámetros de Query:**
```
?search=cancion
&status=ready
&page=1
&limit=50
```

**Respuesta:**
```json
{
  "audioFiles": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  },
  "storage": {
    "used": 5368709120,
    "max": 32212254720,
    "percentage": 16.67
  }
}
```

---

#### 2. Obtener Detalle de Archivo

**GET /api/audio/[id]**
- Obtiene información completa del archivo
- Incluye playlists donde está incluido
- Solo archivos del cliente autenticado

**Respuesta:**
```json
{
  "audioFile": {
    "id": "...",
    "filename": "cancion.mp3",
    "duration": 245.5,
    "title": "Mi Canción",
    "artist": "Artista",
    "playlistItems": [
      {
        "playlist": {
          "id": "...",
          "name": "Playlist Principal"
        }
      }
    ]
  }
}
```

---

#### 3. Actualizar Metadata

**PUT /api/audio/[id]**
- Actualiza metadata del archivo
- Validación con Zod
- Solo archivos del cliente

**Body:**
```json
{
  "title": "Nuevo Título",
  "artist": "Nuevo Artista",
  "album": "Nuevo Álbum",
  "genre": "Rock",
  "year": 2024
}
```

---

#### 4. Eliminar Archivo

**DELETE /api/audio/[id]**
- Elimina archivo físico y registro en DB
- Previene eliminación si está en playlists
- Solo archivos del cliente

**Validaciones:**
- ✅ Verifica que no esté en uso
- ✅ Elimina archivo físico del servidor
- ✅ Elimina registro de base de datos

---

#### 5. Subir Archivo Individual

**POST /api/audio/upload**
- Sube un archivo de audio
- Validación de formato (MP3, AAC, OGG)
- Validación de tamaño (máx 50MB)
- Validación de espacio disponible
- Genera nombre único
- Crea registro con status "processing"

**Form Data:**
```
file: File
```

**Validaciones:**
- ✅ Formato permitido
- ✅ Tamaño máximo 50MB
- ✅ Espacio disponible (30GB por cliente)
- ✅ Nombre único con crypto.randomBytes

---

#### 6. Subir Múltiples Archivos (Batch)

**POST /api/audio/upload/batch**
- Sube múltiples archivos simultáneamente
- Procesa cada archivo individualmente
- Retorna resultado de cada archivo
- Continúa aunque algunos fallen

**Form Data:**
```
files: File[]
```

**Respuesta:**
```json
{
  "success": true,
  "results": [
    {
      "filename": "cancion1.mp3",
      "success": true,
      "audioFileId": "..."
    },
    {
      "filename": "cancion2.mp3",
      "success": false,
      "error": "Formato no permitido"
    }
  ],
  "summary": {
    "total": 10,
    "success": 8,
    "failed": 2
  }
}
```

---

#### 7. Procesar Archivo

**POST /api/audio/[id]/process**
- Procesa archivo con FFmpeg
- Extrae metadata automáticamente
- Actualiza status a "ready" o "error"
- Solo archivos del cliente

---

## 🛠️ Servicios Implementados

### AudioProcessingService

Servicio completo para procesamiento de audio con FFmpeg.

#### Métodos:

**1. extractMetadata(filePath: string)**
- Extrae metadata usando FFprobe
- Obtiene: duration, bitrate, sampleRate, channels
- Extrae tags: title, artist, album, genre, year
- Retorna objeto AudioMetadata

**2. validateAudioFile(filePath: string)**
- Valida que el archivo sea audio válido
- Usa FFprobe para verificar codec
- Retorna boolean

**3. processAudioFile(audioFileId: string)**
- Proceso completo de un archivo
- Valida archivo
- Extrae metadata
- Actualiza registro en DB
- Maneja errores y actualiza status

**4. extractCoverArt(filePath: string, outputPath: string)**
- Extrae cover art del archivo
- Guarda como imagen separada
- Retorna boolean de éxito

**5. convertAudio(inputPath, outputPath, format, bitrate)**
- Convierte audio a otro formato
- Soporta: MP3, AAC, OGG
- Configurable bitrate

---

## 🔒 Seguridad y Validaciones

### Autenticación
- ✅ Todas las APIs requieren sesión activa
- ✅ Verificación de clientId en sesión
- ✅ Solo acceso a archivos propios

### Validación de Archivos
- ✅ Formatos permitidos: MP3, AAC, OGG
- ✅ Tamaño máximo: 50MB por archivo
- ✅ Espacio total: 30GB por cliente
- ✅ Nombres únicos con crypto.randomBytes

### Validación de Eliminación
- ✅ Previene eliminar archivos en uso
- ✅ Verifica playlists antes de eliminar
- ✅ Elimina archivo físico y registro

### Validación de Metadata
- ✅ Schema de Zod para actualizaciones
- ✅ Año entre 1900-2100
- ✅ Campos opcionales

---

## 📊 Flujos Implementados

### Flujo 1: Subir Archivo Individual

```
Cliente → POST /api/audio/upload
  ↓
Validar sesión y cliente
  ↓
Validar formato (MP3, AAC, OGG)
  ↓
Validar tamaño (< 50MB)
  ↓
Calcular espacio usado
  ↓
Validar espacio disponible (< 30GB)
  ↓
Generar nombre único
  ↓
Crear directorio /audio/[clientId]
  ↓
Guardar archivo físico
  ↓
Crear registro en DB (status: processing)
  ↓
[TODO] Agregar a cola de procesamiento
  ↓
Retornar audioFile
```

### Flujo 2: Procesar Archivo con FFmpeg

```
Sistema → POST /api/audio/[id]/process
  ↓
Obtener archivo de DB
  ↓
Validar con FFprobe
  ↓
Extraer metadata:
  - duration
  - bitrate
  - sampleRate
  - channels
  - title, artist, album, genre, year
  ↓
Actualizar registro en DB
  ↓
Cambiar status a "ready"
  ↓
Retornar archivo actualizado
```

### Flujo 3: Subir Múltiples Archivos

```
Cliente → POST /api/audio/upload/batch
  ↓
Validar sesión y cliente
  ↓
Calcular tamaño total
  ↓
Validar espacio disponible
  ↓
Para cada archivo:
  ├─ Validar formato
  ├─ Validar tamaño
  ├─ Guardar archivo
  ├─ Crear registro
  └─ Agregar resultado
  ↓
Retornar resumen:
  - total
  - success
  - failed
  - results[]
```

### Flujo 4: Eliminar Archivo

```
Cliente → DELETE /api/audio/[id]
  ↓
Validar sesión y cliente
  ↓
Verificar que archivo existe
  ↓
Verificar que no está en playlists
  ↓
Eliminar archivo físico
  ↓
Eliminar registro de DB
  ↓
Retornar success
```

---

## 🧪 Pruebas Sugeridas

### 1. Subir Archivo Individual

```bash
curl -X POST http://localhost:3000/api/audio/upload \
  -H "Cookie: next-auth.session-token=..." \
  -F "file=@cancion.mp3"
```

### 2. Listar Archivos

```bash
curl "http://localhost:3000/api/audio?page=1&limit=20" \
  -H "Cookie: next-auth.session-token=..."
```

### 3. Buscar Archivos

```bash
curl "http://localhost:3000/api/audio?search=rock&status=ready" \
  -H "Cookie: next-auth.session-token=..."
```

### 4. Obtener Detalle

```bash
curl http://localhost:3000/api/audio/AUDIO_ID \
  -H "Cookie: next-auth.session-token=..."
```

### 5. Actualizar Metadata

```bash
curl -X PUT http://localhost:3000/api/audio/AUDIO_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "title": "Nueva Canción",
    "artist": "Nuevo Artista",
    "year": 2024
  }'
```

### 6. Procesar Archivo

```bash
curl -X POST http://localhost:3000/api/audio/AUDIO_ID/process \
  -H "Cookie: next-auth.session-token=..."
```

### 7. Eliminar Archivo

```bash
curl -X DELETE http://localhost:3000/api/audio/AUDIO_ID \
  -H "Cookie: next-auth.session-token=..."
```

### 8. Subir Múltiples Archivos

```bash
curl -X POST http://localhost:3000/api/audio/upload/batch \
  -H "Cookie: next-auth.session-token=..." \
  -F "files=@cancion1.mp3" \
  -F "files=@cancion2.mp3" \
  -F "files=@cancion3.mp3"
```

---

## 📁 Estructura de Almacenamiento

```
/audio/
  ├── [clientId1]/
  │   ├── a1b2c3d4e5f6...mp3
  │   ├── f6e5d4c3b2a1...mp3
  │   └── ...
  ├── [clientId2]/
  │   ├── 1a2b3c4d5e6f...mp3
  │   └── ...
  └── ...
```

**Características:**
- Directorio por cliente
- Nombres únicos con crypto.randomBytes(16)
- Extensión original preservada
- Fácil de limpiar por cliente

---

## 🎯 Próximos Pasos (Fase 4)

### Gestión de Playlists

1. **CRUD de Playlists**
   - POST /api/playlists (crear)
   - GET /api/playlists (listar)
   - GET /api/playlists/[id] (detalle)
   - PUT /api/playlists/[id] (actualizar)
   - DELETE /api/playlists/[id] (eliminar)

2. **Gestión de Canciones en Playlist**
   - POST /api/playlists/[id]/items (agregar canción)
   - DELETE /api/playlists/[id]/items/[itemId] (quitar)
   - PUT /api/playlists/[id]/reorder (reordenar)

3. **Funcionalidades Especiales**
   - Marcar playlist como "Principal"
   - Calcular duración total
   - Duplicar playlists
   - Tipos: rotation, special, jingles

4. **UI Components**
   - Lista de playlists
   - Formulario crear/editar
   - Drag & drop para canciones
   - Reordenamiento visual

---

## 📈 Progreso del Proyecto

```
Fase 0: ████████████████████ 100% ✅
Fase 1: ████████████████████ 100% ✅
Fase 2: ████████████████████ 100% ✅
Fase 3: ████████████████████ 100% ✅
Fase 4: ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

**Fases completadas**: 4 de 17  
**Progreso total**: 24% del proyecto  
**Tiempo invertido**: ~5 horas

---

## 💡 Notas Técnicas

### FFmpeg en Docker
- FFmpeg ya está instalado en el contenedor de Liquidsoap
- Se puede usar desde el contenedor de Next.js si se instala
- Alternativa: Procesar en el contenedor de Liquidsoap

### Procesamiento Asíncrono
- Actualmente el procesamiento es síncrono
- TODO: Implementar cola con Bull/BullMQ
- Permitirá procesar múltiples archivos en paralelo
- Mejorará la experiencia de usuario

### Almacenamiento
- Archivos se guardan en volumen Docker
- Persistencia entre reinicios
- Fácil de respaldar
- Considerar S3 para producción

### Metadata
- FFprobe extrae metadata de tags ID3
- Algunos archivos pueden no tener tags
- Se usa filename como fallback para title
- Cover art se puede extraer pero no está implementado

### Validaciones
- Formato se valida por MIME type
- Tamaño se valida antes de guardar
- Espacio se calcula con aggregate
- Eliminación se previene si está en uso

---

## 🐛 Consideraciones

### 1. Procesamiento Síncrono
**Estado**: Funcional pero no óptimo  
**Impacto**: Subidas grandes pueden tardar  
**Solución**: Implementar cola de procesamiento con Bull

### 2. Cover Art
**Estado**: Método implementado pero no integrado  
**Impacto**: No se extraen covers automáticamente  
**Solución**: Integrar en processAudioFile()

### 3. Conversión de Formatos
**Estado**: Método implementado pero no expuesto  
**Impacto**: Solo se aceptan formatos originales  
**Solución**: Crear endpoint de conversión si es necesario

### 4. Almacenamiento en Producción
**Estado**: Usa volumen Docker local  
**Impacto**: No escalable para múltiples servidores  
**Solución**: Migrar a S3 o almacenamiento distribuido

---

## 📚 Archivos Creados

### APIs
- `app/api/audio/route.ts` - Listar archivos
- `app/api/audio/[id]/route.ts` - GET, PUT, DELETE
- `app/api/audio/upload/route.ts` - Subir individual
- `app/api/audio/upload/batch/route.ts` - Subir múltiples
- `app/api/audio/[id]/process/route.ts` - Procesar con FFmpeg

### Servicios
- `lib/services/audioProcessing.ts` - Servicio de procesamiento

### Documentación
- `.kiro/specs/streaming-integration/phase3-summary.md` - Este documento

---

**Última actualización**: 2026-01-10 00:45  
**Siguiente**: Fase 4 - Gestión de Playlists


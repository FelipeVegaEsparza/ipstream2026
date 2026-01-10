# Fase 4 Completada - Gestión de Playlists

**Fecha**: 2026-01-10  
**Estado**: ✅ Completada  
**Duración**: ~20 minutos

---

## ✅ APIs Implementadas

### Playlist Management APIs (9 endpoints)

#### 1. CRUD de Playlists

**GET /api/playlists**
- Lista todas las playlists del cliente
- Filtro por tipo (rotation, special, jingles)
- Incluye conteo de canciones
- Calcula duración total
- Muestra cantidad de programaciones
- Ordenadas por isMain y fecha

**Respuesta:**
```json
{
  "playlists": [
    {
      "id": "...",
      "name": "Playlist Principal",
      "type": "rotation",
      "description": "...",
      "isMain": true,
      "songCount": 50,
      "totalDuration": 12450.5,
      "scheduleCount": 3,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

**POST /api/playlists**
- Crea nueva playlist
- Validación con Zod
- Si se marca como principal, desmarca las demás
- Tipos: rotation, special, jingles

**Body:**
```json
{
  "name": "Mi Playlist",
  "type": "rotation",
  "description": "Descripción opcional",
  "isMain": false
}
```

---

**GET /api/playlists/[id]**
- Obtiene detalle completo de playlist
- Incluye todas las canciones ordenadas
- Incluye programaciones horarias
- Calcula duración total y conteo

**Respuesta:**
```json
{
  "playlist": {
    "id": "...",
    "name": "...",
    "items": [
      {
        "id": "...",
        "order": 0,
        "audioFile": {
          "id": "...",
          "filename": "cancion.mp3",
          "title": "Título",
          "artist": "Artista",
          "duration": 245.5
        }
      }
    ],
    "schedules": [...],
    "totalDuration": 12450.5,
    "songCount": 50
  }
}
```

---

**PUT /api/playlists/[id]**
- Actualiza información de playlist
- Validación con Zod
- Maneja cambio de playlist principal

**Body:**
```json
{
  "name": "Nuevo Nombre",
  "type": "special",
  "description": "Nueva descripción",
  "isMain": true
}
```

---

**DELETE /api/playlists/[id]**
- Elimina playlist
- Previene eliminación si está en programación
- Elimina items en cascada

**Validaciones:**
- ✅ Verifica que no esté en schedules
- ✅ Solo playlists del cliente
- ✅ Elimina items automáticamente

---

#### 2. Gestión de Canciones

**POST /api/playlists/[id]/items**
- Agrega canción a playlist
- Previene duplicados
- Calcula orden automáticamente
- Valida que el archivo pertenezca al cliente

**Body:**
```json
{
  "audioFileId": "..."
}
```

**Validaciones:**
- ✅ Archivo existe y pertenece al cliente
- ✅ No está duplicado en la playlist
- ✅ Orden se calcula automáticamente

---

**DELETE /api/playlists/[id]/items/[itemId]**
- Quita canción de playlist
- Reordena items restantes automáticamente
- Mantiene orden secuencial

**Flujo:**
1. Elimina item
2. Obtiene items restantes
3. Reordena de 0 a N-1

---

**PUT /api/playlists/[id]/reorder**
- Reordena todas las canciones
- Recibe array de IDs en nuevo orden
- Valida que todos los IDs sean válidos

**Body:**
```json
{
  "itemIds": ["id1", "id2", "id3", ...]
}
```

**Validaciones:**
- ✅ Todos los IDs pertenecen a la playlist
- ✅ Cantidad de IDs coincide con items
- ✅ No hay IDs duplicados

---

#### 3. Funcionalidades Especiales

**POST /api/playlists/[id]/duplicate**
- Duplica playlist completa
- Copia todos los items con mismo orden
- Agrega "(Copia)" al nombre
- La copia nunca es principal

**Características:**
- ✅ Copia estructura completa
- ✅ Mantiene orden de canciones
- ✅ No copia programaciones
- ✅ isMain siempre false

---

## 🔒 Seguridad y Validaciones

### Autenticación
- ✅ Todas las APIs requieren sesión activa
- ✅ Verificación de clientId en sesión
- ✅ Solo acceso a playlists propias

### Validación de Datos
- ✅ Schemas de Zod para todos los inputs
- ✅ Nombre: 1-100 caracteres
- ✅ Tipo: rotation, special, jingles
- ✅ isMain: boolean

### Validación de Relaciones
- ✅ AudioFile debe pertenecer al cliente
- ✅ No duplicar canciones en playlist
- ✅ Prevenir eliminar si está en schedules
- ✅ Validar IDs en reordenamiento

### Lógica de Playlist Principal
- ✅ Solo una playlist puede ser principal
- ✅ Al marcar una, se desmarcan las demás
- ✅ La copia nunca es principal

---

## 📊 Flujos Implementados

### Flujo 1: Crear Playlist

```
Cliente → POST /api/playlists
  ↓
Validar sesión y cliente
  ↓
Validar datos (Zod)
  ↓
Si isMain = true:
  └─ Desmarcar otras playlists principales
  ↓
Crear playlist en DB
  ↓
Retornar playlist creada
```

### Flujo 2: Agregar Canción

```
Cliente → POST /api/playlists/[id]/items
  ↓
Validar sesión y cliente
  ↓
Verificar que playlist existe
  ↓
Verificar que audioFile existe
  ↓
Verificar que no está duplicado
  ↓
Calcular siguiente orden
  ↓
Crear PlaylistItem
  ↓
Retornar item con audioFile
```

### Flujo 3: Reordenar Canciones

```
Cliente → PUT /api/playlists/[id]/reorder
  ↓
Validar sesión y cliente
  ↓
Obtener playlist con items
  ↓
Validar que todos los IDs son válidos
  ↓
Validar cantidad de IDs
  ↓
Para cada ID en orden:
  └─ Actualizar order = índice
  ↓
Retornar playlist actualizada
```

### Flujo 4: Eliminar Canción

```
Cliente → DELETE /api/playlists/[id]/items/[itemId]
  ↓
Validar sesión y cliente
  ↓
Verificar que playlist existe
  ↓
Verificar que item existe
  ↓
Eliminar item
  ↓
Obtener items restantes
  ↓
Reordenar de 0 a N-1
  ↓
Retornar success
```

### Flujo 5: Duplicar Playlist

```
Cliente → POST /api/playlists/[id]/duplicate
  ↓
Validar sesión y cliente
  ↓
Obtener playlist original con items
  ↓
Crear nueva playlist:
  - name: "[Original] (Copia)"
  - isMain: false
  - mismo type y description
  ↓
Para cada item:
  └─ Crear PlaylistItem con mismo orden
  ↓
Retornar playlist duplicada
```

---

## 🧪 Pruebas Sugeridas

### 1. Crear Playlist

```bash
curl -X POST http://localhost:3000/api/playlists \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "name": "Mi Playlist Rock",
    "type": "rotation",
    "description": "Las mejores canciones de rock",
    "isMain": true
  }'
```

### 2. Listar Playlists

```bash
curl http://localhost:3000/api/playlists \
  -H "Cookie: next-auth.session-token=..."
```

### 3. Filtrar por Tipo

```bash
curl "http://localhost:3000/api/playlists?type=jingles" \
  -H "Cookie: next-auth.session-token=..."
```

### 4. Obtener Detalle

```bash
curl http://localhost:3000/api/playlists/PLAYLIST_ID \
  -H "Cookie: next-auth.session-token=..."
```

### 5. Agregar Canción

```bash
curl -X POST http://localhost:3000/api/playlists/PLAYLIST_ID/items \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "audioFileId": "AUDIO_FILE_ID"
  }'
```

### 6. Reordenar Canciones

```bash
curl -X PUT http://localhost:3000/api/playlists/PLAYLIST_ID/reorder \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "itemIds": ["id3", "id1", "id2"]
  }'
```

### 7. Quitar Canción

```bash
curl -X DELETE http://localhost:3000/api/playlists/PLAYLIST_ID/items/ITEM_ID \
  -H "Cookie: next-auth.session-token=..."
```

### 8. Actualizar Playlist

```bash
curl -X PUT http://localhost:3000/api/playlists/PLAYLIST_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "name": "Nuevo Nombre",
    "isMain": true
  }'
```

### 9. Duplicar Playlist

```bash
curl -X POST http://localhost:3000/api/playlists/PLAYLIST_ID/duplicate \
  -H "Cookie: next-auth.session-token=..."
```

### 10. Eliminar Playlist

```bash
curl -X DELETE http://localhost:3000/api/playlists/PLAYLIST_ID \
  -H "Cookie: next-auth.session-token=..."
```

---

## 📝 Modelos Utilizados

### Playlist
```typescript
{
  id: string
  clientId: string
  name: string
  type: "rotation" | "special" | "jingles"
  description?: string
  isMain: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### PlaylistItem
```typescript
{
  id: string
  playlistId: string
  audioFileId: string
  order: number
  createdAt: DateTime
}
```

---

## 🎯 Próximos Pasos (Fase 5)

### AutoDJ Básico

1. **Script de Liquidsoap Dinámico**
   - Leer playlist de base de datos
   - Selección aleatoria/secuencial
   - Crossfade y normalización
   - Output a Icecast

2. **Control de AutoDJ**
   - POST /api/stream/start (iniciar)
   - POST /api/stream/stop (detener)
   - POST /api/stream/skip (saltar canción)
   - GET /api/stream/status (estado)

3. **Metadata y Now Playing**
   - GET /api/stream/now-playing
   - Actualización en tiempo real
   - Socket.io para updates

4. **Configuración de Audio**
   - Duración de crossfade
   - Nivel de normalización
   - Modo de reproducción
   - Aplicar sin reiniciar

---

## 📈 Progreso del Proyecto

```
Fase 0: ████████████████████ 100% ✅
Fase 1: ████████████████████ 100% ✅
Fase 2: ████████████████████ 100% ✅
Fase 3: ████████████████████ 100% ✅
Fase 4: ████████████████████ 100% ✅
Fase 5: ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

**Fases completadas**: 5 de 17  
**Progreso total**: 29% del proyecto  
**Tiempo invertido**: ~5.5 horas

---

## 💡 Notas Técnicas

### Orden de Canciones
- Se usa campo `order` numérico
- Comienza en 0
- Se reordena automáticamente al eliminar
- Reordenamiento manual con array de IDs

### Playlist Principal
- Solo una puede ser principal (isMain = true)
- Se usa para AutoDJ por defecto
- Al marcar una, se desmarcan las demás
- Query optimizado con updateMany

### Tipos de Playlist
- **rotation**: Playlist normal de rotación
- **special**: Playlist especial para eventos
- **jingles**: Playlist de jingles/cuñas

### Duplicación
- Copia estructura completa
- Mantiene orden original
- No copia schedules (programaciones)
- Útil para crear variaciones

### Eliminación
- Previene si está en schedules
- Items se eliminan en cascada (Prisma)
- Archivo de audio no se elimina

### Cálculo de Duración
- Se suma duration de todos los audioFiles
- Se calcula en tiempo real
- Útil para planificar programación

---

## 🐛 Consideraciones

### 1. Reordenamiento
**Estado**: Funcional pero puede optimizarse  
**Impacto**: Múltiples queries en reordenamiento  
**Solución**: Usar transacción o updateMany

### 2. Validación de Duplicados
**Estado**: Funcional  
**Impacto**: Query adicional por cada insert  
**Solución**: Usar unique constraint en DB

### 3. Cálculo de Duración
**Estado**: Se calcula en cada request  
**Impacto**: Puede ser lento con muchas canciones  
**Solución**: Cachear o guardar en playlist

### 4. Playlist Principal
**Estado**: Funcional  
**Impacto**: updateMany en cada cambio  
**Solución**: Aceptable, no es operación frecuente

---

## 📚 Archivos Creados

### APIs
- `app/api/playlists/route.ts` - GET, POST
- `app/api/playlists/[id]/route.ts` - GET, PUT, DELETE
- `app/api/playlists/[id]/items/route.ts` - POST (agregar)
- `app/api/playlists/[id]/items/[itemId]/route.ts` - DELETE (quitar)
- `app/api/playlists/[id]/reorder/route.ts` - PUT (reordenar)
- `app/api/playlists/[id]/duplicate/route.ts` - POST (duplicar)

### Documentación
- `.kiro/specs/streaming-integration/phase4-summary.md` - Este documento

---

## 🎓 Aprendizajes

### Relaciones Muchos a Muchos
- PlaylistItem es tabla intermedia
- Permite orden personalizado
- Facilita queries eficientes

### Orden Secuencial
- Importante mantener consistencia
- Reordenar al eliminar
- Validar en reordenamiento manual

### Playlist Principal
- Patrón común: solo uno activo
- updateMany para desmarcar
- Útil para configuración por defecto

### Duplicación
- Útil para crear variaciones
- Copiar estructura, no referencias
- Considerar qué copiar y qué no

---

**Última actualización**: 2026-01-10 01:00  
**Siguiente**: Fase 5 - AutoDJ Básico


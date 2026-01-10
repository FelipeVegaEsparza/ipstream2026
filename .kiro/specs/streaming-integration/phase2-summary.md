# Fase 2 Completada - Gestión de Servidores y Configuración

**Fecha**: 2026-01-09  
**Estado**: ✅ Completada  
**Duración**: ~1 hora

---

## ✅ APIs Implementadas

### Admin APIs (6 endpoints)

#### 1. Gestión de Servidores de Streaming

**GET /api/admin/stream-servers**
- Lista todos los servidores
- Incluye carga actual y porcentaje
- Solo para administradores

**POST /api/admin/stream-servers**
- Crear nuevo servidor
- Validación con Zod
- Verifica duplicados (host:port)

**GET /api/admin/stream-servers/[id]**
- Obtener servidor específico
- Incluye clientes asignados

**PUT /api/admin/stream-servers/[id]**
- Actualizar servidor
- Validación de duplicados

**DELETE /api/admin/stream-servers/[id]**
- Eliminar servidor
- Previene eliminación si tiene clientes

#### 2. Asignación de Clientes

**POST /api/admin/clients/[id]/assign-server**
- Asignar servidor a cliente
- Asignación manual o automática
- Genera mountpoint único
- Genera contraseña de live input
- Crea StreamConfig completo

**DELETE /api/admin/clients/[id]/assign-server**
- Desasignar servidor
- Actualiza carga del servidor

---

### Client APIs (4 endpoints)

#### 3. Configuración de Streaming

**GET /api/stream/config**
- Obtener configuración del cliente
- Incluye información del servidor
- Parsea bitrates de JSON

**PUT /api/stream/config**
- Actualizar configuración
- Validación con Zod
- Permite cambiar:
  - Bitrates
  - Max listeners
  - AutoDJ settings
  - Live input
  - Jingles

#### 4. Credenciales de Live Input

**GET /api/stream/live-credentials**
- Obtener credenciales actuales
- Incluye URL de conexión
- Instrucciones para Butt y Mixxx

**POST /api/stream/live-credentials/regenerate**
- Regenerar contraseña
- Genera nueva contraseña segura
- Retorna nueva URL

---

## 🔒 Seguridad Implementada

### Autenticación
- ✅ Todas las APIs requieren sesión activa
- ✅ Verificación de rol (ADMIN vs CLIENT)
- ✅ Validación de clientId en sesión

### Validación
- ✅ Schemas de Zod para todos los inputs
- ✅ Validación de duplicados
- ✅ Validación de capacidad de servidores
- ✅ Prevención de eliminación con dependencias

### Generación Segura
- ✅ Contraseñas con crypto.randomBytes
- ✅ Mountpoints únicos basados en clientId

---

## 📊 Flujos Implementados

### Flujo 1: Crear Servidor

```
Admin → POST /api/admin/stream-servers
  ↓
Validar datos (Zod)
  ↓
Verificar duplicados
  ↓
Crear en DB
  ↓
Retornar servidor creado
```

### Flujo 2: Asignar Cliente (Automático)

```
Admin → POST /api/admin/clients/[id]/assign-server
  ↓
Verificar cliente existe
  ↓
Buscar servidor con menor carga
  ↓
Verificar capacidad disponible
  ↓
Generar mountpoint único
  ↓
Generar contraseña segura
  ↓
Crear StreamConfig
  ↓
Actualizar currentLoad del servidor
  ↓
Retornar configuración
```

### Flujo 3: Cliente Actualiza Configuración

```
Cliente → PUT /api/stream/config
  ↓
Verificar sesión y clientId
  ↓
Validar datos (Zod)
  ↓
Actualizar en DB
  ↓
Retornar configuración actualizada
```

---

## 🧪 Pruebas Sugeridas

### 1. Crear Servidor (Admin)

```bash
curl -X POST http://localhost:3000/api/admin/stream-servers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "name": "VPS Stream 1",
    "host": "localhost",
    "port": 8000,
    "capacity": 10,
    "region": "local"
  }'
```

### 2. Listar Servidores (Admin)

```bash
curl http://localhost:3000/api/admin/stream-servers \
  -H "Cookie: next-auth.session-token=..."
```

### 3. Asignar Servidor a Cliente (Admin)

```bash
curl -X POST http://localhost:3000/api/admin/clients/CLIENT_ID/assign-server \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{}'
```

### 4. Obtener Configuración (Cliente)

```bash
curl http://localhost:3000/api/stream/config \
  -H "Cookie: next-auth.session-token=..."
```

### 5. Obtener Credenciales Live (Cliente)

```bash
curl http://localhost:3000/api/stream/live-credentials \
  -H "Cookie: next-auth.session-token=..."
```

---

## 📝 Modelos Utilizados

### StreamServer
```typescript
{
  id: string
  name: string
  host: string
  port: number
  capacity: number
  currentLoad: number
  status: "online" | "offline" | "maintenance"
  region?: string
}
```

### StreamConfig
```typescript
{
  id: string
  clientId: string
  serverId: string
  mountpoint: string
  bitrates: string[] // JSON
  maxListeners: number
  autodjEnabled: boolean
  crossfadeDuration: number
  normalizeAudio: boolean
  normalizationLevel: number
  playbackMode: "random" | "sequential"
  liveInputEnabled: boolean
  liveInputPassword: string
  jinglesEnabled: boolean
  jinglesFrequency: number
  status: "active" | "inactive" | "error"
}
```

---

## 🎯 Próximos Pasos (Fase 3)

### Gestión de Biblioteca de Audio

1. **API de Subida de Archivos**
   - POST /api/audio/upload
   - Validación de formato (MP3, AAC, OGG)
   - Validación de tamaño (50MB max)
   - Almacenamiento en volumen Docker
   - Extracción de metadata con FFmpeg

2. **CRUD de AudioFiles**
   - GET /api/audio (listar)
   - GET /api/audio/[id] (detalle)
   - PUT /api/audio/[id] (editar metadata)
   - DELETE /api/audio/[id] (eliminar)

3. **Procesamiento de Audio**
   - Servicio de extracción de metadata
   - Validación de archivos con FFmpeg
   - Generación de thumbnails de cover art
   - Cola de procesamiento con Bull

4. **UI Components**
   - Componente de upload con drag & drop
   - Lista de archivos con tabla
   - Editor de metadata
   - Indicador de espacio usado

---

## 📈 Progreso del Proyecto

```
Fase 0: ████████████████████ 100% ✅
Fase 1: ████████████████████ 100% ✅
Fase 2: ████████████████████ 100% ✅
Fase 3: ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

**Fases completadas**: 3 de 17  
**Progreso total**: 18% del proyecto  
**Tiempo invertido**: ~4 horas

---

## 💡 Notas Técnicas

### Asignación Automática
El algoritmo de asignación automática:
1. Filtra servidores online
2. Filtra servidores con capacidad disponible
3. Selecciona el servidor con menor carga
4. Esto distribuye la carga equitativamente

### Mountpoints
Formato: `/radio_[primeros8caracteres_clientId]`
- Único por cliente
- Fácil de identificar
- Compatible con Icecast

### Contraseñas
- Generadas con crypto.randomBytes(16)
- 32 caracteres hexadecimales
- Seguras y únicas

### Validación de Capacidad
- Se verifica antes de asignar
- Se actualiza currentLoad automáticamente
- Previene sobrecarga de servidores

---

**Última actualización**: 2026-01-10 00:15  
**Siguiente**: Fase 3 - Gestión de Biblioteca de Audio

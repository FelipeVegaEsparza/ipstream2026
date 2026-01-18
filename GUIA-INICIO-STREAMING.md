# 🚀 Guía de Inicio Rápido - Sistema de Streaming

Esta guía te ayudará a configurar y activar el sistema de streaming en IPStream Panel.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:

- ✅ Acceso al panel de administración (rol ADMIN)
- ✅ Un servidor VPS con Icecast + Liquidsoap instalado
- ✅ La IP o dominio del servidor VPS
- ✅ Docker Compose levantado (si estás en desarrollo)

---

## 🎯 Paso 1: Crear un Servidor de Streaming

### Opción A: Usando el Script Automático (Más Rápido)

```bash
# Ejecutar el script de inicialización
npm run streaming:init
```

Este script:
- ✅ Crea un servidor de desarrollo automáticamente
- ✅ Muestra los clientes sin servidor asignado
- ✅ Proporciona instrucciones para los siguientes pasos

### Opción B: Desde la Interfaz Web

1. **Accede al panel de administración**
   - URL: `http://localhost:3000/admin` (desarrollo)
   - Inicia sesión con tu cuenta de administrador

2. **Ve a "Servidores de Streaming"**
   - En el menú lateral, busca "Servidores de Streaming"
   - O accede directamente a: `http://localhost:3000/admin/stream-servers`

3. **Haz clic en "Crear Servidor"**
   - Completa el formulario:
     - **Nombre**: `VPS-Stream-1` (o el nombre que prefieras)
     - **Host**: IP o dominio del servidor (ej: `192.168.1.100` o `stream.example.com`)
     - **Puerto**: `8000` (puerto de Icecast)
     - **Capacidad**: `30` (número máximo de clientes)
     - **Región**: `local` o `us-east`, `eu-west`, etc. (opcional)
     - **Estado**: `online`

4. **Haz clic en "Crear Servidor"**
   - El servidor aparecerá en la lista

### Opción C: Usando la API

```bash
curl -X POST http://localhost:3000/api/admin/stream-servers \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "name": "VPS-Stream-1",
    "host": "192.168.1.100",
    "port": 8000,
    "capacity": 30,
    "region": "local",
    "status": "online"
  }'
```

---

## 🎯 Paso 2: Asignar Servidor a un Cliente

### Opción A: Desde la Interfaz Web (Recomendado)

1. **En la página de "Servidores de Streaming"**
   - Haz clic en el botón "Asignar Cliente"

2. **Selecciona el cliente**
   - Elige el cliente de la lista desplegable
   - Solo aparecerán clientes sin servidor asignado

3. **Selecciona el servidor (opcional)**
   - Puedes elegir un servidor específico
   - O dejar en "Asignación automática" para que el sistema elija el mejor

4. **Haz clic en "Asignar"**
   - El sistema creará automáticamente la configuración de streaming
   - El cliente ya podrá acceder a todas las funciones

### Opción C: Usando la API

```bash
# Asignación automática (recomendado)
curl -X POST http://localhost:3000/api/admin/clients/{clientId}/assign-server \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{}'

# Asignación manual a servidor específico
curl -X POST http://localhost:3000/api/admin/clients/{clientId}/assign-server \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "serverId": "server-id-here"
  }'
```

---

## 🎯 Paso 3: Verificar la Configuración

### Como Cliente

1. **Accede al dashboard de streaming**
   - URL: `http://localhost:3000/dashboard/streaming`

2. **Verifica que ya no aparece el mensaje "Configuración Pendiente"**
   - Deberías ver el panel de control de streaming
   - Con información del servidor asignado

3. **Explora las funciones disponibles**
   - **Control**: Iniciar/detener stream, ver estado
   - **Biblioteca**: Subir archivos de audio
   - **Playlists**: Crear y gestionar playlists
   - **Programación**: Configurar horarios automáticos
   - **Estadísticas**: Ver oyentes y métricas

---

## 📊 ¿Qué se Crea Automáticamente?

Cuando asignas un servidor a un cliente, el sistema crea automáticamente:

### StreamConfig
```json
{
  "clientId": "client-id",
  "serverId": "server-id",
  "mountpoint": "/radio_clientid",
  "bitrates": ["128"],
  "maxListeners": 100,
  "autodjEnabled": true,
  "crossfadeDuration": 3.0,
  "normalizeAudio": true,
  "normalizationLevel": -14.0,
  "playbackMode": "random",
  "liveInputEnabled": true,
  "liveInputPassword": "generated-secure-password",
  "jinglesEnabled": false,
  "jinglesFrequency": 5,
  "status": "inactive"
}
```

### Características Incluidas

- ✅ **Mountpoint único**: `/radio_{clientId}`
- ✅ **Contraseña segura**: Para transmisión en vivo
- ✅ **AutoDJ habilitado**: Con crossfade de 3 segundos
- ✅ **Normalización de audio**: A -14 LUFS
- ✅ **Modo aleatorio**: Por defecto
- ✅ **100 oyentes**: Límite inicial
- ✅ **128 kbps**: Calidad por defecto

---

## 🔧 Configuración de Desarrollo (Docker)

Si estás usando el entorno de desarrollo con Docker:

### 1. Levantar los servicios

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Verificar que Icecast está corriendo

```bash
# Ver logs
docker-compose -f docker-compose.dev.yml logs icecast

# Acceder a la interfaz web
# URL: http://localhost:8000
# Usuario: admin
# Contraseña: hackme
```

### 3. Usar localhost como servidor

Cuando crees el servidor en el paso 1, usa:
- **Host**: `icecast` (nombre del servicio en Docker)
- **Puerto**: `8000`

---

## 🎵 Flujo Completo de Uso

Una vez configurado, el flujo típico es:

### 1. Subir Audio
```
Dashboard → Streaming → Biblioteca → Subir Archivos
```

### 2. Crear Playlist
```
Dashboard → Streaming → Playlists → Nueva Playlist
→ Agregar canciones desde la biblioteca
```

### 3. Configurar como Playlist Principal
```
En la lista de playlists → Marcar como "Principal"
```

### 4. Iniciar el Stream
```
Dashboard → Streaming → Control → Iniciar Stream
```

### 5. Monitorear
```
Dashboard → Streaming → Estadísticas
→ Ver oyentes en tiempo real
→ Ver historial de reproducción
```

---

## 🆘 Solución de Problemas

### Problema: "Configuración de Streaming Pendiente"

**Causa**: No hay un StreamConfig asignado al cliente

**Solución**:
1. Verifica que existe un StreamServer en `/admin/stream-servers`
2. Si no existe, créalo siguiendo el Paso 1
3. Asigna el servidor al cliente siguiendo el Paso 2
4. Recarga la página `/dashboard/streaming`

### Problema: "No hay servidores disponibles"

**Causa**: No hay StreamServers creados o todos están llenos

**Solución**:
1. Crea un nuevo servidor en `/admin/stream-servers`
2. O aumenta la capacidad de un servidor existente

### Problema: "El servidor ha alcanzado su capacidad máxima"

**Causa**: El servidor seleccionado ya tiene el máximo de clientes

**Solución**:
1. Usa asignación automática (el sistema elegirá otro servidor)
2. O crea un nuevo servidor con más capacidad

### Problema: No puedo eliminar un servidor

**Causa**: El servidor tiene clientes asignados

**Solución**:
1. Primero desasigna todos los clientes de ese servidor
2. Luego podrás eliminarlo

---

## 📚 Recursos Adicionales

- **Documentación completa**: `README-STREAMING-DEV.md`
- **Estado del proyecto**: `ESTADO-ACTUAL.md`
- **Roadmap**: `.kiro/specs/streaming-integration/ROADMAP.md`
- **API Manual**: `API_REST_MANUAL.md`

---

## 🎉 ¡Listo!

Ahora tu sistema de streaming está configurado y listo para usar.

**Próximos pasos sugeridos:**
1. Sube algunos archivos de audio de prueba
2. Crea tu primera playlist
3. Inicia el stream y prueba desde VLC o tu navegador
4. Configura horarios automáticos si lo necesitas

---

**¿Necesitas ayuda?**  
Revisa el archivo `ESTADO-ACTUAL.md` para más detalles técnicos o consulta la documentación de las APIs.

# 🎵 Guía para Iniciar el Stream

## ✅ Sistema Completamente Funcional

El sistema ahora genera automáticamente scripts de Liquidsoap y gestiona streams dinámicamente.

---

## 📋 Requisitos Previos

Antes de iniciar el stream, asegúrate de tener:

- ✅ **Docker corriendo**: Icecast y Liquidsoap deben estar activos
- ✅ **Servidor asignado**: Un administrador debe asignarte un servidor VPS
- ✅ **Playlist principal**: Con al menos una canción
- ✅ **Archivos de audio**: En estado "Listo" (no "Procesando")
- ✅ **AutoDJ habilitado**: En la configuración de streaming

---

## 🚀 Pasos para Iniciar el Stream

### 1. Verificar Docker

```bash
# Ver servicios corriendo
docker-compose -f docker-compose.dev.yml ps

# Deberías ver:
# - icecast (puerto 8000)
# - liquidsoap
# - mysql
# - redis
```

Si no están corriendo:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Verificar Icecast

Abre en tu navegador: http://localhost:8000

Deberías ver la página de Icecast con el stream de prueba `/test` activo.

### 3. Crear Playlist Principal

1. Ve a **Streaming → Playlists**
2. Clic en **"Nueva Playlist"**
3. Completa:
   - Nombre: "Mi Playlist Principal"
   - Tipo: Rotación
   - ✅ **Marcar como playlist principal**
4. Clic en **"Crear"**
5. Entra a la playlist (clic en el nombre)
6. Clic en **"Agregar Canciones"**
7. Selecciona al menos una canción
8. Clic en **"Agregar Seleccionadas"**

### 4. Iniciar el Stream

1. Ve a **Streaming → Control**
2. Verifica que aparezca tu configuración
3. Clic en **"Iniciar Stream"**
4. El sistema automáticamente:
   - ✅ Genera un script de Liquidsoap personalizado
   - ✅ Guarda el script en `docker/liquidsoap/scripts/clients/[clientId].liq`
   - ✅ Reinicia Liquidsoap para cargar tu configuración
   - ✅ Crea el mountpoint en Icecast
5. Espera 15-20 segundos para que el stream se active completamente

### 5. Verificar que Funciona

**Opción A: Desde el navegador**
- Copia la URL del stream que aparece en el panel
- Pégala en una nueva pestaña
- Debería empezar a reproducir tu música

**Opción B: Desde VLC**
1. Abrir VLC
2. Media → Abrir ubicación de red
3. Pegar la URL del stream
4. Reproducir

**Opción C: Verificar en Icecast**
1. Ir a: http://localhost:8000
2. Deberías ver tu mountpoint listado (ej: `/radio_clientid`)
3. Clic en el mountpoint para escuchar

---

## 🛑 Detener el Stream

Cuando quieras detener el stream:

1. Ve a **Streaming → Control**
2. Clic en **"Detener Stream"**
3. El sistema automáticamente:
   - ✅ Elimina tu script de Liquidsoap
   - ✅ Reinicia Liquidsoap
   - ✅ Desconecta el mountpoint de Icecast

---

## ⚙️ Configuración Avanzada

### Crossfade
- Controla la transición suave entre canciones
- Valor recomendado: 3-5 segundos
- Se configura en la sección de streaming

### Normalización de Audio
- Mantiene un volumen consistente entre todas las canciones
- Nivel recomendado: -14 LUFS
- Activar en configuración de streaming

### Modo de Reproducción
- **Aleatorio**: Las canciones se reproducen en orden aleatorio
- **Secuencial**: Las canciones se reproducen en el orden de la playlist

### Jingles
- Crea una playlist de tipo "Jingles"
- Configura cada cuántas canciones se reproducirá un jingle
- Los jingles se insertarán automáticamente entre canciones

---

## 🔍 Solución de Problemas

### Problema: "No tienes una playlist principal configurada"

**Solución:**
1. Ve a Playlists
2. Crea una nueva playlist
3. Marca el checkbox "Marcar como playlist principal"
4. Agrega canciones a la playlist

### Problema: "Hay archivos de audio que aún no están procesados"

**Solución:**
1. Ve a Biblioteca
2. Verifica que todos los archivos estén en estado "Listo"
3. Si están en "Procesando", espera o instala FFmpeg (ver `INSTALACION-FFMPEG.md`)

### Problema: "Error al iniciar el stream"

**Causas posibles:**

1. **Docker no está corriendo**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Liquidsoap no puede reiniciarse**
   ```bash
   # Ver logs de Liquidsoap
   docker-compose -f docker-compose.dev.yml logs liquidsoap
   
   # Reiniciar manualmente
   docker-compose -f docker-compose.dev.yml restart liquidsoap
   ```

3. **Playlist vacía**
   - Asegúrate de que la playlist tenga al menos una canción

4. **Archivos de audio no existen**
   - Verifica que los archivos estén en `public/audio/[clientId]/`

### Problema: Stream se inicia pero no se escucha nada

**Solución:**

1. **Espera más tiempo**
   - El reinicio de Liquidsoap puede tomar 15-20 segundos

2. **Verificar script generado**
   ```bash
   # Ver el script generado
   cat docker/liquidsoap/scripts/clients/[clientId].liq
   ```

3. **Ver logs de Liquidsoap**
   ```bash
   docker logs -f ipstream_liquidsoap_dev
   
   # Buscar líneas como:
   # "Iniciando stream para [Cliente]"
   # "Stream [Cliente] activo en /radio_xxx"
   ```

4. **Verificar en Icecast**
   - Abre http://localhost:8000
   - Busca tu mountpoint en la lista
   - Si no aparece, revisa los logs

### Problema: 404 después de iniciar el stream

**Causas:**

1. **El stream aún no está listo**
   - Espera 20 segundos más
   - Recarga la página de Icecast

2. **Error en el script**
   - Revisa los logs de Liquidsoap
   - Busca errores de sintaxis o rutas incorrectas

3. **Liquidsoap no se reinició**
   ```bash
   # Reiniciar manualmente
   docker-compose -f docker-compose.dev.yml restart liquidsoap
   
   # Esperar 20 segundos
   # Verificar en Icecast
   ```

---

## 🏗️ Arquitectura Técnica

### Cuando inicias un stream:

1. **Generación de Script**
   - El sistema lee tu playlist principal
   - Lee tu configuración (crossfade, normalización, jingles)
   - Genera un archivo `.liq` personalizado

2. **Guardado del Script**
   - El script se guarda en `docker/liquidsoap/scripts/clients/[clientId].liq`
   - Este directorio está montado en el contenedor Docker

3. **Reinicio de Liquidsoap**
   - El contenedor se reinicia automáticamente
   - Liquidsoap carga el script principal (`main.liq`)
   - El script principal incluye todos los scripts de clientes con `%include "/scripts/clients"`

4. **Creación del Mountpoint**
   - Liquidsoap se conecta a Icecast
   - Crea tu mountpoint único (ej: `/radio_clientid`)
   - Comienza a transmitir audio

5. **Reproducción**
   - Las canciones se reproducen según tu configuración
   - Se aplican crossfade, normalización, jingles, etc.

### Cuando detienes un stream:

1. **Eliminación del Script**
   - El archivo `.liq` se elimina del directorio

2. **Reinicio de Liquidsoap**
   - El contenedor se reinicia
   - Liquidsoap ya no carga tu script
   - El mountpoint desaparece de Icecast

---

## 📊 Estados del Stream

### Estado: "Detenido" (inactive)
- ⚫ El stream no está activo
- ❌ La URL dará error 404
- ✅ Puedes iniciar el stream

### Estado: "En Vivo" (active)
- 🔴 El stream está transmitiendo
- ✅ La URL debería funcionar
- ✅ Puedes detener el stream

### Estado: "Error" (error)
- ⚠️ Hubo un problema al iniciar/detener
- ❌ Revisa los logs para más detalles
- ✅ Intenta nuevamente o contacta soporte

---

## 🔧 Comandos Útiles

### Ver estado de Docker
```bash
docker-compose -f docker-compose.dev.yml ps
```

### Ver logs en tiempo real
```bash
# Liquidsoap
docker-compose -f docker-compose.dev.yml logs -f liquidsoap

# Icecast
docker-compose -f docker-compose.dev.yml logs -f icecast
```

### Reiniciar servicios
```bash
# Reiniciar todo
docker-compose -f docker-compose.dev.yml restart

# Reiniciar solo Liquidsoap
docker-compose -f docker-compose.dev.yml restart liquidsoap
```

### Ver scripts activos
```bash
# Listar scripts de clientes
ls -la docker/liquidsoap/scripts/clients/

# Ver contenido de un script
cat docker/liquidsoap/scripts/clients/[clientId].liq
```

### Verificar mountpoints en Icecast
```bash
# Abrir en navegador
http://localhost:8000

# O con curl
curl http://localhost:8000/status-json.xsl
```

---

## 🎯 Flujo Completo

```
1. Docker corriendo
   ↓
2. Crear playlist principal
   ↓
3. Agregar canciones (estado: Listo)
   ↓
4. Iniciar stream desde Control
   ↓
5. Sistema genera script .liq
   ↓
6. Sistema guarda script en /scripts/clients/
   ↓
7. Sistema reinicia Liquidsoap
   ↓
8. Liquidsoap carga script y crea mountpoint
   ↓
9. Esperar 15-20 segundos
   ↓
10. Verificar en Icecast (http://localhost:8000)
   ↓
11. Abrir URL del stream
   ↓
12. ¡Escuchar tu radio! 🎵
```

---

## ✅ Checklist Rápido

Antes de reportar un problema, verifica:

- [ ] Docker está corriendo (`docker ps`)
- [ ] Icecast responde en http://localhost:8000
- [ ] Tienes un servidor asignado
- [ ] Tienes una playlist principal creada
- [ ] La playlist tiene al menos una canción
- [ ] Las canciones están en estado "Listo"
- [ ] AutoDJ está habilitado
- [ ] Iniciaste el stream desde el panel
- [ ] Esperaste al menos 20 segundos
- [ ] Revisaste los logs de Liquidsoap
- [ ] Verificaste que el script se generó en `docker/liquidsoap/scripts/clients/`

Si todo está ✅ y sigue sin funcionar, revisa los logs para más detalles.

---

## 📚 Recursos Adicionales

- **Estado del proyecto**: `ESTADO-ACTUAL.md`
- **Instalación de FFmpeg**: `INSTALACION-FFMPEG.md`
- **Desarrollo con Docker**: `README-STREAMING-DEV.md`
- **Configuración inicial**: `GUIA-INICIO-STREAMING.md`

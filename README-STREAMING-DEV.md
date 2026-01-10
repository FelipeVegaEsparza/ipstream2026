# Guía de Desarrollo - Sistema de Streaming

## Introducción

Esta guía te ayudará a configurar el entorno de desarrollo completo para el módulo de streaming, incluyendo Icecast, Liquidsoap y todos los servicios necesarios.

## Arquitectura de Desarrollo

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                       │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    MySQL     │  │   Icecast    │  │  Liquidsoap  │ │
│  │   :3306      │  │   :8000      │  │   (AutoDJ)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐                                      │
│  │    Redis     │                                      │
│  │   :6379      │                                      │
│  └──────────────┘                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          │
┌─────────────────────────▼───────────────────────────────┐
│              Next.js (Panel)                            │
│              http://localhost:3000                      │
└─────────────────────────────────────────────────────────┘
```

## Requisitos Previos

- Docker Desktop instalado y corriendo
- Node.js 18+ instalado
- Git instalado
- Al menos 4GB de RAM disponible
- 10GB de espacio en disco

## Inicio Rápido

### 1. Levantar todos los servicios

```bash
# Levantar MySQL, Icecast, Liquidsoap y Redis
docker-compose -f docker-compose.dev.yml up -d

# Ver logs de todos los servicios
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.dev.yml logs -f icecast
docker-compose -f docker-compose.dev.yml logs -f liquidsoap
```

### 2. Verificar que todo esté corriendo

```bash
# Ver estado de los contenedores
docker-compose -f docker-compose.dev.yml ps

# Deberías ver:
# - ipstream_mysql_dev (healthy)
# - ipstream_icecast_dev (healthy)
# - ipstream_liquidsoap_dev (running)
# - ipstream_redis_dev (running)
```

### 3. Acceder a los servicios

**Icecast (Servidor de Streaming):**
- URL: http://localhost:8000
- Admin: http://localhost:8000/admin
- Usuario admin: `admin`
- Contraseña admin: `hackme`
- Stream de prueba: http://localhost:8000/test

**MySQL:**
- Host: localhost
- Puerto: 3306
- Usuario: `pipstream_user`
- Contraseña: `pipstream_pass`
- Base de datos: `pipstream`

**Redis:**
- Host: localhost
- Puerto: 6379

**Panel Next.js:**
- URL: http://localhost:3000

### 4. Configurar la base de datos

```bash
# Generar cliente Prisma
npm run db:generate

# Crear tablas
npm run db:push

# Crear usuario admin
npm run db:seed
```

### 5. Iniciar el panel de desarrollo

```bash
npm run dev
```

## Estructura de Archivos

```
.
├── docker/
│   ├── icecast/
│   │   └── icecast.xml          # Configuración de Icecast
│   └── liquidsoap/
│       ├── Dockerfile            # Imagen de Liquidsoap
│       └── scripts/
│           └── main.liq          # Script principal de Liquidsoap
├── docker-compose.dev.yml        # Compose para desarrollo
└── README-STREAMING-DEV.md       # Esta guía
```

## Comandos Útiles

### Docker Compose

```bash
# Iniciar servicios
docker-compose -f docker-compose.dev.yml up -d

# Detener servicios
docker-compose -f docker-compose.dev.yml stop

# Reiniciar servicios
docker-compose -f docker-compose.dev.yml restart

# Detener y eliminar contenedores
docker-compose -f docker-compose.dev.yml down

# Detener y eliminar contenedores + volúmenes (BORRA DATOS)
docker-compose -f docker-compose.dev.yml down -v

# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f

# Reconstruir imágenes
docker-compose -f docker-compose.dev.yml build

# Reconstruir y reiniciar
docker-compose -f docker-compose.dev.yml up -d --build
```

### Liquidsoap

```bash
# Acceder al contenedor de Liquidsoap
docker exec -it ipstream_liquidsoap_dev bash

# Ver logs de Liquidsoap
docker-compose -f docker-compose.dev.yml logs -f liquidsoap

# Reiniciar solo Liquidsoap
docker-compose -f docker-compose.dev.yml restart liquidsoap

# Conectar al servidor telnet de Liquidsoap (para comandos)
telnet localhost 1234
```

### Icecast

```bash
# Ver logs de Icecast
docker-compose -f docker-compose.dev.yml logs -f icecast

# Reiniciar solo Icecast
docker-compose -f docker-compose.dev.yml restart icecast

# Ver estadísticas en formato JSON
curl http://localhost:8000/status-json.xsl
```

### MySQL

```bash
# Acceder a MySQL desde línea de comandos
docker exec -it ipstream_mysql_dev mysql -u pipstream_user -p
# Contraseña: pipstream_pass

# Backup de la base de datos
docker exec ipstream_mysql_dev mysqldump -u pipstream_user -ppipstream_pass pipstream > backup.sql

# Restaurar desde backup
docker exec -i ipstream_mysql_dev mysql -u pipstream_user -ppipstream_pass pipstream < backup.sql
```

## Probar el Stream

### Opción 1: Navegador Web

1. Abre http://localhost:8000
2. Haz clic en "test" en la lista de mountpoints
3. Deberías escuchar el stream (si hay audio configurado)

### Opción 2: VLC Media Player

1. Abre VLC
2. Media → Open Network Stream
3. URL: `http://localhost:8000/test`
4. Play

### Opción 3: Línea de comandos

```bash
# Con ffplay (parte de FFmpeg)
ffplay http://localhost:8000/test

# Con mpv
mpv http://localhost:8000/test
```

## Agregar Audio de Prueba

Para probar el AutoDJ, necesitas agregar archivos de audio:

```bash
# Crear directorio de audio en el volumen de Docker
docker exec -it ipstream_liquidsoap_dev mkdir -p /audio

# Copiar un archivo MP3 de prueba
docker cp /ruta/a/tu/cancion.mp3 ipstream_liquidsoap_dev:/audio/

# Crear playlist de prueba
docker exec -it ipstream_liquidsoap_dev bash -c "ls /audio/*.mp3 > /audio/playlist.m3u"

# Reiniciar Liquidsoap para que cargue la playlist
docker-compose -f docker-compose.dev.yml restart liquidsoap
```

## Desarrollo del Script de Liquidsoap

El script principal está en `docker/liquidsoap/scripts/main.liq`.

Después de modificarlo:

```bash
# Reconstruir la imagen
docker-compose -f docker-compose.dev.yml build liquidsoap

# Reiniciar el servicio
docker-compose -f docker-compose.dev.yml up -d liquidsoap

# Ver logs para verificar
docker-compose -f docker-compose.dev.yml logs -f liquidsoap
```

## Conectar un DJ en Vivo (Butt)

1. Descarga Butt: https://danielnoethen.de/butt/
2. Configuración:
   - **Server:** localhost
   - **Port:** 8000
   - **Password:** hackme
   - **Icecast mountpoint:** /live
   - **Icecast user:** source

3. Haz clic en "Play" en Butt
4. Accede a http://localhost:8000/live para escuchar

## Solución de Problemas

### Icecast no inicia

```bash
# Ver logs detallados
docker-compose -f docker-compose.dev.yml logs icecast

# Verificar configuración
docker exec -it ipstream_icecast_dev cat /etc/icecast2/icecast.xml

# Reiniciar
docker-compose -f docker-compose.dev.yml restart icecast
```

### Liquidsoap no se conecta a Icecast

```bash
# Verificar que Icecast esté corriendo
curl http://localhost:8000/status.xsl

# Ver logs de Liquidsoap
docker-compose -f docker-compose.dev.yml logs liquidsoap

# Verificar conectividad entre contenedores
docker exec -it ipstream_liquidsoap_dev ping icecast
```

### No se escucha audio

1. Verifica que haya archivos en `/audio/`
2. Verifica que exista `/audio/playlist.m3u`
3. Verifica logs de Liquidsoap
4. Verifica que el stream esté activo en http://localhost:8000

### Puerto 8000 ya en uso

```bash
# Cambiar el puerto en docker-compose.dev.yml
ports:
  - "8001:8000"  # Usar 8001 en lugar de 8000

# Reiniciar
docker-compose -f docker-compose.dev.yml up -d
```

## Monitoreo

### Ver estadísticas de Icecast

```bash
# JSON
curl http://localhost:8000/status-json.xsl | jq

# XML
curl http://localhost:8000/status.xsl
```

### Conectar al servidor telnet de Liquidsoap

```bash
telnet localhost 1234

# Comandos útiles:
# help - Ver todos los comandos
# request.metadata - Ver metadata actual
# request.on_air - Ver qué está sonando
# exit - Salir
```

## Limpieza

### Eliminar todo (contenedores, volúmenes, imágenes)

```bash
# Detener y eliminar contenedores y volúmenes
docker-compose -f docker-compose.dev.yml down -v

# Eliminar imágenes
docker rmi ipstream_liquidsoap_dev

# Limpiar sistema Docker completo (CUIDADO)
docker system prune -a --volumes
```

## Próximos Pasos

Una vez que tengas el entorno funcionando:

1. ✅ Verifica que puedas acceder a Icecast en http://localhost:8000
2. ✅ Verifica que Liquidsoap esté corriendo sin errores
3. ✅ Agrega audio de prueba y verifica que se reproduzca
4. ✅ Revisa el ROADMAP.md para ver las siguientes tareas
5. ✅ Comienza con la Fase 1: Modelo de Datos

## Recursos Adicionales

- **Documentación de Icecast:** https://icecast.org/docs/
- **Documentación de Liquidsoap:** https://www.liquidsoap.info/doc.html
- **Liquidsoap Book:** https://www.liquidsoap.info/doc-dev/book.html
- **Comunidad de Liquidsoap:** https://github.com/savonet/liquidsoap/discussions

## Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose -f docker-compose.dev.yml logs`
2. Verifica el estado: `docker-compose -f docker-compose.dev.yml ps`
3. Consulta esta documentación
4. Revisa el ROADMAP.md para contexto del desarrollo

# 🚀 IPStream - Despliegue en Producción

Sistema completo de gestión de radio streaming con AutoDJ, listo para desplegar en tu VPS con Dokploy.

## 🎯 Inicio Rápido (5 minutos)

### 1. Generar Secrets
```bash
openssl rand -base64 32  # Para NEXTAUTH_SECRET
```

### 2. Configurar en Dokploy
- Crear proyecto
- Conectar repositorio Git
- Usar `docker-compose.prod.yml`
- Agregar variables de entorno (ver abajo)
- Click en "Deploy"

### 3. Variables de Entorno Mínimas
```env
DOMAIN=tu-dominio.com
STREAM_DOMAIN=stream.tu-dominio.com
DATABASE_URL=mysql://pipstream_user:PASSWORD@mysql:3306/pipstream
MYSQL_ROOT_PASSWORD=PASSWORD
MYSQL_PASSWORD=PASSWORD
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=TU_SECRET_GENERADO
ICECAST_PASSWORD=PASSWORD
ICECAST_ADMIN_PASSWORD=PASSWORD
NODE_ENV=production
```

### 4. Inicializar
```bash
docker exec -it ipstream_app npx prisma migrate deploy
```

## 📚 Documentación Completa

- **[RESUMEN-DESPLIEGUE.md](./RESUMEN-DESPLIEGUE.md)** - Resumen ejecutivo
- **[DESPLIEGUE-DOKPLOY.md](./DESPLIEGUE-DOKPLOY.md)** - Guía paso a paso completa
- **[CHECKLIST-DESPLIEGUE.md](./CHECKLIST-DESPLIEGUE.md)** - Checklist de verificación
- **[COMANDOS-RAPIDOS-DOKPLOY.md](./COMANDOS-RAPIDOS-DOKPLOY.md)** - Comandos útiles

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│           Traefik (SSL/HTTPS)           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Next.js App (Dashboard + API)          │
│  - Gestión de usuarios                  │
│  - Configuración de streams             │
│  - Subida de archivos                   │
└─────────────────────────────────────────┘
         ↓                    ↓
┌──────────────┐    ┌──────────────────┐
│    MySQL     │    │  Icecast Server  │
│  (Database)  │    │   (Streaming)    │
└──────────────┘    └──────────────────┘
                             ↑
                    ┌──────────────────┐
                    │   Liquidsoap     │
                    │    (AutoDJ)      │
                    └──────────────────┘
```

## ✨ Características

- ✅ **AutoDJ** - Reproducción automática 24/7
- ✅ **Multi-cliente** - Múltiples radios en un solo servidor
- ✅ **Playlists** - Gestión de música por horarios
- ✅ **Locuciones** - Locuciones de hora automáticas
- ✅ **Live Input** - Transmisión en vivo desde software externo
- ✅ **Estadísticas** - Oyentes en tiempo real
- ✅ **SSL/HTTPS** - Certificados automáticos con Let's Encrypt
- ✅ **Backups** - Scripts de backup incluidos
- ✅ **Monitoreo** - Health checks y logs

## 🔧 Requisitos del VPS

- **OS**: Ubuntu 20.04+ o Debian 11+
- **RAM**: Mínimo 4GB (recomendado 8GB)
- **Disco**: 50GB+
- **CPU**: 2 cores+
- **Software**: Docker, Docker Compose, Dokploy

## 🌐 Puertos

- `80` - HTTP (redirect a HTTPS)
- `443` - HTTPS (App principal)
- `8000` - Icecast (Streaming)
- `3306` - MySQL (solo interno)
- `6379` - Redis (solo interno)

## 📦 Servicios Incluidos

### Next.js App
- Dashboard de administración
- API REST completa
- Gestión de usuarios y clientes
- Subida de archivos de audio

### MySQL
- Base de datos principal
- Backups automáticos
- Optimizado para producción

### Icecast
- Servidor de streaming
- Múltiples mountpoints
- Estadísticas en tiempo real

### Liquidsoap
- Motor de AutoDJ
- Crossfade automático
- Normalización de audio
- Soporte para locuciones

### Redis
- Caché de sesiones
- Cola de trabajos
- Optimización de performance

## 🔐 Seguridad

### Incluido
- ✅ SSL/TLS automático con Let's Encrypt
- ✅ Redirect HTTP → HTTPS
- ✅ Contraseñas encriptadas
- ✅ Health checks
- ✅ Contenedores aislados

### Recomendado
- 🔒 Firewall (UFW)
- 🔒 Fail2ban
- 🔒 Actualizaciones automáticas
- 🔒 Backups diarios

## 📊 Monitoreo

### Health Checks
```bash
# App
curl https://tu-dominio.com/api/health

# Icecast
curl https://stream.tu-dominio.com/status.xsl
```

### Logs
```bash
# Ver logs en tiempo real
docker logs -f ipstream_app
docker logs -f ipstream_liquidsoap

# Ver últimas 100 líneas
docker logs --tail 100 ipstream_app
```

### Métricas
```bash
# Uso de recursos
docker stats

# Estado de contenedores
docker ps
```

## 💾 Backups

### Automático
Script incluido en `scripts/backup-ipstream.sh`:
- Backup diario de MySQL
- Backup de archivos de audio
- Retención de 7 días
- Configuración con cron

### Manual
```bash
# Base de datos
docker exec ipstream_mysql mysqldump -u root -p pipstream > backup.sql

# Archivos
tar -czf audio-backup.tar.gz /var/dokploy/ipstream/audio
```

## 🔄 Actualizaciones

### Desde Dokploy
1. Push cambios a Git
2. Click en "Redeploy" en Dokploy
3. Esperar a que complete

### Manual
```bash
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🐛 Troubleshooting

### App no inicia
```bash
docker logs ipstream_app --tail 100
docker exec ipstream_app env | grep DATABASE_URL
```

### Stream no se escucha
```bash
docker logs ipstream_liquidsoap --tail 50
curl http://localhost:8000/status-json.xsl
```

### Base de datos no conecta
```bash
docker logs ipstream_mysql --tail 50
docker exec ipstream_mysql mysql -u root -p -e "SELECT 1;"
```

## 📞 Soporte

### Documentación
- [Guía Completa](./DESPLIEGUE-DOKPLOY.md)
- [Comandos Útiles](./COMANDOS-RAPIDOS-DOKPLOY.md)
- [Checklist](./CHECKLIST-DESPLIEGUE.md)

### Logs
Todos los logs están disponibles en:
- Docker logs: `docker logs [container]`
- Volúmenes: `/var/log/icecast2`, `/var/log/liquidsoap`

## 🎉 Después del Despliegue

1. ✅ Accede a `https://tu-dominio.com`
2. ✅ Crea tu usuario administrador
3. ✅ Configura tu primer servidor de streaming
4. ✅ Crea un cliente de prueba
5. ✅ Sube archivos de audio
6. ✅ Crea una playlist
7. ✅ Inicia tu primer stream
8. ✅ Escucha en `https://stream.tu-dominio.com:8000/[mountpoint]`

## 📈 Escalabilidad

El sistema está diseñado para escalar:
- **Horizontal**: Múltiples servidores de streaming
- **Vertical**: Más recursos por servidor
- **Load Balancing**: Traefik incluido
- **CDN**: Compatible con cualquier CDN

## 🌟 Características Avanzadas

- **Multi-tenancy**: Múltiples clientes aislados
- **Programación horaria**: Playlists por día/hora
- **Locuciones automáticas**: Cada X canciones
- **Live override**: Transmisión en vivo prioritaria
- **Estadísticas**: Oyentes, picos, historial
- **API REST**: Integración con otros sistemas

## 📄 Licencia

Ver archivo LICENSE en el repositorio.

---

**¿Listo para desplegar?** Sigue la [Guía Completa](./DESPLIEGUE-DOKPLOY.md) 🚀

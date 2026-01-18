# 📦 Resumen de Archivos para Despliegue

## ✅ Archivos Creados para Producción

### Configuración Docker
1. **`docker-compose.prod.yml`** - Configuración de producción con todos los servicios
2. **`Dockerfile.prod`** - Dockerfile optimizado para Next.js en producción
3. **`.dockerignore`** - Archivos a excluir del build de Docker

### Configuración de Aplicación
4. **`next.config.js`** - Actualizado con `output: 'standalone'`
5. **`.env.production.example`** - Template de variables de entorno
6. **`app/api/health/route.ts`** - Endpoint de health check

### Documentación
7. **`DESPLIEGUE-DOKPLOY.md`** - Guía completa paso a paso
8. **`CHECKLIST-DESPLIEGUE.md`** - Checklist para verificar el despliegue
9. **`COMANDOS-RAPIDOS-DOKPLOY.md`** - Comandos útiles para administración

### Scripts
10. **`scripts/init-production.sh`** - Script de inicialización automática

---

## 🚀 Pasos Rápidos para Desplegar

### 1. Preparar Repositorio
```bash
git add .
git commit -m "Preparar para producción"
git push origin main
```

### 2. Configurar Variables de Entorno en Dokploy

Copia estas variables y reemplaza los valores:

```env
# Dominios
DOMAIN=tu-dominio.com
STREAM_DOMAIN=stream.tu-dominio.com

# Base de Datos
DATABASE_URL=mysql://pipstream_user:TU_PASSWORD@mysql:3306/pipstream
MYSQL_ROOT_PASSWORD=TU_ROOT_PASSWORD
MYSQL_DATABASE=pipstream
MYSQL_USER=pipstream_user
MYSQL_PASSWORD=TU_PASSWORD

# NextAuth (generar con: openssl rand -base64 32)
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=TU_SECRET_GENERADO

# Icecast
ICECAST_HOST=icecast
ICECAST_PORT=8000
ICECAST_PASSWORD=TU_PASSWORD_ICECAST
ICECAST_ADMIN_PASSWORD=TU_PASSWORD_ADMIN

# Node
NODE_ENV=production
```

### 3. Crear Directorios en VPS
```bash
ssh usuario@tu-vps-ip
sudo mkdir -p /var/dokploy/ipstream/audio
sudo mkdir -p /var/dokploy/ipstream/scripts/clients
sudo chown -R 1001:1001 /var/dokploy/ipstream
```

### 4. Desplegar en Dokploy
1. Crear nuevo proyecto en Dokploy
2. Agregar aplicación Docker Compose
3. Conectar repositorio Git
4. Configurar variables de entorno
5. Click en "Deploy"

### 5. Inicializar Base de Datos
```bash
docker exec -it ipstream_app sh
npx prisma migrate deploy
exit
```

### 6. Verificar
```bash
# Health check
curl http://localhost:3000/api/health

# Ver contenedores
docker ps

# Ver logs
docker logs -f ipstream_app
```

---

## 📋 Checklist Rápido

- [ ] Código en Git
- [ ] Variables de entorno configuradas en Dokploy
- [ ] Directorios creados en VPS
- [ ] Deploy ejecutado
- [ ] Migraciones de BD ejecutadas
- [ ] App accesible en navegador
- [ ] SSL configurado (si aplica)
- [ ] Usuario admin creado
- [ ] Stream de prueba funcionando

---

## 🔧 Configuración de Traefik (Incluida)

El `docker-compose.prod.yml` ya incluye las labels de Traefik para:
- ✅ HTTPS automático con Let's Encrypt
- ✅ Redirect HTTP → HTTPS
- ✅ Dominio principal para la app
- ✅ Subdominio para streaming

Solo necesitas configurar estas variables de entorno:
- `DOMAIN` - Tu dominio principal (ej: `radio.com`)
- `STREAM_DOMAIN` - Tu subdominio de streaming (ej: `stream.radio.com`)

---

## 📊 Arquitectura de Producción

```
Internet
    ↓
Traefik (Reverse Proxy + SSL)
    ↓
┌─────────────────────────────────────┐
│  Docker Network: ipstream_network   │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │  Next.js │  │  MySQL   │       │
│  │   App    │←→│          │       │
│  │  :3000   │  │  :3306   │       │
│  └──────────┘  └──────────┘       │
│       ↓                             │
│  ┌──────────┐  ┌──────────┐       │
│  │ Icecast  │←→│Liquidsoap│       │
│  │  :8000   │  │          │       │
│  └──────────┘  └──────────┘       │
│       ↑                             │
│  ┌──────────┐                      │
│  │  Redis   │                      │
│  │  :6379   │                      │
│  └──────────┘                      │
│                                     │
└─────────────────────────────────────┘
         ↓
    Volúmenes Persistentes
    - mysql_data
    - audio files
    - logs
```

---

## 🔐 Seguridad

### Contraseñas Fuertes
Genera contraseñas seguras:
```bash
# Para NEXTAUTH_SECRET
openssl rand -base64 32

# Para otras contraseñas
openssl rand -base64 24
```

### Firewall
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### SSL/TLS
Traefik configurará automáticamente SSL con Let's Encrypt si:
- Tu dominio apunta al VPS
- Los puertos 80 y 443 están abiertos
- Las labels de Traefik están configuradas (ya incluidas)

---

## 📞 Soporte

### Logs
```bash
# Ver logs de la app
docker logs -f ipstream_app

# Ver logs de Liquidsoap
docker logs -f ipstream_liquidsoap

# Ver todos los logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Reiniciar
```bash
# Reiniciar un servicio
docker restart ipstream_app

# Reiniciar todos
docker-compose -f docker-compose.prod.yml restart
```

### Backup
```bash
# Base de datos
docker exec ipstream_mysql mysqldump -u root -p pipstream > backup.sql

# Archivos de audio
tar -czf audio-backup.tar.gz /var/dokploy/ipstream/audio
```

---

## 🎉 ¡Listo!

Tu aplicación IPStream está lista para producción con:
- ✅ Docker Compose optimizado
- ✅ SSL automático con Traefik
- ✅ Health checks configurados
- ✅ Volúmenes persistentes
- ✅ Logs centralizados
- ✅ Documentación completa

Para más detalles, consulta:
- `DESPLIEGUE-DOKPLOY.md` - Guía completa
- `CHECKLIST-DESPLIEGUE.md` - Checklist detallado
- `COMANDOS-RAPIDOS-DOKPLOY.md` - Comandos útiles

---

## 📚 Recursos Adicionales

- [Dokploy Docs](https://docs.dokploy.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)

# ✅ Checklist de Despliegue IPStream

## Pre-Despliegue

### Repositorio
- [ ] Código subido a Git (GitHub/GitLab/Bitbucket)
- [ ] Branch principal actualizada (`main` o `master`)
- [ ] Archivos de producción incluidos:
  - [ ] `docker-compose.prod.yml`
  - [ ] `Dockerfile.prod`
  - [ ] `.dockerignore`
  - [ ] `.env.production.example`

### VPS
- [ ] VPS con mínimo 4GB RAM
- [ ] Ubuntu 20.04+ o Debian 11+
- [ ] Docker instalado
- [ ] Docker Compose instalado
- [ ] Dokploy instalado y funcionando
- [ ] Dominio apuntando al VPS (opcional)

### Puertos
- [ ] Puerto 80 abierto (HTTP)
- [ ] Puerto 443 abierto (HTTPS)
- [ ] Puerto 8000 abierto (Icecast streaming)

## Configuración en Dokploy

### Proyecto
- [ ] Proyecto creado en Dokploy
- [ ] Aplicación Docker Compose agregada
- [ ] Repositorio Git conectado
- [ ] Branch configurada

### Variables de Entorno
- [ ] `DATABASE_URL` configurada
- [ ] `MYSQL_ROOT_PASSWORD` configurada (segura)
- [ ] `MYSQL_DATABASE` configurada
- [ ] `MYSQL_USER` configurada
- [ ] `MYSQL_PASSWORD` configurada (segura)
- [ ] `NEXTAUTH_URL` configurada (tu dominio)
- [ ] `NEXTAUTH_SECRET` generada (min 32 caracteres)
- [ ] `ICECAST_PASSWORD` configurada (segura)
- [ ] `ICECAST_ADMIN_PASSWORD` configurada (segura)
- [ ] `NODE_ENV=production` configurada

### Volúmenes
- [ ] Volumen `mysql_data` configurado
- [ ] Volumen `icecast_logs` configurado
- [ ] Volumen `liquidsoap_logs` configurado
- [ ] Volumen `redis_data` configurado
- [ ] Directorio `/var/dokploy/ipstream/audio` creado
- [ ] Directorio `/var/dokploy/ipstream/scripts/clients` creado
- [ ] Permisos correctos (1001:1001)

## Despliegue

### Build y Deploy
- [ ] Click en "Deploy" en Dokploy
- [ ] Build completado sin errores
- [ ] Todos los contenedores iniciados
- [ ] Health checks pasando

### Verificación de Servicios
```bash
# Ejecutar en el VPS
docker ps  # Todos los contenedores deben estar "Up"
```

- [ ] Contenedor `ipstream_app` corriendo
- [ ] Contenedor `ipstream_mysql` corriendo
- [ ] Contenedor `ipstream_icecast` corriendo
- [ ] Contenedor `ipstream_liquidsoap` corriendo
- [ ] Contenedor `ipstream_redis` corriendo

### Inicialización
```bash
# Ejecutar en el VPS
docker exec -it ipstream_app sh /app/scripts/init-production.sh
```

- [ ] Script de inicialización ejecutado
- [ ] Migraciones de Prisma completadas
- [ ] Directorios creados

## Post-Despliegue

### Acceso Web
- [ ] Aplicación accesible en `https://tu-dominio.com`
- [ ] Página de login carga correctamente
- [ ] SSL/HTTPS funcionando (si configurado)

### Configuración Inicial
- [ ] Usuario administrador creado
- [ ] Servidor de streaming configurado
- [ ] Cliente de prueba creado

### Pruebas Funcionales
- [ ] Login funciona
- [ ] Dashboard carga
- [ ] Subida de archivos de audio funciona
- [ ] Creación de playlist funciona
- [ ] Inicio de stream funciona
- [ ] Stream se escucha en Icecast
- [ ] Metadata se actualiza correctamente

### Icecast
```bash
# Verificar en navegador
http://tu-dominio.com:8000/admin
# Usuario: admin
# Password: tu_icecast_admin_password
```

- [ ] Icecast admin accesible
- [ ] Stream aparece en la lista
- [ ] Metadata visible

## Seguridad

### Firewall
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

- [ ] UFW configurado
- [ ] Solo puertos necesarios abiertos

### SSL/TLS
- [ ] Certificado SSL instalado (Let's Encrypt)
- [ ] HTTPS forzado
- [ ] Certificado válido y no expirado

### Passwords
- [ ] Todas las contraseñas son fuertes (min 16 caracteres)
- [ ] Contraseñas únicas para cada servicio
- [ ] Contraseñas guardadas en gestor seguro

### Actualizaciones
```bash
sudo apt update && sudo apt upgrade -y
```

- [ ] Sistema operativo actualizado
- [ ] Docker actualizado

## Monitoreo y Backups

### Logs
```bash
# Ver logs
docker logs -f ipstream_app
docker logs -f ipstream_liquidsoap
```

- [ ] Logs accesibles
- [ ] No hay errores críticos

### Backups
- [ ] Script de backup configurado
- [ ] Cron job para backups automáticos
- [ ] Backup de prueba realizado
- [ ] Restauración de backup probada

### Monitoreo
- [ ] Health check endpoint funcionando (`/api/health`)
- [ ] Monitoreo de uptime configurado (opcional)
- [ ] Alertas configuradas (opcional)

## Documentación

### Para el equipo
- [ ] Credenciales documentadas (en lugar seguro)
- [ ] Procedimientos de despliegue documentados
- [ ] Contactos de soporte documentados

### Para usuarios
- [ ] Manual de usuario disponible
- [ ] Guías de inicio rápido
- [ ] FAQ preparado

## Optimización (Opcional)

### Performance
- [ ] CDN configurado para assets estáticos
- [ ] Caché de Redis configurado
- [ ] Compresión gzip habilitada
- [ ] Imágenes optimizadas

### Escalabilidad
- [ ] Límites de recursos configurados
- [ ] Auto-scaling configurado (si aplica)
- [ ] Load balancer configurado (si aplica)

## Rollback Plan

### En caso de problemas
```bash
# Volver a versión anterior
docker-compose -f docker-compose.prod.yml down
git checkout [commit-anterior]
docker-compose -f docker-compose.prod.yml up -d
```

- [ ] Plan de rollback documentado
- [ ] Backup reciente disponible
- [ ] Procedimiento de restauración probado

## ✅ Despliegue Completado

Fecha: _______________
Responsable: _______________
Versión desplegada: _______________

### Notas adicionales:
_______________________________________
_______________________________________
_______________________________________

---

## Comandos Útiles

### Ver estado de contenedores
```bash
docker ps
docker-compose -f docker-compose.prod.yml ps
```

### Ver logs
```bash
docker logs -f ipstream_app
docker logs -f ipstream_liquidsoap --tail 100
```

### Reiniciar servicios
```bash
docker-compose -f docker-compose.prod.yml restart app
docker-compose -f docker-compose.prod.yml restart liquidsoap
```

### Acceder a contenedor
```bash
docker exec -it ipstream_app sh
docker exec -it ipstream_mysql mysql -u root -p
```

### Backup manual
```bash
# Base de datos
docker exec ipstream_mysql mysqldump -u root -p pipstream > backup.sql

# Archivos
tar -czf audio-backup.tar.gz /var/dokploy/ipstream/audio
```

### Restaurar backup
```bash
# Base de datos
docker exec -i ipstream_mysql mysql -u root -p pipstream < backup.sql

# Archivos
tar -xzf audio-backup.tar.gz -C /
```

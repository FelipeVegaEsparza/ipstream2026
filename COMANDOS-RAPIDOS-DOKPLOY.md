# 🚀 Comandos Rápidos para Dokploy

## Despliegue Inicial

### 1. Generar NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### 2. Crear directorios en VPS
```bash
ssh usuario@tu-vps-ip

sudo mkdir -p /var/dokploy/ipstream/audio
sudo mkdir -p /var/dokploy/ipstream/scripts/clients
sudo chown -R 1001:1001 /var/dokploy/ipstream
```

### 3. Inicializar base de datos (después del primer deploy)
```bash
docker exec -it ipstream_app sh
npx prisma migrate deploy
npx prisma db push
exit
```

## Monitoreo

### Ver todos los contenedores
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Ver logs en tiempo real
```bash
# App
docker logs -f ipstream_app

# Liquidsoap
docker logs -f ipstream_liquidsoap

# MySQL
docker logs -f ipstream_mysql

# Icecast
docker logs -f ipstream_icecast
```

### Ver últimas 50 líneas de logs
```bash
docker logs --tail 50 ipstream_app
docker logs --tail 50 ipstream_liquidsoap
```

### Health checks
```bash
# App
curl http://localhost:3000/api/health

# Icecast
curl http://localhost:8000/status.xsl

# MySQL
docker exec ipstream_mysql mysqladmin ping -h localhost
```

## Mantenimiento

### Reiniciar servicios
```bash
# Reiniciar solo la app
docker restart ipstream_app

# Reiniciar Liquidsoap
docker restart ipstream_liquidsoap

# Reiniciar todos los servicios
docker-compose -f docker-compose.prod.yml restart
```

### Actualizar aplicación
```bash
# Opción 1: Desde Dokploy UI
# Click en "Redeploy"

# Opción 2: Desde terminal
cd /ruta/del/proyecto
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build app
```

### Limpiar recursos no utilizados
```bash
# Limpiar imágenes antiguas
docker image prune -a

# Limpiar volúmenes no utilizados
docker volume prune

# Limpiar todo (CUIDADO)
docker system prune -a --volumes
```

## Base de Datos

### Backup de MySQL
```bash
# Backup completo
docker exec ipstream_mysql mysqldump -u root -p[PASSWORD] pipstream > backup_$(date +%Y%m%d).sql

# Backup con compresión
docker exec ipstream_mysql mysqldump -u root -p[PASSWORD] pipstream | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restaurar MySQL
```bash
# Desde archivo SQL
docker exec -i ipstream_mysql mysql -u root -p[PASSWORD] pipstream < backup.sql

# Desde archivo comprimido
gunzip < backup.sql.gz | docker exec -i ipstream_mysql mysql -u root -p[PASSWORD] pipstream
```

### Acceder a MySQL
```bash
docker exec -it ipstream_mysql mysql -u root -p
```

### Ejecutar query directa
```bash
docker exec ipstream_mysql mysql -u root -p[PASSWORD] -e "SELECT COUNT(*) FROM pipstream.users;"
```

## Archivos de Audio

### Ver espacio usado
```bash
du -sh /var/dokploy/ipstream/audio
```

### Listar archivos por cliente
```bash
ls -lh /var/dokploy/ipstream/audio/[clientId]/
```

### Backup de archivos de audio
```bash
tar -czf audio_backup_$(date +%Y%m%d).tar.gz /var/dokploy/ipstream/audio
```

### Restaurar archivos de audio
```bash
tar -xzf audio_backup.tar.gz -C /
```

## Liquidsoap

### Ver scripts de clientes
```bash
docker exec ipstream_liquidsoap ls -la /scripts/clients/
```

### Ver contenido de un script
```bash
docker exec ipstream_liquidsoap cat /scripts/clients/[clientId].liq
```

### Regenerar script de cliente
```bash
docker exec ipstream_app node /app/scripts/regenerate-client-script.js [clientId]
```

### Verificar sintaxis de script
```bash
docker exec ipstream_liquidsoap liquidsoap --check /scripts/clients/[clientId].liq
```

## Icecast

### Ver streams activos
```bash
curl -s http://localhost:8000/status-json.xsl | jq '.icestats.source'
```

### Ver oyentes por stream
```bash
curl -s http://localhost:8000/status-json.xsl | jq '.icestats.source[] | {mount: .listenurl, listeners: .listeners}'
```

### Acceder a admin de Icecast
```
http://tu-dominio.com:8000/admin
Usuario: admin
Password: [tu_icecast_admin_password]
```

## Debugging

### Entrar a un contenedor
```bash
# App (Next.js)
docker exec -it ipstream_app sh

# MySQL
docker exec -it ipstream_mysql bash

# Liquidsoap
docker exec -it ipstream_liquidsoap sh

# Icecast
docker exec -it ipstream_icecast sh
```

### Ver variables de entorno
```bash
docker exec ipstream_app env
```

### Ver uso de recursos
```bash
# Todos los contenedores
docker stats

# Un contenedor específico
docker stats ipstream_app
```

### Ver red de Docker
```bash
docker network inspect ipstream_network
```

### Ver volúmenes
```bash
docker volume ls
docker volume inspect ipstream_mysql_data
```

## Troubleshooting

### App no inicia
```bash
# Ver logs detallados
docker logs ipstream_app --tail 100

# Verificar health check
curl http://localhost:3000/api/health

# Verificar variables de entorno
docker exec ipstream_app env | grep DATABASE_URL
```

### MySQL no conecta
```bash
# Verificar que esté corriendo
docker ps | grep mysql

# Ver logs
docker logs ipstream_mysql --tail 50

# Probar conexión
docker exec ipstream_mysql mysql -u pipstream_user -p -e "SELECT 1;"
```

### Liquidsoap se reinicia
```bash
# Ver logs
docker logs ipstream_liquidsoap --tail 100

# Verificar scripts
docker exec ipstream_liquidsoap ls -la /scripts/clients/

# Ver errores de sintaxis
docker logs ipstream_liquidsoap 2>&1 | grep -i error
```

### Stream no se escucha
```bash
# Verificar Icecast
curl http://localhost:8000/status-json.xsl

# Ver si Liquidsoap está conectado
docker logs ipstream_liquidsoap | grep -i "connected"

# Verificar archivos de audio
docker exec ipstream_liquidsoap ls -la /audio/[clientId]/
```

### Espacio en disco lleno
```bash
# Ver uso de disco
df -h

# Ver tamaño de volúmenes Docker
docker system df

# Limpiar logs antiguos
sudo journalctl --vacuum-time=7d

# Limpiar Docker
docker system prune -a
```

## Performance

### Ver uso de CPU y RAM
```bash
docker stats --no-stream
```

### Ver procesos dentro de un contenedor
```bash
docker top ipstream_app
```

### Limitar recursos de un contenedor
```yaml
# En docker-compose.prod.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Seguridad

### Ver puertos expuestos
```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

### Actualizar contraseñas
```bash
# MySQL root password
docker exec -it ipstream_mysql mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nueva_password';
FLUSH PRIVILEGES;

# Actualizar en variables de entorno de Dokploy
```

### Ver logs de acceso
```bash
# Nginx (si aplica)
sudo tail -f /var/log/nginx/access.log

# Docker logs
docker logs ipstream_app | grep -i "POST\|GET"
```

## Automatización

### Script de backup automático
```bash
# Crear script
sudo nano /usr/local/bin/backup-ipstream.sh

# Contenido del script (ver DESPLIEGUE-DOKPLOY.md)

# Hacer ejecutable
sudo chmod +x /usr/local/bin/backup-ipstream.sh

# Agregar a crontab
sudo crontab -e
# Agregar: 0 2 * * * /usr/local/bin/backup-ipstream.sh
```

### Script de monitoreo
```bash
#!/bin/bash
# Verificar que todos los servicios estén corriendo

services=("ipstream_app" "ipstream_mysql" "ipstream_icecast" "ipstream_liquidsoap" "ipstream_redis")

for service in "${services[@]}"; do
    if docker ps | grep -q $service; then
        echo "✅ $service está corriendo"
    else
        echo "❌ $service NO está corriendo"
        # Enviar alerta (email, Slack, etc.)
    fi
done
```

## Información del Sistema

### Ver versiones
```bash
# Docker
docker --version

# Docker Compose
docker-compose --version

# Node.js (en contenedor)
docker exec ipstream_app node --version

# Liquidsoap
docker exec ipstream_liquidsoap liquidsoap --version
```

### Ver información del VPS
```bash
# CPU
lscpu

# RAM
free -h

# Disco
df -h

# Uptime
uptime
```

---

## 📞 Soporte

Si necesitas ayuda:
1. Revisa los logs con los comandos de arriba
2. Verifica el checklist de despliegue
3. Consulta la documentación completa en `DESPLIEGUE-DOKPLOY.md`

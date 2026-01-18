# Guía de Despliegue en VPS con Dokploy

Esta guía te ayudará a desplegar IPStream en tu VPS usando Dokploy.

## Requisitos Previos

### En tu VPS:
- Ubuntu 20.04+ o Debian 11+
- Mínimo 4GB RAM (recomendado 8GB)
- 50GB de espacio en disco
- Docker y Docker Compose instalados
- Dokploy instalado y configurado
- Dominio apuntando a tu VPS (opcional pero recomendado)

### Puertos necesarios:
- `80` - HTTP (Nginx/Traefik)
- `443` - HTTPS (Nginx/Traefik)
- `3000` - Next.js App
- `3306` - MySQL (solo interno)
- `6379` - Redis (solo interno)
- `8000` - Icecast (streaming)

## Paso 1: Preparar el Repositorio

### 1.1 Asegurar que todos los archivos estén en Git

```bash
git add .
git commit -m "Preparar para despliegue en producción"
git push origin main
```

### 1.2 Verificar archivos necesarios

Asegúrate de tener estos archivos en tu repositorio:
- ✅ `docker-compose.prod.yml`
- ✅ `Dockerfile.prod`
- ✅ `.dockerignore`
- ✅ `.env.production.example`
- ✅ `next.config.js` (con `output: 'standalone'`)

## Paso 2: Configurar Dokploy

### 2.1 Acceder a Dokploy

1. Abre tu navegador y ve a: `http://tu-vps-ip:3000` (o el puerto que configuraste)
2. Inicia sesión con tus credenciales

### 2.2 Crear un nuevo proyecto

1. Click en **"New Project"**
2. Nombre: `ipstream`
3. Descripción: `Sistema de gestión de radio streaming`

### 2.3 Conectar repositorio Git

1. En el proyecto, click en **"Add Application"**
2. Selecciona **"Docker Compose"**
3. Configura:
   - **Name**: `ipstream-app`
   - **Repository**: URL de tu repositorio Git
   - **Branch**: `main` (o tu rama principal)
   - **Docker Compose File**: `docker-compose.prod.yml`

## Paso 3: Configurar Variables de Entorno

En Dokploy, ve a la sección **"Environment Variables"** y agrega:

### Variables Críticas (CAMBIAR VALORES):

```env
# Base de Datos
DATABASE_URL=mysql://pipstream_user:TU_PASSWORD_SEGURO@mysql:3306/pipstream
MYSQL_ROOT_PASSWORD=TU_ROOT_PASSWORD_SEGURO
MYSQL_DATABASE=pipstream
MYSQL_USER=pipstream_user
MYSQL_PASSWORD=TU_PASSWORD_SEGURO

# NextAuth (IMPORTANTE: Generar valores seguros)
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=GENERAR_STRING_ALEATORIO_MIN_32_CARACTERES

# Icecast
ICECAST_HOST=icecast
ICECAST_PORT=8000
ICECAST_PASSWORD=TU_PASSWORD_ICECAST
ICECAST_ADMIN_PASSWORD=TU_PASSWORD_ADMIN_ICECAST

# Node
NODE_ENV=production
```

### Generar NEXTAUTH_SECRET:

```bash
# En tu terminal local:
openssl rand -base64 32
```

## Paso 4: Configurar Volúmenes Persistentes

En Dokploy, asegúrate de que estos volúmenes estén configurados:

1. **mysql_data** - Datos de MySQL
2. **icecast_logs** - Logs de Icecast
3. **liquidsoap_logs** - Logs de Liquidsoap
4. **redis_data** - Datos de Redis

### Volúmenes de archivos (bind mounts):

Crea estos directorios en tu VPS:

```bash
# Conectar por SSH a tu VPS
ssh usuario@tu-vps-ip

# Crear directorios
sudo mkdir -p /var/dokploy/ipstream/audio
sudo mkdir -p /var/dokploy/ipstream/scripts/clients
sudo chown -R 1001:1001 /var/dokploy/ipstream/audio
sudo chown -R 1001:1001 /var/dokploy/ipstream/scripts
```

## Paso 5: Configurar Nginx/Traefik (Reverse Proxy)

### Opción A: Usando Traefik (recomendado con Dokploy)

Dokploy generalmente usa Traefik. Configura las labels en `docker-compose.prod.yml`:

```yaml
services:
  app:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ipstream.rule=Host(`tu-dominio.com`)"
      - "traefik.http.routers.ipstream.entrypoints=websecure"
      - "traefik.http.routers.ipstream.tls.certresolver=letsencrypt"
      - "traefik.http.services.ipstream.loadbalancer.server.port=3000"
      
  icecast:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.icecast.rule=Host(`stream.tu-dominio.com`)"
      - "traefik.http.routers.icecast.entrypoints=websecure"
      - "traefik.http.routers.icecast.tls.certresolver=letsencrypt"
      - "traefik.http.services.icecast.loadbalancer.server.port=8000"
```

### Opción B: Nginx manual

Si prefieres Nginx, crea este archivo en tu VPS:

```bash
sudo nano /etc/nginx/sites-available/ipstream
```

```nginx
# App principal
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Icecast streaming
server {
    listen 80;
    server_name stream.tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_buffering off;
    }
}
```

Habilitar y configurar SSL con Certbot:

```bash
sudo ln -s /etc/nginx/sites-available/ipstream /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d tu-dominio.com -d stream.tu-dominio.com
```

## Paso 6: Desplegar

### 6.1 En Dokploy:

1. Click en **"Deploy"**
2. Espera a que se construyan las imágenes (puede tomar 5-10 minutos)
3. Monitorea los logs en tiempo real

### 6.2 Verificar el despliegue:

```bash
# Conectar por SSH
ssh usuario@tu-vps-ip

# Ver contenedores corriendo
docker ps

# Ver logs
docker logs ipstream_app
docker logs ipstream_mysql
docker logs ipstream_icecast
docker logs ipstream_liquidsoap
```

## Paso 7: Inicializar Base de Datos

### 7.1 Ejecutar migraciones de Prisma:

```bash
# Desde Dokploy, abre una terminal en el contenedor de la app
# O por SSH:
docker exec -it ipstream_app sh

# Dentro del contenedor:
npx prisma migrate deploy
npx prisma db push
```

### 7.2 Crear usuario administrador:

Puedes crear un script o hacerlo manualmente desde la interfaz web después del primer despliegue.

## Paso 8: Verificar Funcionamiento

### 8.1 Verificar servicios:

```bash
# Health check de la app
curl http://localhost:3000/api/health

# Verificar Icecast
curl http://localhost:8000/status.xsl

# Verificar MySQL
docker exec ipstream_mysql mysql -u pipstream_user -p -e "SHOW DATABASES;"
```

### 8.2 Acceder a la aplicación:

1. Abre tu navegador
2. Ve a: `https://tu-dominio.com`
3. Deberías ver la página de login

## Paso 9: Configuración Post-Despliegue

### 9.1 Configurar backups automáticos:

```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-ipstream.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/ipstream"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup de MySQL
docker exec ipstream_mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD pipstream > $BACKUP_DIR/db_$DATE.sql

# Backup de archivos de audio
tar -czf $BACKUP_DIR/audio_$DATE.tar.gz /var/dokploy/ipstream/audio

# Mantener solo últimos 7 días
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
```

```bash
# Hacer ejecutable
sudo chmod +x /usr/local/bin/backup-ipstream.sh

# Agregar a crontab (diario a las 2 AM)
sudo crontab -e
# Agregar: 0 2 * * * /usr/local/bin/backup-ipstream.sh
```

### 9.2 Configurar monitoreo:

Considera instalar:
- **Prometheus + Grafana** para métricas
- **Uptime Kuma** para monitoreo de uptime
- **Loki** para logs centralizados

## Paso 10: Mantenimiento

### Actualizar la aplicación:

```bash
# En Dokploy, simplemente:
1. Hacer push de cambios a Git
2. Click en "Redeploy" en Dokploy
3. Esperar a que se complete el despliegue
```

### Ver logs en tiempo real:

```bash
docker logs -f ipstream_app
docker logs -f ipstream_liquidsoap
```

### Reiniciar servicios:

```bash
# Desde Dokploy UI o:
docker-compose -f docker-compose.prod.yml restart app
docker-compose -f docker-compose.prod.yml restart liquidsoap
```

## Troubleshooting

### Problema: La app no inicia

```bash
# Ver logs detallados
docker logs ipstream_app --tail 100

# Verificar variables de entorno
docker exec ipstream_app env | grep DATABASE_URL
```

### Problema: No se puede conectar a MySQL

```bash
# Verificar que MySQL esté corriendo
docker ps | grep mysql

# Probar conexión
docker exec ipstream_mysql mysql -u pipstream_user -p -e "SELECT 1;"
```

### Problema: Liquidsoap se reinicia constantemente

```bash
# Ver logs de Liquidsoap
docker logs ipstream_liquidsoap --tail 50

# Verificar sintaxis del script
docker exec ipstream_liquidsoap cat /scripts/clients/[clientId].liq
```

### Problema: No se escucha el stream

```bash
# Verificar Icecast
curl http://localhost:8000/status-json.xsl

# Verificar que Liquidsoap esté conectado
docker logs ipstream_liquidsoap | grep "connected"
```

## Seguridad

### Recomendaciones:

1. **Firewall**: Configura UFW para permitir solo puertos necesarios
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

2. **Fail2ban**: Protege contra ataques de fuerza bruta
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

3. **Actualizaciones**: Mantén el sistema actualizado
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Passwords**: Usa contraseñas fuertes y únicas para cada servicio

5. **SSL**: Siempre usa HTTPS en producción

## Recursos Adicionales

- [Documentación de Dokploy](https://docs.dokploy.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Icecast Documentation](https://icecast.org/docs/)
- [Liquidsoap Documentation](https://www.liquidsoap.info/doc.html)

## Soporte

Si encuentras problemas durante el despliegue, revisa:
1. Los logs de cada contenedor
2. Las variables de entorno
3. La conectividad de red entre contenedores
4. Los permisos de archivos y directorios

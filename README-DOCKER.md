# Guía de Docker para Desarrollo Local

## Requisitos Previos
- Docker Desktop instalado y corriendo
- Docker Compose instalado (viene incluido con Docker Desktop)

## Iniciar la Base de Datos MySQL

### 1. Levantar el contenedor de MySQL
```bash
docker-compose up -d
```

Este comando:
- Descarga la imagen de MySQL 8.0 (si no la tienes)
- Crea un contenedor llamado `ipstream_mysql`
- Crea la base de datos `pipstream`
- Configura el usuario `pipstream_user` con contraseña `pipstream_pass`
- Expone el puerto 3306 en tu máquina local
- Crea un volumen persistente para los datos

### 2. Verificar que el contenedor está corriendo
```bash
docker-compose ps
```

Deberías ver algo como:
```
NAME              IMAGE       STATUS        PORTS
ipstream_mysql    mysql:8.0   Up 10 seconds 0.0.0.0:3306->3306/tcp
```

### 3. Ver los logs del contenedor
```bash
docker-compose logs -f mysql
```

### 4. Configurar Prisma y crear las tablas
Una vez que MySQL esté corriendo, ejecuta:

```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas en la base de datos
npm run db:push
```

### 5. Iniciar la aplicación
```bash
npm run dev
```

## Comandos Útiles

### Detener el contenedor
```bash
docker-compose stop
```

### Iniciar el contenedor (si ya existe)
```bash
docker-compose start
```

### Detener y eliminar el contenedor
```bash
docker-compose down
```

### Detener y eliminar el contenedor + volúmenes (BORRA TODOS LOS DATOS)
```bash
docker-compose down -v
```

### Acceder a MySQL desde la línea de comandos
```bash
docker exec -it ipstream_mysql mysql -u pipstream_user -p
# Contraseña: pipstream_pass
```

### Ver los logs en tiempo real
```bash
docker-compose logs -f
```

### Reiniciar el contenedor
```bash
docker-compose restart
```

## Conexión a la Base de Datos

### Desde la aplicación (ya configurado en .env)
```
DATABASE_URL="mysql://pipstream_user:pipstream_pass@localhost:3306/pipstream"
```

### Desde herramientas externas (MySQL Workbench, DBeaver, etc.)
- **Host**: localhost
- **Puerto**: 3306
- **Usuario**: pipstream_user
- **Contraseña**: pipstream_pass
- **Base de datos**: pipstream

### Usuario Root (para administración)
- **Usuario**: root
- **Contraseña**: root_password

## Prisma Studio

Para explorar y editar los datos visualmente:
```bash
npm run db:studio
```

Esto abrirá Prisma Studio en http://localhost:5555

## Solución de Problemas

### El puerto 3306 ya está en uso
Si tienes MySQL instalado localmente, puede estar usando el puerto 3306. Opciones:

1. **Detener MySQL local**:
   ```bash
   # Windows
   net stop MySQL80
   
   # O cambiar el puerto en docker-compose.yml
   ports:
     - "3307:3306"
   
   # Y actualizar .env
   DATABASE_URL="mysql://pipstream_user:pipstream_pass@localhost:3307/pipstream"
   ```

### El contenedor no inicia
```bash
# Ver los logs para identificar el error
docker-compose logs mysql

# Eliminar y recrear el contenedor
docker-compose down -v
docker-compose up -d
```

### Error de conexión desde la aplicación
1. Verifica que el contenedor esté corriendo: `docker-compose ps`
2. Verifica que MySQL esté listo: `docker-compose logs mysql | grep "ready for connections"`
3. Verifica la URL de conexión en `.env`

### Resetear la base de datos completamente
```bash
# Detener y eliminar todo (incluidos los datos)
docker-compose down -v

# Volver a iniciar
docker-compose up -d

# Esperar unos segundos y recrear las tablas
npm run db:push
```

## Backup y Restore

### Crear un backup
```bash
docker exec ipstream_mysql mysqldump -u pipstream_user -ppipstream_pass pipstream > backup.sql
```

### Restaurar desde un backup
```bash
docker exec -i ipstream_mysql mysql -u pipstream_user -ppipstream_pass pipstream < backup.sql
```

## Configuración Avanzada

### Cambiar las credenciales
Edita el archivo `docker-compose.yml` y cambia:
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_USER`
- `MYSQL_PASSWORD`

Luego actualiza el archivo `.env` con las nuevas credenciales.

### Persistencia de datos
Los datos se guardan en un volumen Docker llamado `mysql_data`. Esto significa que:
- Los datos persisten aunque detengas el contenedor
- Los datos se eliminan solo si ejecutas `docker-compose down -v`
- Puedes ver los volúmenes con: `docker volume ls`

## Producción

Este setup es solo para desarrollo local. Para producción:
- Usa un servicio de base de datos gestionado (AWS RDS, PlanetScale, etc.)
- Configura backups automáticos
- Usa contraseñas seguras
- Configura SSL/TLS
- Implementa monitoreo y alertas

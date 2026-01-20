# Solución Definitiva al Problema de Despliegue en Dokploy

## Diagnóstico del Problema

**El problema NO es con los archivos** - Todos los archivos existen en el repositorio:
- ✅ `lib/auth.ts` existe
- ✅ `lib/prisma.ts` existe  
- ✅ `components/admin/SystemInfo.tsx` existe
- ✅ `components/admin/BillingOverview.tsx` existe
- ✅ Todos los componentes de dashboard existen

**El problema REAL es:**
Dokploy está haciendo un **shallow clone** y obteniendo un commit antiguo (471 objetos) en lugar del commit actual `841cf36` que tiene todos los archivos.

## Solución 1: Forzar Actualización del Repositorio (RECOMENDADA)

### Paso 1: Crear un commit dummy para forzar actualización
```bash
# Crear un archivo temporal
echo "# Force deploy $(date)" > .deploy-timestamp

# Commit y push
git add .deploy-timestamp
git commit -m "force: Trigger Dokploy redeploy with fresh clone"
git push origin main
```

### Paso 2: En Dokploy
1. Ve a tu aplicación
2. Click en "Settings" o "Configuración"
3. Busca la opción "Clean Build" o "Rebuild from Scratch"
4. Si existe, actívala
5. Click en "Redeploy" o "Deploy"

### Paso 3: Si sigue fallando
En Dokploy, busca opciones de Git:
- **Git Depth**: Si existe, cambia de 1 a 50 o 100
- **Clean Clone**: Si existe, actívala
- **Cache**: Desactiva el cache de Docker temporalmente

## Solución 2: Configurar Dokploy para Clone Completo

Si Dokploy tiene archivo de configuración (buscar `dokploy.yml` o similar):

```yaml
git:
  depth: 0  # Clone completo en lugar de shallow
  clean: true  # Limpiar antes de clonar
```

## Solución 3: Despliegue Manual (Si Dokploy no coopera)

Si Dokploy sigue sin funcionar, despliega directamente en el VPS:

### En tu VPS:
```bash
# Conectar por SSH
ssh usuario@tu-vps

# Clonar el repositorio
cd /opt
git clone https://github.com/FelipeVegaEsparza/ipstream2026.git
cd ipstream2026

# Verificar que tienes el commit correcto
git log --oneline -1
# Debe mostrar: 841cf36

# Copiar archivo de entorno
cp .env.production.example .env.production
nano .env.production  # Editar con tus valores

# Desplegar con Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Ejecutar migraciones
docker exec -it ipstream_app npx prisma migrate deploy

# Crear usuario admin
docker exec -it ipstream_app node scripts/create-admin.js

# Crear directorios necesarios
mkdir -p /opt/ipstream2026/public/audio
mkdir -p /opt/ipstream2026/docker/liquidsoap/scripts/clients
```

## Solución 4: Usar GitHub Actions para Despliegue

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Clone completo
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/ipstream2026
            git pull origin main
            docker-compose -f docker-compose.prod.yml up -d --build
```

## Verificación Post-Despliegue

Una vez que el despliegue funcione:

```bash
# Verificar que los contenedores están corriendo
docker ps

# Verificar logs
docker logs ipstream_app

# Verificar health check
curl http://localhost:3000/api/health

# Verificar que Prisma está funcionando
docker exec -it ipstream_app npx prisma db pull
```

## Por Qué Funciona en Local pero No en Dokploy

1. **Local**: Tienes el repositorio completo con todos los commits
2. **Dokploy**: Hace `git clone --depth=1` que solo obtiene 1 commit
3. **GitHub Cache**: Puede estar sirviendo un commit antiguo en el shallow clone
4. **Docker Cache**: Dokploy puede estar usando layers cacheados del build anterior

## Recomendación Final

**Opción A (Más Rápida)**: Ejecuta la Solución 1 - Crear commit dummy y forzar redeploy

**Opción B (Más Confiable)**: Usa la Solución 3 - Despliegue manual en VPS con Docker Compose

**Opción C (Más Profesional)**: Implementa la Solución 4 - GitHub Actions para CI/CD

---

## Comandos Rápidos para Solución 1

```bash
# En tu máquina local
echo "# Deploy $(date)" > .deploy-timestamp
git add .deploy-timestamp
git commit -m "force: Trigger fresh deploy"
git push origin main

# Luego en Dokploy: Click en "Redeploy" con "Clean Build" activado
```

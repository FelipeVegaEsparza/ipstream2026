#!/bin/bash

# Script de verificación de despliegue
# Ejecutar en el VPS para verificar que todo está correcto

echo "==================================="
echo "Verificación de Despliegue IPStream"
echo "==================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
    fi
}

# 1. Verificar commit actual
echo "1. Verificando commit del repositorio..."
CURRENT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null)
EXPECTED_COMMIT="994ac06"

if [ "$CURRENT_COMMIT" = "$EXPECTED_COMMIT" ]; then
    echo -e "${GREEN}✓${NC} Commit correcto: $CURRENT_COMMIT"
else
    echo -e "${RED}✗${NC} Commit incorrecto: $CURRENT_COMMIT (esperado: $EXPECTED_COMMIT)"
    echo -e "${YELLOW}⚠${NC}  Dokploy está usando un commit antiguo"
fi
echo ""

# 2. Verificar archivos críticos
echo "2. Verificando archivos críticos..."
FILES=(
    "lib/auth.ts"
    "lib/prisma.ts"
    "components/admin/SystemInfo.tsx"
    "components/admin/BillingOverview.tsx"
    "components/dashboard/PodcastCard.tsx"
    "components/dashboard/VideocastCard.tsx"
    "app/api/health/route.ts"
    "docker-compose.prod.yml"
    "Dockerfile.prod"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (FALTA)"
    fi
done
echo ""

# 3. Verificar contenedores Docker
echo "3. Verificando contenedores Docker..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep ipstream
check "Contenedores corriendo"
echo ""

# 4. Verificar health check
echo "4. Verificando health check..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} Health check OK (HTTP $HEALTH_RESPONSE)"
else
    echo -e "${RED}✗${NC} Health check FAIL (HTTP $HEALTH_RESPONSE)"
fi
echo ""

# 5. Verificar logs recientes
echo "5. Últimas líneas de logs de la aplicación..."
docker logs --tail 10 ipstream_app 2>&1 | tail -5
echo ""

# 6. Verificar base de datos
echo "6. Verificando conexión a base de datos..."
docker exec ipstream_app npx prisma db pull --force > /dev/null 2>&1
check "Conexión a base de datos"
echo ""

# 7. Verificar directorios
echo "7. Verificando directorios necesarios..."
DIRS=(
    "public/audio"
    "docker/liquidsoap/scripts/clients"
    "public/uploads"
)

for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir"
    else
        echo -e "${YELLOW}⚠${NC}  $dir (no existe, se creará automáticamente)"
    fi
done
echo ""

# Resumen
echo "==================================="
echo "Verificación completada"
echo "==================================="
echo ""
echo "Si hay errores, revisa:"
echo "1. Logs: docker logs ipstream_app"
echo "2. Variables de entorno: docker exec ipstream_app env | grep DATABASE"
echo "3. Commit: git log --oneline -1"
echo ""

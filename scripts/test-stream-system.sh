#!/bin/bash

# Script de prueba para el sistema de streaming
# Verifica que todos los componentes estén funcionando correctamente

echo "🧪 Iniciando pruebas del sistema de streaming..."
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        return 1
    fi
}

# 1. Verificar Docker
echo "1️⃣  Verificando Docker..."
docker --version > /dev/null 2>&1
check "Docker instalado"

docker-compose --version > /dev/null 2>&1
check "Docker Compose instalado"

# 2. Verificar contenedores
echo ""
echo "2️⃣  Verificando contenedores..."

docker ps | grep ipstream_mysql_dev > /dev/null 2>&1
check "MySQL corriendo"

docker ps | grep ipstream_icecast_dev > /dev/null 2>&1
check "Icecast corriendo"

docker ps | grep ipstream_liquidsoap_dev > /dev/null 2>&1
check "Liquidsoap corriendo"

docker ps | grep ipstream_redis_dev > /dev/null 2>&1
check "Redis corriendo"

# 3. Verificar puertos
echo ""
echo "3️⃣  Verificando puertos..."

curl -s http://localhost:3306 > /dev/null 2>&1
if [ $? -eq 52 ]; then
    echo -e "${GREEN}✓${NC} Puerto 3306 (MySQL) accesible"
else
    echo -e "${RED}✗${NC} Puerto 3306 (MySQL) no accesible"
fi

curl -s http://localhost:8000 > /dev/null 2>&1
check "Puerto 8000 (Icecast) accesible"

curl -s http://localhost:6379 > /dev/null 2>&1
if [ $? -eq 52 ]; then
    echo -e "${GREEN}✓${NC} Puerto 6379 (Redis) accesible"
else
    echo -e "${RED}✗${NC} Puerto 6379 (Redis) no accesible"
fi

# 4. Verificar Icecast
echo ""
echo "4️⃣  Verificando Icecast..."

ICECAST_STATUS=$(curl -s http://localhost:8000/status-json.xsl)
if [ ! -z "$ICECAST_STATUS" ]; then
    echo -e "${GREEN}✓${NC} Icecast respondiendo"
    
    # Verificar stream de prueba
    echo "$ICECAST_STATUS" | grep -q "/test"
    check "Stream de prueba /test activo"
else
    echo -e "${RED}✗${NC} Icecast no responde"
fi

# 5. Verificar estructura de directorios
echo ""
echo "5️⃣  Verificando estructura de directorios..."

[ -d "docker/liquidsoap/scripts" ]
check "Directorio docker/liquidsoap/scripts existe"

[ -d "docker/liquidsoap/scripts/clients" ]
check "Directorio docker/liquidsoap/scripts/clients existe"

[ -f "docker/liquidsoap/scripts/main.liq" ]
check "Script main.liq existe"

[ -d "public/audio" ]
check "Directorio public/audio existe"

# 6. Verificar archivos de servicio
echo ""
echo "6️⃣  Verificando archivos de servicio..."

[ -f "lib/services/liquidsoap.ts" ]
check "Servicio liquidsoap.ts existe"

[ -f "lib/services/scriptManager.ts" ]
check "Servicio scriptManager.ts existe"

[ -f "lib/services/audioProcessing.ts" ]
check "Servicio audioProcessing.ts existe"

# 7. Verificar APIs
echo ""
echo "7️⃣  Verificando APIs..."

[ -f "app/api/stream/start/route.ts" ]
check "API /api/stream/start existe"

[ -f "app/api/stream/stop/route.ts" ]
check "API /api/stream/stop existe"

[ -f "app/api/stream/status/route.ts" ]
check "API /api/stream/status existe"

# 8. Verificar logs de Liquidsoap
echo ""
echo "8️⃣  Verificando logs de Liquidsoap..."

LIQUIDSOAP_LOGS=$(docker logs ipstream_liquidsoap_dev 2>&1 | tail -20)

echo "$LIQUIDSOAP_LOGS" | grep -q "IPStream Liquidsoap iniciando"
check "Liquidsoap iniciado correctamente"

echo "$LIQUIDSOAP_LOGS" | grep -q "Liquidsoap configurado y listo"
check "Liquidsoap configurado"

# 9. Verificar scripts de clientes
echo ""
echo "9️⃣  Verificando scripts de clientes..."

CLIENT_SCRIPTS=$(ls -1 docker/liquidsoap/scripts/clients/*.liq 2>/dev/null | wc -l)
echo -e "${YELLOW}ℹ${NC}  Scripts de clientes activos: $CLIENT_SCRIPTS"

if [ $CLIENT_SCRIPTS -gt 0 ]; then
    echo ""
    echo "Scripts encontrados:"
    ls -lh docker/liquidsoap/scripts/clients/*.liq
fi

# 10. Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumen de Pruebas"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Para probar el sistema completo:"
echo "1. Accede al panel: http://localhost:3000"
echo "2. Inicia sesión como cliente"
echo "3. Ve a Streaming → Playlists"
echo "4. Crea una playlist principal con canciones"
echo "5. Ve a Streaming → Control"
echo "6. Haz clic en 'Iniciar Stream'"
echo "7. Espera 15-20 segundos"
echo "8. Verifica en: http://localhost:8000"
echo ""
echo "Para ver logs en tiempo real:"
echo "  docker logs -f ipstream_liquidsoap_dev"
echo ""
echo "Para reiniciar servicios:"
echo "  docker-compose -f docker-compose.dev.yml restart"
echo ""

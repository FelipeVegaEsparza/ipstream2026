# Script de prueba para el sistema de streaming (Windows)
# Verifica que todos los componentes esten funcionando correctamente

Write-Host "Iniciando pruebas del sistema de streaming..." -ForegroundColor Cyan
Write-Host ""

# Funcion para verificar
function Check {
    param (
        [string]$Message,
        [bool]$Success
    )
    
    if ($Success) {
        Write-Host "OK $Message" -ForegroundColor Green
        return $true
    } else {
        Write-Host "ERROR $Message" -ForegroundColor Red
        return $false
    }
}

# 1. Verificar Docker
Write-Host "1. Verificando Docker..." -ForegroundColor Yellow

try {
    $dockerVersion = docker --version 2>$null
    Check "Docker instalado" ($null -ne $dockerVersion)
} catch {
    Check "Docker instalado" $false
}

try {
    $composeVersion = docker-compose --version 2>$null
    Check "Docker Compose instalado" ($null -ne $composeVersion)
} catch {
    Check "Docker Compose instalado" $false
}

# 2. Verificar contenedores
Write-Host ""
Write-Host "2. Verificando contenedores..." -ForegroundColor Yellow

$containers = docker ps 2>$null

Check "MySQL corriendo" ($containers -match "ipstream_mysql_dev")
Check "Icecast corriendo" ($containers -match "ipstream_icecast_dev")
Check "Liquidsoap corriendo" ($containers -match "ipstream_liquidsoap_dev")
Check "Redis corriendo" ($containers -match "ipstream_redis_dev")

# 3. Verificar puertos
Write-Host ""
Write-Host "3. Verificando puertos..." -ForegroundColor Yellow

try {
    $icecastResponse = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 2 -UseBasicParsing 2>$null
    Check "Puerto 8000 (Icecast) accesible" ($null -ne $icecastResponse)
} catch {
    Check "Puerto 8000 (Icecast) accesible" $false
}

# 4. Verificar Icecast
Write-Host ""
Write-Host "4. Verificando Icecast..." -ForegroundColor Yellow

try {
    $icecastStatus = Invoke-WebRequest -Uri "http://localhost:8000/status-json.xsl" -UseBasicParsing 2>$null
    Check "Icecast respondiendo" ($null -ne $icecastStatus)
    
    if ($icecastStatus.Content -match "/test") {
        Check "Stream de prueba /test activo" $true
    } else {
        Check "Stream de prueba /test activo" $false
    }
} catch {
    Check "Icecast respondiendo" $false
}

# 5. Verificar estructura de directorios
Write-Host ""
Write-Host "5. Verificando estructura de directorios..." -ForegroundColor Yellow

Check "Directorio docker/liquidsoap/scripts existe" (Test-Path "docker/liquidsoap/scripts")
Check "Directorio docker/liquidsoap/scripts/clients existe" (Test-Path "docker/liquidsoap/scripts/clients")
Check "Script main.liq existe" (Test-Path "docker/liquidsoap/scripts/main.liq")
Check "Directorio public/audio existe" (Test-Path "public/audio")

# 6. Verificar archivos de servicio
Write-Host ""
Write-Host "6. Verificando archivos de servicio..." -ForegroundColor Yellow

Check "Servicio liquidsoap.ts existe" (Test-Path "lib/services/liquidsoap.ts")
Check "Servicio scriptManager.ts existe" (Test-Path "lib/services/scriptManager.ts")
Check "Servicio audioProcessing.ts existe" (Test-Path "lib/services/audioProcessing.ts")

# 7. Verificar APIs
Write-Host ""
Write-Host "7. Verificando APIs..." -ForegroundColor Yellow

Check "API /api/stream/start existe" (Test-Path "app/api/stream/start/route.ts")
Check "API /api/stream/stop existe" (Test-Path "app/api/stream/stop/route.ts")
Check "API /api/stream/status existe" (Test-Path "app/api/stream/status/route.ts")

# 8. Verificar logs de Liquidsoap
Write-Host ""
Write-Host "8. Verificando logs de Liquidsoap..." -ForegroundColor Yellow

try {
    $liquidsoapLogs = docker logs ipstream_liquidsoap_dev 2>&1 | Select-Object -Last 20
    
    Check "Liquidsoap iniciado correctamente" ($liquidsoapLogs -match "IPStream Liquidsoap iniciando")
    Check "Liquidsoap configurado" ($liquidsoapLogs -match "Liquidsoap configurado y listo")
} catch {
    Check "Liquidsoap logs accesibles" $false
}

# 9. Verificar scripts de clientes
Write-Host ""
Write-Host "9. Verificando scripts de clientes..." -ForegroundColor Yellow

$clientScripts = Get-ChildItem -Path "docker/liquidsoap/scripts/clients/*.liq" -ErrorAction SilentlyContinue
$scriptCount = if ($clientScripts) { $clientScripts.Count } else { 0 }

Write-Host "INFO Scripts de clientes activos: $scriptCount" -ForegroundColor Cyan

if ($scriptCount -gt 0) {
    Write-Host ""
    Write-Host "Scripts encontrados:" -ForegroundColor Cyan
    $clientScripts | ForEach-Object {
        $sizeKB = [math]::Round($_.Length/1KB, 2)
        Write-Host "  - $($_.Name) ($sizeKB KB)" -ForegroundColor Gray
    }
}

# 10. Resumen
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resumen de Pruebas" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para probar el sistema completo:" -ForegroundColor White
Write-Host "1. Accede al panel: http://localhost:3000" -ForegroundColor Gray
Write-Host "2. Inicia sesion como cliente" -ForegroundColor Gray
Write-Host "3. Ve a Streaming -> Playlists" -ForegroundColor Gray
Write-Host "4. Crea una playlist principal con canciones" -ForegroundColor Gray
Write-Host "5. Ve a Streaming -> Control" -ForegroundColor Gray
Write-Host "6. Haz clic en Iniciar Stream" -ForegroundColor Gray
Write-Host "7. Espera 15-20 segundos" -ForegroundColor Gray
Write-Host "8. Verifica en: http://localhost:8000" -ForegroundColor Gray
Write-Host ""
Write-Host "Para ver logs en tiempo real:" -ForegroundColor White
Write-Host "  docker logs -f ipstream_liquidsoap_dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Para reiniciar servicios:" -ForegroundColor White
Write-Host "  docker-compose -f docker-compose.dev.yml restart" -ForegroundColor Gray
Write-Host ""

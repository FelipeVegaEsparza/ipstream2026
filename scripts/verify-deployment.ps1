# Script de verificación de despliegue para Windows
# Ejecutar localmente para verificar el estado del repositorio

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Verificación de Despliegue IPStream" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar commit actual
Write-Host "1. Verificando commit del repositorio..." -ForegroundColor Yellow
$currentCommit = git rev-parse --short HEAD
$expectedCommit = "994ac06"

if ($currentCommit -eq $expectedCommit) {
    Write-Host "✓ Commit correcto: $currentCommit" -ForegroundColor Green
} else {
    Write-Host "✗ Commit incorrecto: $currentCommit (esperado: $expectedCommit)" -ForegroundColor Red
}
Write-Host ""

# 2. Verificar archivos críticos
Write-Host "2. Verificando archivos críticos..." -ForegroundColor Yellow
$files = @(
    "lib/auth.ts",
    "lib/prisma.ts",
    "components/admin/SystemInfo.tsx",
    "components/admin/BillingOverview.tsx",
    "components/dashboard/PodcastCard.tsx",
    "components/dashboard/VideocastCard.tsx",
    "app/api/health/route.ts",
    "docker-compose.prod.yml",
    "Dockerfile.prod"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file (FALTA)" -ForegroundColor Red
    }
}
Write-Host ""

# 3. Verificar estado de Git
Write-Host "3. Verificando estado de Git..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ([string]::IsNullOrEmpty($gitStatus)) {
    Write-Host "✓ Working tree limpio" -ForegroundColor Green
} else {
    Write-Host "⚠ Hay cambios sin commitear:" -ForegroundColor Yellow
    git status --short
}
Write-Host ""

# 4. Verificar rama actual
Write-Host "4. Verificando rama..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
if ($currentBranch -eq "main") {
    Write-Host "✓ En rama main" -ForegroundColor Green
} else {
    Write-Host "⚠ En rama: $currentBranch (debería ser main)" -ForegroundColor Yellow
}
Write-Host ""

# 5. Verificar sincronización con remoto
Write-Host "5. Verificando sincronización con GitHub..." -ForegroundColor Yellow
git fetch origin main 2>&1 | Out-Null
$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse origin/main

if ($localCommit -eq $remoteCommit) {
    Write-Host "✓ Sincronizado con origin/main" -ForegroundColor Green
} else {
    Write-Host "⚠ Desincronizado con origin/main" -ForegroundColor Yellow
    Write-Host "  Local:  $localCommit" -ForegroundColor Gray
    Write-Host "  Remote: $remoteCommit" -ForegroundColor Gray
}
Write-Host ""

# 6. Verificar últimos commits
Write-Host "6. Últimos 5 commits:" -ForegroundColor Yellow
git log --oneline -5
Write-Host ""

# Resumen
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Verificación completada" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siguiente paso:" -ForegroundColor Yellow
Write-Host "1. Ve a Dokploy" -ForegroundColor White
Write-Host "2. Busca la opción 'Clean Build' o 'Rebuild'" -ForegroundColor White
Write-Host "3. Activa 'Clean Build'" -ForegroundColor White
Write-Host "4. Click en 'Redeploy'" -ForegroundColor White
Write-Host ""
Write-Host "Si Dokploy no tiene 'Clean Build':" -ForegroundColor Yellow
Write-Host "1. Elimina la aplicación en Dokploy" -ForegroundColor White
Write-Host "2. Créala de nuevo desde cero" -ForegroundColor White
Write-Host "3. Asegúrate de que clone el commit: $expectedCommit" -ForegroundColor White
Write-Host ""

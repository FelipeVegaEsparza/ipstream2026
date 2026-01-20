# Script para deshabilitar temporalmente todas las páginas de admin

$pages = @(
    "app/admin/users/[id]/page.tsx",
    "app/admin/users/[id]/edit/page.tsx",
    "app/admin/users/new/page.tsx",
    "app/admin/stream-servers/page.tsx",
    "app/admin/stats/page.tsx",
    "app/admin/settings/page.tsx",
    "app/admin/logs/page.tsx",
    "app/admin/impersonate/page.tsx"
)

$template = @'
'use client'

// TEMPORALMENTE DESHABILITADO - Se habilitará después del primer deploy exitoso
export default function TemporaryDisabledPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-4">⚠️ Página Temporalmente Deshabilitada</h1>
        <div className="card p-6">
          <p className="text-secondary">
            Esta sección estará disponible después del primer despliegue exitoso.
          </p>
        </div>
      </div>
    </div>
  )
}
'@

foreach ($page in $pages) {
    if (Test-Path $page) {
        Write-Host "Deshabilitando: $page" -ForegroundColor Yellow
        Set-Content -Path $page -Value $template
        Write-Host "✓ Deshabilitado: $page" -ForegroundColor Green
    } else {
        Write-Host "⚠ No encontrado: $page" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Proceso completado" -ForegroundColor Cyan
Write-Host "Páginas deshabilitadas: $($pages.Count)" -ForegroundColor Cyan

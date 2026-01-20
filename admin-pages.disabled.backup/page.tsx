'use client'

// TEMPORALMENTE SIMPLIFICADO - Se restaurará después del primer deploy exitoso
export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          🔧 Dashboard Administrativo
        </h1>
        <p className="text-gray-400">
          Panel de administración temporalmente simplificado para el primer despliegue
        </p>
      </div>

      <div className="card p-8 text-center">
        <p className="text-gray-300 mb-4">
          Esta sección se habilitará completamente después del primer despliegue exitoso.
        </p>
        <p className="text-sm text-gray-500">
          Por ahora, todas las funcionalidades de admin están deshabilitadas temporalmente.
        </p>
      </div>
    </div>
  )
}
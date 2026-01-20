import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// TEMPORALMENTE DESHABILITADO - Los componentes se agregarán después del primer deploy
export default async function AboutPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return <div>Error: Acceso no autorizado</div>
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-4">Acerca de</h1>
        <div className="card p-6">
          <p className="text-secondary">
            Información del sistema disponible próximamente.
          </p>
        </div>
      </div>
    </div>
  )
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { StreamServersManager } from '@/components/admin/StreamServersManager'

export default async function StreamServersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Obtener todos los servidores
  const servers = await prisma.streamServer.findMany({
    include: {
      _count: {
        select: { streamConfigs: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Obtener clientes sin servidor asignado
  const clientsWithoutServer = await prisma.client.findMany({
    where: {
      streamConfig: null
    },
    select: {
      id: true,
      name: true,
      user: {
        select: {
          email: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Servidores de Streaming</h1>
        <p className="text-gray-400">Gestiona los servidores VPS para streaming</p>
      </div>

      <StreamServersManager 
        servers={servers} 
        clientsWithoutServer={clientsWithoutServer}
      />
    </div>
  )
}

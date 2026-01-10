import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEffectiveClient } from '@/lib/getEffectiveClient'
import { StreamControl } from '@/components/dashboard/streaming/StreamControl'
import { redirect } from 'next/navigation'

export default async function StreamingPage() {
  const session = await getServerSession(authOptions)
  const effectiveClient = await getEffectiveClient()
  
  if (!session?.user || !effectiveClient) {
    redirect('/auth/login')
  }

  // Obtener configuración de streaming
  const streamConfig = await prisma.streamConfig.findUnique({
    where: { clientId: effectiveClient.clientId },
    include: {
      server: true,
      client: {
        select: {
          name: true,
        },
      },
    },
  })

  // Si no tiene configuración, mostrar mensaje
  if (!streamConfig) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Control de Streaming</h1>
          <p className="text-gray-400">Gestiona tu radio en línea</p>
        </div>

        <div className="card text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Configuración de Streaming Pendiente
            </h3>
            <p className="text-gray-400 mb-6">
              Contacta al administrador para activar tu servicio de streaming
            </p>
            <div className="glass-effect rounded-lg p-4 text-left">
              <p className="text-sm text-gray-300 mb-2">
                <strong>¿Qué incluye el servicio de streaming?</strong>
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• AutoDJ con playlists personalizadas</li>
                <li>• Transmisión en vivo desde software externo</li>
                <li>• Múltiples calidades de audio</li>
                <li>• Estadísticas en tiempo real</li>
                <li>• Programación horaria automática</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Obtener playlist principal
  const mainPlaylist = await prisma.playlist.findFirst({
    where: {
      clientId: effectiveClient.clientId,
      isMain: true,
    },
    include: {
      items: {
        include: {
          audioFile: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  // Obtener última estadística
  const latestStat = await prisma.streamStats.findFirst({
    where: { clientId: effectiveClient.clientId },
    orderBy: { timestamp: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Control de Streaming</h1>
        <p className="text-gray-400">Gestiona tu radio en línea</p>
      </div>

      <StreamControl
        config={streamConfig}
        mainPlaylist={mainPlaylist}
        latestStat={latestStat}
      />
    </div>
  )
}

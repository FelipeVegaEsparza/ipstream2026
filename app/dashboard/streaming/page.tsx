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
    // Verificar si el usuario es admin
    const isAdmin = session.user.role === 'ADMIN'
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Control de Streaming</h1>
          <p className="text-gray-400">Gestiona tu radio en línea</p>
        </div>

        <div className="card text-center py-12">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Configuración de Streaming Pendiente
            </h3>
            
            {isAdmin ? (
              <div className="space-y-4">
                <p className="text-gray-400 mb-6">
                  Para activar el servicio de streaming, necesitas asignar un servidor a este cliente
                </p>
                
                <div className="glass-effect rounded-lg p-6 text-left max-w-md mx-auto">
                  <p className="text-sm font-semibold text-cyan-400 mb-3">
                    Pasos para activar el streaming:
                  </p>
                  <ol className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                      <span>Ve a <strong>Servidores de Streaming</strong> en el menú de administración</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                      <span>Crea un servidor VPS si aún no tienes ninguno</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
                      <span>Asigna el servidor a este cliente usando el botón <strong>"Asignar Cliente"</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
                      <span>Recarga esta página y el streaming estará listo</span>
                    </li>
                  </ol>
                </div>

                <a
                  href="/admin/stream-servers"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-cyan-500/50"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  Ir a Servidores de Streaming
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400 mb-6">
                  Tu servicio de streaming aún no ha sido activado. Contacta al administrador para comenzar.
                </p>
                
                <div className="glass-effect rounded-lg p-6 text-left max-w-md mx-auto">
                  <p className="text-sm font-semibold text-cyan-400 mb-3">
                    ¿Qué incluye el servicio de streaming?
                  </p>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>AutoDJ con playlists personalizadas</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Transmisión en vivo desde software externo</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Múltiples calidades de audio (64, 128, 320 kbps)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Estadísticas en tiempo real de oyentes</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Programación horaria automática</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Jingles y efectos de sonido</span>
                    </li>
                  </ul>
                </div>

                <div className="glass-effect rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-xs text-gray-400">
                    <strong className="text-gray-300">Nota:</strong> El administrador debe asignar un servidor de streaming a tu cuenta para que puedas comenzar a usar estas funciones.
                  </p>
                </div>
              </div>
            )}
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

  // Obtener estado inicial del stream desde Icecast
  let initialStatus = {
    currentSong: null,
    listeners: 0,
    peakListeners: 0,
    streamStatus: 'offline',
  }

  if (streamConfig.status === 'active') {
    try {
      const icecastHost = streamConfig.server.host === 'icecast' ? 'localhost' : streamConfig.server.host
      const icecastUrl = `http://${icecastHost}:${streamConfig.server.port}/status-json.xsl`
      
      const response = await fetch(icecastUrl, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      })

      if (response.ok) {
        const data = await response.json()
        
        const sources = Array.isArray(data.icestats.source) 
          ? data.icestats.source 
          : [data.icestats.source]
        
        const clientSource = sources.find((source: any) => 
          source && source.listenurl && source.listenurl.includes(streamConfig.mountpoint)
        )

        if (clientSource) {
          initialStatus = {
            currentSong: clientSource.title || clientSource.server_name || 'Sin información',
            listeners: clientSource.listeners || 0,
            peakListeners: clientSource.listener_peak || 0,
            streamStatus: 'online',
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Icecast status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Control de Streaming</h1>
        <p className="text-gray-400">Gestiona tu radio en línea</p>
      </div>

      <StreamControl
        config={streamConfig}
        mainPlaylist={mainPlaylist}
        initialStatus={initialStatus}
      />
    </div>
  )
}

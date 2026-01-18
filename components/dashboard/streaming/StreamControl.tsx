'use client'

import { useState, useEffect } from 'react'
import { PlayIcon, PauseIcon, ForwardIcon, Cog6ToothIcon, SignalIcon, MusicalNoteIcon } from '@heroicons/react/24/solid'

interface StreamControlProps {
  config: any
  mainPlaylist: any
  initialStatus: any
}

export function StreamControl({ config, mainPlaylist, initialStatus }: StreamControlProps) {
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [streamStatus, setStreamStatus] = useState(initialStatus)

  const isActive = config.status === 'active'
  
  // Actualizar streamStatus cuando cambia initialStatus
  useEffect(() => {
    setStreamStatus(initialStatus)
  }, [initialStatus])
  
  // Auto-refresh del estado cada 5 segundos cuando el stream está activo
  useEffect(() => {
    if (!isActive) return

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/stream/status', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setStreamStatus({
            currentSong: data.currentSong,
            listeners: data.listeners,
            peakListeners: data.peakListeners,
            streamStatus: data.streamStatus,
          })
        }
      } catch (error) {
        console.error('Error fetching stream status:', error)
      }
    }

    // Fetch inmediato al montar
    fetchStatus()

    // Luego cada 5 segundos
    const interval = setInterval(fetchStatus, 5000)

    return () => clearInterval(interval)
  }, [isActive])
  
  // Generar URL correcta del stream
  const getStreamUrl = () => {
    let host = config.server.host
    
    if (host === 'icecast' || host === 'liquidsoap') {
      host = 'localhost'
    }
    
    if (typeof window !== 'undefined' && (host === 'localhost' || host === '127.0.0.1')) {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        host = window.location.hostname
      }
    }
    
    return `http://${host}:${config.server.port}${config.mountpoint}`
  }
  
  const streamUrl = getStreamUrl()

  const handleStart = async () => {
    setIsStarting(true)
    try {
      const res = await fetch('/api/stream/start', { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al iniciar stream')
      }
    } catch (error) {
      alert('Error al iniciar stream')
    } finally {
      setIsStarting(false)
    }
  }

  const handleStop = async () => {
    setIsStopping(true)
    try {
      const res = await fetch('/api/stream/stop', { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al detener stream')
      }
    } catch (error) {
      alert('Error al detener stream')
    } finally {
      setIsStopping(false)
    }
  }

  const handleSkip = async () => {
    setIsSkipping(true)
    try {
      const res = await fetch('/api/stream/skip', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Error al saltar canción')
      }
    } catch (error) {
      alert('Error al saltar canción')
    } finally {
      setIsSkipping(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Estado del Stream */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <SignalIcon className="w-6 h-6 text-cyan-400 mr-2" />
            Estado del Stream
          </h2>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            isActive 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {isActive ? '🔴 En Vivo' : '⚫ Detenido'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-effect rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Oyentes Actuales</p>
            <p className="text-3xl font-bold text-white">{streamStatus?.listeners || 0}</p>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Pico del Día</p>
            <p className="text-3xl font-bold text-white">{streamStatus?.peakListeners || 0}</p>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Estado</p>
            <p className="text-lg font-semibold text-white">{streamStatus?.streamStatus || 'offline'}</p>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap gap-3">
          {!isActive ? (
            <button
              onClick={handleStart}
              disabled={isStarting || !mainPlaylist}
              className="btn-primary flex items-center space-x-2"
            >
              <PlayIcon className="w-5 h-5" />
              <span>{isStarting ? 'Iniciando...' : 'Iniciar Stream'}</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleStop}
                disabled={isStopping}
                className="btn-danger flex items-center space-x-2"
              >
                <PauseIcon className="w-5 h-5" />
                <span>{isStopping ? 'Deteniendo...' : 'Detener Stream'}</span>
              </button>
              <button
                onClick={handleSkip}
                disabled={isSkipping}
                className="btn-secondary flex items-center space-x-2"
              >
                <ForwardIcon className="w-5 h-5" />
                <span>{isSkipping ? 'Saltando...' : 'Saltar Canción'}</span>
              </button>
            </>
          )}
          <a
            href="/dashboard/streaming/config"
            className="btn-secondary flex items-center space-x-2"
          >
            <Cog6ToothIcon className="w-5 h-5" />
            <span>Configuración</span>
          </a>
        </div>

        {!mainPlaylist && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-400">
              ⚠️ No tienes una playlist principal configurada. 
              <a href="/dashboard/streaming/playlists" className="underline ml-1">
                Crear playlist
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Reproduciendo Ahora */}
      {isActive && streamStatus?.currentSong && (
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <MusicalNoteIcon className="w-6 h-6 text-cyan-400 mr-2" />
            Reproduciendo Ahora
          </h2>
          <div className="glass-effect rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-white mb-1">{streamStatus.currentSong}</p>
                <p className="text-sm text-gray-400">
                  🎵 En vivo • {streamStatus.listeners} oyente{streamStatus.listeners !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información del Stream */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Información del Stream</h2>
        <div className="space-y-3">
          <div className="p-3 glass-effect rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">URL del Stream</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(streamUrl)
                  alert('URL copiada al portapapeles')
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded hover:bg-cyan-500/10"
              >
                Copiar
              </button>
            </div>
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyan-400 hover:text-cyan-300 bg-gray-800/50 px-3 py-2 rounded block break-all"
            >
              {streamUrl}
            </a>
            <p className="text-xs text-gray-500 mt-2">
              Usa esta URL en VLC, Winamp o cualquier reproductor de streaming
            </p>
          </div>
          <div className="flex justify-between items-center p-3 glass-effect rounded-lg">
            <span className="text-sm text-gray-300">Servidor</span>
            <span className="text-sm text-white">{config.server.name}</span>
          </div>
          <div className="flex justify-between items-center p-3 glass-effect rounded-lg">
            <span className="text-sm text-gray-300">Calidades</span>
            <span className="text-sm text-white">
              {JSON.parse(config.bitrates).join(', ')} kbps
            </span>
          </div>
          <div className="flex justify-between items-center p-3 glass-effect rounded-lg">
            <span className="text-sm text-gray-300">AutoDJ</span>
            <span className={`text-sm ${config.autodjEnabled ? 'text-green-400' : 'text-gray-400'}`}>
              {config.autodjEnabled ? 'Habilitado' : 'Deshabilitado'}
            </span>
          </div>
        </div>
      </div>

      {/* Playlist Principal */}
      {mainPlaylist && (
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Playlist Principal</h2>
          <div className="glass-effect rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-semibold text-white">{mainPlaylist.name}</p>
                <p className="text-sm text-gray-400">
                  {mainPlaylist.items.length} canciones
                </p>
              </div>
              <a
                href="/dashboard/streaming/playlists"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                Ver todas →
              </a>
            </div>
            {mainPlaylist.items.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mainPlaylist.items.slice(0, 5).map((item: any, index: number) => (
                  <div key={item.id} className="flex items-center space-x-3 p-2 hover:bg-gray-700/30 rounded">
                    <span className="text-sm text-gray-500 w-6">{index + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm text-white">{item.audioFile.title || item.audioFile.filename}</p>
                      <p className="text-xs text-gray-400">{item.audioFile.artist || 'Desconocido'}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.floor(item.audioFile.duration / 60)}:{String(Math.floor(item.audioFile.duration % 60)).padStart(2, '0')}
                    </span>
                  </div>
                ))}
                {mainPlaylist.items.length > 5 && (
                  <p className="text-sm text-gray-400 text-center pt-2">
                    +{mainPlaylist.items.length - 5} canciones más
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

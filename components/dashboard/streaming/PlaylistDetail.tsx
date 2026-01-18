'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  MusicalNoteIcon,
  ArrowLeftIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface PlaylistDetailProps {
  playlist: any
  availableAudioFiles: any[]
  totalDuration: number
}

export function PlaylistDetail({ playlist, availableAudioFiles, totalDuration }: PlaylistDetailProps) {
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [isAdding, setIsAdding] = useState(false)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const handleAddSongs = async () => {
    if (selectedFiles.length === 0) return

    setIsAdding(true)
    try {
      const response = await fetch(`/api/playlists/${playlist.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioFileIds: selectedFiles }),
      })

      if (response.ok) {
        setShowAddModal(false)
        setSelectedFiles([])
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al agregar canciones')
      }
    } catch (error) {
      alert('Error al agregar canciones')
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveSong = async (itemId: string) => {
    if (!confirm('¿Eliminar esta canción de la playlist?')) return

    try {
      const response = await fetch(`/api/playlists/${playlist.id}/items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar canción')
      }
    } catch (error) {
      alert('Error al eliminar canción')
    }
  }

  const handleMoveUp = async (itemId: string, currentOrder: number) => {
    if (currentOrder === 0) return

    try {
      const response = await fetch(`/api/playlists/${playlist.id}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          newOrder: currentOrder - 1,
        }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al reordenar')
      }
    } catch (error) {
      alert('Error al reordenar')
    }
  }

  const handleMoveDown = async (itemId: string, currentOrder: number) => {
    if (currentOrder === playlist.items.length - 1) return

    try {
      const response = await fetch(`/api/playlists/${playlist.id}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          newOrder: currentOrder + 1,
        }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al reordenar')
      }
    } catch (error) {
      alert('Error al reordenar')
    }
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con info de la playlist */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/streaming/playlists')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-2xl font-bold text-white">{playlist.name}</h2>
                {playlist.isMain && (
                  <StarIconSolid className="w-6 h-6 text-yellow-400" title="Playlist Principal" />
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                playlist.type === 'rotation' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : playlist.type === 'jingles'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                {playlist.type === 'rotation' ? 'Rotación' : playlist.type === 'jingles' ? 'Jingles' : 'Especial'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="glass-effect rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Canciones</p>
            <p className="text-2xl font-bold text-white">{playlist.items.length}</p>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Duración Total</p>
            <p className="text-2xl font-bold text-white">{formatDuration(totalDuration)}</p>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Disponibles</p>
            <p className="text-2xl font-bold text-white">{availableAudioFiles.length}</p>
          </div>
        </div>
      </div>

      {/* Botón agregar canciones */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          disabled={availableAudioFiles.length === 0}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Agregar Canciones</span>
        </button>
      </div>

      {/* Lista de canciones */}
      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">Canciones en la Playlist</h3>

        {playlist.items.length === 0 ? (
          <div className="text-center py-12">
            <MusicalNoteIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No hay canciones en esta playlist</p>
            <p className="text-sm text-gray-500 mb-6">
              Agrega canciones desde tu biblioteca de audio
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={availableAudioFiles.length === 0}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Agregar Canciones</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {playlist.items.map((item: any, index: number) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 p-4 glass-effect rounded-lg hover:bg-gray-700/30 transition-colors"
              >
                {/* Número */}
                <span className="text-gray-500 font-medium w-8 text-center">
                  {index + 1}
                </span>

                {/* Info de la canción */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {item.audioFile.title || item.audioFile.filename}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {item.audioFile.artist || 'Artista desconocido'}
                  </p>
                </div>

                {/* Duración */}
                <span className="text-sm text-gray-400">
                  {formatDuration(item.audioFile.duration)}
                </span>

                {/* Controles */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMoveUp(item.id, index)}
                    disabled={index === 0}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Subir"
                  >
                    <ArrowUpIcon className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(item.id, index)}
                    disabled={index === playlist.items.length - 1}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Bajar"
                  >
                    <ArrowDownIcon className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleRemoveSong(item.id)}
                    className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Agregar Canciones */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6">Agregar Canciones</h2>

            {availableAudioFiles.length === 0 ? (
              <div className="text-center py-12">
                <MusicalNoteIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No hay canciones disponibles</p>
                <p className="text-sm text-gray-500">
                  Todas tus canciones ya están en esta playlist o no tienes archivos de audio
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-300">
                    Seleccionadas: <span className="font-semibold text-white">{selectedFiles.length}</span> de {availableAudioFiles.length}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 mb-6">
                  {availableAudioFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => toggleFileSelection(file.id)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedFiles.includes(file.id)
                          ? 'bg-cyan-500/20 border-2 border-cyan-500'
                          : 'bg-gray-700/30 border-2 border-transparent hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => {}}
                          className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {file.title || file.filename}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            {file.artist || 'Artista desconocido'}
                          </p>
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatDuration(file.duration)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSelectedFiles([])
                }}
                className="flex-1 btn-secondary"
                disabled={isAdding}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSongs}
                disabled={selectedFiles.length === 0 || isAdding}
                className="flex-1 btn-primary"
              >
                {isAdding ? 'Agregando...' : `Agregar ${selectedFiles.length} canción${selectedFiles.length !== 1 ? 'es' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

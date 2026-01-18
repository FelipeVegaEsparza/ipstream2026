'use client'

import { useState } from 'react'
import { PlusIcon, MusicalNoteIcon, StarIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface PlaylistsManagerProps {
  playlists: any[]
}

export function PlaylistsManager({ playlists: initialPlaylists }: PlaylistsManagerProps) {
  const [playlists, setPlaylists] = useState(initialPlaylists)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    type: 'rotation',
    description: '',
    isMain: false,
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlaylist),
      })

      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al crear playlist')
      }
    } catch (error) {
      alert('Error al crear playlist')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta playlist?')) return

    try {
      const res = await fetch(`/api/playlists/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPlaylists(playlists.filter(p => p.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || 'Error al eliminar playlist')
      }
    } catch (error) {
      alert('Error al eliminar playlist')
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/playlists/${id}/duplicate`, { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al duplicar playlist')
      }
    } catch (error) {
      alert('Error al duplicar playlist')
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Botón Crear */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nueva Playlist</span>
        </button>
      </div>

      {/* Lista de Playlists */}
      {playlists.length === 0 ? (
        <div className="card text-center py-12">
          <MusicalNoteIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No hay playlists</p>
          <p className="text-sm text-gray-500 mb-6">
            Crea tu primera playlist para organizar tu música
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Crear Playlist</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="card hover:border-cyan-500/50 transition-colors cursor-pointer group">
              <div onClick={() => window.location.href = `/dashboard/streaming/playlists/${playlist.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {playlist.name}
                      </h3>
                      {playlist.isMain && (
                        <StarIconSolid className="w-5 h-5 text-yellow-400" title="Playlist Principal" />
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

                {playlist.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {playlist.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>{playlist.songCount} canciones</span>
                  <span>{formatDuration(playlist.totalDuration)}</span>
                </div>

                {playlist.items.length > 0 && (
                  <div className="space-y-1 mb-4">
                    {playlist.items.slice(0, 3).map((item: any, index: number) => (
                      <div key={item.id} className="text-xs text-gray-500 truncate">
                        {index + 1}. {item.audioFile.title || item.audioFile.filename}
                      </div>
                    ))}
                    {playlist.items.length > 3 && (
                      <div className="text-xs text-gray-600">
                        +{playlist.items.length - 3} más
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-700" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleDuplicate(playlist.id)}
                  className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1"
                  title="Duplicar"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  <span>Duplicar</span>
                </button>
                <button
                  onClick={() => handleDelete(playlist.id)}
                  className="flex-1 btn-danger text-sm py-2 flex items-center justify-center space-x-1"
                  title="Eliminar"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Nueva Playlist</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                  required
                  placeholder="Mi Playlist"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Tipo
                </label>
                <select
                  value={newPlaylist.type}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, type: e.target.value })}
                  className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                >
                  <option value="rotation">Rotación</option>
                  <option value="special">Especial</option>
                  <option value="jingles">Jingles</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                  rows={3}
                  placeholder="Descripción opcional"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isMain"
                  checked={newPlaylist.isMain}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, isMain: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <label htmlFor="isMain" className="text-sm font-medium text-gray-100">
                  Marcar como playlist principal
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={isCreating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

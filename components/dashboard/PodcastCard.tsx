'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Podcast {
  id: string
  title: string
  description: string
  imageUrl?: string
  audioUrl?: string
  videoUrl?: string
  fileType: 'audio' | 'video'
  duration?: string
  episodeNumber?: number
  season?: string
  createdAt: string
  updatedAt: string
}

interface PodcastCardProps {
  podcast: Podcast
  onEdit: (podcast: Podcast) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
}

export function PodcastCard({ podcast, onEdit, onDelete, isDeleting = false }: PodcastCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    onDelete(podcast.id)
    setShowDeleteConfirm(false)
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: es
    })
  }

  const getFileIcon = () => {
    return podcast.fileType === 'audio' ? '🎵' : '🎥'
  }

  const getFileTypeLabel = () => {
    return podcast.fileType === 'audio' ? 'Podcast' : 'Videocast'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Header con imagen */}
      <div className="relative h-48 bg-gradient-to-br from-purple-500 to-blue-600">
        {podcast.imageUrl ? (
          <Image
            src={podcast.imageUrl}
            alt={podcast.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl opacity-80">
              {getFileIcon()}
            </div>
          </div>
        )}
        
        {/* Overlay con información */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
            {getFileTypeLabel()}
          </span>
          {podcast.episodeNumber && (
            <span className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
              Ep. {podcast.episodeNumber}
            </span>
          )}
        </div>

        {/* Duración */}
        {podcast.duration && (
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            {podcast.duration}
          </div>
        )}

        {/* Botones de acción */}
        <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onEdit(podcast)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors shadow-lg"
            title="Editar episodio"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors shadow-lg"
            title="Eliminar episodio"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {podcast.title}
            </h3>
            
            {podcast.season && (
              <p className="text-sm text-blue-600 font-medium mb-2">
                {podcast.season}
              </p>
            )}
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {podcast.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Publicado {formatDate(podcast.createdAt)}
          </span>
          
          {/* Indicador de archivo */}
          <div className="flex items-center space-x-1">
            <span>{getFileIcon()}</span>
            <span className="capitalize">{podcast.fileType}</span>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Eliminar episodio?
              </h3>
              <p className="text-gray-600 mb-6">
                Esta acción no se puede deshacer. El episodio "{podcast.title}" será eliminado permanentemente.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Estilos CSS para line-clamp
const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
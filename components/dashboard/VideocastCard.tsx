interface Videocast {
  id: string
  title: string
  description: string
  imageUrl?: string
  videoUrl?: string
  duration?: string
  episodeNumber?: number
  season?: string
  createdAt: string
  updatedAt: string
}

interface VideocastCardProps {
  videocast: Videocast
  onEdit: (videocast: Videocast) => void
  onDelete: (id: string) => void
  isDeleting: boolean
}

export function VideocastCard({ videocast, onEdit, onDelete, isDeleting }: VideocastCardProps) {
  return (
    <div className="card hover:shadow-xl transition-all duration-200">
      {videocast.imageUrl && (
        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
          <img
            src={videocast.imageUrl}
            alt={videocast.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary line-clamp-2">
              {videocast.title}
            </h3>
            {videocast.episodeNumber && (
              <p className="text-sm text-secondary">
                Episodio {videocast.episodeNumber}
                {videocast.season && ` - Temporada ${videocast.season}`}
              </p>
            )}
          </div>
        </div>

        {videocast.description && (
          <p className="text-secondary text-sm line-clamp-3">
            {videocast.description}
          </p>
        )}

        {videocast.duration && (
          <div className="flex items-center text-sm text-secondary">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {videocast.duration}
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => onEdit(videocast)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(videocast.id)}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

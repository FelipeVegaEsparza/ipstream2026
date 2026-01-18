interface Podcast {
  id: string
  title: string
  description: string
  imageUrl?: string
  audioUrl?: string
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
  isDeleting: boolean
}

export function PodcastCard({ podcast, onEdit, onDelete, isDeleting }: PodcastCardProps) {
  return (
    <div className="card hover:shadow-xl transition-all duration-200">
      {podcast.imageUrl && (
        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
          <img
            src={podcast.imageUrl}
            alt={podcast.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary line-clamp-2">
              {podcast.title}
            </h3>
            {podcast.episodeNumber && (
              <p className="text-sm text-secondary">
                Episodio {podcast.episodeNumber}
                {podcast.season && ` - Temporada ${podcast.season}`}
              </p>
            )}
          </div>
        </div>

        {podcast.description && (
          <p className="text-secondary text-sm line-clamp-3">
            {podcast.description}
          </p>
        )}

        {podcast.duration && (
          <div className="flex items-center text-sm text-secondary">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {podcast.duration}
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => onEdit(podcast)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(podcast.id)}
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

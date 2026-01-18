'use client'

import { useState, useEffect } from 'react'
import { type VideocastInput } from '@/lib/validations'

interface Videocast {
  id: string
  title: string
  description: string
  imageUrl?: string
  videoUrl?: string
  duration?: string
  episodeNumber?: number
  season?: string
}

interface VideocastFormProps {
  videocast?: Videocast | null
  onSubmit: (data: VideocastInput) => void
  onCancel: () => void
  isLoading: boolean
}

export function VideocastForm({ videocast, onSubmit, onCancel, isLoading }: VideocastFormProps) {
  const [formData, setFormData] = useState<VideocastInput>({
    title: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    duration: '',
    episodeNumber: undefined,
    season: '',
  })

  useEffect(() => {
    if (videocast) {
      setFormData({
        title: videocast.title,
        description: videocast.description,
        imageUrl: videocast.imageUrl || '',
        videoUrl: videocast.videoUrl || '',
        duration: videocast.duration || '',
        episodeNumber: videocast.episodeNumber,
        season: videocast.season || '',
      })
    }
  }, [videocast])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Título *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Descripción *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input min-h-[100px]"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Número de Episodio
          </label>
          <input
            type="number"
            value={formData.episodeNumber || ''}
            onChange={(e) => setFormData({ ...formData, episodeNumber: e.target.value ? parseInt(e.target.value) : undefined })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Temporada
          </label>
          <input
            type="text"
            value={formData.season}
            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          URL de Imagen
        </label>
        <input
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          URL de Video
        </label>
        <input
          type="url"
          value={formData.videoUrl}
          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Duración
        </label>
        <input
          type="text"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          className="input"
          placeholder="ej: 45:30"
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : videocast ? 'Actualizar' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

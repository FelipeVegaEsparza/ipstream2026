'use client'

import { useState, useEffect } from 'react'
import { type PodcastInput } from '@/lib/validations'

interface Podcast {
  id: string
  title: string
  description: string
  imageUrl?: string
  audioUrl?: string
  duration?: string
  episodeNumber?: number
  season?: string
}

interface PodcastFormProps {
  podcast?: Podcast | null
  onSubmit: (data: PodcastInput) => void
  onCancel: () => void
  isLoading: boolean
}

export function PodcastForm({ podcast, onSubmit, onCancel, isLoading }: PodcastFormProps) {
  const [formData, setFormData] = useState<PodcastInput>({
    title: '',
    description: '',
    imageUrl: '',
    audioUrl: '',
    duration: '',
    episodeNumber: undefined,
    season: '',
  })

  useEffect(() => {
    if (podcast) {
      setFormData({
        title: podcast.title,
        description: podcast.description,
        imageUrl: podcast.imageUrl || '',
        audioUrl: podcast.audioUrl || '',
        duration: podcast.duration || '',
        episodeNumber: podcast.episodeNumber,
        season: podcast.season || '',
      })
    }
  }, [podcast])

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
          URL de Audio
        </label>
        <input
          type="url"
          value={formData.audioUrl}
          onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
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
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : podcast ? 'Actualizar' : 'Crear'}
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

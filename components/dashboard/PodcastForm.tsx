'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { podcastSchema, type PodcastInput } from '@/lib/validations'
import { ImageUpload } from '@/components/ui/ImageUpload'

interface PodcastFormProps {
  podcast?: any
  onSubmit: (data: PodcastInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function PodcastForm({ podcast, onSubmit, onCancel, isLoading = false }: PodcastFormProps) {
  const [imageUrl, setImageUrl] = useState(podcast?.imageUrl || '')
  const [audioUrl, setAudioUrl] = useState(podcast?.audioUrl || '')
  const [videoUrl, setVideoUrl] = useState(podcast?.videoUrl || '')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<PodcastInput>({
    resolver: zodResolver(podcastSchema),
    defaultValues: {
      title: podcast?.title || '',
      description: podcast?.description || '',
      imageUrl: podcast?.imageUrl || '',
      audioUrl: podcast?.audioUrl || '',
      videoUrl: podcast?.videoUrl || '',
      fileType: podcast?.fileType || 'audio',
      duration: podcast?.duration || '',
      episodeNumber: podcast?.episodeNumber || undefined,
      season: podcast?.season || '',
    }
  })

  const fileType = watch('fileType')

  const handleFormSubmit = async (data: PodcastInput) => {
    const formData = {
      ...data,
      imageUrl,
      audioUrl: fileType === 'audio' ? audioUrl : '',
      videoUrl: fileType === 'video' ? videoUrl : '',
    }
    await onSubmit(formData)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Título */}
        <div>
          <label className="form-label">
            Título del Episodio *
          </label>
          <input
            {...register('title')}
            type="text"
            className="form-input"
            placeholder="Ej: Episodio 1 - Introducción al Podcast"
          />
          {errors.title && (
            <p className="form-error">{errors.title.message}</p>
          )}
        </div>

        {/* Tipo de Archivo */}
        <div>
          <label className="form-label">
            Tipo de Contenido *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                {...register('fileType')}
                type="radio"
                value="audio"
                className="mr-2"
              />
              <span>🎵 Audio (Podcast)</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('fileType')}
                type="radio"
                value="video"
                className="mr-2"
              />
              <span>🎥 Video (Videocast)</span>
            </label>
          </div>
          {errors.fileType && (
            <p className="form-error">{errors.fileType.message}</p>
          )}
        </div>

        {/* Número de Episodio y Temporada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              Número de Episodio
            </label>
            <input
              {...register('episodeNumber', { 
                setValueAs: (value) => value === '' ? undefined : parseInt(value) 
              })}
              type="number"
              min="1"
              className="form-input"
              placeholder="1"
            />
            {errors.episodeNumber && (
              <p className="form-error">{errors.episodeNumber.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">
              Temporada
            </label>
            <input
              {...register('season')}
              type="text"
              className="form-input"
              placeholder="Temporada 1"
            />
            {errors.season && (
              <p className="form-error">{errors.season.message}</p>
            )}
          </div>
        </div>

        {/* Duración */}
        <div>
          <label className="form-label">
            Duración
          </label>
          <input
            {...register('duration')}
            type="text"
            className="form-input"
            placeholder="45:30 (minutos:segundos)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Formato: MM:SS o HH:MM:SS (ej: 45:30 o 1:15:45)
          </p>
          {errors.duration && (
            <p className="form-error">{errors.duration.message}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="form-label">
            Descripción del Episodio *
          </label>
          <textarea
            {...register('description')}
            rows={6}
            className="form-input resize-vertical"
            placeholder="Describe de qué trata este episodio, los temas que se abordan, invitados especiales, etc."
          />
          <p className="text-sm text-gray-500 mt-1">
            Esta descripción aparecerá como resumen en las listas de episodios
          </p>
          {errors.description && (
            <p className="form-error">{errors.description.message}</p>
          )}
        </div>

        {/* Imagen del Episodio */}
        <ImageUpload
          value={imageUrl}
          onChange={setImageUrl}
          onRemove={() => setImageUrl('')}
          label="Imagen del Episodio"
          description="Portada del episodio (recomendado: 1400x1400px - formato cuadrado)"
        />

        {/* Archivo de Audio */}
        {fileType === 'audio' && (
          <div>
            <label className="form-label">
              Archivo de Audio *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <div className="space-y-2">
                <div className="text-4xl">🎵</div>
                <p className="text-sm text-gray-600">
                  Sube tu archivo de audio (MP3, WAV, M4A)
                </p>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  id="audio-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      // Aquí implementarías la subida del archivo
                      console.log('Audio file selected:', file.name)
                      // Por ahora, simularemos una URL
                      setAudioUrl(`/uploads/audio/${file.name}`)
                    }
                  }}
                />
                <label
                  htmlFor="audio-upload"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Seleccionar Archivo de Audio
                </label>
                {audioUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">✅ Archivo cargado</p>
                    <audio controls className="mt-2 w-full max-w-md mx-auto">
                      <source src={audioUrl} type="audio/mpeg" />
                      Tu navegador no soporta el elemento de audio.
                    </audio>
                  </div>
                )}
              </div>
            </div>
            {errors.audioUrl && (
              <p className="form-error">{errors.audioUrl.message}</p>
            )}
          </div>
        )}

        {/* Archivo de Video */}
        {fileType === 'video' && (
          <div>
            <label className="form-label">
              Archivo de Video *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <div className="space-y-2">
                <div className="text-4xl">🎥</div>
                <p className="text-sm text-gray-600">
                  Sube tu archivo de video (MP4, MOV, AVI)
                </p>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  id="video-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      // Aquí implementarías la subida del archivo
                      console.log('Video file selected:', file.name)
                      // Por ahora, simularemos una URL
                      setVideoUrl(`/uploads/video/${file.name}`)
                    }
                  }}
                />
                <label
                  htmlFor="video-upload"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Seleccionar Archivo de Video
                </label>
                {videoUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">✅ Archivo cargado</p>
                    <video controls className="mt-2 w-full max-w-md mx-auto rounded-lg">
                      <source src={videoUrl} type="video/mp4" />
                      Tu navegador no soporta el elemento de video.
                    </video>
                  </div>
                )}
              </div>
            </div>
            {errors.videoUrl && (
              <p className="form-error">{errors.videoUrl.message}</p>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : podcast ? 'Actualizar Episodio' : 'Crear Episodio'}
          </button>
        </div>
      </form>
    </div>
  )
}
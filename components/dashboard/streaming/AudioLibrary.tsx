'use client'

import { useState } from 'react'
import { CloudArrowUpIcon, MusicalNoteIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'

interface AudioLibraryProps {
  audioFiles: any[]
  totalUsed: number
  maxStorage: number
}

export function AudioLibrary({ audioFiles: initialFiles, totalUsed, maxStorage }: AudioLibraryProps) {
  const [audioFiles, setAudioFiles] = useState(initialFiles)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const percentage = (totalUsed / maxStorage) * 100
  const usedGB = (totalUsed / (1024 * 1024 * 1024)).toFixed(2)
  const maxGB = (maxStorage / (1024 * 1024 * 1024)).toFixed(0)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      
      if (files.length === 1) {
        formData.append('file', files[0])
        const res = await fetch('/api/audio/upload', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          window.location.reload()
        } else {
          const data = await res.json()
          alert(data.error || 'Error al subir archivo')
        }
      } else {
        // Subida múltiple
        Array.from(files).forEach(file => {
          formData.append('files', file)
        })

        const res = await fetch('/api/audio/upload/batch', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          window.location.reload()
        } else {
          const data = await res.json()
          alert(data.error || 'Error al subir archivos')
        }
      }
    } catch (error) {
      alert('Error al subir archivos')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return

    try {
      const res = await fetch(`/api/audio/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAudioFiles(audioFiles.filter(f => f.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || 'Error al eliminar archivo')
      }
    } catch (error) {
      alert('Error al eliminar archivo')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Espacio de Almacenamiento */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Almacenamiento</h2>
          <span className="text-sm text-gray-400">
            {usedGB} GB / {maxGB} GB
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {percentage.toFixed(1)}% utilizado
        </p>
      </div>

      {/* Subir Archivos */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Subir Archivos</h2>
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors">
          <input
            type="file"
            id="audio-upload"
            multiple
            accept="audio/mpeg,audio/mp3,audio/aac,audio/ogg"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <label
            htmlFor="audio-upload"
            className="cursor-pointer block"
          >
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">
              {isUploading ? 'Subiendo archivos...' : 'Haz clic para subir archivos'}
            </p>
            <p className="text-sm text-gray-400">
              MP3, AAC, OGG (máx. 50MB por archivo)
            </p>
            {isUploading && (
              <div className="mt-4 w-full max-w-xs mx-auto bg-gray-700 rounded-full h-2">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Lista de Archivos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            Archivos ({audioFiles.length})
          </h2>
        </div>

        {audioFiles.length === 0 ? (
          <div className="text-center py-12">
            <MusicalNoteIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay archivos de audio</p>
            <p className="text-sm text-gray-500 mt-2">
              Sube tu primer archivo para comenzar
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Título</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Artista</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Duración</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Tamaño</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {audioFiles.map((file) => (
                  <tr key={file.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MusicalNoteIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {file.title || file.filename}
                          </p>
                          <p className="text-xs text-gray-400">{file.filename}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {file.artist || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {file.duration > 0 ? formatDuration(file.duration) : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {formatFileSize(file.fileSize)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        file.status === 'ready' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : file.status === 'processing'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {file.status === 'ready' ? 'Listo' : file.status === 'processing' ? 'Procesando' : 'Error'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.location.href = `/dashboard/streaming/audio/${file.id}`}
                          className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

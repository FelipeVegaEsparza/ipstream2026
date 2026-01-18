'use client'

import { useState } from 'react'
import { ClockIcon, PlusIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'

interface TimeAnnouncement {
  id: string
  filename: string
  duration: number
  description: string | null
  hourValue: number | null
  enabled: boolean
  status: string
  createdAt: string
}

interface AnnouncementConfig {
  enabled: boolean
  playEveryXSongs: number
}

interface TimeAnnouncementsManagerProps {
  announcements: TimeAnnouncement[]
  config: AnnouncementConfig | null
}

export function TimeAnnouncementsManager({ announcements: initialAnnouncements, config: initialConfig }: TimeAnnouncementsManagerProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [config, setConfig] = useState<AnnouncementConfig>(initialConfig || { enabled: false, playEveryXSongs: 5 })
  const [isUploading, setIsUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    hourValue: '',
  })
  const [tempConfig, setTempConfig] = useState(config)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', selectedFile)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('hourValue', formData.hourValue)

      const res = await fetch('/api/time-announcements/upload', {
        method: 'POST',
        body: formDataToSend,
      })

      if (res.ok) {
        const newAnnouncement = await res.json()
        setAnnouncements([...announcements, newAnnouncement])
        setShowModal(false)
        setSelectedFile(null)
        setFormData({
          description: '',
          hourValue: '',
        })
        alert('Locución subida exitosamente')
      } else {
        const error = await res.json()
        alert(error.error || 'Error al subir locución')
      }
    } catch (error) {
      alert('Error al subir locución')
    } finally {
      setIsUploading(false)
    }
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/time-announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      })

      if (res.ok) {
        setAnnouncements(announcements.map(a => 
          a.id === id ? { ...a, enabled: !enabled } : a
        ))
      }
    } catch (error) {
      alert('Error al actualizar locución')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta locución?')) return

    try {
      const res = await fetch(`/api/time-announcements/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setAnnouncements(announcements.filter(a => a.id !== id))
        alert('Locución eliminada')
      }
    } catch (error) {
      alert('Error al eliminar locución')
    }
  }

  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/time-announcements/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempConfig),
      })

      if (res.ok) {
        const updated = await res.json()
        setConfig(updated)
        setShowConfig(false)
        alert('Configuración guardada')
      }
    } catch (error) {
      alert('Error al guardar configuración')
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuración */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Configuración de Locuciones</h3>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="btn-secondary text-sm"
          >
            {showConfig ? 'Ocultar' : 'Configurar'}
          </button>
        </div>

        {showConfig ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enabled"
                checked={tempConfig.enabled}
                onChange={(e) => setTempConfig({ ...tempConfig, enabled: e.target.checked })}
                className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
              />
              <label htmlFor="enabled" className="text-white">
                Activar locuciones automáticas
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-white">Reproducir cada:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={tempConfig.playEveryXSongs}
                onChange={(e) => setTempConfig({ ...tempConfig, playEveryXSongs: parseInt(e.target.value) || 5 })}
                className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <span className="text-gray-400">canciones</span>
            </div>

            <button
              onClick={handleSaveConfig}
              className="btn-primary"
            >
              Guardar Configuración
            </button>
          </div>
        ) : (
          <div className="text-gray-400">
            {config.enabled ? (
              <p>✓ Locuciones activadas - Se reproducen cada {config.playEveryXSongs} canciones</p>
            ) : (
              <p>✗ Locuciones desactivadas</p>
            )}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <ClockIcon className="w-7 h-7 text-cyan-400 mr-2" />
            Locuciones de Hora
          </h2>
          <p className="text-gray-400 mt-1">
            Sube archivos de audio que indiquen la hora actual (ej: "Son las 10 de la mañana")
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nueva Locución</span>
        </button>
      </div>

      {/* Lista de locuciones */}
      <div className="grid grid-cols-1 gap-4">
        {announcements.length === 0 ? (
          <div className="card text-center py-12">
            <ClockIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No hay locuciones configuradas
            </h3>
            <p className="text-gray-400 mb-4">
              Agrega locuciones de hora para que se reproduzcan automáticamente entre tus canciones
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Agregar Primera Locución</span>
            </button>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    announcement.enabled 
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600' 
                      : 'bg-gray-700'
                  }`}>
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-white">
                        {announcement.description || announcement.filename}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        announcement.enabled
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {announcement.enabled ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      {announcement.hourValue !== null && (
                        <span className="text-sm text-cyan-400">
                          {String(announcement.hourValue).padStart(2, '0')}:00 hrs
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {Math.floor(announcement.duration)}s
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggle(announcement.id, announcement.enabled)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      announcement.enabled
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-cyan-500 text-white hover:bg-cyan-600'
                    }`}
                  >
                    {announcement.enabled ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de subida */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Nueva Locución de Hora</h3>
            
            <div className="space-y-4">
              {/* Selector de archivo */}
              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Archivo de Audio
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-cyan-500 transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-300">
                      {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un archivo'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP3, WAV, OGG (máx. 10MB)
                    </p>
                  </label>
                </div>
              </div>

              {/* Hora que representa */}
              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Hora que representa (opcional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={formData.hourValue}
                  onChange={(e) => setFormData({ ...formData, hourValue: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2"
                  placeholder="Ej: 10 (para las 10:00)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si especificas una hora, la locución se reproducirá preferentemente a esa hora
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2"
                  placeholder="Ej: Son las 10 de la mañana"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedFile(null)
                }}
                className="btn-secondary"
                disabled={isUploading}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="btn-primary"
              >
                {isUploading ? 'Subiendo...' : 'Subir Locución'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

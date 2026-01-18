'use client'

import { useState } from 'react'
import { PlusIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline'

interface ScheduleManagerProps {
  schedules: any[]
  playlists: any[]
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function ScheduleManager({ schedules: initialSchedules, playlists }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState(initialSchedules)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    playlistId: '',
    dayOfWeek: 1,
    startTime: '00:00',
    endTime: '23:59',
    isActive: true,
  })

  // Agrupar schedules por día
  const schedulesByDay = DAYS.map((day, index) => ({
    day,
    dayIndex: index,
    schedules: schedules.filter(s => s.dayOfWeek === index),
  }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      })

      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al crear programación')
      }
    } catch (error) {
      alert('Error al crear programación')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta programación?')) return

    try {
      const res = await fetch(`/api/schedule/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSchedules(schedules.filter(s => s.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || 'Error al eliminar programación')
      }
    } catch (error) {
      alert('Error al eliminar programación')
    }
  }

  const handleCopyDay = async (fromDay: number) => {
    const toDays = prompt(
      `Copiar programación de ${DAYS[fromDay]} a qué días? (separados por coma, ej: 1,2,3)\n0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado`
    )
    
    if (!toDays) return

    const days = toDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d) && d >= 0 && d <= 6)
    
    if (days.length === 0) {
      alert('Días inválidos')
      return
    }

    try {
      const res = await fetch('/api/schedule/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDay, toDays: days }),
      })

      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al copiar programación')
      }
    } catch (error) {
      alert('Error al copiar programación')
    }
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
          <span>Nueva Programación</span>
        </button>
      </div>

      {/* Calendario Semanal */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <CalendarIcon className="w-6 h-6 text-cyan-400 mr-2" />
          Programación Semanal
        </h2>

        <div className="space-y-4">
          {schedulesByDay.map(({ day, dayIndex, schedules: daySchedules }) => (
            <div key={dayIndex} className="glass-effect rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{day}</h3>
                <div className="flex items-center space-x-2">
                  {daySchedules.length > 0 && (
                    <button
                      onClick={() => handleCopyDay(dayIndex)}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Copiar a otros días
                    </button>
                  )}
                  <span className="text-sm text-gray-400">
                    {daySchedules.length} programación(es)
                  </span>
                </div>
              </div>

              {daySchedules.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500">Sin programación</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Se usará la playlist principal
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-white">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            schedule.playlist.type === 'rotation'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : schedule.playlist.type === 'jingles'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {schedule.playlist.name}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Información */}
      <div className="card bg-blue-500/10 border-blue-500/30">
        <h3 className="text-sm font-semibold text-blue-400 mb-2">💡 Información</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Las programaciones se aplican automáticamente según el día y hora</li>
          <li>• Si no hay programación, se usa la playlist principal</li>
          <li>• No puede haber solapamiento de horarios en el mismo día</li>
          <li>• Puedes copiar la programación de un día a otros días</li>
        </ul>
      </div>

      {/* Modal Crear Programación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Nueva Programación</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Playlist *
                </label>
                <select
                  value={newSchedule.playlistId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, playlistId: e.target.value })}
                  className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                  required
                >
                  <option value="">Selecciona una playlist</option>
                  {playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name} ({playlist.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Día de la Semana *
                </label>
                <select
                  value={newSchedule.dayOfWeek}
                  onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                >
                  {DAYS.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-100 mb-2">
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-100 mb-2">
                    Hora Fin *
                  </label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newSchedule.isActive}
                  onChange={(e) => setNewSchedule({ ...newSchedule, isActive: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-100">
                  Activar programación
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

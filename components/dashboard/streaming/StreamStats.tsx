'use client'

import { SignalIcon, UsersIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline'

interface StreamStatsProps {
  latestStat: any
  peakToday: number
  last24hStats: any[]
}

export function StreamStats({ latestStat, peakToday, last24hStats }: StreamStatsProps) {
  const currentListeners = latestStat?.listeners || 0
  const avgListeners = last24hStats.length > 0
    ? Math.round(last24hStats.reduce((sum, s) => sum + s.listeners, 0) / last24hStats.length)
    : 0

  // Agrupar por hora para el gráfico
  const hourlyData = Array(24).fill(0).map(() => ({ listeners: 0, count: 0 }))
  
  last24hStats.forEach(stat => {
    const hour = new Date(stat.timestamp).getHours()
    hourlyData[hour].listeners += stat.listeners
    hourlyData[hour].count++
  })

  const chartData = hourlyData.map((data, hour) => ({
    hour,
    avg: data.count > 0 ? Math.round(data.listeners / data.count) : 0,
  }))

  const maxListeners = Math.max(...chartData.map(d => d.avg), 1)

  return (
    <div className="space-y-6">
      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Oyentes Actuales</p>
            <UsersIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-white">{currentListeners}</p>
          <p className="text-xs text-gray-500 mt-1">
            {latestStat ? new Date(latestStat.timestamp).toLocaleTimeString() : 'Sin datos'}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Pico del Día</p>
            <ChartBarIcon className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">{peakToday}</p>
          <p className="text-xs text-gray-500 mt-1">Máximo hoy</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Promedio 24h</p>
            <SignalIcon className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{avgListeners}</p>
          <p className="text-xs text-gray-500 mt-1">Últimas 24 horas</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Estado</p>
            <ClockIcon className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-lg font-semibold text-white">
            {latestStat?.streamStatus || 'offline'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {latestStat?.uptime ? `${Math.floor(latestStat.uptime / 3600)}h uptime` : 'Sin datos'}
          </p>
        </div>
      </div>

      {/* Gráfico de Últimas 24 Horas */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6">Oyentes - Últimas 24 Horas</h2>
        
        {last24hStats.length === 0 ? (
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay datos disponibles</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end space-x-1 h-64">
              {chartData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end justify-center h-full">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t hover:from-cyan-400 hover:to-blue-400 transition-all cursor-pointer relative group"
                      style={{ height: `${(data.avg / maxListeners) * 100}%`, minHeight: data.avg > 0 ? '4px' : '0' }}
                      title={`${data.hour}:00 - ${data.avg} oyentes`}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {data.hour}:00 - {data.avg} oyentes
                      </div>
                    </div>
                  </div>
                  {index % 3 === 0 && (
                    <span className="text-xs text-gray-500 mt-2">{data.hour}h</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Distribución por Calidad */}
      {latestStat && (latestStat.listeners64 > 0 || latestStat.listeners128 > 0 || latestStat.listeners320 > 0) && (
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Distribución por Calidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-effect rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">64 kbps</p>
              <p className="text-2xl font-bold text-white">{latestStat.listeners64}</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(latestStat.listeners64 / currentListeners) * 100}%` }}
                />
              </div>
            </div>
            <div className="glass-effect rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">128 kbps</p>
              <p className="text-2xl font-bold text-white">{latestStat.listeners128}</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full"
                  style={{ width: `${(latestStat.listeners128 / currentListeners) * 100}%` }}
                />
              </div>
            </div>
            <div className="glass-effect rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">320 kbps</p>
              <p className="text-2xl font-bold text-white">{latestStat.listeners320}</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(latestStat.listeners320 / currentListeners) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canción Actual */}
      {latestStat?.currentSong && (
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Reproduciendo Ahora</h2>
          <div className="glass-effect rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-white">{latestStat.currentSong}</p>
                <p className="text-sm text-gray-400">
                  {new Date(latestStat.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

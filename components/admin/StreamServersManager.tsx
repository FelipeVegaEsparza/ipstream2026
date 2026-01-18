'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Server {
  id: string
  name: string
  host: string
  port: number
  capacity: number
  currentLoad: number
  status: string
  region: string | null
  _count: {
    streamConfigs: number
  }
}

interface Client {
  id: string
  name: string
  user: {
    email: string
  }
}

interface Props {
  servers: Server[]
  clientsWithoutServer: Client[]
}

export function StreamServersManager({ servers: initialServers, clientsWithoutServer }: Props) {
  const router = useRouter()
  const [servers, setServers] = useState(initialServers)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 8000,
    capacity: 30,
    region: '',
    status: 'online'
  })

  const [assignData, setAssignData] = useState({
    clientId: '',
    serverId: ''
  })

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/stream-servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear servidor')
      }

      setShowCreateModal(false)
      setFormData({
        name: '',
        host: '',
        port: 8000,
        capacity: 30,
        region: '',
        status: 'online'
      })
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignServer = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/clients/${assignData.clientId}/assign-server`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: assignData.serverId || undefined })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al asignar servidor')
      }

      setShowAssignModal(false)
      setAssignData({ clientId: '', serverId: '' })
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteServer = async (serverId: string) => {
    if (!confirm('¿Estás seguro de eliminar este servidor? Los clientes asignados perderán su configuración.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/stream-servers/${serverId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar servidor')
      }

      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400'
      case 'offline': return 'text-red-400'
      case 'maintenance': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getLoadPercentage = (server: Server) => {
    return Math.round((server.currentLoad / server.capacity) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Servidor
        </button>

        {clientsWithoutServer.length > 0 && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="btn-secondary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Asignar Cliente ({clientsWithoutServer.length})
          </button>
        )}
      </div>

      {/* Servers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => {
          const loadPercentage = getLoadPercentage(server)
          
          return (
            <div key={server.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{server.name}</h3>
                  <p className="text-sm text-gray-400">{server.host}:{server.port}</p>
                  {server.region && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded">
                      {server.region}
                    </span>
                  )}
                </div>
                <span className={`text-sm font-medium ${getStatusColor(server.status)}`}>
                  {server.status}
                </span>
              </div>

              {/* Load Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Carga</span>
                  <span className="text-white font-medium">
                    {server.currentLoad} / {server.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      loadPercentage >= 90 ? 'bg-red-500' :
                      loadPercentage >= 70 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${loadPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 glass-effect rounded-lg">
                <div>
                  <p className="text-xs text-gray-400">Clientes</p>
                  <p className="text-lg font-semibold text-white">{server._count.streamConfigs}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Disponibles</p>
                  <p className="text-lg font-semibold text-white">
                    {server.capacity - server.currentLoad}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => handleDeleteServer(server.id)}
                disabled={loading || server._count.streamConfigs > 0}
                className="w-full btn-danger text-sm"
                title={server._count.streamConfigs > 0 ? 'No se puede eliminar un servidor con clientes asignados' : ''}
              >
                Eliminar Servidor
              </button>
            </div>
          )
        })}

        {servers.length === 0 && (
          <div className="col-span-full card text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay servidores configurados
            </h3>
            <p className="text-gray-400 mb-6">
              Crea tu primer servidor de streaming para comenzar
            </p>
          </div>
        )}
      </div>

      {/* Create Server Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Crear Servidor</h2>
            
            <form onSubmit={handleCreateServer} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                  placeholder="VPS-Stream-1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Host (IP o Dominio)
                </label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                  placeholder="192.168.1.100 o stream.example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-100 mb-2">
                    Puerto
                  </label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                    min="1"
                    max="65535"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-100 mb-2">
                    Capacidad
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Región (opcional)
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                  placeholder="us-east, eu-west, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="maintenance">Mantenimiento</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Servidor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Client Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Asignar Cliente a Servidor</h2>
            
            <form onSubmit={handleAssignServer} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Cliente
                </label>
                <select
                  value={assignData.clientId}
                  onChange={(e) => setAssignData({ ...assignData, clientId: e.target.value })}
                  className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                  required
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientsWithoutServer.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Servidor (opcional)
                </label>
                <select
                  value={assignData.serverId}
                  onChange={(e) => setAssignData({ ...assignData, serverId: e.target.value })}
                  className="w-full rounded-xl bg-gray-700 border border-gray-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 px-4 py-3"
                >
                  <option value="">Asignación automática</option>
                  {servers
                    .filter(s => s.status === 'online' && s.currentLoad < s.capacity)
                    .map((server) => (
                      <option key={server.id} value={server.id}>
                        {server.name} ({server.currentLoad}/{server.capacity})
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-300 mt-2">
                  Si no seleccionas un servidor, se asignará automáticamente el que tenga menor carga
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Asignando...' : 'Asignar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, CreditCard, Calendar, Plus } from 'lucide-react'

interface Client {
  id: string
  name: string
  user: {
    name: string | null
    email: string
  }
  plan?: {
    id: string
    name: string
    price: number
    currency: string
    interval: string
  } | null
  subscription?: {
    id: string
    status: string
    endDate: Date
  } | null
}

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  isActive: boolean
}

interface ClientPlanAssignmentProps {
  clients: Client[]
  plans: Plan[]
}

export function ClientPlanAssignment({ clients, plans }: ClientPlanAssignmentProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const assignPlan = async (clientId: string, planId: string) => {
    setLoading(clientId)
    try {
      const response = await fetch('/api/admin/clients/assign-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, planId })
      })

      if (response.ok) {
        alert('Plan asignado exitosamente')
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.message || 'Error al asignar plan')
      }
    } catch (error) {
      alert('Error al asignar plan')
    } finally {
      setLoading(null)
    }
  }

  const formatPrice = (price: number, currency: string, interval: string) => {
    const formattedAmount = currency === 'CLP' 
      ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(price)
      : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
    
    return `${formattedAmount}/${interval === 'monthly' ? 'mes' : 'año'}`
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge className="bg-gray-600">Sin Plan</Badge>
    
    const statusConfig = {
      active: { color: 'bg-green-600', text: 'Activo' },
      expired: { color: 'bg-red-600', text: 'Vencido' },
      cancelled: { color: 'bg-gray-600', text: 'Cancelado' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active

    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="h-5 w-5" />
          Asignar Planes a Clientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clients.length > 0 ? (
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="p-4 rounded-lg bg-gray-700/50 border border-gray-600">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-semibold">{client.name}</h4>
                      {getStatusBadge(client.subscription?.status)}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-2">
                      {client.user.email}
                    </p>

                    {client.plan ? (
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-300">
                          Plan Actual: {client.plan.name} - {formatPrice(client.plan.price, client.plan.currency, client.plan.interval)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-orange-400">
                        <CreditCard className="h-4 w-4" />
                        <span>Sin plan asignado</span>
                      </div>
                    )}

                    {client.subscription && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Vence: {new Date(client.subscription.endDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {plans.filter(plan => plan.isActive).map((plan) => (
                      <Button
                        key={plan.id}
                        size="sm"
                        onClick={() => assignPlan(client.id, plan.id)}
                        disabled={loading === client.id || client.plan?.id === plan.id}
                        className={`${
                          client.plan?.id === plan.id 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {loading === client.id ? (
                          'Asignando...'
                        ) : client.plan?.id === plan.id ? (
                          '✓ Asignado'
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            {plan.name}
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No hay clientes registrados
            </h3>
            <p className="text-gray-400">
              Los clientes aparecerán aquí cuando se registren usuarios
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, CreditCard, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface Subscription {
  id: string
  status: string
  startDate: Date
  endDate: Date
  autoRenew: boolean
  cancelledAt: Date | null
  cancellationReason: string | null
  client: {
    id: string
    name: string
    user: {
      name: string | null
      email: string
    }
  }
  plan: {
    id: string
    name: string
    price: number
    currency: string
    interval: string
  }
  _count: {
    payments: number
  }
}

interface SubscriptionsTableProps {
  subscriptions: Subscription[]
}

export function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-600', text: 'Activa', icon: CheckCircle },
      expired: { color: 'bg-red-600', text: 'Vencida', icon: XCircle },
      cancelled: { color: 'bg-gray-600', text: 'Cancelada', icon: XCircle },
      pending: { color: 'bg-yellow-600', text: 'Pendiente', icon: AlertTriangle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpiringSoon = (endDate: Date) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta suscripción?')) return
    
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST'
      })
      
      if (response.ok) {
        window.location.reload()
      } else {
        alert('Error al cancelar la suscripción')
      }
    } catch (error) {
      alert('Error al cancelar la suscripción')
    }
  }

  const handleRenewSubscription = async (subscriptionId: string) => {
    if (!confirm('¿Estás seguro de que quieres renovar esta suscripción?')) return
    
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/renew`, {
        method: 'POST'
      })
      
      if (response.ok) {
        window.location.reload()
      } else {
        alert('Error al renovar la suscripción')
      }
    } catch (error) {
      alert('Error al renovar la suscripción')
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Suscripciones Activas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {subscriptions.length > 0 ? (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="p-4 rounded-lg bg-gray-700/50 border border-gray-600">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-white font-medium">
                          {subscription.client.name}
                        </span>
                      </div>
                      {getStatusBadge(subscription.status)}
                      {isExpiringSoon(subscription.endDate) && (
                        <Badge className="bg-orange-600 text-white">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Vence Pronto
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      {subscription.client.user.email}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        {subscription.plan.name} - ${subscription.plan.price}/{subscription.plan.interval === 'monthly' ? 'mes' : 'año'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                      </div>
                      <div className="text-gray-400">
                        {subscription._count.payments} pagos realizados
                      </div>
                    </div>

                    {subscription.autoRenew && subscription.status === 'active' && (
                      <div className="text-xs text-green-400">
                        ✓ Renovación automática activada
                      </div>
                    )}

                    {subscription.cancelledAt && (
                      <div className="text-xs text-red-400">
                        Cancelada el {formatDate(subscription.cancelledAt)}
                        {subscription.cancellationReason && (
                          <span className="block">Motivo: {subscription.cancellationReason}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {subscription.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelSubscription(subscription.id)}
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        Cancelar
                      </Button>
                    )}
                    
                    {(subscription.status === 'expired' || subscription.status === 'cancelled') && (
                      <Button
                        size="sm"
                        onClick={() => handleRenewSubscription(subscription.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Renovar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No hay suscripciones
            </h3>
            <p className="text-gray-400">
              Las suscripciones aparecerán aquí cuando los clientes se suscriban a un plan
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, User, Calendar, CreditCard, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  transactionId: string | null
  description: string | null
  paidAt: Date | null
  createdAt: Date
  client: {
    id: string
    name: string
    user: {
      name: string | null
      email: string
    }
  }
  subscription: {
    id: string
    plan: {
      name: string
    }
  } | null
}

interface PaymentsTableProps {
  payments: Payment[]
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-600', text: 'Completado', icon: CheckCircle },
      pending: { color: 'bg-yellow-600', text: 'Pendiente', icon: Clock },
      failed: { color: 'bg-red-600', text: 'Fallido', icon: XCircle },
      refunded: { color: 'bg-gray-600', text: 'Reembolsado', icon: RefreshCw }
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

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      credit_card: { text: 'Tarjeta de Crédito', color: 'bg-blue-600' },
      bank_transfer: { text: 'Transferencia', color: 'bg-purple-600' },
      paypal: { text: 'PayPal', color: 'bg-indigo-600' },
      other: { text: 'Otro', color: 'bg-gray-600' }
    }

    const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.other

    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'CLP') {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    } else if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    }
    return `${currency} ${amount.toLocaleString()}`
  }

  const handleRefund = async (paymentId: string) => {
    if (!confirm('¿Estás seguro de que quieres procesar este reembolso?')) return

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST'
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Error al procesar el reembolso')
      }
    } catch (error) {
      alert('Error al procesar el reembolso')
    }
  }

  const handleMarkAsPaid = async (paymentId: string) => {
    if (!confirm('¿Estás seguro de que quieres marcar este pago como completado?')) return

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/complete`, {
        method: 'POST'
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Error al marcar el pago como completado')
      }
    } catch (error) {
      alert('Error al marcar el pago como completado')
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Historial de Pagos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="p-4 rounded-lg bg-gray-700/50 border border-gray-600">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-xl font-bold text-white">
                        {formatAmount(payment.amount, payment.currency)}
                      </div>
                      {getStatusBadge(payment.status)}
                      {getPaymentMethodBadge(payment.paymentMethod)}
                    </div>

                    <div className="flex items-center gap-2 text-gray-300">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{payment.client.name}</span>
                      <span className="text-gray-400">({payment.client.user.email})</span>
                    </div>

                    {payment.subscription && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <CreditCard className="h-4 w-4" />
                        <span>Plan: {payment.subscription.plan.name}</span>
                      </div>
                    )}

                    {payment.description && (
                      <div className="text-sm text-gray-400">
                        {payment.description}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Creado: {formatDate(payment.createdAt)}
                      </div>
                      {payment.paidAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Pagado: {formatDate(payment.paidAt)}
                        </div>
                      )}
                      {payment.transactionId && (
                        <div className="text-xs">
                          ID: {payment.transactionId}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {payment.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(payment.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Marcar Pagado
                      </Button>
                    )}

                    {payment.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRefund(payment.id)}
                        className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
                      >
                        Reembolsar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No hay pagos registrados
            </h3>
            <p className="text-gray-400">
              Los pagos aparecerán aquí cuando los clientes realicen transacciones
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
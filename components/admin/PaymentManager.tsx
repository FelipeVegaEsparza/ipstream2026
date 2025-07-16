'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    DollarSign,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Clock,
    Plus,
    CreditCard,
    User,
    Search
} from 'lucide-react'

interface Subscription {
    id: string
    status: string
    startDate: Date
    endDate: Date
    autoRenew: boolean
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
    payments: Array<{
        id: string
        amount: number
        currency: string
        status: string
        paidAt: Date | null
        createdAt: Date
    }>
}

interface PaymentManagerProps {
    subscriptions: Subscription[]
}

export function PaymentManager({ subscriptions }: PaymentManagerProps) {
    const [filter, setFilter] = useState('all') // all, overdue, pending, paid
    const [searchTerm, setSearchTerm] = useState('')
    const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null)

    // Calcular estado de pagos
    const getPaymentStatus = (subscription: Subscription) => {
        const now = new Date()
        const endDate = new Date(subscription.endDate)
        const daysUntilDue = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Buscar último pago
        const lastPayment = subscription.payments
            .filter(p => p.status === 'completed')
            .sort((a, b) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime())[0]

        if (daysUntilDue < 0) {
            return { status: 'overdue', daysUntilDue, lastPayment, color: 'bg-red-600' }
        } else if (daysUntilDue <= 7) {
            return { status: 'due_soon', daysUntilDue, lastPayment, color: 'bg-orange-600' }
        } else if (subscription.payments.some(p => p.status === 'pending')) {
            return { status: 'pending', daysUntilDue, lastPayment, color: 'bg-blue-600' }
        } else {
            return { status: 'current', daysUntilDue, lastPayment, color: 'bg-green-600' }
        }
    }

    // Filtrar suscripciones
    const filteredSubscriptions = subscriptions.filter(subscription => {
        const paymentStatus = getPaymentStatus(subscription)
        const matchesFilter = filter === 'all' ||
            (filter === 'overdue' && paymentStatus.status === 'overdue') ||
            (filter === 'pending' && paymentStatus.status === 'pending') ||
            (filter === 'due_soon' && paymentStatus.status === 'due_soon') ||
            (filter === 'current' && paymentStatus.status === 'current')

        const matchesSearch = searchTerm === '' ||
            subscription.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subscription.client.user.email.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesFilter && matchesSearch
    })

    const formatCurrency = (amount: number, currency: string) => {
        if (currency === 'CLP') {
            return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount)
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    }

    const registerPayment = async (subscriptionId: string, amount: number, currency: string) => {
        try {
            const response = await fetch('/api/admin/payments/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriptionId,
                    amount,
                    currency,
                    paymentMethod: 'manual',
                    description: 'Pago registrado manualmente por administrador'
                })
            })

            if (response.ok) {
                alert('Pago registrado exitosamente')
                window.location.reload()
            } else {
                alert('Error al registrar pago')
            }
        } catch (error) {
            alert('Error al registrar pago')
        }
    }

    const extendSubscription = async (subscriptionId: string) => {
        if (!confirm('¿Extender la suscripción por un período adicional?')) return

        try {
            const response = await fetch('/api/admin/subscriptions/extend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionId })
            })

            if (response.ok) {
                alert('Suscripción extendida exitosamente')
                window.location.reload()
            } else {
                alert('Error al extender suscripción')
            }
        } catch (error) {
            alert('Error al extender suscripción')
        }
    }

    // Estadísticas rápidas
    const stats = {
        overdue: subscriptions.filter(s => getPaymentStatus(s).status === 'overdue').length,
        dueSoon: subscriptions.filter(s => getPaymentStatus(s).status === 'due_soon').length,
        pending: subscriptions.filter(s => getPaymentStatus(s).status === 'pending').length,
        current: subscriptions.filter(s => getPaymentStatus(s).status === 'current').length
    }

    return (
        <div className="space-y-6">
            {/* Estadísticas de Pagos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-red-500/10 border-red-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                            <div>
                                <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
                                <p className="text-sm text-red-300">Pagos Vencidos</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-orange-500/10 border-orange-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="h-8 w-8 text-orange-400" />
                            <div>
                                <p className="text-2xl font-bold text-orange-400">{stats.dueSoon}</p>
                                <p className="text-sm text-orange-300">Vencen Pronto</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-500/10 border-blue-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-8 w-8 text-blue-400" />
                            <div>
                                <p className="text-2xl font-bold text-blue-400">{stats.pending}</p>
                                <p className="text-sm text-blue-300">Pagos Pendientes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-8 w-8 text-green-400" />
                            <div>
                                <p className="text-2xl font-bold text-green-400">{stats.current}</p>
                                <p className="text-sm text-green-300">Al Día</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros y Búsqueda */}
            <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { key: 'all', label: 'Todos', count: subscriptions.length },
                                { key: 'overdue', label: 'Vencidos', count: stats.overdue },
                                { key: 'due_soon', label: 'Por Vencer', count: stats.dueSoon },
                                { key: 'pending', label: 'Pendientes', count: stats.pending },
                                { key: 'current', label: 'Al Día', count: stats.current }
                            ].map(filterOption => (
                                <Button
                                    key={filterOption.key}
                                    size="sm"
                                    variant={filter === filterOption.key ? "default" : "outline"}
                                    onClick={() => setFilter(filterOption.key)}
                                    className={filter === filterOption.key ? "bg-blue-600" : "border-gray-600 hover:bg-gray-700"}
                                >
                                    {filterOption.label} ({filterOption.count})
                                </Button>
                            ))}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar cliente..."
                                className="bg-gray-700 border-gray-600 text-white pl-10 w-64"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Suscripciones y Pagos */}
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Gestión de Pagos ({filteredSubscriptions.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredSubscriptions.map((subscription) => {
                            const paymentStatus = getPaymentStatus(subscription)
                            return (
                                <div key={subscription.id} className="p-4 rounded-lg bg-gray-700/50 border border-gray-600">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-white font-semibold">{subscription.client.name}</h4>
                                                <Badge className={`${paymentStatus.color} text-white`}>
                                                    {paymentStatus.status === 'overdue' && `Vencido hace ${Math.abs(paymentStatus.daysUntilDue)} días`}
                                                    {paymentStatus.status === 'due_soon' && `Vence en ${paymentStatus.daysUntilDue} días`}
                                                    {paymentStatus.status === 'pending' && 'Pago Pendiente'}
                                                    {paymentStatus.status === 'current' && 'Al Día'}
                                                </Badge>
                                            </div>

                                            <p className="text-gray-400 text-sm mb-2">
                                                {subscription.client.user.email}
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-400">Plan:</p>
                                                    <p className="text-white font-medium">
                                                        {subscription.plan.name} - {formatCurrency(subscription.plan.price, subscription.plan.currency)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-gray-400">Período:</p>
                                                    <p className="text-white">
                                                        {new Date(subscription.startDate).toLocaleDateString('es-ES')} - {new Date(subscription.endDate).toLocaleDateString('es-ES')}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-gray-400">Último Pago:</p>
                                                    <p className="text-white">
                                                        {paymentStatus.lastPayment
                                                            ? new Date(paymentStatus.lastPayment.paidAt || paymentStatus.lastPayment.createdAt).toLocaleDateString('es-ES')
                                                            : 'Sin pagos'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => registerPayment(subscription.id, subscription.plan.price, subscription.plan.currency)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Registrar Pago
                                            </Button>

                                            {paymentStatus.status === 'overdue' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => extendSubscription(subscription.id)}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Extender
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {filteredSubscriptions.length === 0 && (
                            <div className="text-center py-12">
                                <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">
                                    No hay suscripciones que coincidan con los filtros
                                </h3>
                                <p className="text-gray-400">
                                    Ajusta los filtros o crea nuevas suscripciones
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Users, DollarSign, Calendar, TrendingUp, AlertTriangle } from 'lucide-react'

interface BillingOverviewProps {
  totalPlans: number
  activePlans: number
  totalSubscriptions: number
  activeSubscriptions: number
  expiredSubscriptions: number
  totalRevenue: number
  monthlyRevenue: number
}

export function BillingOverview({
  totalPlans,
  activePlans,
  totalSubscriptions,
  activeSubscriptions,
  expiredSubscriptions,
  totalRevenue,
  monthlyRevenue
}: BillingOverviewProps) {
  const stats = [
    {
      title: 'Planes Totales',
      value: totalPlans,
      subtitle: `${activePlans} activos`,
      icon: CreditCard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Suscripciones Activas',
      value: activeSubscriptions,
      subtitle: `${totalSubscriptions} totales`,
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Ingresos Totales',
      value: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(totalRevenue),
      subtitle: 'Acumulado',
      icon: DollarSign,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Ingresos del Mes',
      value: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(monthlyRevenue),
      subtitle: 'Este mes',
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Suscripciones Vencidas',
      value: expiredSubscriptions,
      subtitle: 'Requieren atención',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    },
    {
      title: 'Tasa de Retención',
      value: totalSubscriptions > 0 ? `${Math.round((activeSubscriptions / totalSubscriptions) * 100)}%` : '0%',
      subtitle: 'Clientes activos',
      icon: Calendar,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
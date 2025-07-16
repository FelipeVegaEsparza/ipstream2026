import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BillingOverview } from '@/components/admin/BillingOverview'
import { PlansManager } from '@/components/admin/PlansManager'
import { PaymentsTable } from '@/components/admin/PaymentsTable'
import { SubscriptionsTable } from '@/components/admin/SubscriptionsTable'
import { ClientPlanAssignment } from '@/components/admin/ClientPlanAssignment'
import { PaymentManager } from '@/components/admin/PaymentManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function BillingPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return <div>Error: Acceso no autorizado</div>
  }

  // Obtener estadísticas de facturación
  const [
    totalPlans,
    activePlans,
    totalSubscriptions,
    activeSubscriptions,
    expiredSubscriptions,
    totalRevenue,
    monthlyRevenue,
    recentPayments,
    plans,
    subscriptions,
    clients
  ] = await Promise.all([
    prisma.plan.count(),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: 'active' } }),
    prisma.subscription.count({ where: { status: 'expired' } }),
    prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: {
        status: 'completed',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    }),
    prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          include: { user: true }
        },
        subscription: {
          include: { plan: true }
        }
      }
    }),
    prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            clients: true,
            subscriptions: true
          }
        }
      }
    }),
    prisma.subscription.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          include: { user: true }
        },
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: { payments: true }
        }
      }
    }),
    prisma.client.findMany({
      include: {
        user: true,
        plan: true,
        subscription: true
      },
      orderBy: { createdAt: 'desc' }
    })
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Gestión de Planes y Pagos
        </h1>
        <p className="text-gray-400">
          Administra planes, suscripciones y pagos de tus clientes
        </p>
      </div>

      <BillingOverview 
        totalPlans={totalPlans}
        activePlans={activePlans}
        totalSubscriptions={totalSubscriptions}
        activeSubscriptions={activeSubscriptions}
        expiredSubscriptions={expiredSubscriptions}
        totalRevenue={totalRevenue._sum.amount || 0}
        monthlyRevenue={monthlyRevenue._sum.amount || 0}
      />

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800 border-gray-700">
          <TabsTrigger value="plans" className="data-[state=active]:bg-blue-600">
            Planes
          </TabsTrigger>
          <TabsTrigger value="assign" className="data-[state=active]:bg-blue-600">
            Asignar Planes
          </TabsTrigger>
          <TabsTrigger value="manage-payments" className="data-[state=active]:bg-blue-600">
            Gestionar Pagos
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-blue-600">
            Suscripciones
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-blue-600">
            Historial
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
            Análisis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <PlansManager plans={plans} />
        </TabsContent>

        <TabsContent value="assign" className="space-y-6">
          <ClientPlanAssignment 
            clients={clients} 
            plans={plans} 
          />
        </TabsContent>

        <TabsContent value="manage-payments" className="space-y-6">
          <PaymentManager 
            subscriptions={subscriptions} 
          />
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <SubscriptionsTable subscriptions={subscriptions} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentsTable payments={recentPayments} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">
              Análisis Avanzado
            </h3>
            <p className="text-gray-400">
              Próximamente: Gráficos de ingresos, tendencias y métricas avanzadas
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
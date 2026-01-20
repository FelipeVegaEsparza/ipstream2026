import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { clientId, planId } = await request.json()

    if (!clientId || !planId) {
      return NextResponse.json({ error: 'ClientId y PlanId son requeridos' }, { status: 400 })
    }

    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Verificar que el plan existe y está activo
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    })

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Plan no encontrado o inactivo' }, { status: 404 })
    }

    // Usar transacción para asignar plan y crear suscripción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar el cliente con el nuevo plan
      const updatedClient = await tx.client.update({
        where: { id: clientId },
        data: { planId: planId }
      })

      // Cancelar suscripción anterior si existe
      await tx.subscription.updateMany({
        where: { 
          clientId: clientId,
          status: 'active'
        },
        data: { 
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: 'Plan cambiado por administrador'
        }
      })

      // Crear nueva suscripción
      const startDate = new Date()
      const endDate = new Date()
      
      // Calcular fecha de vencimiento según el intervalo del plan
      if (plan.interval === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1)
      } else if (plan.interval === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1)
      }

      const subscription = await tx.subscription.create({
        data: {
          clientId: clientId,
          planId: planId,
          status: 'active',
          startDate: startDate,
          endDate: endDate,
          autoRenew: true
        }
      })

      return { client: updatedClient, subscription }
    })

    return NextResponse.json({
      message: 'Plan asignado exitosamente',
      client: result.client,
      subscription: result.subscription
    })

  } catch (error) {
    console.error('Error al asignar plan:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
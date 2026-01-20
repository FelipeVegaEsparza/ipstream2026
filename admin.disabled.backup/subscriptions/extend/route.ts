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

    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: 'ID de suscripción requerido' }, { status: 400 })
    }

    // Obtener la suscripción con el plan
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true, client: true }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 })
    }

    // Calcular nueva fecha de vencimiento
    const currentEndDate = new Date(subscription.endDate)
    const newEndDate = new Date(currentEndDate)

    if (subscription.plan.interval === 'monthly') {
      newEndDate.setMonth(newEndDate.getMonth() + 1)
    } else if (subscription.plan.interval === 'yearly') {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1)
    }

    // Actualizar la suscripción
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        endDate: newEndDate,
        status: 'active'
      },
      include: {
        client: { include: { user: true } },
        plan: true
      }
    })

    return NextResponse.json({
      message: 'Suscripción extendida exitosamente',
      subscription: updatedSubscription,
      previousEndDate: subscription.endDate,
      newEndDate: newEndDate
    })

  } catch (error) {
    console.error('Error al extender suscripción:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
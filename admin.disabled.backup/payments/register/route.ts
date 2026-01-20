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

    const { subscriptionId, amount, currency, paymentMethod, description } = await request.json()

    if (!subscriptionId || !amount || !currency) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 })
    }

    // Verificar que la suscripción existe
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { client: true, plan: true }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 })
    }

    // Usar transacción para registrar pago y actualizar suscripción
    const result = await prisma.$transaction(async (tx) => {
      // Crear el pago
      const payment = await tx.payment.create({
        data: {
          clientId: subscription.clientId,
          subscriptionId: subscriptionId,
          amount: amount,
          currency: currency,
          status: 'completed',
          paymentMethod: paymentMethod || 'manual',
          description: description || 'Pago registrado por administrador',
          paidAt: new Date(),
          transactionId: `MANUAL_${Date.now()}`
        }
      })

      // Extender la suscripción si está vencida o por vencer
      const now = new Date()
      const endDate = new Date(subscription.endDate)
      
      if (endDate <= now) {
        // Si está vencida, extender desde ahora
        const newEndDate = new Date()
        if (subscription.plan.interval === 'monthly') {
          newEndDate.setMonth(newEndDate.getMonth() + 1)
        } else {
          newEndDate.setFullYear(newEndDate.getFullYear() + 1)
        }

        await tx.subscription.update({
          where: { id: subscriptionId },
          data: {
            endDate: newEndDate,
            status: 'active'
          }
        })
      }

      return payment
    })

    return NextResponse.json({
      message: 'Pago registrado exitosamente',
      payment: result
    })

  } catch (error) {
    console.error('Error al registrar pago:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
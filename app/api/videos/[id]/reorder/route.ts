import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user.clientId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { direction } = body

    if (!['up', 'down'].includes(direction)) {
      return NextResponse.json(
        { error: 'Dirección inválida' },
        { status: 400 }
      )
    }

    // Obtener el video actual
    const currentVideo = await prisma.rankingVideo.findFirst({
      where: {
        id: params.id,
        clientId: session.user.clientId,
      }
    })

    if (!currentVideo) {
      return NextResponse.json(
        { error: 'Video no encontrado' },
        { status: 404 }
      )
    }

    const currentOrder = currentVideo.order
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1

    // Verificar que el nuevo orden sea válido
    const targetVideo = await prisma.rankingVideo.findFirst({
      where: {
        clientId: session.user.clientId,
        order: newOrder
      }
    })

    if (!targetVideo) {
      return NextResponse.json(
        { error: 'No se puede mover en esa dirección' },
        { status: 400 }
      )
    }

    // Intercambiar las posiciones
    await prisma.$transaction([
      // Actualizar el video actual
      prisma.rankingVideo.update({
        where: { id: currentVideo.id },
        data: { order: newOrder }
      }),
      // Actualizar el video objetivo
      prisma.rankingVideo.update({
        where: { id: targetVideo.id },
        data: { order: currentOrder }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering video:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
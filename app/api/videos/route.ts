import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rankingVideoSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user.clientId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = rankingVideoSchema.parse(body)

    // Obtener el siguiente número de orden
    const lastVideo = await prisma.rankingVideo.findFirst({
      where: { clientId: session.user.clientId },
      orderBy: { order: 'desc' }
    })

    const nextOrder = lastVideo ? lastVideo.order + 1 : 1

    const video = await prisma.rankingVideo.create({
      data: {
        ...data,
        order: nextOrder,
        clientId: session.user.clientId,
      }
    })

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
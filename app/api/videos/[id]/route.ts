import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rankingVideoSchema } from '@/lib/validations'

export async function PUT(
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
    const data = rankingVideoSchema.parse(body)

    const video = await prisma.rankingVideo.update({
      where: {
        id: params.id,
        clientId: session.user.clientId,
      },
      data: {
        name: data.name,
        videoUrl: data.videoUrl,
        description: data.description,
      }
    })

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Obtener el video a eliminar
    const videoToDelete = await prisma.rankingVideo.findFirst({
      where: {
        id: params.id,
        clientId: session.user.clientId,
      }
    })

    if (!videoToDelete) {
      return NextResponse.json(
        { error: 'Video no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el video
    await prisma.rankingVideo.delete({
      where: {
        id: params.id,
        clientId: session.user.clientId,
      }
    })

    // Reordenar los videos restantes para cerrar el hueco
    await prisma.rankingVideo.updateMany({
      where: {
        clientId: session.user.clientId,
        order: {
          gt: videoToDelete.order
        }
      },
      data: {
        order: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
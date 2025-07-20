import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { clientId } = params

    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Obtener videos del ranking
    const videos = await prisma.rankingVideo.findMany({
      where: { clientId },
      select: {
        id: true,
        name: true,
        videoUrl: true,
        description: true,
        order: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(videos)

  } catch (error) {
    console.error('Error getting videos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
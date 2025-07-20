import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string; id: string } }
) {
  try {
    const { clientId, id } = params

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

    // Obtener el podcast específico (solo audio)
    const podcast = await prisma.podcast.findFirst({
      where: { 
        id,
        clientId,
        fileType: 'audio' // Solo audio
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        audioUrl: true,
        duration: true,
        episodeNumber: true,
        season: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!podcast) {
      return NextResponse.json(
        { error: 'Episodio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(podcast)

  } catch (error) {
    console.error('Error getting podcast:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string; id: string } }
) {
  try {
    const podcast = await prisma.podcast.findFirst({
      where: {
        id: params.id,
        clientId: params.clientId
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        audioUrl: true,
        videoUrl: true,
        fileType: true,
        duration: true,
        episodeNumber: true,
        season: true,
        createdAt: true,
        updatedAt: true,
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
    console.error('Error fetching podcast:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
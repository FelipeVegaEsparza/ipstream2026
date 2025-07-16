import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const videos = await prisma.rankingVideo.findMany({
      where: { clientId: params.clientId },
      select: {
        id: true,
        name: true,
        videoUrl: true,
        description: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
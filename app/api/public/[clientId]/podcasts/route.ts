import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [podcasts, total] = await Promise.all([
      prisma.podcast.findMany({
        where: { clientId: params.clientId },
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
        },
        orderBy: [
          { episodeNumber: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prisma.podcast.count({
        where: { clientId: params.clientId }
      })
    ])

    return NextResponse.json({
      data: podcasts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching podcasts:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
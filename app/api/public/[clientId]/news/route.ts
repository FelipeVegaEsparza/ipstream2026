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

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where: { clientId: params.clientId },
        select: {
          id: true,
          name: true,
          slug: true,
          shortText: true,
          longText: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.news.count({
        where: { clientId: params.clientId }
      })
    ])

    return NextResponse.json({
      data: news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Get single news by slug
export async function GET_BY_SLUG(
  request: NextRequest,
  { params }: { params: { clientId: string; slug: string } }
) {
  try {
    const news = await prisma.news.findFirst({
      where: {
        clientId: params.clientId,
        slug: params.slug
      },
      select: {
        id: true,
        name: true,
        slug: true,
        shortText: true,
        longText: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!news) {
      return NextResponse.json(
        { error: 'Noticia no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
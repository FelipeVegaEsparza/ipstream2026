import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
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
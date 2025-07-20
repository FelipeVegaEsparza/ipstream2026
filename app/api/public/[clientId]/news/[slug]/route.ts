import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string; slug: string } }
) {
  try {
    const { clientId, slug } = params

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

    // Obtener la noticia específica
    const news = await prisma.news.findFirst({
      where: { 
        slug,
        clientId 
      },
      select: {
        id: true,
        name: true,
        slug: true,
        shortText: true,
        longText: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true
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
    console.error('Error getting news:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
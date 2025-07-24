import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleCors, createCorsResponse, createCorsErrorResponse } from '@/lib/cors'

export async function OPTIONS() {
  return handleCors()
}

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
      return createCorsErrorResponse('Cliente no encontrado', 404)
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
      return createCorsErrorResponse('Noticia no encontrada', 404)
    }

    return createCorsResponse(news)

  } catch (error) {
    console.error('Error getting news:', error)
    return createCorsErrorResponse('Error interno del servidor', 500)
  }
}
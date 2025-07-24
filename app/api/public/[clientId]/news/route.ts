import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleCors, createCorsResponse, createCorsErrorResponse } from '@/lib/cors'

export async function OPTIONS() {
  return handleCors()
}

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { clientId } = params
    const { searchParams } = new URL(request.url)
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Máximo 50
    const skip = (page - 1) * limit

    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true }
    })

    if (!client) {
      return createCorsErrorResponse('Cliente no encontrado', 404)
    }

    // Obtener noticias con paginación
    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where: { clientId },
        select: {
          id: true,
          name: true,
          slug: true,
          shortText: true,
          longText: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.news.count({
        where: { clientId }
      })
    ])

    const totalPages = Math.ceil(total / limit)

    return createCorsResponse({
      data: news,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      }
    })

  } catch (error) {
    console.error('Error getting news:', error)
    return createCorsErrorResponse('Error interno del servidor', 500)
  }
}
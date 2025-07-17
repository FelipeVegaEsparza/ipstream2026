import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { newsSchema } from '@/lib/validations'
import { getEffectiveClientFromRequest } from '@/lib/getEffectiveClient'

export async function POST(request: NextRequest) {
  try {
    console.log('📰 Creating news - Start')
    
    // Usar la función helper para obtener el cliente efectivo
    const effectiveClient = await getEffectiveClientFromRequest(request)
    
    if (!effectiveClient) {
      console.log('📰 No effective client found')
      return NextResponse.json(
        { error: 'No autorizado - Sin cliente asociado' },
        { status: 401 }
      )
    }

    console.log('📰 Effective client:', effectiveClient)

    const body = await request.json()
    console.log('📰 Request body keys:', Object.keys(body))
    
    const data = newsSchema.parse(body)
    console.log('📰 Validated data keys:', Object.keys(data))

    // Verificar que el slug no exista para este cliente
    const existingNews = await prisma.news.findFirst({
      where: {
        clientId: effectiveClient.clientId,
        slug: data.slug
      }
    })

    if (existingNews) {
      console.log('📰 Slug already exists:', data.slug)
      return NextResponse.json(
        { error: 'Ya existe una noticia con este slug' },
        { status: 400 }
      )
    }

    console.log('📰 Creating news in database...')
    const news = await prisma.news.create({
      data: {
        ...data,
        clientId: effectiveClient.clientId,
      }
    })

    console.log('📰 News created successfully:', news.id)
    return NextResponse.json(news)
  } catch (error) {
    console.error('📰 Error creating news:', error)
    
    // Provide more detailed error information
    if (error instanceof Error) {
      console.error('📰 Error message:', error.message)
      console.error('📰 Error stack:', error.stack)
      
      // Check for specific Prisma errors
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Ya existe una noticia con datos similares' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Cliente no válido' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
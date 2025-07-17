import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { newsSchema } from '@/lib/validations'
import { getEffectiveClientFromRequest } from '@/lib/getEffectiveClient'
import { sanitizeObject, validateText } from '@/lib/text-sanitizer'

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
    
    // Sanitizar el texto antes de validar
    const sanitizedBody = sanitizeObject(body)
    console.log('📰 Text sanitized')
    
    // Validar campos de texto críticos
    if (sanitizedBody.name) {
      const nameValidation = validateText(sanitizedBody.name)
      if (!nameValidation.isValid) {
        console.log('📰 Invalid name text:', nameValidation.error)
        return NextResponse.json(
          { error: `Título inválido: ${nameValidation.error}` },
          { status: 400 }
        )
      }
    }
    
    if (sanitizedBody.shortText) {
      const shortTextValidation = validateText(sanitizedBody.shortText)
      if (!shortTextValidation.isValid) {
        console.log('📰 Invalid shortText:', shortTextValidation.error)
        return NextResponse.json(
          { error: `Texto corto inválido: ${shortTextValidation.error}` },
          { status: 400 }
        )
      }
    }
    
    if (sanitizedBody.longText) {
      const longTextValidation = validateText(sanitizedBody.longText)
      if (!longTextValidation.isValid) {
        console.log('📰 Invalid longText:', longTextValidation.error)
        return NextResponse.json(
          { error: `Texto largo inválido: ${longTextValidation.error}` },
          { status: 400 }
        )
      }
    }
    
    const data = newsSchema.parse(sanitizedBody)
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
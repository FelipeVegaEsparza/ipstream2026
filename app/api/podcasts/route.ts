import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { podcastSchema } from '@/lib/validations'
import { getEffectiveClientFromRequest } from '@/lib/getEffectiveClient'
import { sanitizeObject, validateText } from '@/lib/text-sanitizer'

export async function POST(request: NextRequest) {
  try {
    console.log('🎙️ Creating podcast - Start')
    
    // Usar la función helper para obtener el cliente efectivo
    const effectiveClient = await getEffectiveClientFromRequest(request)
    
    if (!effectiveClient) {
      console.log('🎙️ No effective client found')
      return NextResponse.json(
        { error: 'No autorizado - Sin cliente asociado' },
        { status: 401 }
      )
    }

    console.log('🎙️ Effective client:', effectiveClient)

    const body = await request.json()
    console.log('🎙️ Request body keys:', Object.keys(body))
    
    // Sanitizar el texto antes de validar
    const sanitizedBody = sanitizeObject(body)
    console.log('🎙️ Text sanitized')
    
    // Validar campos de texto críticos
    if (sanitizedBody.title) {
      const titleValidation = validateText(sanitizedBody.title)
      if (!titleValidation.isValid) {
        console.log('🎙️ Invalid title text:', titleValidation.error)
        return NextResponse.json(
          { error: `Título del episodio inválido: ${titleValidation.error}` },
          { status: 400 }
        )
      }
    }
    
    if (sanitizedBody.description) {
      const descValidation = validateText(sanitizedBody.description)
      if (!descValidation.isValid) {
        console.log('🎙️ Invalid description:', descValidation.error)
        return NextResponse.json(
          { error: `Descripción inválida: ${descValidation.error}` },
          { status: 400 }
        )
      }
    }

    // Try to parse with Zod
    console.log('🎙️ Attempting Zod validation...')
    let data;
    try {
      data = podcastSchema.parse(sanitizedBody)
      console.log('🎙️ Zod validation successful')
    } catch (zodError) {
      console.log('🎙️ Zod validation failed:', zodError)
      return NextResponse.json(
        { error: 'Error de validación: ' + zodError.message },
        { status: 400 }
      )
    }

    console.log('🎙️ Creating podcast in database...')
    const podcast = await prisma.podcast.create({
      data: {
        ...data,
        clientId: effectiveClient.clientId,
      }
    })

    console.log('🎙️ Podcast created successfully:', podcast.id)
    return NextResponse.json(podcast)
  } catch (error) {
    console.error('🎙️ Error creating podcast:', error)
    
    if (error instanceof Error) {
      console.error('🎙️ Error message:', error.message)
      console.error('🎙️ Error stack:', error.stack)
      
      // Check for specific Prisma errors
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Ya existe un episodio con datos similares' },
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

export async function GET(request: NextRequest) {
  try {
    console.log('🎙️ Getting podcasts - Start')
    
    // Usar la función helper para obtener el cliente efectivo
    const effectiveClient = await getEffectiveClientFromRequest(request)
    
    if (!effectiveClient) {
      console.log('🎙️ No effective client found')
      return NextResponse.json(
        { error: 'No autorizado - Sin cliente asociado' },
        { status: 401 }
      )
    }

    console.log('🎙️ Effective client:', effectiveClient)

    const podcasts = await prisma.podcast.findMany({
      where: {
        clientId: effectiveClient.clientId
      },
      orderBy: [
        { episodeNumber: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    console.log('🎙️ Found', podcasts.length, 'podcasts')
    return NextResponse.json(podcasts)
  } catch (error) {
    console.error('🎙️ Error getting podcasts:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
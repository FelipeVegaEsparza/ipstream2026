import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { podcastSchema } from '@/lib/validations'
import { getEffectiveClientFromRequest } from '@/lib/getEffectiveClient'
import { sanitizeObject, validateText } from '@/lib/text-sanitizer'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🎙️ Getting podcast by ID:', params.id)
    
    // Usar la función helper para obtener el cliente efectivo
    const effectiveClient = await getEffectiveClientFromRequest(request)
    
    if (!effectiveClient) {
      console.log('🎙️ No effective client found')
      return NextResponse.json(
        { error: 'No autorizado - Sin cliente asociado' },
        { status: 401 }
      )
    }

    const podcast = await prisma.podcast.findFirst({
      where: {
        id: params.id,
        clientId: effectiveClient.clientId,
        fileType: 'audio' // Solo audio
      }
    })

    if (!podcast) {
      return NextResponse.json(
        { error: 'Episodio no encontrado' },
        { status: 404 }
      )
    }

    console.log('🎙️ Podcast found:', podcast.title)
    return NextResponse.json(podcast)
  } catch (error) {
    console.error('🎙️ Error getting podcast:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🎙️ Updating podcast:', params.id)
    
    // Usar la función helper para obtener el cliente efectivo
    const effectiveClient = await getEffectiveClientFromRequest(request)
    
    if (!effectiveClient) {
      console.log('🎙️ No effective client found')
      return NextResponse.json(
        { error: 'No autorizado - Sin cliente asociado' },
        { status: 401 }
      )
    }

    // Verificar que el podcast existe y pertenece al cliente
    const existingPodcast = await prisma.podcast.findFirst({
      where: {
        id: params.id,
        clientId: effectiveClient.clientId,
        fileType: 'audio' // Solo audio
      }
    })

    if (!existingPodcast) {
      return NextResponse.json(
        { error: 'Episodio no encontrado' },
        { status: 404 }
      )
    }

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

    console.log('🎙️ Updating podcast in database...')
    const podcast = await prisma.podcast.update({
      where: {
        id: params.id
      },
      data: {
        ...data,
        fileType: 'audio', // Mantener tipo audio
        videoUrl: null, // No video para podcasts
      }
    })

    console.log('🎙️ Podcast updated successfully:', podcast.id)
    return NextResponse.json(podcast)
  } catch (error) {
    console.error('🎙️ Error updating podcast:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🎙️ Deleting podcast:', params.id)
    
    // Usar la función helper para obtener el cliente efectivo
    const effectiveClient = await getEffectiveClientFromRequest(request)
    
    if (!effectiveClient) {
      console.log('🎙️ No effective client found')
      return NextResponse.json(
        { error: 'No autorizado - Sin cliente asociado' },
        { status: 401 }
      )
    }

    // Verificar que el podcast existe y pertenece al cliente
    const existingPodcast = await prisma.podcast.findFirst({
      where: {
        id: params.id,
        clientId: effectiveClient.clientId,
        fileType: 'audio' // Solo audio
      }
    })

    if (!existingPodcast) {
      return NextResponse.json(
        { error: 'Episodio no encontrado' },
        { status: 404 }
      )
    }

    console.log('🎙️ Deleting podcast from database...')
    await prisma.podcast.delete({
      where: {
        id: params.id
      }
    })

    console.log('🎙️ Podcast deleted successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('🎙️ Error deleting podcast:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rankingVideoSchema } from '@/lib/validations'
import { getEffectiveClientFromRequest } from '@/lib/getEffectiveClient'
import { sanitizeObject, validateText } from '@/lib/text-sanitizer'

export async function POST(request: NextRequest) {
  try {
    console.log('🎵 Creating video - Start')
    
    // Usar la función helper para obtener el cliente efectivo
    const effectiveClient = await getEffectiveClientFromRequest(request)
    
    if (!effectiveClient) {
      console.log('🎵 No effective client found')
      return NextResponse.json(
        { error: 'No autorizado - Sin cliente asociado' },
        { status: 401 }
      )
    }

    console.log('🎵 Effective client:', effectiveClient)

    const body = await request.json()
    console.log('🎵 Request body keys:', Object.keys(body))
    
    // Sanitizar el texto antes de validar
    const sanitizedBody = sanitizeObject(body)
    console.log('🎵 Text sanitized')
    
    // Validar campos de texto críticos
    if (sanitizedBody.name) {
      const nameValidation = validateText(sanitizedBody.name)
      if (!nameValidation.isValid) {
        console.log('🎵 Invalid name text:', nameValidation.error)
        return NextResponse.json(
          { error: `Nombre del video inválido: ${nameValidation.error}` },
          { status: 400 }
        )
      }
    }
    
    if (sanitizedBody.description) {
      const descValidation = validateText(sanitizedBody.description)
      if (!descValidation.isValid) {
        console.log('🎵 Invalid description:', descValidation.error)
        return NextResponse.json(
          { error: `Descripción inválida: ${descValidation.error}` },
          { status: 400 }
        )
      }
    }
    
    const data = rankingVideoSchema.parse(sanitizedBody)
    console.log('🎵 Validated data keys:', Object.keys(data))

    // Obtener el siguiente número de orden
    const lastVideo = await prisma.rankingVideo.findFirst({
      where: { clientId: effectiveClient.clientId },
      orderBy: { order: 'desc' }
    })

    const nextOrder = lastVideo ? lastVideo.order + 1 : 1
    console.log('🎵 Next order number:', nextOrder)

    console.log('🎵 Creating video in database...')
    const video = await prisma.rankingVideo.create({
      data: {
        ...data,
        order: nextOrder,
        clientId: effectiveClient.clientId,
      }
    })

    console.log('🎵 Video created successfully:', video.id)
    return NextResponse.json(video)
  } catch (error) {
    console.error('🎵 Error creating video:', error)
    
    if (error instanceof Error) {
      console.error('🎵 Error message:', error.message)
      console.error('🎵 Error stack:', error.stack)
      
      // Check for specific Prisma errors
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Ya existe un video con datos similares' },
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
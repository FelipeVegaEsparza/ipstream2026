import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { videocastSchema } from '@/lib/validations'
import { getEffectiveClientFromRequest } from '@/lib/getEffectiveClient'
import { sanitizeObject, validateText } from '@/lib/text-sanitizer'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🎥 Updating videocast - Start')
    
    const effectiveClient = await getEffectiveClientFromRequest(request)
    
    if (!effectiveClient) {
      return NextResponse.json(
        { error: 'No autorizado - Sin cliente asociado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const sanitizedBody = sanitizeObject(body)
    
    // Validar campos de texto críticos
    if (sanitizedBody.title) {
      const titleValidation = validateText(sanitizedBody.title)
      if (!titleValidation.isValid) {
        return NextResponse.json(
          { error: `Título del episodio inválido: ${titleValidation.error}` },
          { status: 400 }
        )
      }
    }
    
    if (sanitizedBody.description) {
      const descValidation = validateText(sanitizedBody.description)
      if (!descValidation.isValid) {
        return NextResponse.json(
          { error: `Descripción inválida: ${descValidation.error}` },
          { status: 400 }
        )
      }
    }

    let data;
    try {
      data = videocastSchema.parse(sanitizedBody)
    } catch (zodError) {
      return NextResponse.json(
        { error: 'Error de validación: ' + zodError.message },
        { status: 400 }
      )
    }

    // Verificar que el videocast existe y pertenece al cliente
    const existingVideocast = await prisma.podcast.findFirst({
      where: {
        id: params.id,
        clientId: effectiveClient.clientId,
        fileType: 'video'
      }
    })

    if (!existingVideocast) {
      return NextResponse.json(
        { error: 'Episodio no encontrado' },
        { status: 404 }
      )
    }

    const videocast = await prisma.podcast.update({
      where: { id: params.id },
      data: {
        ...data,
        fileType: 'video', // Mantener tipo video
        audioUrl: null, // No audio para videocasts
      }
    })

    console.log('🎥 Videocast updated successfully:', videocast.id)
    return NextResponse.json(videocast)
  } catch (error) {
    console.error('🎥 Error updating videocast:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🎥 Deleting videocast - Start')
    
    const effectiveClient = await getEffectiveClientFromRequest(request)
    
    if (!effectiveClient) {
      return NextResponse.json(
        { error: 'No autorizado - Sin cliente asociado' },
        { status: 401 }
      )
    }

    // Verificar que el videocast existe y pertenece al cliente
    const existingVideocast = await prisma.podcast.findFirst({
      where: {
        id: params.id,
        clientId: effectiveClient.clientId,
        fileType: 'video'
      }
    })

    if (!existingVideocast) {
      return NextResponse.json(
        { error: 'Episodio no encontrado' },
        { status: 404 }
      )
    }

    await prisma.podcast.delete({
      where: { id: params.id }
    })

    console.log('🎥 Videocast deleted successfully:', params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('🎥 Error deleting videocast:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
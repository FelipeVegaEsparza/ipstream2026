import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rankingVideoSchema } from '@/lib/validations'
import { getEffectiveClientFromRequest } from '@/lib/getEffectiveClient'

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
    
    const data = rankingVideoSchema.parse(body)
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
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

const streamConfigUpdateSchema = z.object({
  bitrates: z.array(z.enum(['64', '128', '320'])).optional(),
  maxListeners: z.number().int().min(1).optional(),
  autodjEnabled: z.boolean().optional(),
  crossfadeDuration: z.number().min(0).max(10).optional(),
  normalizeAudio: z.boolean().optional(),
  normalizationLevel: z.number().min(-20).max(-8).optional(),
  playbackMode: z.enum(['random', 'sequential']).optional(),
  liveInputEnabled: z.boolean().optional(),
  jinglesEnabled: z.boolean().optional(),
  jinglesFrequency: z.number().int().min(1).optional(),
})

// GET - Obtener configuración de streaming del cliente
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.clientId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const streamConfig = await prisma.streamConfig.findUnique({
      where: { clientId: session.user.clientId },
      include: {
        server: {
          select: {
            id: true,
            name: true,
            host: true,
            port: true,
            status: true
          }
        }
      }
    })

    if (!streamConfig) {
      return NextResponse.json(
        { error: 'No tienes configuración de streaming. Contacta al administrador.' },
        { status: 404 }
      )
    }

    // Parsear bitrates de JSON a array
    const config = {
      ...streamConfig,
      bitrates: JSON.parse(streamConfig.bitrates)
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error al obtener configuración:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar configuración de streaming
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.clientId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = streamConfigUpdateSchema.parse(body)

    // Verificar que el cliente tiene configuración
    const existingConfig = await prisma.streamConfig.findUnique({
      where: { clientId: session.user.clientId }
    })

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'No tienes configuración de streaming' },
        { status: 404 }
      )
    }

    // Preparar datos para actualizar
    const updateData: any = { ...validatedData }

    // Convertir bitrates a JSON si se proporciona
    if (validatedData.bitrates) {
      updateData.bitrates = JSON.stringify(validatedData.bitrates)
    }

    const updatedConfig = await prisma.streamConfig.update({
      where: { clientId: session.user.clientId },
      data: updateData,
      include: {
        server: {
          select: {
            id: true,
            name: true,
            host: true,
            port: true,
            status: true
          }
        }
      }
    })

    // Parsear bitrates de vuelta a array
    const config = {
      ...updatedConfig,
      bitrates: JSON.parse(updatedConfig.bitrates)
    }

    return NextResponse.json(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar configuración:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const streamServerUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  host: z.string().min(1).optional(),
  port: z.number().int().min(1).max(65535).optional(),
  capacity: z.number().int().min(1).optional(),
  region: z.string().optional(),
  status: z.enum(['online', 'offline', 'maintenance']).optional(),
})

// GET - Obtener un servidor específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const server = await prisma.streamServer.findUnique({
      where: { id: params.id },
      include: {
        streamConfigs: {
          include: {
            client: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!server) {
      return NextResponse.json(
        { error: 'Servidor no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(server)
  } catch (error) {
    console.error('Error al obtener servidor:', error)
    return NextResponse.json(
      { error: 'Error al obtener servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar servidor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = streamServerUpdateSchema.parse(body)

    // Verificar que el servidor existe
    const existingServer = await prisma.streamServer.findUnique({
      where: { id: params.id }
    })

    if (!existingServer) {
      return NextResponse.json(
        { error: 'Servidor no encontrado' },
        { status: 404 }
      )
    }

    // Si se está cambiando host o port, verificar que no exista otro servidor con esos datos
    if (validatedData.host || validatedData.port) {
      const duplicateServer = await prisma.streamServer.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
            { host: validatedData.host || existingServer.host },
            { port: validatedData.port || existingServer.port }
          ]
        }
      })

      if (duplicateServer) {
        return NextResponse.json(
          { error: 'Ya existe otro servidor con ese host y puerto' },
          { status: 400 }
        )
      }
    }

    const updatedServer = await prisma.streamServer.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json(updatedServer)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar servidor:', error)
    return NextResponse.json(
      { error: 'Error al actualizar servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar servidor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el servidor existe
    const server = await prisma.streamServer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { streamConfigs: true }
        }
      }
    })

    if (!server) {
      return NextResponse.json(
        { error: 'Servidor no encontrado' },
        { status: 404 }
      )
    }

    // No permitir eliminar si tiene clientes asignados
    if (server._count.streamConfigs > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. El servidor tiene ${server._count.streamConfigs} cliente(s) asignado(s)` },
        { status: 400 }
      )
    }

    await prisma.streamServer.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Servidor eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar servidor:', error)
    return NextResponse.json(
      { error: 'Error al eliminar servidor' },
      { status: 500 }
    )
  }
}

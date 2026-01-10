import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

const assignServerSchema = z.object({
  serverId: z.string().optional(), // Si no se proporciona, se asigna automáticamente
})

// POST - Asignar servidor a cliente
export async function POST(
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

    const clientId = params.id
    const body = await request.json()
    const { serverId } = assignServerSchema.parse(body)

    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { streamConfig: true }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya tiene configuración de streaming
    if (client.streamConfig) {
      return NextResponse.json(
        { error: 'El cliente ya tiene un servidor asignado' },
        { status: 400 }
      )
    }

    let selectedServer

    if (serverId) {
      // Asignación manual
      selectedServer = await prisma.streamServer.findUnique({
        where: { id: serverId }
      })

      if (!selectedServer) {
        return NextResponse.json(
          { error: 'Servidor no encontrado' },
          { status: 404 }
        )
      }

      // Verificar capacidad
      const currentLoad = await prisma.streamConfig.count({
        where: { serverId: serverId }
      })

      if (currentLoad >= selectedServer.capacity) {
        return NextResponse.json(
          { error: 'El servidor ha alcanzado su capacidad máxima' },
          { status: 400 }
        )
      }
    } else {
      // Asignación automática - buscar servidor con menor carga
      const servers = await prisma.streamServer.findMany({
        where: { status: 'online' },
        include: {
          _count: {
            select: { streamConfigs: true }
          }
        }
      })

      if (servers.length === 0) {
        return NextResponse.json(
          { error: 'No hay servidores disponibles' },
          { status: 400 }
        )
      }

      // Filtrar servidores que no estén llenos
      const availableServers = servers.filter(
        server => server._count.streamConfigs < server.capacity
      )

      if (availableServers.length === 0) {
        return NextResponse.json(
          { error: 'Todos los servidores están llenos' },
          { status: 400 }
        )
      }

      // Seleccionar el servidor con menor carga
      selectedServer = availableServers.reduce((prev, current) =>
        prev._count.streamConfigs < current._count.streamConfigs ? prev : current
      )
    }

    // Generar mountpoint único
    const mountpoint = `/radio_${clientId.substring(0, 8)}`

    // Generar contraseña segura para live input
    const liveInputPassword = crypto.randomBytes(16).toString('hex')

    // Crear configuración de streaming
    const streamConfig = await prisma.streamConfig.create({
      data: {
        clientId: clientId,
        serverId: selectedServer.id,
        mountpoint: mountpoint,
        bitrates: JSON.stringify(['128']), // Por defecto solo 128kbps
        maxListeners: 100, // Por defecto
        autodjEnabled: true,
        crossfadeDuration: 3.0,
        normalizeAudio: true,
        normalizationLevel: -14.0,
        playbackMode: 'random',
        liveInputEnabled: true,
        liveInputPassword: liveInputPassword,
        jinglesEnabled: false,
        jinglesFrequency: 5,
        status: 'inactive'
      },
      include: {
        server: true,
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Actualizar currentLoad del servidor
    await prisma.streamServer.update({
      where: { id: selectedServer.id },
      data: {
        currentLoad: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      message: 'Servidor asignado exitosamente',
      streamConfig: streamConfig
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al asignar servidor:', error)
    return NextResponse.json(
      { error: 'Error al asignar servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Desasignar servidor de cliente
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

    const clientId = params.id

    // Verificar que el cliente tiene configuración
    const streamConfig = await prisma.streamConfig.findUnique({
      where: { clientId: clientId }
    })

    if (!streamConfig) {
      return NextResponse.json(
        { error: 'El cliente no tiene servidor asignado' },
        { status: 404 }
      )
    }

    // Eliminar configuración
    await prisma.streamConfig.delete({
      where: { clientId: clientId }
    })

    // Actualizar currentLoad del servidor
    await prisma.streamServer.update({
      where: { id: streamConfig.serverId },
      data: {
        currentLoad: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({ message: 'Servidor desasignado exitosamente' })
  } catch (error) {
    console.error('Error al desasignar servidor:', error)
    return NextResponse.json(
      { error: 'Error al desasignar servidor' },
      { status: 500 }
    )
  }
}

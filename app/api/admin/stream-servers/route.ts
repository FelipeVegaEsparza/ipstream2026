import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validación
const streamServerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  host: z.string().min(1, 'El host es requerido'),
  port: z.number().int().min(1).max(65535).default(8000),
  capacity: z.number().int().min(1, 'La capacidad debe ser al menos 1'),
  region: z.string().optional(),
})

// GET - Listar todos los servidores
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const servers = await prisma.streamServer.findMany({
      include: {
        _count: {
          select: { streamConfigs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calcular carga actual basada en configuraciones activas
    const serversWithLoad = servers.map(server => ({
      ...server,
      currentLoad: server._count.streamConfigs,
      loadPercentage: Math.round((server._count.streamConfigs / server.capacity) * 100)
    }))

    return NextResponse.json(serversWithLoad)
  } catch (error) {
    console.error('Error al obtener servidores:', error)
    return NextResponse.json(
      { error: 'Error al obtener servidores' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo servidor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = streamServerSchema.parse(body)

    // Verificar que no exista un servidor con el mismo host:port
    const existingServer = await prisma.streamServer.findFirst({
      where: {
        host: validatedData.host,
        port: validatedData.port
      }
    })

    if (existingServer) {
      return NextResponse.json(
        { error: 'Ya existe un servidor con ese host y puerto' },
        { status: 400 }
      )
    }

    const server = await prisma.streamServer.create({
      data: {
        name: validatedData.name,
        host: validatedData.host,
        port: validatedData.port,
        capacity: validatedData.capacity,
        region: validatedData.region,
        currentLoad: 0,
        status: 'online'
      }
    })

    return NextResponse.json(server, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear servidor:', error)
    return NextResponse.json(
      { error: 'Error al crear servidor' },
      { status: 500 }
    )
  }
}

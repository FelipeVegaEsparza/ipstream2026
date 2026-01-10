import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// GET - Obtener credenciales de live input
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
            host: true,
            port: true
          }
        }
      }
    })

    if (!streamConfig) {
      return NextResponse.json(
        { error: 'No tienes configuración de streaming' },
        { status: 404 }
      )
    }

    if (!streamConfig.liveInputEnabled) {
      return NextResponse.json(
        { error: 'Live input no está habilitado' },
        { status: 400 }
      )
    }

    // Construir URL de conexión
    const connectionUrl = `http://${streamConfig.server.host}:${streamConfig.server.port}${streamConfig.mountpoint}_live`

    return NextResponse.json({
      enabled: streamConfig.liveInputEnabled,
      host: streamConfig.server.host,
      port: streamConfig.server.port,
      mountpoint: `${streamConfig.mountpoint}_live`,
      username: 'source',
      password: streamConfig.liveInputPassword,
      connectionUrl: connectionUrl,
      instructions: {
        butt: {
          server: streamConfig.server.host,
          port: streamConfig.server.port,
          password: streamConfig.liveInputPassword,
          mountpoint: `${streamConfig.mountpoint}_live`,
          user: 'source'
        },
        mixxx: {
          type: 'Icecast 2',
          host: streamConfig.server.host,
          port: streamConfig.server.port,
          login: 'source',
          password: streamConfig.liveInputPassword,
          mount: `${streamConfig.mountpoint}_live`
        }
      }
    })
  } catch (error) {
    console.error('Error al obtener credenciales:', error)
    return NextResponse.json(
      { error: 'Error al obtener credenciales' },
      { status: 500 }
    )
  }
}

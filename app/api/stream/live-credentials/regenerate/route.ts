import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// POST - Regenerar contraseña de live input
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.clientId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const streamConfig = await prisma.streamConfig.findUnique({
      where: { clientId: session.user.clientId }
    })

    if (!streamConfig) {
      return NextResponse.json(
        { error: 'No tienes configuración de streaming' },
        { status: 404 }
      )
    }

    // Generar nueva contraseña
    const newPassword = crypto.randomBytes(16).toString('hex')

    const updatedConfig = await prisma.streamConfig.update({
      where: { clientId: session.user.clientId },
      data: {
        liveInputPassword: newPassword
      },
      include: {
        server: {
          select: {
            host: true,
            port: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Contraseña regenerada exitosamente',
      newPassword: newPassword,
      connectionUrl: `http://${updatedConfig.server.host}:${updatedConfig.server.port}${updatedConfig.mountpoint}_live`
    })
  } catch (error) {
    console.error('Error al regenerar contraseña:', error)
    return NextResponse.json(
      { error: 'Error al regenerar contraseña' },
      { status: 500 }
    )
  }
}

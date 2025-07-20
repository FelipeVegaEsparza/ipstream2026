import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { clientId } = params

    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Obtener redes sociales
    const socialNetworks = await prisma.socialNetworks.findUnique({
      where: { clientId },
      select: {
        facebook: true,
        youtube: true,
        instagram: true,
        tiktok: true,
        whatsapp: true,
        x: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!socialNetworks) {
      return NextResponse.json(
        { error: 'Redes sociales no encontradas' },
        { status: 404 }
      )
    }

    return NextResponse.json(socialNetworks)

  } catch (error) {
    console.error('Error getting social networks:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
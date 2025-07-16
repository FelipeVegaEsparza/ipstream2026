import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const socialNetworks = await prisma.socialNetworks.findUnique({
      where: { clientId: params.clientId },
      select: {
        facebook: true,
        youtube: true,
        instagram: true,
        tiktok: true,
        whatsapp: true,
        x: true,
        createdAt: true,
        updatedAt: true,
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
    console.error('Error fetching social networks:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
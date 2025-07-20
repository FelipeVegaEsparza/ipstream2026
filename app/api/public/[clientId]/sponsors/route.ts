import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { clientId } = params

    // Verificar que el cliente exists
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

    // Obtener sponsors
    const sponsors = await prisma.sponsor.findMany({
      where: { clientId },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        address: true,
        description: true,
        facebook: true,
        youtube: true,
        instagram: true,
        tiktok: true,
        whatsapp: true,
        x: true,
        website: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(sponsors)

  } catch (error) {
    console.error('Error getting sponsors:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
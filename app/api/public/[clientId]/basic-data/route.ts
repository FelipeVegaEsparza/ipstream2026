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

    // Obtener datos básicos
    const basicData = await prisma.basicData.findUnique({
      where: { clientId },
      select: {
        projectName: true,
        projectDescription: true,
        logoUrl: true,
        coverUrl: true,
        radioStreamingUrl: true,
        videoStreamingUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!basicData) {
      return NextResponse.json(
        { error: 'Datos básicos no encontrados' },
        { status: 404 }
      )
    }

    return NextResponse.json(basicData)

  } catch (error) {
    console.error('Error getting basic data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
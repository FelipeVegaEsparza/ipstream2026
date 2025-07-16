import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const basicData = await prisma.basicData.findUnique({
      where: { clientId: params.clientId },
      select: {
        projectName: true,
        projectDescription: true,
        logoUrl: true,
        coverUrl: true,
        radioStreamingUrl: true,
        videoStreamingUrl: true,
        createdAt: true,
        updatedAt: true,
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
    console.error('Error fetching basic data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
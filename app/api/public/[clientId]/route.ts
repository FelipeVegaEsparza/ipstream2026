import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: params.clientId },
      select: { id: true, name: true }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Obtener todos los datos del cliente
    const [
      basicData,
      socialNetworks,
      programs,
      news,
      videos,
      sponsors,
      promotions,
      podcasts
    ] = await Promise.all([
      prisma.basicData.findUnique({
        where: { clientId: params.clientId },
        select: {
          projectName: true,
          projectDescription: true,
          logoUrl: true,
          coverUrl: true,
          radioStreamingUrl: true,
          videoStreamingUrl: true,
        }
      }),
      prisma.socialNetworks.findUnique({
        where: { clientId: params.clientId },
        select: {
          facebook: true,
          youtube: true,
          instagram: true,
          tiktok: true,
          whatsapp: true,
          x: true,
        }
      }),
      prisma.program.findMany({
        where: { clientId: params.clientId },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          description: true,
          startTime: true,
          endTime: true,
          weekDays: true,
        },
        orderBy: { startTime: 'asc' }
      }),
      prisma.news.findMany({
        where: { clientId: params.clientId },
        select: {
          id: true,
          name: true,
          slug: true,
          shortText: true,
          imageUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.rankingVideo.findMany({
        where: { clientId: params.clientId },
        select: {
          id: true,
          name: true,
          videoUrl: true,
          description: true,
          order: true,
        },
        orderBy: { order: 'asc' }
      }),
      prisma.sponsor.findMany({
        where: { clientId: params.clientId },
        select: {
          id: true,
          name: true,
          logoUrl: true,
          description: true,
          website: true,
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.promotion.findMany({
        where: { clientId: params.clientId },
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          link: true,
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.podcast.findMany({
        where: { clientId: params.clientId },
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          audioUrl: true,
          videoUrl: true,
          fileType: true,
          duration: true,
          episodeNumber: true,
          season: true,
          createdAt: true,
        },
        orderBy: [
          { episodeNumber: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 10
      })
    ])

    // Parse weekDays JSON for programs
    const parsedPrograms = programs.map(program => ({
      ...program,
      weekDays: JSON.parse(program.weekDays)
    }))

    const response = {
      client: {
        id: client.id,
        name: client.name
      },
      basicData,
      socialNetworks,
      programs: parsedPrograms,
      news,
      videos,
      sponsors,
      promotions,
      podcasts
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching client data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
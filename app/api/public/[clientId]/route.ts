import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleCors, createCorsResponse, createCorsErrorResponse } from '@/lib/cors'

export async function OPTIONS() {
  return handleCors()
}

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { clientId } = params

    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true }
    })

    if (!client) {
      return createCorsErrorResponse('Cliente no encontrado', 404)
    }

    // Obtener todos los datos del cliente
    const [basicData, socialNetworks, programs, news, videos, sponsors, promotions, [podcasts, videocasts]] = await Promise.all([
      prisma.basicData.findUnique({
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
      }),
      prisma.socialNetworks.findUnique({
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
      }),
      prisma.program.findMany({
        where: { clientId },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          description: true,
          startTime: true,
          endTime: true,
          weekDays: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { startTime: 'asc' }
      }),
      prisma.news.findMany({
        where: { clientId },
        select: {
          id: true,
          name: true,
          slug: true,
          shortText: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.rankingVideo.findMany({
        where: { clientId },
        select: {
          id: true,
          name: true,
          videoUrl: true,
          description: true,
          order: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { order: 'asc' }
      }),
      prisma.sponsor.findMany({
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
        }
      }),
      prisma.promotion.findMany({
        where: { clientId },
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          link: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      Promise.all([
        // Podcasts (audio)
        prisma.podcast.findMany({
          where: { 
            clientId,
            fileType: 'audio'
          },
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            audioUrl: true,
            duration: true,
            episodeNumber: true,
            season: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: [
            { episodeNumber: 'desc' },
            { createdAt: 'desc' }
          ],
          take: 10
        }),
        // Videocasts (video)
        prisma.podcast.findMany({
          where: { 
            clientId,
            fileType: 'video'
          },
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            videoUrl: true,
            duration: true,
            episodeNumber: true,
            season: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: [
            { episodeNumber: 'desc' },
            { createdAt: 'desc' }
          ],
          take: 10
        })
      ])
    ])

    // Procesar weekDays para programs
    const processedPrograms = programs.map(program => ({
      ...program,
      weekDays: typeof program.weekDays === 'string' ? JSON.parse(program.weekDays) : program.weekDays
    }))

    return createCorsResponse({
      client,
      basicData,
      socialNetworks,
      programs: processedPrograms,
      news,
      videos,
      sponsors,
      promotions,
      podcasts,
      videocasts
    })

  } catch (error) {
    console.error('Error getting client data:', error)
    return createCorsErrorResponse('Error interno del servidor', 500)
  }
}
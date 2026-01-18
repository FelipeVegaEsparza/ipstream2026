import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEffectiveClient } from '@/lib/getEffectiveClient'
import { redirect } from 'next/navigation'
import { PlaylistDetail } from '@/components/dashboard/streaming/PlaylistDetail'

export default async function PlaylistDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const effectiveClient = await getEffectiveClient()
  
  if (!session?.user || !effectiveClient) {
    redirect('/auth/login')
  }

  // Obtener playlist con sus items
  const playlist = await prisma.playlist.findFirst({
    where: {
      id: params.id,
      clientId: effectiveClient.clientId,
    },
    include: {
      items: {
        include: {
          audioFile: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!playlist) {
    redirect('/dashboard/streaming/playlists')
  }

  // Obtener archivos de audio disponibles (que no están en esta playlist)
  const availableAudioFiles = await prisma.audioFile.findMany({
    where: {
      clientId: effectiveClient.clientId,
      status: 'ready',
      NOT: {
        playlistItems: {
          some: {
            playlistId: params.id,
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calcular duración total
  const totalDuration = playlist.items.reduce((sum, item) => sum + item.audioFile.duration, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {playlist.name}
        </h1>
        <p className="text-gray-400">
          {playlist.description || 'Gestiona las canciones de esta playlist'}
        </p>
      </div>

      <PlaylistDetail
        playlist={playlist}
        availableAudioFiles={availableAudioFiles}
        totalDuration={totalDuration}
      />
    </div>
  )
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEffectiveClient } from '@/lib/getEffectiveClient'
import { PlaylistsManager } from '@/components/dashboard/streaming/PlaylistsManager'
import { redirect } from 'next/navigation'

export default async function PlaylistsPage() {
  const session = await getServerSession(authOptions)
  const effectiveClient = await getEffectiveClient()
  
  if (!session?.user || !effectiveClient) {
    redirect('/auth/login')
  }

  // Obtener playlists
  const playlists = await prisma.playlist.findMany({
    where: { clientId: effectiveClient.clientId },
    include: {
      items: {
        include: {
          audioFile: true,
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: [
      { isMain: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  // Calcular duración total de cada playlist
  const playlistsWithDuration = playlists.map(playlist => {
    const totalDuration = playlist.items.reduce(
      (sum, item) => sum + (item.audioFile.duration || 0),
      0
    )
    return {
      ...playlist,
      totalDuration,
      songCount: playlist.items.length,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Playlists</h1>
        <p className="text-gray-400">Organiza tu música en playlists</p>
      </div>

      <PlaylistsManager playlists={playlistsWithDuration} />
    </div>
  )
}

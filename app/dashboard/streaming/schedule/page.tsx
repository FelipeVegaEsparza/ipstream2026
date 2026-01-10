import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEffectiveClient } from '@/lib/getEffectiveClient'
import { ScheduleManager } from '@/components/dashboard/streaming/ScheduleManager'
import { redirect } from 'next/navigation'

export default async function SchedulePage() {
  const session = await getServerSession(authOptions)
  const effectiveClient = await getEffectiveClient()
  
  if (!session?.user || !effectiveClient) {
    redirect('/auth/login')
  }

  // Obtener schedules
  const schedules = await prisma.schedule.findMany({
    where: { clientId: effectiveClient.clientId },
    include: {
      playlist: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' },
    ],
  })

  // Obtener playlists disponibles
  const playlists = await prisma.playlist.findMany({
    where: { clientId: effectiveClient.clientId },
    select: {
      id: true,
      name: true,
      type: true,
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Programación Horaria</h1>
        <p className="text-gray-400">Programa diferentes playlists según día y hora</p>
      </div>

      <ScheduleManager schedules={schedules} playlists={playlists} />
    </div>
  )
}

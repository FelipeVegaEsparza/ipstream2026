import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEffectiveClient } from '@/lib/getEffectiveClient'
import { StreamStats } from '@/components/dashboard/streaming/StreamStats'
import { redirect } from 'next/navigation'

export default async function StatsPage() {
  const session = await getServerSession(authOptions)
  const effectiveClient = await getEffectiveClient()
  
  if (!session?.user || !effectiveClient) {
    redirect('/auth/login')
  }

  // Obtener última estadística
  const latestStat = await prisma.streamStats.findFirst({
    where: { clientId: effectiveClient.clientId },
    orderBy: { timestamp: 'desc' },
  })

  // Obtener pico del día
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayStats = await prisma.streamStats.findMany({
    where: {
      clientId: effectiveClient.clientId,
      timestamp: { gte: today },
    },
    orderBy: { listeners: 'desc' },
    take: 1,
  })

  const peakToday = todayStats.length > 0 ? todayStats[0].listeners : 0

  // Obtener estadísticas de últimas 24 horas
  const last24h = new Date()
  last24h.setHours(last24h.getHours() - 24)

  const last24hStats = await prisma.streamStats.findMany({
    where: {
      clientId: effectiveClient.clientId,
      timestamp: { gte: last24h },
    },
    orderBy: { timestamp: 'asc' },
    select: {
      timestamp: true,
      listeners: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Estadísticas</h1>
        <p className="text-gray-400">Analiza el rendimiento de tu radio</p>
      </div>

      <StreamStats
        latestStat={latestStat}
        peakToday={peakToday}
        last24hStats={last24hStats}
      />
    </div>
  )
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEffectiveClient } from '@/lib/getEffectiveClient'
import { TimeAnnouncementsManager } from '@/components/dashboard/streaming/TimeAnnouncementsManager'
import { redirect } from 'next/navigation'

export default async function TimeAnnouncementsPage() {
  const session = await getServerSession(authOptions)
  const effectiveClient = await getEffectiveClient()
  
  if (!session?.user || !effectiveClient) {
    redirect('/auth/login')
  }

  // Obtener locuciones del cliente
  const announcements = await prisma.timeAnnouncement.findMany({
    where: { clientId: effectiveClient.clientId },
    orderBy: { createdAt: 'desc' },
  })

  // Obtener configuración
  const config = await prisma.announcementConfig.findUnique({
    where: { clientId: effectiveClient.clientId },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Locuciones de Hora</h1>
        <p className="text-gray-400">
          Configura locuciones que se reproducirán automáticamente cada X canciones
        </p>
      </div>

      <TimeAnnouncementsManager 
        announcements={JSON.parse(JSON.stringify(announcements))} 
        config={config ? JSON.parse(JSON.stringify(config)) : null}
      />
    </div>
  )
}

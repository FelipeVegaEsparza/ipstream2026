import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ImpersonationBanner } from '@/components/ImpersonationBanner'
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  // Permitir acceso si es CLIENT o si es ADMIN (para impersonación)
  if (session.user.role !== 'CLIENT' && session.user.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-900">
        <ImpersonationBanner />
        <DashboardLayoutClient user={session.user}>
          {children}
        </DashboardLayoutClient>
      </div>
    </SessionProvider>
  )
}
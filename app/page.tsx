import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function HomePage() {
  const headersList = headers()
  const userAgent = headersList.get('user-agent')

  // Health check for Docker/monitoring services
  if (userAgent && (userAgent.includes('docker/healthcheck') || userAgent.includes('UptimeRobot'))) {
    return <p>OK</p>;
  }

  // Redirect logic for real users
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }
  
  if (session.user.role === 'ADMIN') {
    redirect('/admin')
  } else {
    redirect('/dashboard')
  }
}
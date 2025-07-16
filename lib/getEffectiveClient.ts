import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cookies } from 'next/headers'

export interface EffectiveClientData {
  clientId: string
  isImpersonating: boolean
  impersonationData?: {
    adminId: string
    adminEmail: string
    clientId: string
    clientUserId: string
    clientEmail: string
    clientName: string
    timestamp: number
    expires: number
  }
}

export async function getEffectiveClient(): Promise<EffectiveClientData | null> {
  const session = await getServerSession(authOptions)
  const cookieStore = cookies()
  
  if (!session?.user) {
    return null
  }

  // Verificar si hay impersonación activa
  const impersonationToken = cookieStore.get('impersonation_token')?.value
  let effectiveClientId = session.user.clientId
  let isImpersonating = false
  let impersonationData = null

  if (impersonationToken && session.user.role === 'ADMIN') {
    try {
      const decoded = JSON.parse(Buffer.from(impersonationToken, 'base64').toString())
      if (Date.now() < decoded.expires) {
        effectiveClientId = decoded.clientId
        isImpersonating = true
        impersonationData = decoded
      }
    } catch (error) {
      console.error('Error decoding impersonation token:', error)
    }
  }
  
  if (!effectiveClientId) {
    return null
  }

  return {
    clientId: effectiveClientId,
    isImpersonating,
    impersonationData
  }
}
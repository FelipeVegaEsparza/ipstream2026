import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Verificar impersonación en rutas del dashboard
    if (pathname.startsWith('/dashboard')) {
      const impersonationToken = req.cookies.get('impersonation_token')?.value

      if (impersonationToken && token?.role === 'ADMIN') {
        try {
          const impData = JSON.parse(Buffer.from(impersonationToken, 'base64').toString())

          // Verificar que el token no haya expirado
          if (Date.now() < impData.expires) {
            // Crear una respuesta que incluya headers de impersonación
            const response = NextResponse.next()
            response.headers.set('x-impersonation-active', 'true')
            response.headers.set('x-impersonation-client-id', impData.clientId)
            response.headers.set('x-impersonation-client-email', impData.clientEmail)
            return response
          } else {
            // Token expirado, limpiar cookie
            const response = NextResponse.next()
            response.cookies.delete('impersonation_token')
            return response
          }
        } catch (error) {
          console.error('Error parsing impersonation token:', error)
          const response = NextResponse.next()
          response.cookies.delete('impersonation_token')
          return response
        }
      }
    }

    // Verificar acceso a rutas de admin
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Verificar acceso a rutas de dashboard
    if (pathname.startsWith('/dashboard')) {
      if (!token || (token.role !== 'CLIENT' && token.role !== 'ADMIN')) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Permitir acceso a páginas públicas
        if (pathname.startsWith('/auth') || pathname === '/') {
          return true
        }

        // Requerir autenticación para todas las demás rutas
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/dashboard/:path*',
    '/api/admin/:path*'
  ]
}
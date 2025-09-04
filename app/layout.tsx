import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DirectoryInitializer } from '@/components/providers/DirectoryInitializer'

import AuthSessionProvider from '@/components/providers/AuthSessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IPStream Panel',
  description: 'Panel de gestión de contenido para radio y streaming',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthSessionProvider>
          <DirectoryInitializer />
          {children}
          {/* Script global para sanitizar texto pegado */}
          <script src="/text-sanitizer.js" async></script>
        </AuthSessionProvider>
      </body>
    </html>
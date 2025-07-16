import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import { NewsList } from '@/components/dashboard/NewsList'

export default async function NewsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user.clientId) {
    return <div>Error: No se encontró información del cliente</div>
  }

  const news = await prisma.news.findMany({
    where: { clientId: session.user.clientId },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Noticias
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona las noticias de tu radio
          </p>
        </div>
        <Link
          href="/dashboard/news/new"
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Noticia
        </Link>
      </div>

      <NewsList news={news} />
    </div>
  )
}
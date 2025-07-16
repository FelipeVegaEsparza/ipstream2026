import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { UserForm } from '@/components/admin/UserForm'

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return <div>Error: Acceso no autorizado</div>
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      client: true
    }
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Editar Usuario
        </h1>
        <p className="text-gray-400">
          Modifica la información del usuario y su proyecto
        </p>
      </div>

      <div className="card max-w-2xl">
        <UserForm initialData={user} />
      </div>
    </div>
  )
}
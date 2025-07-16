import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().optional(),
  clientName: z.string().min(1, 'El nombre del proyecto es requerido'),
  plan: z.string().default('basic'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        client: {
          include: {
            _count: {
              select: {
                programs: true,
                news: true,
                rankingVideos: true,
                sponsors: true,
                promotions: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = updateUserSchema.parse(body)

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: { client: true }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el email no esté en uso por otro usuario
    if (data.email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email: data.email }
      })

      if (emailInUse) {
        return NextResponse.json(
          { error: 'El email ya está en uso' },
          { status: 400 }
        )
      }
    }

    // Preparar datos de actualización
    const updateData: any = {
      name: data.name,
      email: data.email,
    }

    // Solo actualizar contraseña si se proporciona
    if (data.password && data.password.length > 0) {
      updateData.password = await bcrypt.hash(data.password, 12)
    }

    // Actualizar usuario y cliente en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar usuario
      const user = await tx.user.update({
        where: { id: params.id },
        data: updateData
      })

      // Actualizar cliente si existe
      let client = null
      if (existingUser.client) {
        client = await tx.client.update({
          where: { id: existingUser.client.id },
          data: {
            name: data.clientName,
            plan: data.plan
          }
        })
      }

      return { user, client }
    })

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        client: result.client
      }
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { client: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // No permitir eliminar administradores
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'No se puede eliminar un administrador' },
        { status: 400 }
      )
    }

    // Eliminar usuario (el cliente se elimina automáticamente por CASCADE)
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: 'Usuario eliminado exitosamente' 
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
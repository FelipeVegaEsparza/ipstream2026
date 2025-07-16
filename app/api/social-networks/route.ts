import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { socialNetworksSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user.clientId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = socialNetworksSchema.parse(body)

    const socialNetworks = await prisma.socialNetworks.create({
      data: {
        ...data,
        clientId: session.user.clientId,
      }
    })

    return NextResponse.json(socialNetworks)
  } catch (error) {
    console.error('Error creating social networks:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user.clientId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = socialNetworksSchema.parse(body)

    const socialNetworks = await prisma.socialNetworks.upsert({
      where: {
        clientId: session.user.clientId,
      },
      update: data,
      create: {
        ...data,
        clientId: session.user.clientId,
      }
    })

    return NextResponse.json(socialNetworks)
  } catch (error) {
    console.error('Error updating social networks:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
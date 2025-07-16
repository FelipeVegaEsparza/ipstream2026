import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { basicDataSchema } from '@/lib/validations'

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
    const data = basicDataSchema.parse(body)

    const basicData = await prisma.basicData.create({
      data: {
        ...data,
        clientId: session.user.clientId,
      }
    })

    return NextResponse.json(basicData)
  } catch (error) {
    console.error('Error creating basic data:', error)
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
    const data = basicDataSchema.parse(body)

    const basicData = await prisma.basicData.upsert({
      where: {
        clientId: session.user.clientId,
      },
      update: data,
      create: {
        ...data,
        clientId: session.user.clientId,
      }
    })

    return NextResponse.json(basicData)
  } catch (error) {
    console.error('Error updating basic data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
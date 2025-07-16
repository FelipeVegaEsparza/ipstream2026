import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { programSchema } from '@/lib/validations'

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
    const data = programSchema.parse(body)

    const program = await prisma.program.create({
      data: {
        ...data,
        weekDays: JSON.stringify(data.weekDays),
        clientId: session.user.clientId,
      }
    })

    return NextResponse.json(program)
  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
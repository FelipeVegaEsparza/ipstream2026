import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const programs = await prisma.program.findMany({
      where: { clientId: params.clientId },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        description: true,
        startTime: true,
        endTime: true,
        weekDays: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { startTime: 'asc' }
    })

    // Parse weekDays JSON for each program
    const parsedPrograms = programs.map(program => ({
      ...program,
      weekDays: JSON.parse(program.weekDays)
    }))

    return NextResponse.json(parsedPrograms)
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
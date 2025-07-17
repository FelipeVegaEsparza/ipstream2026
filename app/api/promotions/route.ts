import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { promotionSchema } from '@/lib/validations'
import { getEffectiveClientFromRequest } from '@/lib/getEffectiveClient'

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Creating promotion - Start')
    
    // Usar la función helper para obtener el cliente efectivo
    const effectiveClient = await getEffectiveClientFromRequest(request)
    
    if (!effectiveClient) {
      console.log('🎯 No effective client found')
      return NextResponse.json(
        { error: 'No autorizado - Sin cliente asociado' },
        { status: 401 }
      )
    }

    console.log('🎯 Effective client:', effectiveClient)

    const body = await request.json()
    console.log('🎯 Request body keys:', Object.keys(body))
    
    const data = promotionSchema.parse(body)
    console.log('🎯 Validated data keys:', Object.keys(data))

    console.log('🎯 Creating promotion in database...')
    const promotion = await prisma.promotion.create({
      data: {
        ...data,
        clientId: effectiveClient.clientId,
      }
    })

    console.log('🎯 Promotion created successfully:', promotion.id)
    return NextResponse.json(promotion)
  } catch (error) {
    console.error('🎯 Error creating promotion:', error)
    
    if (error instanceof Error) {
      console.error('🎯 Error message:', error.message)
      console.error('🎯 Error stack:', error.stack)
      
      // Check for specific Prisma errors
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Ya existe una promoción con datos similares' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Cliente no válido' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
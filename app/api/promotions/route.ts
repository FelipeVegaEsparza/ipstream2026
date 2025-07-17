import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { promotionSchema } from '@/lib/validations'
import { getEffectiveClientFromRequest } from '@/lib/getEffectiveClient'
import { sanitizeObject, validateText } from '@/lib/text-sanitizer'

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
    
    // Sanitizar el texto antes de validar
    const sanitizedBody = sanitizeObject(body)
    console.log('🎯 Text sanitized')
    
    // Validar campos de texto críticos
    if (sanitizedBody.title) {
      const titleValidation = validateText(sanitizedBody.title)
      if (!titleValidation.isValid) {
        console.log('🎯 Invalid title text:', titleValidation.error)
        return NextResponse.json(
          { error: `Título de promoción inválido: ${titleValidation.error}` },
          { status: 400 }
        )
      }
    }
    
    if (sanitizedBody.description) {
      const descValidation = validateText(sanitizedBody.description)
      if (!descValidation.isValid) {
        console.log('🎯 Invalid description:', descValidation.error)
        return NextResponse.json(
          { error: `Descripción inválida: ${descValidation.error}` },
          { status: 400 }
        )
      }
    }
    
    const data = promotionSchema.parse(sanitizedBody)
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
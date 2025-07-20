import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user.clientId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se encontró archivo' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg']
    const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/quicktime']
    
    const allowedTypes = [...imageTypes, ...audioTypes, ...videoTypes]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Se permiten imágenes (JPG, PNG, GIF, WebP), audio (MP3, WAV, M4A, AAC) y video (MP4, MOV, AVI, WebM)' },
        { status: 400 }
      )
    }

    // Validar tamaño según tipo de archivo
    let maxSize = 5 * 1024 * 1024 // 5MB para imágenes por defecto
    
    if (audioTypes.includes(file.type)) {
      maxSize = 100 * 1024 * 1024 // 100MB para audio
    } else if (videoTypes.includes(file.type)) {
      maxSize = 500 * 1024 * 1024 // 500MB para video
    }
    
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Máximo ${maxSizeMB}MB para este tipo de archivo` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), 'public', 'uploads', session.user.clientId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${originalName}`
    const filePath = join(uploadDir, fileName)

    // Guardar archivo
    await writeFile(filePath, buffer)

    // Retornar URL pública que apunta a nuestra API
    const publicUrl = `/api/uploads/${session.user.clientId}/${fileName}`

    return NextResponse.json({
      url: publicUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
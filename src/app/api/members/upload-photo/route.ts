import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const memberId = formData.get('memberId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    if (!memberId) {
      return NextResponse.json(
        { error: 'ID du membre non fourni' },
        { status: 400 }
      )
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      )
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux (max 10MB)' },
        { status: 400 }
      )
    }

    // Vérifier si Cloudinary est configuré
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || cloudName === 'your_cloud_name' || !apiKey || apiKey === 'your_api_key' || !apiSecret || apiSecret === 'your_api_secret') {
      // Mode développement : retourner une URL placeholder
      const placeholderUrl = 'https://via.placeholder.com/400x400/cccccc/666666?text=Photo+Membre'

      // Mettre à jour le membre avec l'URL placeholder
      await prisma.membre.update({
        where: { id: memberId },
        data: { imageUrl: placeholderUrl }
      })

      return NextResponse.json({
        success: true,
        secure_url: placeholderUrl,
        public_id: 'placeholder_' + Date.now()
      })
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload vers Cloudinary avec le SDK
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'etu-membres',
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', quality: 'auto', gravity: 'face' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Erreur Cloudinary SDK:', error)
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(buffer)
    })

    const imageUrl = (result as any).secure_url

    // Mettre à jour le membre avec l'URL de l'image
    await prisma.membre.update({
      where: { id: memberId },
      data: { imageUrl }
    })

    return NextResponse.json({
      success: true,
      secure_url: imageUrl,
      public_id: (result as any).public_id
    })

  } catch (error: any) {
    console.error('Erreur lors de l\'upload:', error)

    return NextResponse.json(
      { error: `Erreur lors de l'upload de l'image: ${error.message}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

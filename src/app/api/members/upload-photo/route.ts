import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { PrismaClient } from '@prisma/client'
import { verifySessionToken } from '@/lib/security/session'
import { normalizeUploadedImage } from '@/lib/security/image'
import { rateLimit } from '@/lib/security/http'

const prisma = new PrismaClient()

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'member-photo-upload', 6, 60 * 60 * 1000)
  if (limited) return limited
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const memberId = formData.get('memberId') as string
    const uploadToken = formData.get('uploadToken')

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

    const uploadSession = await verifySessionToken(typeof uploadToken === 'string' ? uploadToken : undefined, 'upload')
    if (!uploadSession || uploadSession.sub !== memberId) {
      return NextResponse.json({ error: 'Autorisation de téléversement invalide ou expirée' }, { status: 403 })
    }

    const buffer = await normalizeUploadedImage(file, { maxBytes: 5 * 1024 * 1024, width: 400, height: 400, fit: 'cover' })

    // Vérifier si Cloudinary est configuré
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || cloudName === 'your_cloud_name' || !apiKey || apiKey === 'your_api_key' || !apiSecret || apiSecret === 'your_api_secret') {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Service de téléversement indisponible' }, { status: 503 })
      }
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

    // Upload vers Cloudinary avec le SDK
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'etu-membres',
          resource_type: 'image',
          format: 'jpg',
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
      { error: "Impossible de traiter l'image" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

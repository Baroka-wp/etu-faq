import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/security/http'
import { normalizeUploadedImage } from '@/lib/security/image'

const prisma = new PrismaClient()

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    // Récupérer l'ID du membre depuis le cookie
    const membreId = (await getSession(request, 'membre'))?.sub

    if (!membreId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier que le membre existe et est actif
    const membreExistant = await prisma.membre.findUnique({
      where: { id: membreId }
    })

    if (!membreExistant) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    if (membreExistant.statut !== 'actif') {
      return NextResponse.json(
        { error: 'Votre compte est suspendu. Veuillez contacter l\'administrateur.' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    const buffer = await normalizeUploadedImage(file, { maxBytes: 5 * 1024 * 1024, width: 400, height: 400, fit: 'cover' })

    let imageUrl: string

    // Vérifier si Cloudinary est configuré
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Service de téléversement indisponible' }, { status: 503 })
      }
      // Mode développement : retourner une URL placeholder
      imageUrl = 'https://via.placeholder.com/400x400/cccccc/666666?text=Photo+de+profil'
    } else {
      // Upload vers Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'etu-membres',
            resource_type: 'image',
            format: 'jpg',
            transformation: [
              { width: 400, height: 400, crop: 'fill', quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      })

      imageUrl = result.secure_url
    }

    // Mettre à jour le membre avec la nouvelle image
    await prisma.membre.update({
      where: { id: membreId },
      data: { imageUrl }
    })

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Photo de profil mise à jour avec succès'
    })

  } catch (error: any) {
    console.error('❌ Erreur lors de l\'upload:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'upload' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

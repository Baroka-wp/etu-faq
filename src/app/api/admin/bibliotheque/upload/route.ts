import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { normalizeUploadedImage } from '@/lib/security/image'
import { getAuthorizedAdmin } from '@/lib/security/admin'

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    const buffer = await normalizeUploadedImage(file, { maxBytes: 5 * 1024 * 1024, width: 800, height: 1200, fit: 'inside' })

    // Vérifier si Cloudinary est configuré
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || cloudName === 'your_cloud_name' || !apiKey || apiKey === 'your_api_key' || !apiSecret || apiSecret === 'your_api_secret') {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Service de téléversement indisponible' }, { status: 503 })
      }
      // Mode développement : retourner une URL placeholder
      return NextResponse.json({
        success: true,
        secure_url: 'https://via.placeholder.com/400x600/cccccc/666666?text=Image+de+couverture',
        public_id: 'placeholder_' + Date.now()
      })
    }

    // Upload vers Cloudinary avec le SDK
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'etu-bibliotheque',
          resource_type: 'image',
          format: 'jpg',
          transformation: [
            { width: 400, height: 600, crop: 'fit', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Erreur Cloudinary SDK:', error)
            reject(error)
          } else {
            console.log('✅ Upload Cloudinary SDK réussi:', result?.public_id)
            resolve(result)
          }
        }
      ).end(buffer)
    })

    return NextResponse.json({
      success: true,
      secure_url: (result as any).secure_url,
      public_id: (result as any).public_id
    })

  } catch (error: any) {
    console.error('❌ Erreur lors de l\'upload:', error)
    
    return NextResponse.json(
      { error: "Impossible de traiter l'image" },
      { status: 500 }
    )
  }
}

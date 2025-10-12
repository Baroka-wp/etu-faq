import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

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
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
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

    console.log('🔍 Debug Cloudinary config:')
    console.log('- Cloud Name:', cloudName)
    console.log('- API Key:', apiKey ? '***' + apiKey.slice(-4) : 'undefined')
    console.log('- API Secret:', apiSecret ? '***' + apiSecret.slice(-4) : 'undefined')

    if (!cloudName || cloudName === 'your_cloud_name' || !apiKey || apiKey === 'your_api_key' || !apiSecret || apiSecret === 'your_api_secret') {
      console.log('⚠️ Cloudinary non configuré, utilisation du mode placeholder')
      // Mode développement : retourner une URL placeholder
      return NextResponse.json({
        success: true,
        secure_url: 'https://via.placeholder.com/400x600/cccccc/666666?text=Image+de+couverture',
        public_id: 'placeholder_' + Date.now()
      })
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('🚀 Upload vers Cloudinary avec SDK...')
    console.log('📤 Fichier:', file.name, file.size, file.type)

    // Upload vers Cloudinary avec le SDK
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'etu-bibliotheque',
          resource_type: 'auto',
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
      { error: `Erreur lors de l'upload de l'image: ${error.message}` },
      { status: 500 }
    )
  }
}

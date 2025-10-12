import { NextRequest, NextResponse } from 'next/server'

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

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload vers Cloudinary
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', new Blob([buffer], { type: file.type }))
    cloudinaryFormData.append('upload_preset', 'etu_bibliotheque')
    cloudinaryFormData.append('folder', 'etu-bibliotheque')

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData
      }
    )

    if (!cloudinaryResponse.ok) {
      throw new Error('Erreur lors de l\'upload vers Cloudinary')
    }

    const cloudinaryData = await cloudinaryResponse.json()

    return NextResponse.json({
      success: true,
      secure_url: cloudinaryData.secure_url,
      public_id: cloudinaryData.public_id
    })

  } catch (error: any) {
    console.error('Erreur lors de l\'upload:', error)
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de l\'image' },
      { status: 500 }
    )
  }
}

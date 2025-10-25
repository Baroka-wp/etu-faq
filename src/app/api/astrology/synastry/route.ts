import { NextRequest, NextResponse } from 'next/server'

const KERYKEION_API_URL = 'https://fictional-dollop-lje2.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des champs requis
    const requiredFields = ['person1', 'person2']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Champs manquants: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Validation des données des personnes
    const personFields = ['name', 'year', 'month', 'day', 'hour', 'minute', 'city', 'nation']
    for (const person of [body.person1, body.person2]) {
      const missingPersonFields = personFields.filter(field => !person[field])
      if (missingPersonFields.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Champs manquants pour ${person.name || 'une personne'}: ${missingPersonFields.join(', ')}` 
          },
          { status: 400 }
        )
      }
    }

    // Préparation des données pour l'API Kerykeion
    const kerykeionPayload = {
      person1: body.person1,
      person2: body.person2,
      language: body.language || 'FR',
      theme: body.theme || 'classic'
    }

    // Appel à l'API Kerykeion
    const response = await fetch(`${KERYKEION_API_URL}/api/synastry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(kerykeionPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erreur API Kerykeion:', errorText)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de l\'appel à l\'API Kerykeion',
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (!data.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'L\'API Kerykeion a retourné une erreur',
          details: data
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data.data,
      svg_base64: data.svg_base64,
      file_name: data.file_name,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur dans l\'API route:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

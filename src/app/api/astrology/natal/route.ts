import { NextRequest, NextResponse } from 'next/server'

const KERYKEION_API_URL = 'https://fictional-dollop-lje2.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des champs requis
    const requiredFields = ['name', 'year', 'month', 'day', 'hour', 'minute', 'city', 'nation']
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

    // Préparation des données pour l'API Kerykeion
    const kerykeionPayload = {
      name: body.name,
      year: body.year,
      month: body.month,
      day: body.day,
      hour: body.hour,
      minute: body.minute,
      city: body.city,
      nation: body.nation,
      theme: body.theme || 'classic',
      language: body.language || 'FR',
      zodiac_type: body.zodiac_type || 'Tropic',
      houses_system: body.houses_system || 'P',
      perspective_type: 'Apparent Geocentric'
    }

    // Appel à l'API Kerykeion
    const response = await fetch(`${KERYKEION_API_URL}/api/natal`, {
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

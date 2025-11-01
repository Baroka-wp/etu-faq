'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Sparkles, FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'
import AdminSidebar from '@/components/AdminSidebar'
import { getPlanetSymbol, getZodiacSymbol, getZodiacName, getSpiritualGuidance, getPersonalityAnalysis, getProgressGuidance, normalizePlanetName, getPlanetNameFrench, getPlanetDisplayOrder } from '@/utils/astrologyInterpretations'

interface NatalChartData {
    basic_info: {
        name: string
        birth_date: string
        birth_time: string
        location: string
        coordinates: {
            longitude: number
            latitude: number
        }
    }
    planets: Record<string, any>
    houses: Record<string, any>
    interpretations: Record<string, any>
    svg: {
        base64: string
        filename: string
        generated: boolean
    }
}

export default function ResultatsPage() {
    const router = useRouter()
    const [chartData, setChartData] = useState<NatalChartData | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('carte-du-ciel')
    const [interpretationTab, setInterpretationTab] = useState('spiritual')

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST'
            })
            router.push('/login')
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error)
        }
    }

    useEffect(() => {
        // Récupérer les données depuis le localStorage uniquement
        const savedData = localStorage.getItem('astrology-chart-data')
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData)
                
                // DEBUG: Afficher la structure complète des données pour comprendre comment l'Ascendant est nommé
                console.log('=== STRUCTURE DES DONNÉES COMPLÈTES ===')
                console.log('ChartData:', parsedData)
                console.log('Planets keys:', Object.keys(parsedData?.planets || {}))
                console.log('Planets values:', Object.values(parsedData?.planets || {}))
                
                // Chercher spécifiquement l'Ascendant dans toutes les formes possibles
                const planets = parsedData?.planets || {}
                console.log('=== RECHERCHE ASCENDANT ===')
                console.log('Toutes les clés de planets:', Object.keys(planets))
                console.log('Tous les planet_name:', Object.values(planets).map((p: any) => p?.planet_name))
                
                // Chercher toutes les variantes possibles
                Object.entries(planets).forEach(([key, planet]: [string, any]) => {
                    const name = planet?.planet_name || ''
                    if (name.toLowerCase().includes('asc') || 
                        name.toLowerCase().includes('ac') || 
                        key.toLowerCase().includes('asc') ||
                        key.toLowerCase().includes('ac')) {
                        console.log(`✅ ASCENDANT TROUVÉ: key="${key}", planet_name="${name}", planet=`, planet)
                    }
                })
                
                // Chercher aussi dans d'autres objets possibles
                if (parsedData?.houses) {
                    console.log('Houses keys:', Object.keys(parsedData.houses))
                }
                if (parsedData?.basic_info) {
                    console.log('Basic info:', parsedData.basic_info)
                }
                
                // Afficher la structure complète pour comprendre
                console.log('Structure complète de la réponse API:', JSON.stringify(parsedData, null, 2))
                
                setChartData(parsedData)
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error)
                toast.error('Données de carte invalides')
                router.push('/admin/carte-du-ciel')
            }
        } else {
            toast.error('Aucune carte trouvée. Veuillez générer une nouvelle carte.')
            router.push('/admin/carte-du-ciel')
        }
        setLoading(false)
    }, [router])

    const handleBackToForm = () => {
        router.push('/admin/carte-du-ciel')
    }

    const handleDownload = () => {
        if (chartData?.svg.base64) {
            try {
                const svgContent = atob(chartData.svg.base64)
                const blob = new Blob([svgContent], { type: 'image/svg+xml' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = chartData.svg.filename || 'carte-du-ciel.svg'
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Carte téléchargée avec succès!')
            } catch (error) {
                console.error('Erreur lors du téléchargement:', error)
                toast.error('Erreur lors du téléchargement de la carte')
            }
        }
    }

    const generatePDF = async () => {
        if (!chartData) return
        
        setLoading(true)
        toast.loading('Génération du PDF en cours...', { id: 'pdf-generation' })
        
        try {
            // Attendre un peu pour que le DOM soit complètement chargé
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const margin = 15
            let yPosition = margin
            
            // Fonction pour ajouter une nouvelle page si nécessaire
            const checkNewPage = (requiredHeight: number) => {
                if (yPosition + requiredHeight > pageHeight - margin) {
                    pdf.addPage()
                    yPosition = margin
                }
            }
            
            // Fonction pour ajouter une ligne horizontale
            const addHorizontalLine = () => {
                pdf.setDrawColor(200, 200, 200)
                pdf.setLineWidth(0.1)
                pdf.line(margin, yPosition, pageWidth - margin, yPosition)
                yPosition += 5
            }
            
            // En-tête avec style
            pdf.setFillColor(245, 245, 250)
            pdf.rect(0, 0, pageWidth, 40, 'F')
            
            pdf.setFontSize(22)
            pdf.setTextColor(30, 30, 30)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Votre Carte du Ciel', pageWidth / 2, yPosition + 8, { align: 'center' })
            yPosition += 12
            
            pdf.setFontSize(14)
            pdf.setTextColor(50, 50, 50)
            pdf.setFont('helvetica', 'bold')
            pdf.text(chartData.basic_info.name, pageWidth / 2, yPosition, { align: 'center' })
            yPosition += 7
            
            pdf.setFontSize(11)
            pdf.setTextColor(100, 100, 100)
            pdf.setFont('helvetica', 'normal')
            pdf.text(`Né(e) le ${chartData.basic_info.birth_date} à ${chartData.basic_info.birth_time}`, pageWidth / 2, yPosition, { align: 'center' })
            yPosition += 6
            pdf.text(chartData.basic_info.location, pageWidth / 2, yPosition, { align: 'center' })
            yPosition += 15
            
            // Carte SVG - Convertir et ajouter l'image avec meilleure qualité
            if (chartData.svg.base64) {
                checkNewPage(100)
                
                try {
                    let imgData: string | null = null
                    let imgWidth = 0
                    let imgHeight = 0
                    
                    // Attendre que l'image soit chargée dans le DOM
                    await new Promise(resolve => setTimeout(resolve, 300))
                    
                    // Méthode 1: Essayer de capturer depuis le DOM avec html2canvas
                    const chartImageElement = document.querySelector('#carte-du-ciel-svg') as HTMLImageElement
                    
                    if (chartImageElement) {
                        try {
                            // Attendre que l'image soit complètement chargée
                            if (!chartImageElement.complete) {
                                await new Promise((resolve) => {
                                    chartImageElement.onload = () => resolve(null)
                                    chartImageElement.onerror = () => resolve(null)
                                    setTimeout(() => resolve(null), 1000)
                                })
                            }
                            
                            // Utiliser html2canvas pour capturer l'image depuis le DOM
                            const container = chartImageElement.parentElement
                            if (container) {
                                const canvas = await html2canvas(container, {
                                    backgroundColor: '#ffffff',
                                    scale: 2,
                                    useCORS: true,
                                    logging: false,
                                    allowTaint: true,
                                    width: chartImageElement.offsetWidth || 800,
                                    height: chartImageElement.offsetHeight || 800
                                })
                                
                                imgData = canvas.toDataURL('image/png', 1.0)
                                imgWidth = (canvas.width * 0.264583)
                                imgHeight = (canvas.height * 0.264583)
                            }
                        } catch (error) {
                            console.log('Erreur html2canvas, utilisation du fallback:', error)
                        }
                    }
                    
                    // Méthode 2: Fallback - Créer une image depuis le base64 SVG directement
                    if (!imgData) {
                        await new Promise((resolve) => {
                            const img = new Image()
                            
                            img.onload = () => {
                                try {
                                    const canvas = document.createElement('canvas')
                                    // Dimensions par défaut pour les SVG
                                    const defaultSize = 1200
                                    canvas.width = img.naturalWidth || img.width || defaultSize
                                    canvas.height = img.naturalHeight || img.height || defaultSize
                                    
                                    const ctx = canvas.getContext('2d')
                                    if (ctx) {
                                        // Fond blanc
                                        ctx.fillStyle = '#ffffff'
                                        ctx.fillRect(0, 0, canvas.width, canvas.height)
                                        
                                        // Dessiner l'image SVG
                                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                                        
                                        imgData = canvas.toDataURL('image/png', 1.0)
                                        imgWidth = (canvas.width * 0.264583)
                                        imgHeight = (canvas.height * 0.264583)
                                        
                                        console.log('Image SVG convertie:', { imgWidth, imgHeight })
                                    }
                                } catch (error) {
                                    console.error('Erreur lors de la conversion SVG:', error)
                                }
                                resolve(null)
                            }
                            
                            img.onerror = (error) => {
                                console.error('Erreur lors du chargement de l\'image SVG:', error)
                                resolve(null)
                            }
                            
                            // Charger l'image depuis le base64
                            const svgDataUrl = `data:image/svg+xml;base64,${chartData.svg.base64}`
                            img.src = svgDataUrl
                        })
                    }
                    
                    // Ajouter l'image au PDF si disponible
                    if (imgData && imgWidth > 0 && imgHeight > 0) {
                        // Dimensions de l'image pour le PDF
                        const maxWidth = pageWidth - 2 * margin
                        const maxHeight = 160 // mm
                        
                        // Calculer les dimensions pour s'adapter à la page
                        const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight)
                        const finalWidth = imgWidth * scale
                        const finalHeight = imgHeight * scale
                        
                        checkNewPage(finalHeight + 25)
                        
                        // Titre de la section avec style
                        pdf.setFontSize(18)
                        pdf.setTextColor(30, 30, 30)
                        pdf.setFont('helvetica', 'bold')
                        pdf.text('Votre Thème Astral', pageWidth / 2, yPosition, { align: 'center' })
                        yPosition += 12
                        
                        // Cadre décoratif autour de l'image
                        pdf.setDrawColor(180, 180, 180)
                        pdf.setFillColor(250, 250, 250)
                        pdf.setLineWidth(0.5)
                        const imgX = (pageWidth - finalWidth) / 2
                        const imgY = yPosition
                        pdf.rect(imgX - 3, imgY - 3, finalWidth + 6, finalHeight + 6, 'FD')
                        
                        // Ajouter l'image
                        pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight)
                        yPosition += finalHeight + 20
                        
                        console.log('Image ajoutée au PDF avec succès')
                    } else {
                        console.warn('Image SVG non disponible pour le PDF')
                        // Ajouter un message si l'image n'est pas disponible
                        pdf.setFontSize(12)
                        pdf.setTextColor(150, 150, 150)
                        pdf.setFont('helvetica', 'italic')
                        pdf.text('Carte astrologique non disponible dans ce PDF', pageWidth / 2, yPosition, { align: 'center' })
                        yPosition += 15
                    }
                } catch (error) {
                    console.error('Erreur lors du traitement de la carte SVG:', error)
                    // Continuer même si l'image ne peut pas être ajoutée
                }
            }
            
            // Section Planètes et Maisons avec style
            checkNewPage(70)
            
            addHorizontalLine()
            
            pdf.setFillColor(250, 250, 255)
            pdf.rect(margin - 5, yPosition - 3, pageWidth - 2 * margin + 10, 12, 'F')
            
            pdf.setFontSize(16)
            pdf.setTextColor(30, 30, 30)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Planètes et Maisons', pageWidth / 2, yPosition + 8, { align: 'center' })
            yPosition += 12
            
            // Sous-section Planètes
            pdf.setFontSize(12)
            pdf.setTextColor(100, 100, 150)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Planètes', margin, yPosition)
            yPosition += 8
            
            pdf.setFontSize(10)
            pdf.setTextColor(60, 60, 60)
            pdf.setFont('helvetica', 'normal')
            
            const planetsArray = Object.entries(chartData.planets).map(([key, planet]: [string, any]) => ({
                key,
                planet,
                frenchName: getPlanetNameFrench(planet.planet_name)
            }))
            
            const displayOrder = getPlanetDisplayOrder()
            planetsArray.sort((a, b) => {
                const indexA = displayOrder.indexOf(a.frenchName)
                const indexB = displayOrder.indexOf(b.frenchName)
                if (indexA !== -1 && indexB !== -1) return indexA - indexB
                if (indexA !== -1) return -1
                if (indexB !== -1) return 1
                return 0
            })
            
            planetsArray.forEach(({ planet, frenchName }) => {
                checkNewPage(7)
                const houseNumber = planet.house ? planet.house.split(' ')[1] : ''
                // Format: Symbole | Nom | Signe Position | Maison
                const symbol = getPlanetSymbol(planet.planet_name)
                const zodiacSymbol = getZodiacSymbol(planet.sign)
                pdf.text(`${symbol} ${frenchName}`, margin + 5, yPosition)
                pdf.setTextColor(150, 100, 200)
                pdf.text(`${zodiacSymbol} ${Math.floor(planet.position)}°`, pageWidth / 2, yPosition)
                if (houseNumber) {
                    pdf.setTextColor(100, 100, 100)
                    pdf.text(`Maison ${houseNumber}`, pageWidth - margin - 15, yPosition, { align: 'right' })
                }
                pdf.setTextColor(60, 60, 60)
                yPosition += 6
            })
            
            yPosition += 8
            
            // Sous-section Maisons
            pdf.setFontSize(12)
            pdf.setTextColor(100, 100, 150)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Maisons', margin, yPosition)
            yPosition += 8
            
            pdf.setFontSize(10)
            pdf.setTextColor(60, 60, 60)
            pdf.setFont('helvetica', 'normal')
            
            Object.entries(chartData.houses).forEach(([key, house]) => {
                checkNewPage(7)
                const houseNumber = key.replace('_house', '').replace('first', '1').replace('second', '2').replace('third', '3').replace('fourth', '4').replace('fifth', '5').replace('sixth', '6').replace('seventh', '7').replace('eighth', '8').replace('ninth', '9').replace('tenth', '10').replace('eleventh', '11').replace('twelfth', '12')
                const signName = getZodiacName(house.sign)
                const zodiacSymbol = getZodiacSymbol(house.sign)
                pdf.text(`Maison ${houseNumber}`, margin + 5, yPosition)
                pdf.setTextColor(150, 100, 200)
                pdf.text(`${zodiacSymbol} ${signName}`, pageWidth / 2, yPosition)
                pdf.setTextColor(100, 100, 100)
                pdf.text(`${Math.floor(house.position)}°`, pageWidth - margin - 15, yPosition, { align: 'right' })
                pdf.setTextColor(60, 60, 60)
                yPosition += 6
            })
            
            yPosition += 12
            
            // Interprétation Spirituelle avec style
            checkNewPage(60)
            
            addHorizontalLine()
            
            pdf.setFillColor(255, 250, 250)
            pdf.rect(margin - 5, yPosition - 3, pageWidth - 2 * margin + 10, 12, 'F')
            
            pdf.setFontSize(16)
            pdf.setTextColor(30, 30, 30)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Interprétation Spirituelle', pageWidth / 2, yPosition + 8, { align: 'center' })
            yPosition += 15
            
            pdf.setFontSize(10)
            pdf.setFont('helvetica', 'normal')
            
            if (sun) {
                checkNewPage(25)
                pdf.setFillColor(255, 245, 230)
                pdf.rect(margin - 3, yPosition - 4, pageWidth - 2 * margin + 6, 25, 'F')
                
                pdf.setFont('helvetica', 'bold')
                pdf.setFontSize(12)
                pdf.setTextColor(200, 100, 0)
                pdf.text('☉ Votre Mission d\'Âme', margin, yPosition)
                yPosition += 7
                
                pdf.setFontSize(10)
                pdf.setTextColor(80, 80, 80)
                pdf.setFont('helvetica', 'normal')
                pdf.text(`Soleil en ${getZodiacName(sun.sign)}`, margin, yPosition)
                yPosition += 6
                
                pdf.setFontSize(9)
                pdf.setTextColor(60, 60, 60)
                const spiritualText = getSpiritualGuidance('Soleil', sun.sign)
                const spiritualLines = pdf.splitTextToSize(spiritualText, pageWidth - 2 * margin)
                spiritualLines.forEach((line: string) => {
                    checkNewPage(5)
                    pdf.text(line, margin + 2, yPosition)
                    yPosition += 4
                })
                yPosition += 5
            }
            
            if (moon) {
                checkNewPage(25)
                pdf.setFillColor(240, 245, 255)
                pdf.rect(margin - 3, yPosition - 4, pageWidth - 2 * margin + 6, 25, 'F')
                
                pdf.setFont('helvetica', 'bold')
                pdf.setFontSize(12)
                pdf.setTextColor(50, 100, 200)
                pdf.text('☽ Votre Intuition Divine', margin, yPosition)
                yPosition += 7
                
                pdf.setFontSize(10)
                pdf.setTextColor(80, 80, 80)
                pdf.setFont('helvetica', 'normal')
                pdf.text(`Lune en ${getZodiacName(moon.sign)}`, margin, yPosition)
                yPosition += 6
                
                pdf.setFontSize(9)
                pdf.setTextColor(60, 60, 60)
                const spiritualText = getSpiritualGuidance('Lune', moon.sign)
                const spiritualLines = pdf.splitTextToSize(spiritualText, pageWidth - 2 * margin)
                spiritualLines.forEach((line: string) => {
                    checkNewPage(5)
                    pdf.text(line, margin + 2, yPosition)
                    yPosition += 4
                })
                yPosition += 5
            }
            
            if (jupiter) {
                checkNewPage(25)
                pdf.setFillColor(255, 245, 255)
                pdf.rect(margin - 3, yPosition - 4, pageWidth - 2 * margin + 6, 25, 'F')
                
                pdf.setFont('helvetica', 'bold')
                pdf.setFontSize(12)
                pdf.setTextColor(150, 50, 200)
                pdf.text('♃ Votre Expansion Spirituelle', margin, yPosition)
                yPosition += 7
                
                pdf.setFontSize(10)
                pdf.setTextColor(80, 80, 80)
                pdf.setFont('helvetica', 'normal')
                pdf.text(`Jupiter en ${getZodiacName(jupiter.sign)}`, margin, yPosition)
                yPosition += 6
                
                pdf.setFontSize(9)
                pdf.setTextColor(60, 60, 60)
                const spiritualText = getSpiritualGuidance('Jupiter', jupiter.sign)
                const spiritualLines = pdf.splitTextToSize(spiritualText, pageWidth - 2 * margin)
                spiritualLines.forEach((line: string) => {
                    checkNewPage(5)
                    pdf.text(line, margin + 2, yPosition)
                    yPosition += 4
                })
                yPosition += 5
            }
            
            yPosition += 12
            
            // Analyse de Personnalité avec style
            checkNewPage(60)
            
            addHorizontalLine()
            
            pdf.setFillColor(250, 255, 250)
            pdf.rect(margin - 5, yPosition - 3, pageWidth - 2 * margin + 10, 12, 'F')
            
            pdf.setFontSize(16)
            pdf.setTextColor(30, 30, 30)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Analyse de votre Personnalité', pageWidth / 2, yPosition + 8, { align: 'center' })
            yPosition += 15
            
            pdf.setFontSize(9)
            pdf.setFont('helvetica', 'normal')
            
            const personalityPlanets = [
                { planet: sun, name: 'Soleil', title: 'Votre Essence', symbol: '☉', color: [200, 100, 0] },
                { planet: moon, name: 'Lune', title: 'Vos Émotions', symbol: '☽', color: [50, 100, 200] },
                { planet: ascendant, name: 'Ascendant', title: 'Votre Image', symbol: 'Ac', color: [100, 150, 200] },
                { planet: jupiter, name: 'Jupiter', title: 'Vos Talents', symbol: '♃', color: [150, 50, 200] },
                { planet: saturn, name: 'Saturne', title: 'Vos Défis', symbol: '♄', color: [100, 100, 100] },
                { planet: mars, name: 'Mars', title: 'Votre Énergie', symbol: '♂', color: [200, 50, 50] }
            ]
            
            personalityPlanets.forEach(({ planet, name, title, symbol, color }) => {
                if (planet) {
                    checkNewPage(30)
                    
                    // Encadré avec couleur
                    pdf.setFillColor(color[0] + 50, color[1] + 50, color[2] + 50)
                    pdf.setDrawColor(color[0], color[1], color[2])
                    pdf.setLineWidth(0.2)
                    pdf.rect(margin - 3, yPosition - 4, pageWidth - 2 * margin + 6, 28, 'FD')
                    
                    pdf.setFont('helvetica', 'bold')
                    pdf.setFontSize(11)
                    pdf.setTextColor(color[0], color[1], color[2])
                    pdf.text(`${symbol} ${title} (${name})`, margin, yPosition)
                    yPosition += 7
                    
                    pdf.setFontSize(9)
                    pdf.setTextColor(80, 80, 80)
                    pdf.setFont('helvetica', 'normal')
                    pdf.text(`${name} en ${getZodiacName(planet.sign)}`, margin, yPosition)
                    yPosition += 6
                    
                    pdf.setFontSize(9)
                    pdf.setTextColor(60, 60, 60)
                    const personalityText = getPersonalityAnalysis(name, planet.sign)
                    const personalityLines = pdf.splitTextToSize(personalityText, pageWidth - 2 * margin)
                    personalityLines.forEach((line: string) => {
                        checkNewPage(5)
                        pdf.text(line, margin + 2, yPosition)
                        yPosition += 4
                    })
                    yPosition += 5
                }
            })
            
            yPosition += 12
            
            // Programme de Progrès avec style
            checkNewPage(60)
            
            addHorizontalLine()
            
            pdf.setFillColor(255, 255, 250)
            pdf.rect(margin - 5, yPosition - 3, pageWidth - 2 * margin + 10, 12, 'F')
            
            pdf.setFontSize(16)
            pdf.setTextColor(30, 30, 30)
            pdf.setFont('helvetica', 'bold')
            pdf.text('Programme de Progrès', pageWidth / 2, yPosition + 8, { align: 'center' })
            yPosition += 15
            
            pdf.setFontSize(9)
            pdf.setFont('helvetica', 'normal')
            
            const progressPlanets = [
                { planet: sun, name: 'Soleil', title: 'Mission de Vie', symbol: '☉', color: [200, 100, 0] },
                { planet: moon, name: 'Lune', title: 'Équilibre Émotionnel', symbol: '☽', color: [50, 100, 200] },
                { planet: ascendant, name: 'Ascendant', title: 'Image Personnelle', symbol: 'Ac', color: [100, 150, 200] },
                { planet: jupiter, name: 'Jupiter', title: 'Développement des Talents', symbol: '♃', color: [150, 50, 200] },
                { planet: saturn, name: 'Saturne', title: 'Surmonter les Défis', symbol: '♄', color: [100, 100, 100] },
                { planet: mars, name: 'Mars', title: 'Énergie et Action', symbol: '♂', color: [200, 50, 50] }
            ]
            
            progressPlanets.forEach(({ planet, name, title, symbol, color }) => {
                if (planet) {
                    checkNewPage(30)
                    
                    // Encadré avec couleur
                    pdf.setFillColor(color[0] + 55, color[1] + 55, color[2] + 55)
                    pdf.setDrawColor(color[0], color[1], color[2])
                    pdf.setLineWidth(0.2)
                    pdf.rect(margin - 3, yPosition - 4, pageWidth - 2 * margin + 6, 28, 'FD')
                    
                    pdf.setFont('helvetica', 'bold')
                    pdf.setFontSize(11)
                    pdf.setTextColor(color[0], color[1], color[2])
                    pdf.text(`${symbol} ${title} (${name})`, margin, yPosition)
                    yPosition += 7
                    
                    pdf.setFont('helvetica', 'bold')
                    pdf.setFontSize(9)
                    pdf.setTextColor(150, 50, 200)
                    pdf.text('OBJECTIF :', margin, yPosition)
                    yPosition += 6
                    
                    pdf.setFont('helvetica', 'normal')
                    pdf.setFontSize(9)
                    pdf.setTextColor(60, 60, 60)
                    const progressText = getProgressGuidance(name, planet.sign, '30days')
                    const progressLines = pdf.splitTextToSize(progressText, pageWidth - 2 * margin)
                    progressLines.forEach((line: string) => {
                        checkNewPage(5)
                        pdf.text(line, margin + 2, yPosition)
                        yPosition += 4
                    })
                    yPosition += 5
                }
            })
            
            // Footer
            const totalPages = pdf.getNumberOfPages()
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i)
                pdf.setFontSize(8)
                pdf.setFont('helvetica', 'italic')
                pdf.text(`Page ${i} sur ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
                pdf.text('Propulsé par Kerykeion - Bibliothèque d\'Astrologie Python', pageWidth / 2, pageHeight - 5, { align: 'center' })
            }
            
            // Sauvegarder le PDF
            const fileName = `carte-du-ciel-${chartData.basic_info.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
            pdf.save(fileName)
            
            toast.success('PDF généré avec succès!', { id: 'pdf-generation' })
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error)
            toast.error('Erreur lors de la génération du PDF', { id: 'pdf-generation' })
        } finally {
            setLoading(false)
        }
    }

    // Trouver les planètes spécifiques (en utilisant la normalisation pour être plus robuste)
    const sun = Object.values(chartData?.planets || {}).find((p: any) => {
        const normalized = normalizePlanetName(p.planet_name)
        return normalized === 'Soleil'
    })
    const moon = Object.values(chartData?.planets || {}).find((p: any) => {
        const normalized = normalizePlanetName(p.planet_name)
        return normalized === 'Lune'
    })
    const mars = Object.values(chartData?.planets || {}).find((p: any) => {
        const normalized = normalizePlanetName(p.planet_name)
        return normalized === 'Mars'
    })
    const jupiter = Object.values(chartData?.planets || {}).find((p: any) => {
        const normalized = normalizePlanetName(p.planet_name)
        return normalized === 'Jupiter'
    })
    const saturn = Object.values(chartData?.planets || {}).find((p: any) => {
        const normalized = normalizePlanetName(p.planet_name)
        return normalized === 'Saturne'
    })
    // Recherche de l'Ascendant - il n'est pas dans planets, chercher ailleurs
    let ascendant: any = null
    
    // 1. Chercher dans houses (première maison = Ascendant - le signe de la première maison est le signe ascendant)
    if (chartData?.houses) {
        // Chercher la première maison dans toutes les formes possibles
        const firstHouseKeys = [
            'first_house', 'first', 'house_1', 'house1', '1', 
            'First_House', 'First', 'House_1', 'House1',
            'FIRST_HOUSE', 'FIRST'
        ]
        
        let firstHouse: any = null
        for (const key of firstHouseKeys) {
            if (chartData.houses[key]) {
                firstHouse = chartData.houses[key]
                console.log(`✅ Première maison trouvée avec la clé: "${key}"`, firstHouse)
                break
            }
        }
        
        // Si pas trouvé, chercher par correspondance dans les clés
        if (!firstHouse) {
            const housesKeys = Object.keys(chartData.houses)
            const firstHouseKey = housesKeys.find(k => 
                k.toLowerCase().includes('first') || 
                k.toLowerCase().includes('1') ||
                k === '1' ||
                k === 'first'
            )
            if (firstHouseKey) {
                firstHouse = chartData.houses[firstHouseKey]
                console.log(`✅ Première maison trouvée avec correspondance: "${firstHouseKey}"`, firstHouse)
            }
        }
        
        // Si trouvé, créer l'objet ascendant à partir du signe de la première maison
        if (firstHouse && firstHouse.sign) {
            ascendant = {
                planet_name: 'Ascendant',
                sign: firstHouse.sign,
                position: firstHouse.position || 0,
                house: 'Maison 1'
            }
            console.log('✅ Ascendant créé à partir de la première maison:', ascendant)
        }
    }
    
    // 2. Chercher dans basic_info (peut-être stocké là)
    if (!ascendant && chartData?.basic_info) {
        const basicInfo = chartData.basic_info as any
        if (basicInfo.ascendant || basicInfo.asc) {
            ascendant = basicInfo.ascendant || basicInfo.asc
            console.log('✅ Ascendant trouvé dans basic_info:', ascendant)
        }
    }
    
    // 3. Chercher dans un objet séparé "angles" ou "ascendant"
    if (!ascendant && (chartData as any)?.angles) {
        ascendant = (chartData as any).angles.ascendant || (chartData as any).angles.AC || (chartData as any).angles.asc
        if (ascendant) {
            console.log('✅ Ascendant trouvé dans angles:', ascendant)
        }
    }
    
    // 4. Si toujours pas trouvé, utiliser l'index -3 comme dans le code Python (3ème depuis la fin)
    if (!ascendant && chartData?.planets) {
        const planetsArray = Object.values(chartData.planets)
        if (planetsArray.length >= 3) {
            const ascendantCandidate = planetsArray[planetsArray.length - 3] as any
            // Vérifier si c'est bien l'ascendant
            const name = (ascendantCandidate?.planet_name || '').toLowerCase()
            if (name.includes('asc') || name === 'ac' || name.includes('ascendant')) {
                ascendant = ascendantCandidate
                console.log('✅ Ascendant trouvé à l\'index -3:', ascendant)
            }
        }
    }
    
    if (!ascendant) {
        console.log('⚠️ Ascendant non trouvé. Structure complète:', {
            houses: chartData?.houses,
            basic_info: chartData?.basic_info,
            planets_count: Object.keys(chartData?.planets || {}).length,
            planets_keys: Object.keys(chartData?.planets || {})
        })
    } else {
        console.log('✅ Ascendant final trouvé:', ascendant)
    }

    if (loading) {
        return (
            <div className="h-screen bg-gray-50 flex overflow-hidden">
                <AdminSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onLogout={handleLogout}
                />
                <div className="flex-1 lg:ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <Sparkles className="w-8 h-8 mx-auto mb-4 text-purple-600 animate-pulse" />
                        <p className="text-gray-600">Chargement des résultats...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!chartData) {
        return (
            <div className="h-screen bg-gray-50 flex overflow-hidden">
                <AdminSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onLogout={handleLogout}
                />
                <div className="flex-1 lg:ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Aucune donnée trouvée</h1>
                        <p className="text-gray-600 mb-6">Les données de la carte astrologique ne sont pas disponibles.</p>
                        <Button onClick={handleBackToForm} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour au formulaire
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <div className="lg:ml-64">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre Carte du Ciel</h1>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{chartData.basic_info.name}</h2>
                            <p className="text-gray-600 mb-1">Né(e) le {chartData.basic_info.birth_date} à {chartData.basic_info.birth_time}</p>
                            <p className="text-gray-600">{chartData.basic_info.location}</p>
                        </div>
                    </header>

                    {/* Carte SVG */}
                    {chartData.svg.base64 && (
                        <div className="mb-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Votre Thème Astral</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-gray-50 rounded-lg p-6 flex justify-center">
                                        <img
                                            id="carte-du-ciel-svg"
                                            src={`data:image/svg+xml;base64,${chartData.svg.base64}`}
                                            alt={`Carte du Ciel de ${chartData.basic_info.name}`}
                                            className="max-w-full h-auto max-h-[600px] object-contain"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Données astrologiques compactes */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Tableau des Planètes compact */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Planètes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {(() => {
                                            // Trier les planètes selon l'ordre spécifié
                                            const planetsArray = Object.entries(chartData.planets).map(([key, planet]: [string, any]) => ({
                                                key,
                                                planet,
                                                frenchName: getPlanetNameFrench(planet.planet_name)
                                            }))
                                            
                                            const displayOrder = getPlanetDisplayOrder()
                                            
                                            // Trier selon l'ordre d'affichage
                                            planetsArray.sort((a, b) => {
                                                const indexA = displayOrder.indexOf(a.frenchName)
                                                const indexB = displayOrder.indexOf(b.frenchName)
                                                
                                                // Si les deux sont dans l'ordre, trier par index
                                                if (indexA !== -1 && indexB !== -1) {
                                                    return indexA - indexB
                                                }
                                                // Si seul A est dans l'ordre, A vient en premier
                                                if (indexA !== -1) return -1
                                                // Si seul B est dans l'ordre, B vient en premier
                                                if (indexB !== -1) return 1
                                                // Sinon, garder l'ordre original
                                                return 0
                                            })
                                            
                                            return planetsArray.map(({ key, planet, frenchName }) => {
                                                const houseNumber = planet.house ? planet.house.split(' ')[1] : ''
                                                return (
                                                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-lg">{getPlanetSymbol(planet.planet_name)}</span>
                                                            <span className="font-medium text-gray-900">{frenchName}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm">
                                                            <span className="text-purple-600">
                                                                {getZodiacSymbol(planet.sign)} {Math.floor(planet.position)}°
                                                            </span>
                                                            {houseNumber && (
                                                                <span className="text-gray-600">Maison {houseNumber}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tableau des Maisons compact */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Maisons</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(chartData.houses).map(([key, house]) => {
                                            const houseNumber = key.replace('_house', '').replace('first', '1').replace('second', '2').replace('third', '3').replace('fourth', '4').replace('fifth', '5').replace('sixth', '6').replace('seventh', '7').replace('eighth', '8').replace('ninth', '9').replace('tenth', '10').replace('eleventh', '11').replace('twelfth', '12')
                                            const signName = getZodiacName(house.sign)
                                            return (
                                                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-sm font-medium text-gray-600 w-6">{houseNumber}</span>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-purple-600 text-sm">{getZodiacSymbol(house.sign)}</span>
                                                            <span className="text-gray-900">{signName}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-gray-600 text-sm">{Math.floor(house.position)}°</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mb-6 border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setInterpretationTab('spiritual')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    interpretationTab === 'spiritual'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Interprétation Spirituelle
                            </button>
                            <button
                                onClick={() => setInterpretationTab('personality')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    interpretationTab === 'personality'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Analyse de la Personnalité
                            </button>
                            <button
                                onClick={() => setInterpretationTab('progress')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    interpretationTab === 'progress'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Programme de Progrès
                            </button>
                        </nav>
                    </div>

                    {/* Interprétation Spirituelle Tab */}
                    {interpretationTab === 'spiritual' && (
                        <div className="mb-8">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Interprétation Spirituelle</h2>
                                <p className="text-gray-600">Votre chemin d'évolution spirituelle révélé par votre thème astral.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Mission d'Âme - Soleil */}
                                <Card>
                                    <CardHeader>
                                        <div className="text-center">
                                            <div className="text-4xl text-orange-600 mb-4">☉</div>
                                            <CardTitle className="text-lg mb-2">Votre Mission d'Âme</CardTitle>
                                            {sun && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Soleil en {getZodiacName(sun.sign)}</strong>
                                                </p>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {getSpiritualGuidance('Soleil', sun?.sign || 'Bélier')}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Intuition Divine - Lune */}
                                <Card>
                                    <CardHeader>
                                        <div className="text-center">
                                            <div className="text-4xl text-blue-500 mb-4">☽</div>
                                            <CardTitle className="text-lg mb-2">Votre Intuition Divine</CardTitle>
                                            {moon && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Lune en {getZodiacName(moon.sign)}</strong>
                                                </p>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {getSpiritualGuidance('Lune', moon?.sign || 'Cancer')}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Expansion Spirituelle - Jupiter */}
                                <Card>
                                    <CardHeader>
                                        <div className="text-center">
                                            <div className="text-4xl text-purple-600 mb-4">♃</div>
                                            <CardTitle className="text-lg mb-2">Votre Expansion Spirituelle</CardTitle>
                                            {jupiter && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Jupiter en {getZodiacName(jupiter.sign)}</strong>
                                                </p>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {getSpiritualGuidance('Jupiter', jupiter?.sign || 'Sagittaire')}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Analyse Personnalité Tab */}
                    {interpretationTab === 'personality' && (
                        <div className="mb-8">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyse de votre Personnalité</h2>
                                <p className="text-gray-600">Les caractéristiques essentielles de votre personnalité révélées par votre thème.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Soleil */}
                                {sun && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-orange-600 mb-4">☉</div>
                                                <CardTitle className="text-lg mb-2">Votre Essence</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Soleil en {getZodiacName(sun.sign)}</strong>
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {getPersonalityAnalysis('Soleil', sun.sign)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Lune */}
                                {moon && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-blue-500 mb-4">☽</div>
                                                <CardTitle className="text-lg mb-2">Vos Émotions</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Lune en {getZodiacName(moon.sign)}</strong>
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {getPersonalityAnalysis('Lune', moon.sign)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Ascendant */}
                                {ascendant && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-blue-700 mb-4">Ac</div>
                                                <CardTitle className="text-lg mb-2">Votre Image</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Ascendant en {getZodiacName(ascendant.sign)}</strong>
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {getPersonalityAnalysis('Ascendant', ascendant.sign)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Jupiter */}
                                {jupiter && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-purple-600 mb-4">♃</div>
                                                <CardTitle className="text-lg mb-2">Vos Talents</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Jupiter en {getZodiacName(jupiter.sign)}</strong>
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {getPersonalityAnalysis('Jupiter', jupiter.sign)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Saturne */}
                                {saturn && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-gray-700 mb-4">♄</div>
                                                <CardTitle className="text-lg mb-2">Vos Défis</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Saturne en {getZodiacName(saturn.sign)}</strong>
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {getPersonalityAnalysis('Saturne', saturn.sign)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Mars */}
                                {mars && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-red-600 mb-4">♂</div>
                                                <CardTitle className="text-lg mb-2">Votre Énergie</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Mars en {getZodiacName(mars.sign)}</strong>
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {getPersonalityAnalysis('Mars', mars.sign)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Programme de Progrès Tab */}
                    {interpretationTab === 'progress' && (
                        <div className="mb-8">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Programme de Progrès</h2>
                                <p className="text-gray-600">Votre plan d'action personnalisé basé sur votre analyse de personnalité et votre interprétation spirituelle.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Soleil */}
                                {sun && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-orange-600 mb-4">☉</div>
                                                <CardTitle className="text-lg mb-2">Mission de Vie (Soleil)</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <h4 className="font-semibold text-sm text-purple-600 mb-2">OBJECTIF :</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getProgressGuidance('Soleil', sun.sign, '30days')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Lune */}
                                {moon && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-blue-500 mb-4">☽</div>
                                                <CardTitle className="text-lg mb-2">Équilibre Émotionnel (Lune)</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <h4 className="font-semibold text-sm text-purple-600 mb-2">OBJECTIF :</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getProgressGuidance('Lune', moon.sign, '30days')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Ascendant */}
                                {ascendant && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-blue-700 mb-4">Ac</div>
                                                <CardTitle className="text-lg mb-2">Image Personnelle (Ascendant)</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <h4 className="font-semibold text-sm text-purple-600 mb-2">OBJECTIF :</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getProgressGuidance('Ascendant', ascendant.sign, '30days')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Jupiter */}
                                {jupiter && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-purple-600 mb-4">♃</div>
                                                <CardTitle className="text-lg mb-2">Développement des Talents (Jupiter)</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <h4 className="font-semibold text-sm text-purple-600 mb-2">OBJECTIF :</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getProgressGuidance('Jupiter', jupiter.sign, '30days')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Saturne */}
                                {saturn && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-gray-700 mb-4">♄</div>
                                                <CardTitle className="text-lg mb-2">Surmonter les Défis (Saturne)</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <h4 className="font-semibold text-sm text-purple-600 mb-2">OBJECTIF :</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getProgressGuidance('Saturne', saturn.sign, '30days')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Mars */}
                                {mars && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-red-600 mb-4">♂</div>
                                                <CardTitle className="text-lg mb-2">Énergie et Action (Mars)</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <h4 className="font-semibold text-sm text-purple-600 mb-2">OBJECTIF :</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getProgressGuidance('Mars', mars.sign, '30days')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center mb-8 pt-6 border-t border-gray-200">
                        <Button onClick={handleBackToForm} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Nouvelle Carte
                        </Button>
                        <Button onClick={generatePDF} variant="default" disabled={loading}>
                            <FileDown className="w-4 h-4 mr-2" />
                            {loading ? 'Génération...' : 'Télécharger PDF'}
                        </Button>
                    </div>

                    {/* Footer */}
                    <footer className="text-center py-8 border-t border-gray-200">
                        <p className="text-gray-600 mb-1">
                            Propulsé par <strong className="text-gray-900">Kerykeion</strong> - Bibliothèque d'Astrologie Python
                        </p>
                        <p className="text-sm text-gray-500">
                            Les données sont calculées avec précision astronomique.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    )
}

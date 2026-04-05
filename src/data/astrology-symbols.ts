// Symboles des planètes (clés en minuscules pour correspondre à l'API)
export const planetSymbols: Record<string, string> = {
  'sun': '☉',
  'moon': '☽',
  'mercury': '☿',
  'venus': '♀',
  'mars': '♂',
  'jupiter': '♃',
  'saturn': '♄',
  'uranus': '♅',
  'neptune': '♆',
  'pluto': '♇',
  'true_node': '☊',
  'mean_node': '☊',
  'chiron': '⚷',
  'mean_lilith': '⚸'
}

// Noms français des planètes (clés en minuscules)
export const planetNamesFR: Record<string, string> = {
  'sun': 'Soleil',
  'moon': 'Lune',
  'mercury': 'Mercure',
  'venus': 'Vénus',
  'mars': 'Mars',
  'jupiter': 'Jupiter',
  'saturn': 'Saturne',
  'uranus': 'Uranus',
  'neptune': 'Neptune',
  'pluto': 'Pluton',
  'true_node': 'Noeud nord',
  'mean_node': 'Noeud nord',
  'chiron': 'Chiron',
  'mean_lilith': 'Lilith'
}

// Symboles des signes
export const signSymbols: Record<string, string> = {
  'Aries': '♈',
  'Taurus': '♉',
  'Gemini': '♊',
  'Cancer': '♋',
  'Leo': '♌',
  'Virgo': '♍',
  'Libra': '♎',
  'Scorpio': '♏',
  'Sagittarius': '♐',
  'Capricorn': '♑',
  'Aquarius': '♒',
  'Pisces': '♓'
}

// Noms français des signes
export const signNamesFR: Record<string, string> = {
  'Aries': 'Bélier',
  'Taurus': 'Taureau',
  'Gemini': 'Gémeaux',
  'Cancer': 'Cancer',
  'Leo': 'Lion',
  'Virgo': 'Vierge',
  'Libra': 'Balance',
  'Scorpio': 'Scorpion',
  'Sagittarius': 'Sagittaire',
  'Capricorn': 'Capricorne',
  'Aquarius': 'Verseau',
  'Pisces': 'Poissons'
}

// Couleurs des planètes (clés en minuscules)
export const planetColors: Record<string, string> = {
  'sun': 'text-orange-500',
  'moon': 'text-blue-400',
  'mercury': 'text-teal-500',
  'venus': 'text-pink-500',
  'mars': 'text-red-500',
  'jupiter': 'text-blue-600',
  'saturn': 'text-cyan-600',
  'uranus': 'text-cyan-400',
  'neptune': 'text-blue-700',
  'pluto': 'text-purple-600',
  'true_node': 'text-gray-600',
  'mean_node': 'text-gray-600',
  'chiron': 'text-indigo-500',
  'mean_lilith': 'text-purple-700'
}

// Couleurs des signes
export const signColors: Record<string, string> = {
  'Aries': 'text-red-500',
  'Taurus': 'text-green-600',
  'Gemini': 'text-yellow-500',
  'Cancer': 'text-blue-400',
  'Leo': 'text-orange-500',
  'Virgo': 'text-green-500',
  'Libra': 'text-pink-400',
  'Scorpio': 'text-red-700',
  'Sagittarius': 'text-purple-500',
  'Capricorn': 'text-gray-700',
  'Aquarius': 'text-cyan-500',
  'Pisces': 'text-blue-500'
}

// Couleurs de fond pour les planètes (version douce) (clés en minuscules)
export const planetBgColors: Record<string, string> = {
  'sun': 'bg-orange-50',
  'moon': 'bg-blue-50',
  'mercury': 'bg-teal-50',
  'venus': 'bg-pink-50',
  'mars': 'bg-red-50',
  'jupiter': 'bg-blue-50',
  'saturn': 'bg-cyan-50',
  'uranus': 'bg-cyan-50',
  'neptune': 'bg-blue-50',
  'pluto': 'bg-purple-50',
  'true_node': 'bg-gray-50',
  'mean_node': 'bg-gray-50',
  'chiron': 'bg-indigo-50',
  'mean_lilith': 'bg-purple-50'
}

// Ordre d'affichage des planètes (clés en minuscules pour correspondre à l'API)
export const planetOrder = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'true_node',
  'chiron'
]

// Fonction pour formater la position en degrés/minutes
export function formatPosition(degrees: number): string {
  const deg = Math.floor(degrees)
  const min = Math.floor((degrees - deg) * 60)
  return `${deg}°${min.toString().padStart(2, '0')}`
}

// Fonction pour convertir les maisons en chiffres romains
export function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [12, 'XII'], [11, 'XI'], [10, 'X'], [9, 'IX'],
    [8, 'VIII'], [7, 'VII'], [6, 'VI'], [5, 'V'],
    [4, 'IV'], [3, 'III'], [2, 'II'], [1, 'I']
  ]

  for (const [value, numeral] of romanNumerals) {
    if (num === value) return numeral
  }
  return num.toString()
}

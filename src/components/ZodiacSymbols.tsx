'use client'

interface ZodiacSymbolsProps {
    signName: string
    className?: string
}

export default function ZodiacSymbols({ signName, className = "text-lg" }: ZodiacSymbolsProps) {
    const getSymbol = (sign: string) => {
        const symbols: Record<string, string> = {
            'Bélier': '♈',
            'Taureau': '♉',
            'Gémeaux': '♊',
            'Cancer': '♋',
            'Lion': '♌',
            'Vierge': '♍',
            'Balance': '♎',
            'Scorpion': '♏',
            'Sagittaire': '♐',
            'Capricorne': '♑',
            'Verseau': '♒',
            'Poissons': '♓'
        }

        return symbols[sign] || sign
    }

    return (
        <span className={`text-purple-600 ${className}`}>
            {getSymbol(signName)}
        </span>
    )
}

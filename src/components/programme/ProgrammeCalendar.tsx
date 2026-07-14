'use client'

import { Check, Trash2 } from 'lucide-react'

export type ProgrammeCategory = 'TEMPLE' | 'ECOLE'

export interface ProgrammeEventSummary {
  id: string
  jour: number
  lienUnique: string
  gradesAutorises: string[]
  inscrits: number
}

export interface ProgrammeActivity {
  id: string
  categorie: ProgrammeCategory
  titre: string
  heures: string
  lieu: string
  ordre: number
  jours: number[]
  evenements: ProgrammeEventSummary[]
}

interface ProgrammeCalendarProps {
  categorie: ProgrammeCategory
  annee: number
  mois: number
  activites: ProgrammeActivity[]
  onDateClick?: (activiteId: string, jour: number) => void
  onRemoveActivity?: (activite: ProgrammeActivity) => void
}

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const JOURS = ['D', 'L', 'Ma', 'Me', 'J', 'V', 'S']

const IDENTITE = {
  TEMPLE: {
    organisation: 'Ordre des Marins Pêcheurs (OMP)',
    titre: 'Programme du Temple',
    couleur: '#087f38',
  },
  ECOLE: {
    organisation: 'École Transcendantaliste Universelle (ETU)',
    titre: 'Programme Pédagogique',
    couleur: '#111111',
  },
} satisfies Record<ProgrammeCategory, { organisation: string; titre: string; couleur: string }>

export default function ProgrammeCalendar({
  categorie,
  annee,
  mois,
  activites,
  onDateClick,
  onRemoveActivity,
}: ProgrammeCalendarProps) {
  const identite = IDENTITE[categorie]
  const nombreJours = new Date(annee, mois, 0).getDate()
  const joursDuMois = Array.from({ length: nombreJours }, (_, index) => index + 1)

  return (
    <div className="mx-auto min-w-[1320px] bg-white px-10 py-9 text-black">
      <div className="mb-5 grid grid-cols-[110px_1fr_110px] items-center">
        <img src="/logo-etu.png" alt="Logo ETU" className="mx-auto h-20 w-20 object-contain" />
        <div className="text-center">
          <h2
            className="font-parchemin text-[48px] font-normal leading-none"
            style={{ color: identite.couleur }}
          >
            {identite.organisation}
          </h2>
          <p className="mt-1 text-[22px] font-semibold italic text-red-600" style={{ fontFamily: 'Georgia, serif' }}>
            {identite.titre}
          </p>
        </div>
        <img src="/logo-etu.png" alt="Logo ETU" className="mx-auto h-20 w-20 object-contain" />
      </div>

      <div className="mb-1 flex h-2">
        <span className="w-1/3 bg-[#0b8a3c]" />
        <span className="w-1/3 bg-[#f8d20b]" />
        <span className="w-1/3 bg-[#e51d39]" />
      </div>
      <h3 className="mb-7 text-center text-[21px] font-bold">{MOIS[mois - 1]} {annee}</h3>

      <table className="w-full table-fixed border-collapse text-[11px]">
        <colgroup>
          <col className="w-[36px]" /><col className="w-[320px]" /><col className="w-[92px]" /><col className="w-[82px]" />
          {joursDuMois.map((jour) => <col key={jour} className="w-[25px]" />)}
        </colgroup>
        <thead className="bg-[#fff4b8] font-bold text-[#69571a]">
          <tr>
            <th className="border border-gray-400 py-1">N°</th>
            <th className="border border-gray-400 py-1">ACTIVITÉS</th>
            <th className="border border-gray-400 py-1">HEURES</th>
            <th className="border border-gray-400 py-1">LIEUX</th>
            {joursDuMois.map((jour) => <th key={jour} className="border border-gray-400 py-1">{JOURS[new Date(annee, mois - 1, jour).getDay()]}</th>)}
          </tr>
          <tr>
            <th className="border border-gray-400" /><th className="border border-gray-400" /><th className="border border-gray-400" /><th className="border border-gray-400" />
            {joursDuMois.map((jour) => <th key={jour} className="border border-gray-400 py-1">{jour}</th>)}
          </tr>
        </thead>
        <tbody>
          {activites.map((activite, index) => (
            <tr key={activite.id} className="h-[31px]">
              <td className="border border-gray-400 text-center">{index + 1}</td>
              <td className="group border border-gray-400 px-2">
                <div className="flex items-center justify-between">
                  <span>{activite.titre}</span>
                  {onRemoveActivity && (
                    <button data-html2canvas-ignore onClick={() => onRemoveActivity(activite)} className="invisible p-1 text-gray-400 hover:text-red-600 group-hover:visible" title="Retirer">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </td>
              <td className="border border-gray-400 text-center">{activite.heures}</td>
              <td className="border border-gray-400 text-center">{activite.lieu}</td>
              {joursDuMois.map((jour) => {
                const checked = activite.jours.includes(jour)
                const evenement = activite.evenements.find((item) => item.jour === jour)
                const contenu = (
                  <>
                    {checked && <Check className="h-5 w-5 text-[#71104f]" strokeWidth={1.5} />}
                    {evenement && onDateClick && <span data-html2canvas-ignore className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-gray-900" />}
                  </>
                )

                return (
                  <td key={jour} className={`border border-gray-400 p-0 ${checked ? 'bg-[#efacd9]' : 'bg-[#fafafa]'}`}>
                    {onDateClick ? (
                      <button onClick={() => onDateClick(activite.id, jour)} className="relative flex h-[30px] w-full items-center justify-center" aria-label={`${activite.titre}, ${jour} ${MOIS[mois - 1]}`}>
                        {contenu}
                      </button>
                    ) : (
                      <div className="flex h-[30px] w-full items-center justify-center">{contenu}</div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

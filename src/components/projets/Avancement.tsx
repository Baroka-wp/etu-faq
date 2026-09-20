/** Barre d'avancement, annoncée aux lecteurs d'écran. */
export default function Avancement({
  valeur,
  legende,
  etiquette,
}: {
  valeur: number
  legende?: string
  etiquette: string
}) {
  const borne = Math.min(100, Math.max(0, Math.round(valeur)))

  return (
    <div>
      <div
        role="progressbar"
        aria-valuenow={borne}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${etiquette} : ${borne}% accompli`}
        className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <div
          className="h-full rounded-full bg-gray-900 transition-[width] duration-500"
          style={{ width: `${borne}%` }}
        />
      </div>
      {legende && <p className="mt-2 text-sm text-gray-600">{legende}</p>}
    </div>
  )
}

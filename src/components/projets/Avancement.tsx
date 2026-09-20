/** Trait d'avancement : une ligne qui se remplit, sans pourcentage criard. */
export default function Avancement({
  valeur,
  legende,
}: {
  valeur: number
  legende?: string
}) {
  return (
    <div>
      <div className="h-px w-full bg-stone-200">
        <div
          className="h-px bg-stone-900 transition-[width] duration-500"
          style={{ width: `${Math.min(100, Math.max(0, valeur))}%` }}
        />
      </div>
      {legende && <p className="mt-2 text-xs text-stone-400">{legende}</p>}
    </div>
  )
}

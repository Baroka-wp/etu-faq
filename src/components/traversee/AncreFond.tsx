/**
 * Illustration de fond : une ancre marine enlacée d'une corde.
 * Purement décorative, très pâle, derrière le contenu.
 *
 * La corde est tracée en trois passes : un trait épais, un cœur de la
 * couleur du fond qui masque l'ancre là où la corde passe devant, puis
 * des hachures courtes qui dessinent la torsion.
 */
const CORDE =
  'M212 44 C236 52 242 84 224 104 C206 124 170 136 176 168 C182 202 236 204 234 242 C232 280 166 284 168 322 C170 358 232 360 230 396 C228 428 170 430 136 424 C104 418 86 440 104 462 C128 490 272 492 296 462 C314 440 298 418 272 420'

export default function AncreFond() {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="40 0 320 520"
      className="pointer-events-none fixed -bottom-10 -right-24 z-0 h-[36rem] w-auto max-w-none select-none text-stone-900 opacity-[0.07] sm:-right-10 sm:h-[44rem] lg:right-8 lg:h-[52rem]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Organeau */}
      <circle cx="200" cy="58" r="38" strokeWidth="5" />
      <circle cx="200" cy="58" r="22" strokeWidth="4" />

      {/* Verge */}
      <path strokeWidth="5" d="M188 96 L188 118 M212 96 L212 118" />
      <path strokeWidth="5" d="M188 152 L185 428 M212 152 L215 428" />
      <path strokeWidth="2" d="M201 158 L201 420" />

      {/* Jas, avec ses frettes */}
      <rect x="110" y="118" width="180" height="34" rx="11" strokeWidth="5" />
      <path strokeWidth="4" d="M130 119 L130 151 M270 119 L270 151" />
      <path strokeWidth="4" d="M170 119 L170 151 M178 119 L178 151 M222 119 L222 151 M230 119 L230 151" />

      {/* Bras, pattes et diamant */}
      <path
        strokeWidth="5"
        d="M185 428 C158 444 126 428 116 400 L142 386 Q114 352 100 306 Q90 356 70 402 L92 394 C106 444 150 470 200 492 C250 470 294 444 308 394 L330 402 Q310 356 300 306 Q286 352 258 386 L284 400 C274 428 242 444 215 428"
      />
      <path strokeWidth="2" d="M198 480 C160 462 124 438 108 404" />
      <path strokeWidth="2" d="M202 480 C240 462 276 438 292 404" />

      {/* Corde */}
      <path strokeWidth="15" d={CORDE} />
      <path strokeWidth="8" className="text-[#faf9f6]" d={CORDE} />
      <path strokeWidth="12" strokeLinecap="butt" strokeDasharray="2.2 6.5" d={CORDE} />
    </svg>
  )
}

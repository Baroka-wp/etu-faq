'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatPrixFcfa } from '@/lib/monographie'

const numero = '22967153974'
const bouton = 'rounded-lg bg-[#831843] px-4 py-2 text-center text-sm font-medium text-white hover:bg-[#691336]'

export default function AchatRessource({ titre, prix }: { titre: string; prix: number | null }) {
  const montant = prix !== null && prix > 0 ? formatPrixFcfa(prix) : null
  const message = montant
    ? `Bonjour, j’aimerais avoir « ${titre} ». Ci-joint la preuve de paiement des ${montant}. Merci.`
    : `Bonjour, j’aimerais avoir « ${titre} ». Quel montant dois-je déposer par MoMo ?`

  return <Dialog>
    <DialogTrigger className={bouton} aria-label={'Acheter ' + titre}>L’acheter</DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{titre}</DialogTitle>
        <DialogDescription>{montant
          ? <>Effectuez un dépôt MoMo de <strong>{montant}</strong> au <strong>+{numero}</strong>.</>
          : 'Demandez le tarif sur WhatsApp avant de faire votre dépôt MoMo.'}</DialogDescription>
      </DialogHeader>
      {montant && <p className="text-sm">Après le dépôt, ouvrez WhatsApp et joignez la capture du paiement au message prérempli.</p>}
      <a className={bouton} href={'https://wa.me/' + numero + '?text=' + encodeURIComponent(message)} target="_blank" rel="noreferrer">
        {montant ? 'Envoyer la preuve sur WhatsApp' : 'Demander le tarif sur WhatsApp'}
      </a>
    </DialogContent>
  </Dialog>
}

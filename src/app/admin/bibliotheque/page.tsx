import { redirect } from 'next/navigation'

/** La bibliothèque a rejoint les Enseignements. */
export default function AncienneBibliothequePage() {
  redirect('/admin/enseignements?onglet=ressources')
}

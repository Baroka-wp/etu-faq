export function lienCommandeLivre(book: { title: string; whatsappMessage: string }) {
    const personnalise = book.whatsappMessage?.trim()
    const message = personnalise
        ? (personnalise.includes(book.title) ? personnalise : `${personnalise}\n\nOuvrage demandé : « ${book.title} ».`)
        : `Bonjour, je souhaite commander « ${book.title} ». Pourriez-vous m’indiquer la marche à suivre ? Merci.`
    return `https://wa.me/22967153974?text=${encodeURIComponent(message)}`
}

function cleanPhone(phone) {
    if (!phone) return ''
    return phone.replace(/[\s\-\+\(\)]/g, '')
}

function formatPrice(val) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
}

function statusLabel(status) {
    const map = {
        pending: 'En attente', confirmed: 'Confirmée', processing: 'En cours',
        shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
    }
    return map[status] ?? status
}

export function buildAdminMessage(order) {
    const addr = order.shipping_address ?? {}
    const name = [addr.first_name, addr.last_name].filter(Boolean).join(' ')
    const itemLines = (order.items ?? []).map(i => {
        const label = i.variant_label ? ` (${i.variant_label})` : ''
        return `• ${i.product_name}${label} x${i.quantity} — ${formatPrice(i.unit_price * i.quantity)}`
    })

    return [
        `Nouvelle commande`,
        `N°: ${order.number}`,
        `Client: ${name || 'Inconnu'}`,
        addr.phone ? `Tél: ${addr.phone}` : null,
        `Adresse: ${addr.address_line1 ?? ''}, ${addr.city ?? ''}`,
        '',
        'Articles:',
        ...itemLines,
        '',
        `Total: ${formatPrice(order.total)}`,
    ].filter(l => l !== null).join('\n')
}

export function buildClientMessage(order, shopName = 'La boutique') {
    const addr  = order.shipping_address ?? {}
    const name  = addr.first_name ?? 'Client'
    const track = order.tracking_number ? `\nSuivi: ${order.tracking_number}` : ''

    return [
        `Bonjour ${name},`,
        `Votre commande n° ${order.number} a bien été enregistrée.`,
        `Statut: ${statusLabel(order.status)}${track}`,
        '',
        `Merci pour votre confiance !`,
        shopName,
    ].join('\n')
}

export function buildWaLink(phone, message) {
    const num = cleanPhone(phone)
    if (!num) return null
    return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}

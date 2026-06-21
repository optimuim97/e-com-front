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

/**
 * @param {Object} order        - L'objet commande (avec items, shipping_address, payments…)
 * @param {Object} [settings]   - Réglages boutique (payment_mobile_number, etc.)
 */
export function buildAdminMessage(order, settings = {}) {
    const addr = order.shipping_address ?? {}
    const name = [addr.first_name, addr.last_name].filter(Boolean).join(' ')
    const itemLines = (order.items ?? []).map(i => {
        const label = i.variant_label ? ` (${i.variant_label})` : ''
        return `• ${i.product_name}${label} x${i.quantity} — ${formatPrice(i.unit_price * i.quantity)}`
    })

    // Méthode de paiement
    const provider  = order.payments?.[0]?.provider ?? order.payment_method ?? ''
    const methodMap = {
        wave: 'Wave', orange_money: 'Orange Money',
        stripe: 'Carte bancaire', delivery: 'À la livraison',
    }
    const methodLabel = methodMap[provider] ?? provider

    // Ligne Wave : numéro de paiement
    let waveLine = null
    if (provider === 'wave' && settings.payment_mobile_number) {
        waveLine = `💳 Paiement Wave → ${settings.payment_mobile_number}`
    }

    return [
        `🌹 Nouvelle commande Rosa Beauty Facial Care`,
        `N°: ${order.number}`,
        `Client: ${name || 'Inconnu'}`,
        addr.phone ? `Tél: ${addr.phone}` : null,
        `Adresse: ${addr.address_line1 ?? ''}, ${addr.city ?? ''}`,
        '',
        '🛒 Articles:',
        ...itemLines,
        '',
        `💰 Total: ${formatPrice(order.total)}`,
        methodLabel ? `Paiement: ${methodLabel}` : null,
        waveLine,
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

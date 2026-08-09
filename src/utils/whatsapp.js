function cleanPhone(phone) {
    if (!phone) return ''
    return phone.replace(/[\s\-\+\(\)]/g, '')
}

function formatPrice(val) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
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

/*
 * Le récapitulatif destiné à la cliente n'est plus rédigé ici.
 * Cette version-ci n'avait ni le détail des articles ni les montants, alors
 * que l'envoi automatique (OrderNotificationMessage, côté serveur) les
 * contenait : deux textes pour un même message, qui ont fini par diverger.
 * L'écran de détail récupère désormais le texte du serveur via
 * GET /admin/orders/{order}/whatsapp-message.
 */

export function buildWaLink(phone, message) {
    const num = cleanPhone(phone)
    if (!num) return null
    return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}

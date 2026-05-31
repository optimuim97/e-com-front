/**
 * program.fields.js
 * Contrat champs pour la demande de consultation conseiller.
 */

export const CONSULTATION_FIELDS = {
  type:        { api: 'type',        label: 'Type de consultation',       type: 'select',   required: true  },
  channel:     { api: 'channel',     label: 'Mode de contact préféré',    type: 'select',   required: true  },
  preferred_at:{ api: 'preferred_at',label: 'Créneau souhaité',           type: 'datetime', required: false },
  message:     { api: 'message',     label: 'Votre demande',              type: 'textarea', required: false },
  phone:       { api: 'phone',       label: 'Téléphone (WhatsApp)',        type: 'tel',      required: false },
}

export const CONSULTATION_TYPES = [
  { value: 'skincare',  label: '🌿 Routine soin de peau' },
  { value: 'product',   label: '💄 Conseil produit' },
  { value: 'routine',   label: '✨ Routine complète' },
  { value: 'gift',      label: '🎁 Idée cadeau' },
  { value: 'other',     label: '💬 Autre question' },
]

export const CONSULTATION_CHANNELS = [
  { value: 'whatsapp', label: '💬 WhatsApp' },
  { value: 'video',    label: '📹 Appel vidéo' },
  { value: 'email',    label: '📧 Email' },
  { value: 'store',    label: '🏪 En boutique' },
]

export function makeConsultationForm() {
  return {
    type:         '',
    channel:      'whatsapp',
    preferred_at: '',
    message:      '',
    phone:        '',
  }
}

export function mapConsultationErrors(laravelErrors = {}) {
  const apiToForm = Object.fromEntries(
    Object.entries(CONSULTATION_FIELDS).map(([k, def]) => [def.api, k])
  )
  return Object.fromEntries(
    Object.entries(laravelErrors).map(([apiKey, msgs]) => [
      apiToForm[apiKey] ?? apiKey,
      Array.isArray(msgs) ? msgs[0] : msgs,
    ])
  )
}

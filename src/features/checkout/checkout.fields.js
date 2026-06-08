/**
 * checkout.fields.js
 * Source de vérité pour tous les champs du formulaire de commande.
 *
 * - Clé (gauche)  : nom du champ dans le formulaire Vue (v-model)
 * - api           : nom exact attendu par Laravel dans le payload
 * - label         : texte affiché dans les <label>
 * - type          : type d'input HTML
 * - required      : validation minimale
 *
 * Usage :
 *   import { makeForm, toPayload, mapErrors } from './checkout.fields'
 */

export const FIELDS = {
  // ── Informations personnelles ──────────────────────────────────────────
  first_name:             { api: 'first_name',             label: 'Prénom(s)',            type: 'text',   required: true  },
  last_name:              { api: 'last_name',              label: 'Nom',               type: 'text',   required: false },
  email:                  { api: 'email',                  label: 'Email',             type: 'email',  required: true  },
  phone:                  { api: 'phone',                  label: 'Téléphone',         type: 'tel',    required: true  },

  // ── Adresse de livraison ───────────────────────────────────────────────
  shipping_address_line1: { api: 'shipping_address_line1', label: 'Adresse ligne 1',   type: 'text',   required: true  },
  shipping_address_line2: { api: 'shipping_address_line2', label: 'Adresse ligne 2',   type: 'text',   required: false },
  shipping_city:          { api: 'shipping_city',          label: 'Ville',             type: 'text',   required: true  },
  shipping_commune:       { api: 'shipping_commune',       label: 'Commune',           type: 'text',   required: false },
  shipping_region:        { api: 'shipping_region',        label: 'Région',            type: 'text',   required: false },
  shipping_postal_code:   { api: 'shipping_postal_code',   label: 'Code postal',       type: 'text',   required: false },
  shipping_country:       { api: 'shipping_country',       label: 'Pays',              type: 'select', required: true  },
  shipping_phone:         { api: 'shipping_phone',         label: 'Tél. livraison',    type: 'tel',    required: false },

  // ── Adresse de facturation ─────────────────────────────────────────────
  billing_address_line1:  { api: 'billing_address_line1',  label: 'Adresse ligne 1',   type: 'text',   required: false },
  billing_address_line2:  { api: 'billing_address_line2',  label: 'Adresse ligne 2',   type: 'text',   required: false },
  billing_city:           { api: 'billing_city',           label: 'Ville',             type: 'text',   required: false },
  billing_postal_code:    { api: 'billing_postal_code',    label: 'Code postal',       type: 'text',   required: false },
  billing_country:        { api: 'billing_country',        label: 'Pays',              type: 'select', required: false },

  // ── Paiement & livraison ───────────────────────────────────────────────
  payment_method:         { api: 'payment_method',         label: 'Mode de paiement',  type: 'radio',  required: true  },
  shipping_method:        { api: 'shipping_method',        label: 'Mode de livraison', type: 'radio',  required: true  },
  coupon_code:            { api: 'coupon_code',            label: 'Code promo',        type: 'text',   required: false },
  customer_note:          { api: 'customer_note',          label: 'Note client',       type: 'textarea',required: false },
}

/** Génère le formulaire vide avec les valeurs par défaut */
export function makeForm(overrides = {}) {
  const defaults = {
    first_name: '', last_name: '', email: '', phone: '',
    shipping_address_line1: '', shipping_address_line2: '',
    shipping_city: '', shipping_commune: '', shipping_region: '',
    shipping_postal_code: '', shipping_country: 'CI', shipping_phone: '',
    billing_address_line1: '', billing_address_line2: '',
    billing_city: '', billing_postal_code: '', billing_country: 'CI',
    payment_method: 'wave', shipping_method: 'standard',
    coupon_code: null, customer_note: '',
  }
  return { ...defaults, ...overrides }
}

/**
 * Convertit les erreurs de validation Laravel vers les clés du formulaire Vue.
 * Laravel renvoie : { "shipping_address_line1": ["Ce champ est requis."] }
 * → Vue reçoit   : { "shipping_address_line1": "Ce champ est requis." }
 */
export function mapErrors(laravelErrors = {}) {
  const apiToForm = Object.fromEntries(
    Object.entries(FIELDS).map(([formKey, def]) => [def.api, formKey])
  )
  return Object.fromEntries(
    Object.entries(laravelErrors).map(([apiKey, msgs]) => [
      apiToForm[apiKey] ?? apiKey,
      Array.isArray(msgs) ? msgs[0] : msgs,
    ])
  )
}

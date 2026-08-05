<template>
  <div class="zep-overlay" @click.self="$emit('close')">
    <div class="zep">
      <!-- En-tête -->
      <header class="zep__head">
        <div>
          <span class="eyebrow">Aperçu avant export</span>
          <h3>{{ label }}</h3>
        </div>
        <button class="zep__close" @click="$emit('close')" aria-label="Fermer">✕</button>
      </header>

      <!-- Options d'ajustement -->
      <div class="zep__options">
        <label class="zep__field">
          <span>Titre du document</span>
          <input v-model="titleEdit" type="text" class="input" maxlength="120" />
        </label>

        <div class="zep__toggles">
          <button type="button" class="zep__chip" :class="{ active: onlyPaid }" @click="onlyPaid = !onlyPaid">
            {{ onlyPaid ? '✓' : '' }} Payées uniquement
          </button>
          <button type="button" class="zep__chip" :class="{ active: hideOutOfZone }" @click="hideOutOfZone = !hideOutOfZone">
            {{ hideOutOfZone ? '✓' : '' }} Exclure hors zone
          </button>
          <span class="zep__spacer"></span>
          <button type="button" class="zep__link" @click="selectAll">Tout cocher</button>
          <button type="button" class="zep__link" @click="selectNone">Tout décocher</button>
        </div>
      </div>

      <!-- Tableau de prévisualisation -->
      <div class="zep__body">
        <table class="zep__table">
          <thead>
            <tr>
              <th class="zep__th-check">
                <input type="checkbox" :checked="allVisibleSelected" @change="toggleAllVisible" />
              </th>
              <th>N°</th>
              <th>Client</th>
              <th>Adresse</th>
              <th>Total</th>
              <th>Paiement</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="o in visibleOrders"
              :key="o.id"
              :class="{ 'zep__row--off': !selected.has(o.id) }"
              @click="toggle(o.id)"
            >
              <td class="zep__th-check">
                <input type="checkbox" :checked="selected.has(o.id)" @click.stop="toggle(o.id)" />
              </td>
              <td class="zep__mono">{{ o.number }}</td>
              <td>
                <div class="zep__client">{{ clientName(o) }}</div>
                <a v-if="o.shipping_address?.phone" :href="`tel:${o.shipping_address.phone}`" class="zep__phone" @click.stop>
                  {{ o.shipping_address.phone }}
                </a>
              </td>
              <td class="zep__addr">
                {{ o.shipping_address?.address_line1 || '—' }}
                <span v-if="o.shipping_unknown" class="zep__tag zep__tag--warn">hors zone</span>
              </td>
              <td class="zep__total">{{ formatPrice(o.total) }}</td>
              <td>
                <span class="zep__tag" :class="o.is_paid ? 'zep__tag--ok' : 'zep__tag--pending'">
                  {{ o.is_paid ? 'Payée' : 'À régler' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="!visibleOrders.length" class="zep__empty">
          Aucune commande ne correspond aux filtres choisis.
        </p>
      </div>

      <!-- Récapitulatif + actions -->
      <footer class="zep__foot">
        <div class="zep__summary">
          <strong>{{ selectedOrders.length }}</strong> commande(s) sélectionnée(s)
          <span class="zep__summary-total">{{ formatPrice(selectedTotal) }}</span>
          <span v-if="unpaidCount" class="zep__warn">{{ unpaidCount }} non payée(s)</span>
        </div>
        <div class="zep__actions">
          <button class="btn btn-outline btn-sm" @click="$emit('close')">Annuler</button>
          <button v-if="has('csv')" class="btn btn-outline btn-sm" :disabled="!selectedOrders.length" @click="downloadCSV">
            CSV
          </button>
          <button
            v-if="has('xlsx')"
            class="btn btn-outline btn-sm"
            :disabled="!selectedOrders.length || busy"
            @click="downloadXlsx"
          >
            {{ busy === 'xlsx' ? '…' : 'Excel' }}
          </button>
          <button
            v-if="has('pdf')"
            class="btn btn-primary btn-sm"
            :disabled="!selectedOrders.length || busy"
            @click="downloadPDF"
          >
            {{ busy === 'pdf' ? 'Génération…' : 'Télécharger le PDF' }}
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/api'

const props = defineProps({
  label:  { type: String, required: true },
  orders: { type: Array,  required: true },
  // Formats proposés : 'xlsx' (Excel, backend) · 'pdf' (feuille de livraison) · 'csv' (client)
  formats: { type: Array, default: () => ['pdf', 'csv'] },
})
defineEmits(['close'])

const has = (f) => props.formats.includes(f)

const titleEdit     = ref(props.label)
const onlyPaid      = ref(false)
const hideOutOfZone = ref(false)
const busy          = ref(null)   // null | 'pdf' | 'xlsx'

// Toutes les commandes sont cochées par défaut
const selected = ref(new Set(props.orders.map(o => o.id)))

const visibleOrders = computed(() =>
  props.orders.filter(o => {
    if (onlyPaid.value && !o.is_paid) return false
    if (hideOutOfZone.value && o.shipping_unknown) return false
    return true
  })
)

// L'export ne prend que les commandes à la fois visibles ET cochées
const selectedOrders = computed(() => visibleOrders.value.filter(o => selected.value.has(o.id)))
const selectedTotal  = computed(() => selectedOrders.value.reduce((s, o) => s + (Number(o.total) || 0), 0))
const unpaidCount    = computed(() => selectedOrders.value.filter(o => !o.is_paid).length)

const allVisibleSelected = computed(() =>
  visibleOrders.value.length > 0 && visibleOrders.value.every(o => selected.value.has(o.id))
)

function toggle(id) {
  const s = new Set(selected.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selected.value = s
}
function toggleAllVisible() {
  allVisibleSelected.value ? selectNone() : selectAll()
}
function selectAll() {
  const s = new Set(selected.value)
  visibleOrders.value.forEach(o => s.add(o.id))
  selected.value = s
}
function selectNone() {
  const s = new Set(selected.value)
  visibleOrders.value.forEach(o => s.delete(o.id))
  selected.value = s
}

function clientName(o) {
  const a = o.shipping_address || {}
  return o.user?.name || `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim() || '—'
}
function formatPrice(v) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'XOF', maximumFractionDigits: 0,
  }).format(Number(v) || 0)
}
const safeName = (s) => String(s ?? '').replace(/[^a-zA-Z0-9\-_]+/g, '_').slice(0, 50)

/** Télécharge un blob renvoyé par le backend pour les ids sélectionnés. */
async function downloadBlob({ kind, url, mime, ext }) {
  if (busy.value || !selectedOrders.value.length) return
  busy.value = kind
  try {
    const params = new URLSearchParams()
    selectedOrders.value.forEach(o => params.append('order_ids[]', o.id))
    if (kind === 'pdf')  params.append('label', titleEdit.value || props.label)
    if (kind === 'xlsx') params.append('format', 'xlsx')

    const res  = await api.get(`${url}?${params.toString()}`, { responseType: 'blob' })
    const href = URL.createObjectURL(new Blob([res.data], { type: mime }))
    const a    = document.createElement('a')
    a.href     = href
    a.download = `${kind === 'pdf' ? 'livraison' : 'commandes'}_${safeName(titleEdit.value)}_${new Date().toISOString().slice(0, 10)}.${ext}`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(href)
  } catch (e) {
    console.error(`Export ${kind} échoué`, e)
  } finally {
    busy.value = null
  }
}

// PDF : feuille de livraison groupée par zone
const downloadPDF = () => downloadBlob({
  kind: 'pdf',
  url:  '/admin/orders/export-by-zone',
  mime: 'application/pdf',
  ext:  'pdf',
})

// Excel : tableau complet des commandes (même générateur que l'export global)
const downloadXlsx = () => downloadBlob({
  kind: 'xlsx',
  url:  '/admin/orders/export',
  mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ext:  'xlsx',
})

// ── Export CSV (client-side) ────────────────────────────────────────────────
function downloadCSV() {
  const esc = (v) => {
    const s = String(v ?? '').replace(/"/g, '""')
    return /[",;\n]/.test(s) ? `"${s}"` : s
  }
  const header = ['N°', 'Client', 'Téléphone', 'Adresse', 'Commune', 'Total', 'Paiement', 'Statut']
  const rows = selectedOrders.value.map(o => {
    const a = o.shipping_address || {}
    return [
      o.number,
      clientName(o),
      a.phone ?? '',
      a.address_line1 ?? '',
      a.commune ?? a.city ?? '',
      o.total ?? '',
      o.is_paid ? 'Payée' : 'À régler',
      o.status ?? '',
    ]
  })
  const csv  = '﻿' + [header, ...rows].map(r => r.map(esc).join(';')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `tournee_${safeName(titleEdit.value)}_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.zep-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.zep {
  background: #fff;
  border-radius: var(--radius-lg);
  width: 100%; max-width: 900px; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
}

.zep__head {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--cream-200);
}
.zep__head h3 { font-family: var(--font-display); font-size: 1.125rem; margin: 2px 0 0; }
.zep__close {
  width: 30px; height: 30px; border-radius: 50%;
  border: 1px solid var(--cream-300); background: #fff; cursor: pointer;
}
.zep__close:hover { background: var(--rose-500); color: #fff; border-color: var(--rose-500); }

/* Options */
.zep__options {
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--cream-100);
  background: var(--cream-50);
  display: flex; flex-direction: column; gap: var(--space-3);
}
.zep__field { display: flex; flex-direction: column; gap: 4px; }
.zep__field span {
  font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--gray-500);
}
.zep__toggles { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
.zep__spacer { flex: 1; }
.zep__chip {
  padding: 6px 14px; border-radius: 999px;
  border: 1.5px solid var(--cream-300); background: #fff;
  font-size: 0.75rem; font-weight: 500; color: var(--gray-600); cursor: pointer;
  transition: all var(--transition-fast);
}
.zep__chip:hover { border-color: var(--rose-300); }
.zep__chip.active {
  background: var(--rose-500); border-color: var(--rose-500); color: #fff;
}
.zep__link {
  background: none; border: none; cursor: pointer;
  font-size: 0.75rem; font-weight: 500; color: var(--rose-600);
}
.zep__link:hover { text-decoration: underline; }

/* Tableau */
.zep__body { flex: 1; overflow-y: auto; padding: 0 var(--space-5); }
.zep__table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.zep__table thead th {
  position: sticky; top: 0; background: #fff; z-index: 1;
  text-align: left; padding: 10px 8px;
  font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.04em;
  text-transform: uppercase; color: var(--gray-500);
  border-bottom: 1px solid var(--cream-200);
}
.zep__table tbody tr {
  border-bottom: 1px solid var(--cream-100); cursor: pointer;
}
.zep__table tbody tr:hover { background: var(--rose-50); }
.zep__table td { padding: 10px 8px; vertical-align: top; }
.zep__row--off { opacity: 0.4; }
.zep__th-check { width: 34px; }
.zep__mono { font-family: ui-monospace, monospace; font-weight: 500; }
.zep__client { font-weight: 500; color: var(--gray-800); }
.zep__phone { font-size: 0.75rem; color: var(--rose-600); text-decoration: none; }
.zep__addr { color: var(--gray-600); max-width: 260px; }
.zep__total { font-weight: 600; color: var(--rose-600); white-space: nowrap; }
.zep__empty { text-align: center; color: var(--gray-400); padding: var(--space-8) 0; }

.zep__tag {
  display: inline-block; font-size: 0.625rem; font-weight: 600;
  padding: 2px 8px; border-radius: 999px; white-space: nowrap;
}
.zep__tag--ok      { background: #dcfce7; color: #15803d; }
.zep__tag--pending { background: #fef3c7; color: #92400e; }
.zep__tag--warn    { background: var(--cream-200); color: var(--gray-600); margin-left: 6px; }

/* Pied */
.zep__foot {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-3); flex-wrap: wrap;
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--cream-200); background: var(--cream-50);
}
.zep__summary { font-size: 0.8125rem; color: var(--gray-600); display: flex; align-items: center; gap: var(--space-3); }
.zep__summary-total { font-weight: 700; color: var(--rose-600); }
.zep__warn { color: #92400e; font-weight: 500; }
.zep__actions { display: flex; gap: var(--space-2); }

@media (max-width: 640px) {
  .zep__addr { display: none; }
  .zep__foot { flex-direction: column; align-items: stretch; }
  .zep__actions .btn { flex: 1; }
}
</style>

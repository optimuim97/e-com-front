<template>
  <section class="card extr" :class="{ 'extr--open': open }">
    <!--
      Header doubles as the fold toggle. Folded, it still carries one chip per
      zone — orders ready, and overdue ones in red — so nothing is hidden by
      folding: only the detail and the buttons are.
    -->
    <button
      type="button"
      class="extr__toggle"
      :aria-expanded="open"
      aria-controls="extr-body"
      @click="toggle"
    >
      <span class="extr__title">Extractions</span>

      <span v-if="!loading" class="extr__chips">
        <span
          v-for="c in carriers"
          :key="c.type"
          class="extr__chip"
          :class="{
            'extr__chip--today': c.scheduled_today && c.pending_count,
            'extr__chip--idle': !c.pending_count && !c.overdue_count,
          }"
        >
          {{ c.label }}
          <strong>{{ c.pending_count }}</strong>
          <em v-if="c.overdue_count" class="extr__chip-late">
            {{ c.overdue_count }} en retard
          </em>
        </span>
      </span>

      <svg
        class="extr__chevron"
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    </button>

    <div v-show="open" id="extr-body" class="extr__body">
      <p class="extr__hint">
        Commandes prêtes et non encore extraites. Le fichier (.txt) les marque
        « extraites » et ouvre la tournée en brouillon, comme l'envoi de 21 h —
        qui reprendra ensuite à partir de là.
        <template v-if="canFinance">
          <br />
          La feuille de livraison ne porte aucun total : elle part avec les colis.
          La version chiffrée — total par zone, articles, total général — est
          envoyée par courriel aux destinataires réglés dans les Paramètres, et
          « Totaux » ci-dessous l'affiche sans rien extraire.
        </template>
      </p>

      <div v-if="loading" class="extr__loading">Chargement…</div>

      <div v-else class="extr__grid">
        <article
          v-for="c in carriers"
          :key="c.type"
          class="extr__card"
          :class="{ 'extr__card--off': !c.scheduled_today }"
        >
          <div class="extr__card-head">
            <strong class="extr__name">{{ c.label }}</strong>
            <span class="extr__badge" :class="c.scheduled_today ? 'extr__badge--on' : 'extr__badge--off'">
              {{ c.scheduled_today ? "Passage ce soir" : 'Hors jour' }}
            </span>
          </div>

          <p class="extr__meta">
            {{ capitalize(c.days_label) }} · 21 h
            <br />
            {{ c.requires_payment ? 'Payées uniquement' : 'Paiement à la livraison' }}
          </p>

          <p class="extr__count">
            <strong>{{ c.pending_count }}</strong> prête{{ c.pending_count > 1 ? 's' : '' }}
            <span v-if="c.overdue_count" class="extr__late">
              · {{ c.overdue_count }} en retard
            </span>
          </p>

          <!--
            Off-schedule the button stays active: a carrier sometimes comes by
            exceptionally. It only changes look, and the server asks for an
            explicit confirmation before marking anything.
          -->
          <div class="extr__actions">
            <button
              type="button"
              class="btn btn-sm extr__btn"
              :class="c.scheduled_today ? 'btn-primary' : 'btn-outline extr__btn--off'"
              :disabled="!c.pending_count || busy === c.type"
              @click="extract(c)"
            >
              {{ busy === c.type ? 'Extraction…' : 'Extraire (.txt)' }}
            </button>

            <!--
              Les chiffres, réservés à qui suit les recettes. Le bouton n'est pas
              seulement masqué : le serveur refuse la route sans `finance.view`.
              Un aperçu, qui ne marque rien et ne déplace pas la fenêtre — sinon
              personne ne regarde ce que vaut une soirée.
            -->
            <button
              v-if="canFinance"
              type="button"
              class="btn btn-sm btn-outline extr__btn extr__btn--totals"
              :disabled="!c.pending_count || busy === `${c.type}:totals`"
              title="Total par zone, articles à sortir, total général. Ne marque aucune commande."
              @click="showTotals(c)"
            >
              {{ busy === `${c.type}:totals` ? 'Calcul…' : 'Totaux' }}
            </button>
          </div>
        </article>
      </div>
    </div>

    <p v-if="message" class="extr__msg" :class="{ 'extr__msg--error': isError }">{{ message }}</p>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
import { useAuthStore } from '@/features/auth/auth.store'

const emit = defineEmits(['extracted'])

// Les cumuls sont réservés à qui suit les recettes : l'agent prépare les
// sorties sans savoir ce que pèse la soirée.
const auth       = useAuthStore()
const canFinance = computed(() => auth.can('finance.view'))

const STORAGE_KEY = 'admin.orders.extractions.open'

const carriers = ref([])
const loading  = ref(true)
const busy     = ref(null)
const message  = ref('')
const isError  = ref(false)

// Folded by default: the panel is a daily tool, not the page's subject. The
// agent's choice is remembered in this browser only.
const open = ref(readOpen())

function readOpen() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function toggle() {
  open.value = !open.value
  try {
    localStorage.setItem(STORAGE_KEY, open.value ? '1' : '0')
  } catch {
    // Storage unavailable (private window): folding still works for this visit.
  }
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')

async function refresh() {
  try {
    const { data } = await api.get('/admin/orders/extractions')
    carriers.value = data.data ?? []
  } finally {
    loading.value = false
  }
}

/**
 * Runs a zone's extraction.
 *
 * Off-schedule, the server answers 409 without marking anything: that is when
 * confirmation is asked, with the calendar it returns. No order is touched
 * until the agent says yes.
 */
async function extract(carrier, confirmOffDay = false) {
  busy.value    = carrier.type
  message.value = ''
  isError.value = false

  try {
    const res = await api.post(
      `/admin/orders/extractions/${carrier.type}`,
      { confirm_off_day: confirmOffDay ? 1 : 0 },
      { responseType: 'blob' },
    )

    download(res)

    const count = Number(res.headers['x-extracted-count'] ?? 0)
    const round = res.headers['x-round-code']
    const plural = count > 1 ? 's' : ''
    message.value = `${carrier.label} : ${count} commande${plural} extraite${plural}`
      + (round ? ` · tournée ${round} en brouillon.` : '.')

    await refresh()
    emit('extracted')
  } catch (e) {
    const status = e.response?.status
    const data   = await readJson(e.response?.data)

    if (status === 409 && data?.requires_confirmation && !confirmOffDay) {
      busy.value = null
      if (confirm(`${data.message}\n\nExtraire quand même ?`)) {
        return extract(carrier, true)
      }
      return
    }

    isError.value = true
    message.value = data?.message ?? "L'extraction a échoué."
  } finally {
    busy.value = null
  }
}

/**
 * Downloads the figures version of what is due.
 *
 * A preview: it marks nothing, opens no round and does not move the window. The
 * same recap is emailed at every extraction — this button is there for the
 * question « combien ça fait, là, maintenant ».
 */
async function showTotals(carrier) {
  busy.value    = `${carrier.type}:totals`
  message.value = ''
  isError.value = false

  try {
    const res = await api.get(
      `/admin/orders/extractions/${carrier.type}/totals`,
      { responseType: 'blob' },
    )

    download(res)

    const count = Number(res.headers['x-extracted-count'] ?? 0)
    message.value = `${carrier.label} : totaux de ${count} commande${count > 1 ? 's' : ''}`
      + ' — aucune commande marquée.'
  } catch (e) {
    const data = await readJson(e.response?.data)

    isError.value = true
    message.value = data?.message ?? "Les totaux n'ont pas pu être calculés."
  } finally {
    busy.value = null
  }
}

/**
 * The response comes back as a blob, errors included: a JSON 409 or 422 has
 * to be read back by hand before its message can be shown.
 */
async function readJson(blob) {
  if (!(blob instanceof Blob)) return blob ?? null
  try {
    return JSON.parse(await blob.text())
  } catch {
    return null
  }
}

function download(res) {
  const disposition = res.headers['content-disposition'] ?? ''
  const name = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? 'extraction.txt'

  const href = URL.createObjectURL(new Blob([res.data], { type: 'text/plain;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = href
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(href)
}

onMounted(refresh)

defineExpose({ refresh })
</script>

<style scoped>
.extr { padding: 0; margin-bottom: var(--space-4); overflow: hidden; }

.extr__toggle {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 0;
  background: none;
  cursor: pointer;
  text-align: left;
}
.extr__toggle:hover { background: var(--cream-50); }

.extr__title {
  flex: 0 0 auto;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-800);
}

.extr__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.extr__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full, 999px);
  background: var(--cream-100, #f5f0eb);
  font-size: 0.75rem;
  color: var(--gray-600);
  white-space: nowrap;
}
.extr__chip strong { color: var(--gray-800); }
.extr__chip--today { background: #dcfce7; color: #166534; }
.extr__chip--today strong { color: #166534; }
.extr__chip--idle { opacity: 0.6; }
.extr__chip-late {
  font-style: normal;
  font-weight: 600;
  color: #b91c1c;
}

.extr__chevron {
  flex: 0 0 auto;
  color: var(--gray-400);
  transition: transform 0.15s ease;
}
.extr--open .extr__chevron { transform: rotate(180deg); }

.extr__body {
  padding: 0 var(--space-4) var(--space-4);
  border-top: 1px solid var(--cream-200);
}

.extr__hint {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin: var(--space-3) 0;
  line-height: 1.5;
}

.extr__loading { font-size: 0.8125rem; color: var(--gray-400); }

.extr__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-2);
}

.extr__card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-3);
  border: 1px solid var(--rose-100);
  border-radius: var(--radius-md, 8px);
  background: #fff;
}
.extr__card--off { background: var(--cream-50); border-color: var(--cream-200); }

.extr__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.extr__name { font-size: 0.8125rem; color: var(--gray-800); }

.extr__badge {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--radius-full, 999px);
  white-space: nowrap;
}
.extr__badge--on  { background: #dcfce7; color: #15803d; }
.extr__badge--off { background: #fef3c7; color: #b45309; }

.extr__meta { font-size: 0.6875rem; color: var(--gray-500); margin: 2px 0 0; line-height: 1.4; }

.extr__count { font-size: 0.75rem; color: var(--gray-600); margin: 6px 0; }
.extr__count strong { font-size: 1rem; color: var(--rose-600); }
.extr__late { color: #b91c1c; font-weight: 600; }

.extr__actions {
  display: flex;
  gap: 6px;
  margin-top: auto;
  padding-top: 6px;
}
.extr__btn { flex: 1; justify-content: center; }
.extr__btn--off { border-color: #f59e0b; color: #b45309; }
/* Les chiffres restent au second plan : l'extraction est le geste du soir. */
.extr__btn--totals { flex: 0 0 auto; }

.extr__msg { margin: 0; padding: 0 var(--space-4) var(--space-3); font-size: 0.8125rem; color: #15803d; }
.extr__msg--error { color: #b91c1c; }
</style>

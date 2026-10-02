<template>
  <div class="admin-page">
    <header class="page-header">
      <div>
        <span class="eyebrow">Opérations</span>
        <h1 class="page-header__title">À traiter</h1>
        <p class="page-header__sub">
          Ce qui a dépassé son délai, le plus ancien d'abord. Rien n'est envoyé
          ni annulé automatiquement : la décision reste ici.
        </p>
      </div>
      <button class="btn btn-outline btn-sm" :disabled="loading" @click="load()">
        {{ loading ? 'Chargement…' : 'Rafraîchir' }}
      </button>
    </header>

    <p v-if="error" class="att-error">{{ error }}</p>

    <!--
      Les doublons d'abord : c'est le seul motif où il reste quelque chose à
      éviter. Passée l'extraction du soir, deux colis sont sur la route.
    -->
    <section v-if="duplicates.length" class="dup-block">
      <header class="dup-block__head">
        <h2 class="dup-block__title">Doublons probables</h2>
        <p class="dup-block__sub">
          Même cliente, même panier. Gardez-en une, annulez celle qui est en
          trop : ouvrez-la d'un clic — l'annulation remet les articles en stock.
        </p>
      </header>

      <article v-for="(groupe, i) in duplicates" :key="i" class="card dup-group">
        <div class="dup-group__client">
          <strong>{{ groupe.customer.name }}</strong>
          <span v-if="groupe.customer.phone">{{ groupe.customer.phone }}</span>
        </div>

        <div class="dup-group__orders">
          <button
            v-for="(commande, rang) in groupe.orders"
            :key="commande.id"
            type="button"
            class="dup-order"
            :class="{
              'dup-order--extra': rang > 0,
              'dup-order--busy': ouverture === commande.id,
            }"
            @click="ouvrir(commande.id)"
          >
            <div class="dup-order__head">
              <strong>{{ commande.number }}</strong>
              <span class="dup-order__tag">{{ rang === 0 ? 'La plus ancienne' : 'Doublon ?' }}</span>
            </div>
            <p class="dup-order__meta">
              {{ quand(commande.created_at) }} · {{ commande.status_label }}
            </p>
            <ul class="dup-order__items">
              <li v-for="(article, j) in commande.items" :key="j">
                {{ article.quantity }} × {{ article.name }}
              </li>
            </ul>
            <p class="dup-order__total">{{ prix(commande.total) }}</p>
          </button>
        </div>
      </article>
    </section>

    <!-- Un compteur par motif : on choisit par quoi commencer. -->
    <div v-if="!loading && total" class="att-tabs">
      <button
        type="button"
        class="att-tab"
        :class="{ 'att-tab--on': filtre === '' }"
        @click="filtre = ''"
      >
        Tout <span class="att-tab__count">{{ total }}</span>
      </button>
      <button
        v-for="(nombre, code) in counts"
        :key="code"
        type="button"
        class="att-tab"
        :class="{ 'att-tab--on': filtre === code }"
        @click="filtre = filtre === code ? '' : code"
      >
        {{ MOTIFS[code] ?? code }} <span class="att-tab__count">{{ nombre }}</span>
      </button>
    </div>

    <div v-if="loading" class="loader-wrap"><div class="loader"></div></div>

    <!-- Le bon état de cet écran est d'être vide — doublons compris. -->
    <div v-else-if="!lignes.length && !duplicates.length" class="att-empty">
      <strong>Rien à traiter.</strong>
      <p>Aucune commande ne dépasse son délai. C'est l'état normal de cet écran.</p>
    </div>

    <div v-else class="att-list">
      <article
        v-for="ligne in lignes"
        :key="ligne.order.id"
        class="card att-row"
        :class="`att-row--${ligne.level}`"
      >
        <div class="att-row__main">
          <div class="att-row__head">
            <button type="button" class="att-row__number" @click="ouvrir(ligne.order.id)">
              {{ ligne.order.number }}
            </button>
            <span class="att-row__client">{{ nomClient(ligne.order) }}</span>
            <span class="att-row__status">{{ ligne.order.status_label }}</span>
            <span class="att-row__age">{{ anciennete(ligne.since) }}</span>
          </div>

          <ul class="att-reasons">
            <li v-for="r in ligne.attention" :key="r.code" :class="`att-reason att-reason--${r.level}`">
              <strong>{{ r.label }}</strong>
              <span class="att-reason__hint">{{ r.hint }}</span>
            </li>
          </ul>
        </div>

        <div class="att-row__side">
          <span v-if="ligne.order.total !== null" class="att-row__total">{{ prix(ligne.order.total) }}</span>
          <a
            v-if="lienWhatsapp(ligne.order)"
            :href="lienWhatsapp(ligne.order)"
            target="_blank"
            rel="noopener"
            class="btn btn-sm btn-outline"
          >WhatsApp</a>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="ouverture !== null"
            @click="ouvrir(ligne.order.id)"
          >{{ ouverture === ligne.order.id ? 'Ouverture…' : 'Traiter' }}</button>
        </div>
      </article>
    </div>

    <!--
      Le traitement se fait ici, par-dessus la file.

      L'écran renvoyait vers la liste des commandes, où la ligne n'était que
      surlignée : il fallait la retrouver, l'ouvrir, agir, puis revenir — et
      revenir ramenait la file au début. Les motifs se règlent presque tous
      d'un seul geste (fixer des frais, encaisser, annuler, prévenir la
      cliente) : ils se font sans quitter la file, qui se recompte derrière.

      Téléportée hors de la page : la fenêtre ne doit pas hériter du contexte
      d'empilement des cartes.
    -->
    <Teleport to="body">
      <OrderQuickActionModal
        v-if="aTraiter"
        :order="aTraiter"
        @close="aTraiter = null"
        @updated="majCommande"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
import OrderQuickActionModal from './OrderQuickActionModal.vue'

/** Libellés courts des motifs, pour les onglets. */
const MOTIFS = {
  to_call:           'À appeler',
  unpaid:            'Règlement attendu',
  cancel_suggested:  'Annulation à décider',
  fee_pending:       'Frais à fixer',
  missed_extraction: 'Oubliée à l\'extraction',
  late_delivery:     'Livraison en retard',
}

const data       = ref([])
const duplicates = ref([])
const counts  = ref({})
const total   = ref(0)
const loading = ref(true)
const error   = ref('')
const filtre  = ref('')

/** La commande ouverte dans la fenêtre de traitement, et celle qui se charge. */
const aTraiter  = ref(null)
const ouverture = ref(null)

const lignes = computed(() => filtre.value
  ? data.value.filter(l => l.attention.some(r => r.code === filtre.value))
  : data.value)

/**
 * Recharge la file.
 *
 * En mode silencieux, le chargement ne remplace pas l'écran par une roue :
 * c'est ce qui se passe après un traitement, la fenêtre est encore ouverte
 * par-dessus et l'agente n'a pas à voir la page clignoter derrière.
 */
async function load({ silencieux = false } = {}) {
  if (! silencieux) loading.value = true
  error.value = ''
  try {
    // Les deux listes ensemble : l'écran n'a de sens qu'entier.
    const [file, doublons] = await Promise.all([
      api.get('/admin/orders/attention'),
      api.get('/admin/orders/duplicates'),
    ])

    data.value       = file.data.data ?? []
    counts.value     = file.data.counts ?? {}
    total.value      = file.data.total ?? 0
    duplicates.value = doublons.data.data ?? []
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Chargement impossible.'
  } finally {
    loading.value = false
  }
}

/**
 * Ouvre le traitement d'une commande.
 *
 * La commande est rechargée au clic plutôt que reprise de la liste : la file
 * n'en porte qu'un instantané, et un doublon n'en porte qu'un résumé (numéro,
 * articles, total). La fenêtre a besoin du reste — règlement, sous-total,
 * frais à fixer — pour savoir ce qu'elle peut proposer.
 */
async function ouvrir(id) {
  if (ouverture.value) return

  ouverture.value = id
  error.value     = ''

  try {
    // Pas `data` : ce nom est déjà celui de la file, plus haut dans ce fichier.
    const reponse  = await api.get(`/admin/orders/${id}`)
    aTraiter.value = reponse.data.data ?? reponse.data
  } catch (e) {
    error.value = e.response?.data?.message ?? "Cette commande n'a pas pu être ouverte."
  } finally {
    ouverture.value = null
  }
}

/**
 * Une commande vient de changer.
 *
 * La fenêtre reste ouverte sur ce qui a été enregistré — fixer des frais puis
 * prévenir la cliente est un même geste en deux temps. La file se recompte
 * derrière : un motif réglé doit quitter la liste.
 */
function majCommande(maj) {
  if (aTraiter.value?.id === maj.id) {
    aTraiter.value = { ...aTraiter.value, ...maj }
  }

  load({ silencieux: true })
}

function nomClient(order) {
  const a = order.shipping_address ?? {}
  return [a.first_name, a.last_name].filter(Boolean).join(' ') || order.user?.name || '—'
}

/** Depuis quand le délai est dépassé — c'est l'ancienneté qui fait agir. */
function anciennete(since) {
  if (!since) return ''
  const heures = Math.max(0, Math.round((Date.now() - new Date(since)) / 3600000))
  if (heures < 24) return `depuis ${heures} h`
  return `depuis ${Math.round(heures / 24)} j`
}

/** Date courte d'une commande : le jour et l'heure suffisent à trancher. */
function quand(valeur) {
  if (!valeur) return ''
  return new Date(valeur).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function prix(v) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'XOF', minimumFractionDigits: 0,
  }).format(Number(v ?? 0))
}

/**
 * Le numéro de la cliente, prêt à appeler sur WhatsApp. Presque tous ces
 * motifs se règlent par un message : autant l'avoir sous la main.
 */
function lienWhatsapp(order) {
  const brut = order.shipping_address?.phone ?? order.user?.phone ?? ''
  const num  = String(brut).replace(/\D/g, '')
  if (!num) return null
  return `https://wa.me/${num.startsWith('225') ? num : '225' + num.replace(/^0+/, '')}`
}

onMounted(load)
</script>

<style scoped>
.att-error { color: #b91c1c; font-size: 0.8125rem; }

.att-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: var(--space-4);
}
.att-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: 1px solid var(--cream-300);
  border-radius: var(--radius-full, 999px);
  background: #fff;
  font-size: 0.8125rem;
  color: var(--gray-600);
  cursor: pointer;
}
.att-tab--on { border-color: var(--rose-400); color: var(--rose-600); background: var(--rose-50); }
.att-tab__count { font-weight: 700; }

.att-empty {
  padding: var(--space-6);
  text-align: center;
  color: var(--gray-500);
}
.att-empty strong { display: block; color: var(--gray-700); margin-bottom: 4px; }
.att-empty p { margin: 0; font-size: 0.875rem; }

/* ── Doublons ── */
.dup-block { margin-bottom: var(--space-5); }
.dup-block__head { margin-bottom: var(--space-3); }
.dup-block__title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--gray-800);
}
.dup-block__sub { margin: 2px 0 0; font-size: 0.75rem; color: var(--gray-500); line-height: 1.5; }

.dup-group {
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-2);
  border-left: 3px solid #dc2626;
}
.dup-group__client {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  font-size: 0.8125rem;
}
.dup-group__client span { color: var(--gray-500); }

.dup-group__orders {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: var(--space-2);
}

.dup-order {
  display: block;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--cream-200);
  border-radius: var(--radius-md, 8px);
  background: #fff;
  font: inherit;
  text-align: left;
  color: inherit;
  cursor: pointer;
}
.dup-order:hover { border-color: var(--rose-300, #f0a6bd); }
.dup-order--extra { background: #fff7f7; border-color: #fecaca; }
/* Pendant le chargement de la commande, pour que le clic ait une réponse. */
.dup-order--busy { border-color: var(--rose-400); }

.dup-order__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.dup-order__head strong { font-size: 0.8125rem; color: var(--gray-800); }
.dup-order__tag {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--radius-full, 999px);
  background: var(--cream-100, #f5f0eb);
  color: var(--gray-600);
  white-space: nowrap;
}
.dup-order--extra .dup-order__tag { background: #fee2e2; color: #b91c1c; }

.dup-order__meta { margin: 2px 0 6px; font-size: 0.6875rem; color: var(--gray-400); }

.dup-order__items {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.75rem;
  color: var(--gray-600);
}

.dup-order__total { margin: 6px 0 0; font-size: 0.8125rem; font-weight: 600; color: var(--gray-700); }

.att-list { display: flex; flex-direction: column; gap: var(--space-2); }

.att-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-left: 3px solid transparent;
}
.att-row--warning  { border-left-color: #f59e0b; }
.att-row--critical { border-left-color: #dc2626; }

.att-row__main { min-width: 0; flex: 1; }

.att-row__head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: 6px;
}
.att-row__number {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-weight: 600;
  color: var(--gray-800);
  cursor: pointer;
}
.att-row__number:hover { color: var(--rose-600); }
.att-row__client { font-size: 0.8125rem; color: var(--gray-600); }
.att-row__status {
  font-size: 0.6875rem;
  padding: 1px 7px;
  border-radius: var(--radius-full, 999px);
  background: var(--cream-100, #f5f0eb);
  color: var(--gray-600);
}
.att-row__age { font-size: 0.75rem; color: var(--gray-400); }

.att-reasons { list-style: none; margin: 0; padding: 0; }
.att-reason { font-size: 0.8125rem; padding: 2px 0; }
.att-reason strong { font-weight: 600; }
.att-reason--warning strong  { color: #b45309; }
.att-reason--critical strong { color: #b91c1c; }
.att-reason__hint { display: block; font-size: 0.75rem; color: var(--gray-500); }

.att-row__side {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
.att-row__total { font-size: 0.8125rem; color: var(--gray-600); white-space: nowrap; }

@media (max-width: 720px) {
  .att-row { flex-direction: column; }
  .att-row__side { width: 100%; justify-content: flex-end; }
}
</style>

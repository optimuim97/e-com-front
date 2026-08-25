<template>
  <div class="ship">
    <header class="ship__head">
      <div>
        <h1 class="ship__title">Expéditions</h1>
        <p class="ship__sub">
          Les commandes qui partent hors d'Abidjan. Celles à tarifer d'abord :
          tant que leurs frais ne sont pas saisis, elles ne peuvent pas être expédiées.
        </p>
      </div>
      <button class="btn btn-outline btn-sm" :disabled="loading" @click="rafraichir">
        Actualiser
      </button>
    </header>

    <!-- Onglets : l'ordre suit l'urgence, pas la géographie. -->
    <nav class="ship__tabs" role="tablist">
      <button
        v-for="t in ONGLETS"
        :key="t.cle"
        type="button"
        role="tab"
        class="ship__tab"
        :class="{ 'ship__tab--active': onglet === t.cle, 'ship__tab--urgent': t.urgent }"
        :aria-selected="onglet === t.cle"
        @click="changerOnglet(t.cle)"
      >
        {{ t.label }}
        <span v-if="compteurs[t.cle] !== null" class="ship__count">{{ compteurs[t.cle] }}</span>
      </button>
    </nav>

    <p class="ship__hint">{{ ONGLETS.find(t => t.cle === onglet).aide }}</p>

    <div class="card table-scroll">
      <table class="admin-table">
        <thead>
          <tr>
            <th>N°</th>
            <th>Date</th>
            <th>Cliente</th>
            <th>Destination</th>
            <th>Statut</th>
            <th>Montant</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="o in commandes" :key="o.id">
            <tr :class="{ 'ship__row--traitee': traitees.has(o.id), 'ship__row--ouverte': ouverte === o.id }">
              <td class="admin-table__mono">{{ o.number }}</td>
              <td>{{ formatDate(o.created_at) }}</td>
              <td>
                {{ o.shipping_address?.first_name }} {{ o.shipping_address?.last_name }}
                <span class="ship__phone">{{ o.shipping_address?.phone || '—' }}</span>
              </td>
              <td>
                {{ o.shipping_address?.city || '—' }}
                <span v-if="o.shipping_unknown" class="ship__flag">à tarifer</span>
              </td>
              <td>
                {{ STATUTS[o.status] ?? o.status }}
                <span v-if="traitees.has(o.id)" class="ship__done">traitée</span>
              </td>
              <td class="admin-table__total">{{ formatPrice(o.total) }}</td>
              <td>
                <div class="ship__actions">
                  <!--
                    Traitement sur place : l'agent enchaîne les commandes sans
                    quitter son onglet. Ouvrir la fiche complète le renvoyait
                    dans la liste générale, où il perdait à la fois sa place et
                    le filtre qui l'y avait amené.
                  -->
                  <button type="button" class="btn btn-xs btn-primary" @click="basculer(o)">
                    {{ ouverte === o.id ? 'Fermer' : 'Traiter' }}
                  </button>
                  <RouterLink
                    class="ship__detail"
                    :to="{ name: 'admin.order', params: { id: o.id }, query: { retour: 'expeditions', onglet } }"
                  >
                    Fiche →
                  </RouterLink>
                </div>
              </td>
            </tr>
            <tr v-if="ouverte === o.id" class="admin-table__detail-row">
              <td :colspan="7">
                <OrderQuickActionModal
                  :order="o"
                  inline
                  @close="ouverte = null"
                  @updated="apresTraitement"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <p v-if="!loading && !commandes.length" class="ship__empty">
        Aucune commande dans cet onglet.
      </p>
      <p v-if="loading" class="ship__empty">Chargement…</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import api from '@/api'
import OrderQuickActionModal from './OrderQuickActionModal.vue'

/*
 * Trois onglets, dans l'ordre où ils coûtent de l'argent : une commande à
 * tarifer bloque l'expédition, une commande hors Abidjan attend un prépaiement,
 * une commande internationale se négocie à la main.
 */
const ONGLETS = [
  { cle: 'a_tarifer',     label: 'À tarifer',     urgent: true,
    aide: "Zone non tarifée : saisir les frais de livraison, puis le mode de règlement, et rappeler la cliente pour confirmer le nouveau total." },
  { cle: 'interior',      label: 'Hors Abidjan',  urgent: false,
    aide: "Intérieur du pays. Règlement d'avance par Wave ou Orange Money : ne rien expédier avant d'avoir vu le crédit sur le compte." },
  { cle: 'international', label: 'International', urgent: false,
    aide: "Hors Côte d'Ivoire. Aucun paiement en ligne : frais, délais et douane se négocient avec la cliente sur WhatsApp." },
]

const STATUTS = {
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En préparation',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
}

const route = useRoute()

const onglet = ref('a_tarifer')
const commandes = ref([])
const loading = ref(false)
const compteurs = reactive({ a_tarifer: null, interior: null, international: null })

/** Fiche dépliée sous sa ligne. Une seule à la fois. */
const ouverte = ref(null)

/*
 * Commandes traitées pendant cette session d'écran.
 *
 * Une commande dont on vient de saisir les frais quitte l'onglet « À tarifer »
 * au prochain chargement. La faire disparaître sous le curseur donne
 * l'impression d'avoir perdu quelque chose : on la garde affichée, marquée
 * « traitée », jusqu'à ce que l'agent change d'onglet ou actualise lui-même.
 */
const traitees = ref(new Set())

/** Traduit un onglet en paramètres de l'API des commandes. */
function parametres(cle) {
  return cle === 'a_tarifer' ? { a_tarifer: 1 } : { destination: cle }
}

async function charger() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/orders', {
      params: { ...parametres(onglet.value), per_page: 100 },
    })
    commandes.value = data.data
    compteurs[onglet.value] = data.total
  } finally {
    loading.value = false
  }
}

/**
 * Compteurs des onglets inactifs.
 *
 * Une requête par onglet, en ne demandant qu'une ligne : seul le total compte,
 * et l'API des commandes le renvoie déjà. Ajouter un point d'entrée dédié pour
 * trois nombres n'en valait pas la peine.
 */
async function chargerCompteurs() {
  await Promise.all(ONGLETS.map(async (t) => {
    if (t.cle === onglet.value) return
    try {
      const { data } = await api.get('/admin/orders', {
        params: { ...parametres(t.cle), per_page: 5 },
      })
      compteurs[t.cle] = data.total
    } catch {
      compteurs[t.cle] = null
    }
  }))
}

function changerOnglet(cle) {
  if (cle === onglet.value) return
  onglet.value = cle
  ouverte.value = null
  traitees.value = new Set()   // le marquage ne vaut que pour l'onglet en cours
  charger()
}

function basculer(commande) {
  ouverte.value = ouverte.value === commande.id ? null : commande.id
}

/**
 * Une action vient d'aboutir sur la commande dépliée.
 *
 * La ligne est mise à jour sur place et marquée, plutôt que rechargée : le
 * rechargement la ferait sortir de l'onglet et refermerait la fiche, alors que
 * l'agent a souvent deux ou trois gestes à enchaîner dessus.
 */
function apresTraitement(majOrder) {
  const i = commandes.value.findIndex((o) => o.id === majOrder.id)
  if (i >= 0) commandes.value[i] = { ...commandes.value[i], ...majOrder }

  traitees.value = new Set(traitees.value).add(majOrder.id)
}

async function rafraichir() {
  ouverte.value = null
  traitees.value = new Set()
  await charger()
  await chargerCompteurs()
}

onMounted(async () => {
  // Retour depuis la fiche complète : on rouvre l'onglet quitté et on surligne
  // la commande, pour que l'agent retrouve sa place au lieu de repartir du haut.
  if (route.query.onglet && ONGLETS.some((t) => t.cle === route.query.onglet)) {
    onglet.value = route.query.onglet
  }

  await rafraichir()

  const retour = Number(route.query.commande)
  if (retour) {
    traitees.value = new Set([retour])
    await nextTick()
    document.querySelector('.ship__row--traitee')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
})

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatPrice(val) {
  if (val === null || val === undefined) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val)
}
</script>

<style scoped>
.ship { display: flex; flex-direction: column; gap: var(--space-4); }

.ship__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}
.ship__title { margin: 0; font-size: 1.5rem; font-weight: 700; }
.ship__sub {
  margin: var(--space-1) 0 0;
  font-size: 0.875rem;
  color: var(--gray-500);
  max-width: 62ch;
}

.ship__tabs {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  border-bottom: 1px solid var(--cream-200);
  padding-bottom: var(--space-2);
}
.ship__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 14px;
  border: 1.5px solid var(--cream-300);
  border-radius: var(--radius-full);
  background: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-600);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.ship__tab:hover { border-color: var(--rose-300); color: var(--rose-600); }
.ship__tab--active {
  border-color: var(--rose-500);
  background: var(--rose-50);
  color: var(--rose-600);
  font-weight: 600;
}
/* L'onglet des commandes bloquées reste repérable même inactif. */
.ship__tab--urgent:not(.ship__tab--active) { border-color: #e8b4ae; color: #a3221b; }

.ship__count {
  min-width: 1.4rem;
  padding: 0 6px;
  border-radius: var(--radius-full);
  background: var(--cream-200);
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
}
.ship__tab--active .ship__count { background: var(--rose-200); }

.ship__hint {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-600);
  background: var(--cream-50);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.ship__phone {
  display: block;
  font-size: 0.75rem;
  color: var(--gray-400);
}

.ship__flag {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: var(--radius-full);
  background: #fbeeec;
  color: #a3221b;
  font-size: 0.6875rem;
  font-weight: 700;
}

.ship__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  white-space: nowrap;
}
.ship__detail { font-size: 0.8125rem; color: var(--gray-500); }
.ship__detail:hover { color: var(--rose-600); }

/* Ligne dépliée : rattachée visuellement à sa fiche, sinon les deux flottent. */
.ship__row--ouverte > td { background: var(--cream-50); }

/* Traitée pendant cette session : la ligne reste, mais se distingue. */
.ship__row--traitee > td {
  background: #f2f8f4;
  box-shadow: inset 3px 0 0 #2f6b46;
}

.ship__done {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: var(--radius-full);
  background: #dcece2;
  color: #2f6b46;
  font-size: 0.6875rem;
  font-weight: 700;
}

.ship__empty {
  padding: var(--space-6);
  text-align: center;
  color: var(--gray-400);
  font-size: 0.9375rem;
}
</style>

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
          <tr v-for="o in commandes" :key="o.id">
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
            <td>{{ STATUTS[o.status] ?? o.status }}</td>
            <td class="admin-table__total">{{ formatPrice(o.total) }}</td>
            <td>
              <RouterLink :to="{ name: 'admin.order', params: { id: o.id } }">Traiter →</RouterLink>
            </td>
          </tr>
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
import { ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api'

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

const onglet = ref('a_tarifer')
const commandes = ref([])
const loading = ref(false)
const compteurs = reactive({ a_tarifer: null, interior: null, international: null })

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
  charger()
}

async function rafraichir() {
  await charger()
  await chargerCompteurs()
}

onMounted(rafraichir)

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

.ship__empty {
  padding: var(--space-6);
  text-align: center;
  color: var(--gray-400);
  font-size: 0.9375rem;
}
</style>

<template>
  <div class="admin-page">
    <!-- Header -->
    <header class="page-header">
      <div>
        <span class="eyebrow">Boutique</span>
        <h1 class="page-header__title">Commandes</h1>
      </div>
      <span class="badge badge-gray">{{ pagination.total ?? 0 }} commande(s)</span>
    </header>

    <!-- Filters -->
    <div class="card filters-bar">
      <div class="status-tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          @click="setStatus(tab.value)"
          class="status-tab"
          :class="{ 'status-tab--active': filters.status === tab.value }"
        >
          {{ tab.label }}
        </button>
      </div>
      <input
        v-model="filters.search"
        @input="debouncedFetch"
        type="text"
        class="input filters-bar__search"
        placeholder="Rechercher par numéro, client…"
      />
    </div>

    <!-- Table -->
    <div class="card">
      <div v-if="loading" class="loader-wrap">
        <div class="loader"></div>
      </div>

      <div v-else-if="orders.length === 0" class="empty-state">
        Aucune commande trouvée.
      </div>

      <div v-else class="table-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th>N° commande</th>
              <th>Client</th>
              <th>Date</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Paiement</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td class="admin-table__mono">{{ order.order_number }}</td>
              <td>
                <div class="admin-table__client">{{ order.user?.name ?? `${order.shipping_first_name} ${order.shipping_last_name}` }}</div>
                <div class="admin-table__sub">{{ order.user?.email ?? '' }}</div>
              </td>
              <td>{{ formatDate(order.created_at) }}</td>
              <td class="admin-table__total">{{ formatPrice(order.total) }}</td>
              <td><span :class="statusBadge(order.status)">{{ statusLabel(order.status) }}</span></td>
              <td>{{ paymentLabel(order.payment_method) }}</td>
              <td class="admin-table__action">
                <RouterLink :to="{ name: 'admin.order', params: { id: order.id } }">
                  Détail →
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="pagination">
        <p>Page {{ pagination.current_page }} / {{ pagination.last_page }}</p>
        <div class="pagination__actions">
          <button @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1" class="btn btn-outline btn-sm">←</button>
          <button @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page" class="btn btn-outline btn-sm">→</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api'

const orders = ref([])
const loading = ref(true)
const pagination = ref({})

const filters = reactive({
  status: '',
  search: '',
  page: 1,
})

const statusTabs = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'processing', label: 'En cours' },
  { value: 'shipped', label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'cancelled', label: 'Annulées' },
]

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { filters.page = 1; fetchOrders() }, 400)
}

function setStatus(val) {
  filters.status = val
  filters.page = 1
  fetchOrders()
}

function changePage(page) {
  filters.page = page
  fetchOrders()
}

async function fetchOrders() {
  loading.value = true
  try {
    const params = { page: filters.page }
    if (filters.status) params.status = filters.status
    if (filters.search) params.search = filters.search
    const { data } = await api.get('/admin/orders', { params })
    orders.value = data.data
    pagination.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      total: data.total,
    }
  } finally {
    loading.value = false
  }
}

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
}

function statusLabel(status) {
  const map = {
    pending: 'En attente', processing: 'En cours', shipped: 'Expédiée',
    delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
  }
  return map[status] ?? status
}

function statusBadge(status) {
  const map = {
    pending: 'badge badge-warning', processing: 'badge badge-primary',
    shipped: 'badge badge-primary', delivered: 'badge badge-success',
    cancelled: 'badge badge-danger', refunded: 'badge badge-gray',
  }
  return map[status] ?? 'badge badge-gray'
}

function paymentLabel(method) {
  const map = {
    wave: 'Wave', orange_money: 'Orange Money', stripe: 'Stripe',
    virement: 'Virement', delivery: 'Livraison',
  }
  return map[method] ?? method
}

onMounted(fetchOrders)
</script>

<style scoped>
.admin-page { display: flex; flex-direction: column; gap: var(--space-5); }

.filters-bar {
  padding: var(--space-4);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}
.filters-bar__search { flex: 1; min-width: 220px; }

.status-tabs { display: flex; flex-wrap: wrap; gap: 2px; }
.status-tab {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-500);
  background: transparent;
  transition: all var(--transition-fast);
}
.status-tab:hover { background: var(--cream-200); color: var(--gray-700); }
.status-tab--active {
  background: var(--rose-500);
  color: #fff;
  box-shadow: var(--shadow-rose);
}

.table-scroll { overflow-x: auto; }

/* ── Table modifiers ── */
.admin-table__mono {
  font-family: ui-monospace, monospace;
  font-weight: 500;
  color: var(--gray-800) !important;
}
.admin-table__client {
  font-weight: 500;
  color: var(--gray-800);
}
.admin-table__sub {
  font-size: 0.75rem;
  color: var(--gray-400);
}
.admin-table__total {
  font-weight: 600;
  color: var(--rose-600) !important;
}
.admin-table__action a {
  color: var(--rose-500);
  font-size: 0.8125rem;
  font-weight: 500;
  transition: color var(--transition-fast);
}
.admin-table__action a:hover { color: var(--rose-700); }

.pagination {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--cream-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination p { font-size: 0.8125rem; color: var(--gray-400); }
.pagination__actions { display: flex; gap: var(--space-2); }
.pagination__actions .btn { padding: 6px 12px; }
</style>

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
      <!-- Export button -->
      <button @click="showExport = !showExport" class="export-toggle-btn" :class="{ active: showExport }">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3"/>
        </svg>
        Exporter
      </button>
    </div>

    <!-- Export panel -->
    <div v-if="showExport" class="card export-panel">
      <h3 class="export-panel__title">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3"/>
        </svg>
        Exporter les commandes
      </h3>

      <div class="export-filters">
        <!-- Date range -->
        <div class="export-field">
          <label class="export-label">Du</label>
          <input v-model="exportFilters.date_from" type="date" class="input export-input" />
        </div>
        <div class="export-field">
          <label class="export-label">Au</label>
          <input v-model="exportFilters.date_to" type="date" class="input export-input" />
        </div>

        <!-- Status -->
        <div class="export-field">
          <label class="export-label">Statut</label>
          <AppSelect v-model="exportFilters.status" :options="orderStatusOptions" placeholder="Tous" />
        </div>

        <!-- Country -->
        <div class="export-field">
          <label class="export-label">Pays</label>
          <AppSelect v-model="exportFilters.country" :options="exportCountryOptions" placeholder="Tous" />
        </div>
      </div>

      <!-- Format + Download buttons -->
      <div class="export-actions">
        <p class="export-hint">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01" stroke-linecap="round"/></svg>
          Les filtres actifs (statut, recherche) ne s'appliquent pas à l'export — utilisez les filtres ci-dessus.
        </p>
        <div class="export-btns">
          <button @click="downloadExport('xlsx')" :disabled="exporting" class="btn btn-primary btn-sm">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"/>
            </svg>
            {{ exporting ? 'Génération…' : 'Télécharger Excel (.xlsx)' }}
          </button>
          <button @click="downloadExport('csv')" :disabled="exporting" class="btn btn-outline btn-sm">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            {{ exporting ? 'Génération…' : 'Télécharger CSV' }}
          </button>
        </div>
      </div>
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
            <template v-for="order in orders" :key="order.id">
              <tr :class="{ 'admin-table__row--expanded': expandedId === order.id }">
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
                  <div class="admin-table__action-row">
                    <button
                      class="btn btn-xs btn-primary"
                      @click="toggleQuickAction(order)"
                      :title="expandedId === order.id ? 'Replier' : 'Traitement rapide'"
                    >
                      {{ expandedId === order.id ? '▾ Fermer' : '⚡ Traiter' }}
                    </button>
                    <RouterLink :to="{ name: 'admin.order', params: { id: order.id } }">
                      Détail →
                    </RouterLink>
                  </div>
                </td>
              </tr>
              <tr v-if="expandedId === order.id" class="admin-table__detail-row">
                <td :colspan="7">
                  <OrderQuickActionModal
                    :order="order"
                    inline
                    @close="expandedId = null"
                    @updated="onOrderUpdated"
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="orders.length" class="pagination">
        <div class="pagination__left">
          <select v-model.number="filters.per_page" @change="changePerPage" class="input pagination__perpage">
            <option :value="10">10 / page</option>
            <option :value="20">20 / page</option>
            <option :value="50">50 / page</option>
            <option :value="100">100 / page</option>
          </select>
          <span class="pagination__total">
            {{ pagination.total ?? 0 }} commandes
          </span>
        </div>
        <div class="pagination__actions">
          <button @click="changePage(1)"
            :disabled="pagination.current_page <= 1" class="btn btn-outline btn-sm" title="Première page">«</button>
          <button @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1" class="btn btn-outline btn-sm">←</button>
          <button
            v-for="(p, i) in pageNumbers"
            :key="i"
            :disabled="p === '…'"
            :class="['btn', 'btn-sm', p === pagination.current_page ? 'btn-primary' : 'btn-outline', { 'pagination__ellipsis': p === '…' }]"
            @click="typeof p === 'number' && changePage(p)"
          >{{ p }}</button>
          <button @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page" class="btn btn-outline btn-sm">→</button>
          <button @click="changePage(pagination.last_page)"
            :disabled="pagination.current_page >= pagination.last_page" class="btn btn-outline btn-sm" title="Dernière page">»</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api'
import OrderQuickActionModal from './OrderQuickActionModal.vue'
import { useOrderStatsStore } from '@/admin/stores/orderStats.store'

const orderStats = useOrderStatsStore()
const expandedId = ref(null)

function toggleQuickAction(order) {
  expandedId.value = expandedId.value === order.id ? null : order.id
}

function onOrderUpdated(updated) {
  // Mettre à jour la ligne dans la liste
  const idx = orders.value.findIndex(o => o.id === updated.id)
  if (idx >= 0) orders.value[idx] = { ...orders.value[idx], ...updated }
  // Rafraîchir le badge sidebar
  orderStats.refresh()
}

const orders = ref([])
const loading = ref(true)
const pagination = ref({})

const filters = reactive({
  status: '',
  search: '',
  page: 1,
  per_page: 20,
})

// Liste de pages à afficher (max 5 boutons centrés autour de la page courante)
const pageNumbers = computed(() => {
  const last = pagination.value.last_page ?? 1
  const cur  = pagination.value.current_page ?? 1
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)

  const pages = new Set([1, last, cur])
  for (let d = 1; d <= 2; d++) {
    if (cur - d > 1) pages.add(cur - d)
    if (cur + d < last) pages.add(cur + d)
  }
  const sorted = Array.from(pages).sort((a, b) => a - b)
  // Insertion ellipses
  const out = []
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i])
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push('…')
  }
  return out
})

const orderStatusOptions = [
  { value: 'pending',    label: 'En attente' },
  { value: 'processing', label: 'En cours' },
  { value: 'shipped',    label: 'Expédiées' },
  { value: 'delivered',  label: 'Livrées' },
  { value: 'cancelled',  label: 'Annulées' },
  { value: 'refunded',   label: 'Remboursées' },
]

const exportCountryOptions = [
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'SN', label: 'Sénégal' },
  { value: 'ML', label: 'Mali' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'GN', label: 'Guinée' },
  { value: 'CM', label: 'Cameroun' },
  { value: 'FR', label: 'France' },
]

/* ── Export ── */
const showExport = ref(false)
const exporting  = ref(false)
const exportFilters = reactive({
  date_from: '',
  date_to:   '',
  status:    '',
  country:   '',
})

async function downloadExport(format) {
  exporting.value = true
  try {
    const params = { format }
    if (exportFilters.date_from) params.date_from = exportFilters.date_from
    if (exportFilters.date_to)   params.date_to   = exportFilters.date_to
    if (exportFilters.status)    params.status     = exportFilters.status
    if (exportFilters.country)   params.country    = exportFilters.country

    const response = await api.get('/admin/orders/export', {
      params,
      responseType: 'blob',
    })

    const ext      = format === 'csv' ? 'csv' : 'xlsx'
    const date     = new Date().toISOString().slice(0, 10)
    const filename = `commandes-${date}.${ext}`
    const url      = URL.createObjectURL(new Blob([response.data]))
    const link     = document.createElement('a')
    link.href      = url
    link.download  = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Export failed', e)
  } finally {
    exporting.value = false
  }
}

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
  if (typeof page !== 'number') return
  if (page < 1 || page > (pagination.value.last_page ?? 1)) return
  filters.page = page
  fetchOrders()
  // Scroll en haut du tableau pour ne pas perdre l'utilisateur après changement de page
  document.querySelector('.table-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })
}

function changePerPage() {
  filters.page = 1
  fetchOrders()
}

async function fetchOrders() {
  loading.value = true
  try {
    const params = { page: filters.page, per_page: filters.per_page }
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

/* ── Export toggle ── */
.export-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--cream-300);
  background: #fff;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-600);
  transition: all var(--transition-fast);
  white-space: nowrap;
}
.export-toggle-btn:hover,
.export-toggle-btn.active {
  border-color: var(--rose-400);
  color: var(--rose-600);
  background: var(--rose-50);
}

/* ── Export panel ── */
.export-panel {
  padding: var(--space-5);
  border: 1.5px solid var(--rose-100);
  background: var(--rose-50);
}
.export-panel__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--space-4);
}
.export-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.export-field { display: flex; flex-direction: column; gap: 4px; }
.export-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-500);
  letter-spacing: 0.04em;
}
.export-input {
  min-width: 160px;
  padding: 8px 12px;
  font-size: 0.8125rem;
  background: #fff;
}
.export-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--rose-100);
}
.export-hint {
  display: flex;
  align-items: flex-start;
  gap: var(--space-1);
  font-size: 0.75rem;
  color: var(--gray-400);
  max-width: 400px;
  line-height: 1.4;
}
.export-btns {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
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
.admin-table__action-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  justify-content: flex-end;
}
.btn-xs {
  padding: 4px 10px !important;
  font-size: 0.6875rem !important;
  height: auto !important;
  border-radius: var(--radius-sm);
}

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

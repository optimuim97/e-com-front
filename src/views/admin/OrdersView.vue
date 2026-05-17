<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Commandes</h1>
      <span class="badge badge-gray">{{ pagination.total ?? 0 }} commande(s)</span>
    </div>

    <!-- Filters bar -->
    <div class="card p-4 flex flex-wrap gap-3 items-center">
      <!-- Status tabs -->
      <div class="flex flex-wrap gap-1">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          @click="setStatus(tab.value)"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          :class="filters.status === tab.value
            ? 'bg-primary-500 text-white'
            : 'text-gray-500 hover:bg-gray-100'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Search -->
      <div class="flex-1 min-w-[200px]">
        <input
          v-model="filters.search"
          @input="debouncedFetch"
          type="text"
          class="input text-sm"
          placeholder="Rechercher par numÃ©ro, clientâ€¦"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="flex justify-center py-16">
        <div class="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="orders.length === 0" class="text-center py-16 text-gray-400">
        Aucune commande trouvÃ©e.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">NÂ° commande</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">Client</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">Paiement</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="order in orders"
              :key="order.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 font-mono font-medium text-gray-800">{{ order.order_number }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-gray-800">{{ order.user?.name ?? order.shipping_first_name + ' ' + order.shipping_last_name }}</div>
                <div class="text-xs text-gray-400">{{ order.user?.email ?? '' }}</div>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ formatDate(order.created_at) }}</td>
              <td class="px-4 py-3 font-semibold text-gray-800">{{ formatPrice(order.total) }}</td>
              <td class="px-4 py-3"><span :class="statusBadge(order.status)">{{ statusLabel(order.status) }}</span></td>
              <td class="px-4 py-3 text-gray-500">{{ paymentLabel(order.payment_method) }}</td>
              <td class="px-4 py-3">
                <RouterLink
                  :to="{ name: 'admin.order', params: { id: order.id } }"
                  class="text-primary-500 hover:underline text-sm font-medium"
                >
                  DÃ©tail â†’
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <p class="text-sm text-gray-400">
          Page {{ pagination.current_page }} sur {{ pagination.last_page }}
        </p>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            class="btn-outline py-1.5 px-3 text-sm disabled:opacity-40"
          >
            â†
          </button>
          <button
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page"
            class="btn-outline py-1.5 px-3 text-sm disabled:opacity-40"
          >
            â†’
          </button>
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
  { value: 'shipped', label: 'ExpÃ©diÃ©es' },
  { value: 'delivered', label: 'LivrÃ©es' },
  { value: 'cancelled', label: 'AnnulÃ©es' },
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
  if (!val) return 'â€”'
  return new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
}

function statusLabel(status) {
  const map = {
    pending: 'En attente', processing: 'En cours', shipped: 'ExpÃ©diÃ©e',
    delivered: 'LivrÃ©e', cancelled: 'AnnulÃ©e', refunded: 'RemboursÃ©e',
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


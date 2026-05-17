<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-2xl font-bold text-gray-900 mb-8">Mes commandes</h1>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="orders.length === 0" class="card p-12 text-center">
        <p class="text-gray-400 text-lg mb-4">Vous n'avez pas encore de commande.</p>
        <RouterLink to="/shop" class="btn-primary">DÃ©couvrir nos produits</RouterLink>
      </div>

      <!-- List -->
      <div v-else class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="card card-hover p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="font-semibold text-gray-800">{{ order.order_number }}</span>
              <span :class="statusBadge(order.status)">{{ statusLabel(order.status) }}</span>
            </div>
            <p class="text-sm text-gray-400">{{ formatDate(order.created_at) }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ order.items_count ?? 'â€”' }} article(s)</p>
          </div>

          <div class="text-right flex-shrink-0">
            <p class="text-lg font-bold text-primary-500">{{ formatPrice(order.total) }}</p>
            <RouterLink
              :to="{ name: 'order', params: { number: order.order_number } }"
              class="text-sm text-primary-500 hover:underline"
            >
              Voir le dÃ©tail â†’
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api'

const orders = ref([])
const loading = ref(true)

async function fetchOrders() {
  loading.value = true
  try {
    const { data } = await api.get('/orders')
    orders.value = data.data ?? data
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(val) {
  if (!val) return 'â€”'
  return new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
}

function statusLabel(status) {
  const map = {
    pending: 'En attente',
    processing: 'En cours',
    shipped: 'ExpÃ©diÃ©e',
    delivered: 'LivrÃ©e',
    cancelled: 'AnnulÃ©e',
    refunded: 'RemboursÃ©e',
  }
  return map[status] ?? status
}

function statusBadge(status) {
  const map = {
    pending: 'badge badge-warning',
    processing: 'badge badge-primary',
    shipped: 'badge badge-primary',
    delivered: 'badge badge-success',
    cancelled: 'badge badge-danger',
    refunded: 'badge badge-gray',
  }
  return map[status] ?? 'badge badge-gray'
}

onMounted(fetchOrders)
</script>


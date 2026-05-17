<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Clients</h1>
      <span class="badge badge-gray">{{ pagination.total ?? 0 }} client(s)</span>
    </div>

    <!-- Search bar -->
    <div class="card p-4">
      <input
        v-model="search"
        @input="debouncedFetch"
        type="text"
        class="input"
        placeholder="Rechercher par nom ou emailâ€¦"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="users.length === 0" class="card p-12 text-center text-gray-400">
      Aucun client trouvÃ©.
    </div>

    <!-- Table -->
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">Client</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">RÃ´le</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">Commandes</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">Total dÃ©pensÃ©</th>
              <th class="text-left px-4 py-3 font-semibold text-gray-600">Inscrit le</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {{ initials(user.name) }}
                  </div>
                  <span class="font-medium text-gray-800">{{ user.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ user.email }}</td>
              <td class="px-4 py-3">
                <span :class="user.role === 'admin' ? 'badge badge-primary' : 'badge badge-gray'">
                  {{ user.role === 'admin' ? 'Admin' : 'Client' }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600 text-center">{{ user.orders_count ?? 0 }}</td>
              <td class="px-4 py-3 font-medium text-gray-800">{{ formatPrice(user.orders_sum_total ?? 0) }}</td>
              <td class="px-4 py-3 text-gray-400">{{ formatDate(user.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <p class="text-sm text-gray-400">Page {{ pagination.current_page }} / {{ pagination.last_page }}</p>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            class="btn-outline py-1.5 px-3 text-sm disabled:opacity-40"
          >â†</button>
          <button
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page"
            class="btn-outline py-1.5 px-3 text-sm disabled:opacity-40"
          >â†’</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'

const users = ref([])
const loading = ref(true)
const search = ref('')
const pagination = ref({})
const page = ref(1)

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; fetchUsers() }, 400)
}

function changePage(p) {
  page.value = p
  fetchUsers()
}

async function fetchUsers() {
  loading.value = true
  try {
    const params = { page: page.value }
    if (search.value) params.search = search.value
    const { data } = await api.get('/admin/users', { params })
    users.value = data.data
    pagination.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      total: data.total,
    }
  } finally {
    loading.value = false
  }
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('')
}

function formatDate(val) {
  if (!val) return 'â€”'
  return new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
}

onMounted(fetchUsers)
</script>


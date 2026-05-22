<template>
  <div class="admin-page">
    <!-- Header -->
    <header class="page-header">
      <div>
        <span class="eyebrow">Communauté</span>
        <h1 class="page-header__title">Clientes & clients</h1>
      </div>
      <span class="badge badge-gray">{{ pagination.total ?? 0 }} client(s)</span>
    </header>

    <!-- Search bar -->
    <div class="card filters-bar">
      <input
        v-model="search"
        @input="debouncedFetch"
        type="text"
        class="input"
        placeholder="Rechercher par nom ou email…"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loader-wrap">
      <div class="loader"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="users.length === 0" class="card empty-state">
      <div class="empty-state__icon">🌸</div>
      <p>Aucun client trouvé.</p>
    </div>

    <!-- Table -->
    <div v-else class="card">
      <div class="table-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Commandes</th>
              <th>Total dépensé</th>
              <th>Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="user-cell__avatar">{{ initials(user.name) }}</div>
                  <span class="admin-table__client">{{ user.name }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="user.role === 'admin' ? 'badge badge-primary' : 'badge badge-gray'">
                  {{ user.role === 'admin' ? 'Admin' : 'Client' }}
                </span>
              </td>
              <td class="user-cell__count">{{ user.orders_count ?? 0 }}</td>
              <td class="admin-table__total">{{ formatPrice(user.orders_sum_total ?? 0) }}</td>
              <td class="user-cell__date">{{ formatDate(user.created_at) }}</td>
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
import { ref, onMounted } from 'vue'
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
  if (!val) return '—'
  return new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
}

onMounted(fetchUsers)
</script>

<style scoped>
.admin-page { display: flex; flex-direction: column; gap: var(--space-5); }

.filters-bar { padding: var(--space-4); }

.table-scroll { overflow-x: auto; }

/* ── Table modifiers ── */
.admin-table__client { font-weight: 500; color: var(--gray-800); }
.admin-table__total { font-weight: 600; color: var(--rose-600) !important; }

.user-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.user-cell__avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--rose-200), var(--rose-400));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8125rem;
  flex-shrink: 0;
}
.user-cell__count { text-align: center; }
.user-cell__date {
  font-size: 0.75rem;
  color: var(--gray-400);
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

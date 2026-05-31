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

    <!-- Search + Export -->
    <div class="card filters-bar">
      <input
        v-model="search"
        @input="debouncedFetch"
        type="text"
        class="input filters-bar__search"
        placeholder="Rechercher par nom ou email…"
      />
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
        Exporter les clients
      </h3>

      <div class="export-filters">
        <div class="export-field">
          <label class="export-label">Inscription du</label>
          <input v-model="exportFilters.date_from" type="date" class="input export-input" />
        </div>
        <div class="export-field">
          <label class="export-label">Au</label>
          <input v-model="exportFilters.date_to" type="date" class="input export-input" />
        </div>
        <div class="export-field">
          <label class="export-label">Pays (commandes)</label>
          <AppSelect v-model="exportFilters.country" :options="countryOptions" placeholder="Tous" />
        </div>
      </div>

      <div class="export-actions">
        <p class="export-hint">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01" stroke-linecap="round"/></svg>
          Les administrateurs sont exclus de l'export.
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
              <th>Numéro</th>
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
              <td>{{ user.phone }}</td>
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
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'

const users = ref([])
const loading = ref(true)
const search = ref('')
const pagination = ref({})
const page = ref(1)

const countryOptions = [
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'SN', label: 'Sénégal' },
  { value: 'ML', label: 'Mali' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'GN', label: 'Guinée' },
  { value: 'CM', label: 'Cameroun' },
  { value: 'FR', label: 'France' },
]

/* ── Export ── */
const showExport    = ref(false)
const exporting     = ref(false)
const exportFilters = reactive({
  date_from: '',
  date_to:   '',
  country:   '',
})

async function downloadExport(format) {
  exporting.value = true
  try {
    const params = { format }
    if (exportFilters.date_from) params.date_from = exportFilters.date_from
    if (exportFilters.date_to)   params.date_to   = exportFilters.date_to
    if (exportFilters.country)   params.country    = exportFilters.country

    const response = await api.get('/admin/users/export', {
      params,
      responseType: 'blob',
    })

    const ext      = format === 'csv' ? 'csv' : 'xlsx'
    const date     = new Date().toISOString().slice(0, 10)
    const filename = `clients-${date}.${ext}`
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

.filters-bar {
  padding: var(--space-4);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}
.filters-bar__search { flex: 1; min-width: 220px; }

/* ── Export ── */
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
.export-toggle-btn.active { border-color: var(--rose-400); color: var(--rose-600); background: var(--rose-50); }

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
.export-label { font-size: 0.75rem; font-weight: 500; color: var(--gray-500); letter-spacing: 0.04em; }
.export-input { min-width: 160px; padding: 8px 12px; font-size: 0.8125rem; background: #fff; }
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
  max-width: 360px;
  line-height: 1.4;
}
.export-btns { display: flex; gap: var(--space-2); flex-wrap: wrap; }

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

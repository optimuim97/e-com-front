<template>
  <div class="admin-page">
    <!-- Header -->
    <header class="page-header">
      <div>
        <span class="eyebrow">Boutique</span>
        <h1 class="page-header__title">Commandes</h1>
      </div>
      <span class="badge badge-gray">{{ orderStats.total }} commande(s) au total</span>
    </header>

    <!-- ── Vue d'ensemble : cartes stats ── -->
    <div class="orders-stats">
      <button
        class="stat-card stat-card--all"
        :class="{ 'stat-card--active': filters.status === '' }"
        @click="setStatusFilter('')"
      >
        <span class="stat-card__label">Total</span>
        <span class="stat-card__value">{{ orderStats.total }}</span>
        <span class="stat-card__hint">{{ orderStats.today }} aujourd'hui · {{ orderStats.thisWeek }} cette semaine</span>
      </button>

      <button
        class="stat-card stat-card--pending"
        :class="{ 'stat-card--active': filters.status === 'pending' }"
        @click="setStatusFilter('pending')"
        :title="`${fmt(orderStats.pendingRevenue)} en attente de validation`"
      >
        <span class="stat-card__label">En attente</span>
        <span class="stat-card__value">{{ orderStats.pending }}</span>
        <span class="stat-card__hint">{{ fmt(orderStats.pendingRevenue) }}</span>
      </button>

      <button
        class="stat-card stat-card--processing"
        :class="{ 'stat-card--active': filters.status === 'processing' }"
        @click="setStatusFilter('processing')"
      >
        <span class="stat-card__label">En traitement</span>
        <span class="stat-card__value">{{ orderStats.processing }}</span>
        <span class="stat-card__hint">À préparer</span>
      </button>

      <button
        class="stat-card stat-card--shipped"
        :class="{ 'stat-card--active': filters.status === 'shipped' }"
        @click="setStatusFilter('shipped')"
      >
        <span class="stat-card__label">Expédiées</span>
        <span class="stat-card__value">{{ orderStats.shipped }}</span>
        <span class="stat-card__hint">En cours de livraison</span>
      </button>

      <button
        class="stat-card stat-card--delivered"
        :class="{ 'stat-card--active': filters.status === 'delivered' }"
        @click="setStatusFilter('delivered')"
      >
        <span class="stat-card__label">Livrées</span>
        <span class="stat-card__value">{{ orderStats.delivered }}</span>
        <span class="stat-card__hint">Terminées</span>
      </button>

      <div class="stat-card stat-card--revenue">
        <span class="stat-card__label">Chiffre d'affaires</span>
        <span class="stat-card__value">{{ fmtCompact(orderStats.revenue) }}</span>
        <span class="stat-card__hint">Panier moyen {{ fmt(orderStats.avgBasket) }}</span>
      </div>
    </div>

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
      <!-- Group-by selector -->
      <label class="group-by">
        <span>Grouper par</span>
        <select v-model="groupBy" @change="onGroupByChange" class="group-by__select">
          <option value="">Aucun (liste)</option>
          <option value="zone">Zone</option>
          <option value="commune">Commune</option>
          <option value="address">Adresse</option>
          <option value="status">Statut</option>
        </select>
      </label>

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

    <!-- Modal itinéraire de tournée -->
    <DeliveryRouteMap
      v-if="routeMap"
      :title="routeMap.title"
      :orders="routeMap.orders"
      @close="routeMap = null"
    />

    <!-- ── Vue groupée (groupBy ≠ '') ── -->
    <div v-if="groupBy" class="card">
      <div v-if="loading" class="loader-wrap"><div class="loader"></div></div>
      <div v-else-if="!groupedOrders.length" class="empty-state">Aucune commande à grouper.</div>
      <div v-else class="zone-groups">
        <div
          v-for="g in groupedOrders"
          :key="g.key"
          class="zone-group"
          :class="{ 'zone-group--off': g.isOther }"
        >
          <button class="zone-group__head" @click="toggleGroup(g.key)">
            <span class="zone-group__title">
              <strong>{{ groupIcon }} {{ g.label }}</strong>
              <span v-if="g.sublabel" class="zone-group__sub">{{ g.sublabel }}</span>
            </span>
            <span class="zone-group__meta">
              <span class="badge badge-gray">{{ g.orders.length }} cmd</span>
              <span class="zone-group__total">{{ formatPrice(g.total) }}</span>
              <button
                type="button"
                class="commune-group__export"
                @click.stop="openRouteMapForGroup(g)"
                title="Voir l'itinéraire de tournée"
              >🗺️</button>
              <button
                type="button"
                class="commune-group__export"
                @click.stop="exportGroupCSV(g)"
                title="Exporter en CSV"
              >⬇ CSV</button>
              <span class="zone-group__chevron" :class="{ open: openGroups.has(g.key) }">▾</span>
            </span>
          </button>
          <div v-if="openGroups.has(g.key)" class="zone-group__body">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Client</th>
                  <th>Adresse</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in g.orders" :key="o.id">
                  <td class="admin-table__mono">{{ o.number }}</td>
                  <td>
                    <div class="admin-table__client">{{ o.user?.name ?? `${o.shipping_address?.first_name ?? ''} ${o.shipping_address?.last_name ?? ''}` }}</div>
                    <a
                      v-if="o.shipping_address?.phone"
                      :href="`tel:${o.shipping_address.phone}`"
                      class="admin-table__phone"
                    >📞 {{ o.shipping_address.phone }}</a>
                  </td>
                  <td class="admin-table__sub">{{ o.shipping_address?.address_line1 ?? '—' }}</td>
                  <td>{{ formatDate(o.created_at) }}</td>
                  <td class="admin-table__total">{{ formatPrice(o.total) }}</td>
                  <td><span :class="statusBadge(o.status)">{{ statusLabel(o.status) }}</span></td>
                  <td class="admin-table__action">
                    <RouterLink :to="{ name: 'admin.order', params: { id: o.id } }">Détail →</RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Vue Liste ── -->
    <div v-else class="card">
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
                <td class="admin-table__mono">
                  {{ order.number }}
                  <div v-if="order.tracking_number" class="admin-table__tracking" :title="`Suivi : ${order.tracking_number}`">
                    📦 {{ order.tracking_number }}
                  </div>
                </td>
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

      <!-- Pagination unifiée (mode liste uniquement) -->
      <AdminPagination
        v-if="!groupBy"
        :current-page="pagination.current_page"
        :last-page="pagination.last_page"
        :total="pagination.total"
        :per-page="filters.per_page"
        item-singular="commande"
        item-plural="commandes"
        @update:page="changePage"
        @update:per-page="onPerPageUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api'
import OrderQuickActionModal from './OrderQuickActionModal.vue'
import DeliveryRouteMap from './DeliveryRouteMap.vue'
import AdminPagination from '@/admin/components/AdminPagination.vue'
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

// ── Mode d'affichage : liste paginée ou groupée selon une dimension ──
// groupBy: '' = liste paginée | 'zone' | 'commune' | 'address' | 'status'
const groupBy    = ref('')             // défaut : aucun groupement (liste paginée)
const allOrders  = ref([])             // commandes brutes pour le regroupement client-side
const openGroups = ref(new Set())

const groupIcon = computed(() => ({
  zone:    '📍',
  commune: '🏘️',
  address: '🏠',
  status:  '🏷️',
}[groupBy.value] ?? ''))

// Calcule les groupes selon la dimension choisie. Dérivé de allOrders.
const groupedOrders = computed(() => {
  if (!groupBy.value) return []
  const buckets = new Map()

  for (const o of allOrders.value) {
    let key, label, sublabel = '', isOther = false
    const a = o.shipping_address || {}

    switch (groupBy.value) {
      case 'zone': {
        const z = o.shipping_zone
        key      = z?.name || '__off__'
        label    = z?.name || 'Hors zone'
        sublabel = z?.group || ''
        isOther  = !z
        break
      }
      case 'commune': {
        const c = (a.commune || a.city || '').trim()
        key      = c || '__none__'
        label    = c || 'Sans commune'
        sublabel = a.country || ''
        isOther  = !c
        break
      }
      case 'address': {
        // Normalisation : lowercase, accents retirés, espaces collapsés.
        const raw  = (a.address_line1 || '').trim()
        const norm = raw.toLowerCase()
          .normalize('NFD').replace(/\p{Diacritic}/gu, '')
          .replace(/\s+/g, ' ')
        key      = norm || '__none__'
        label    = raw || 'Sans adresse'
        sublabel = [a.commune, a.city].filter(Boolean).join(', ')
        isOther  = !raw
        break
      }
      case 'status': {
        key      = o.status
        label    = statusLabel(o.status)
        break
      }
    }

    if (!buckets.has(key)) {
      buckets.set(key, { key, label, sublabel, isOther, orders: [], total: 0 })
    }
    const b = buckets.get(key)
    b.orders.push(o)
    b.total += Number(o.total) || 0
  }

  // Tri : groupes "Autre" (hors zone, sans commune, sans adresse) en dernier.
  return [...buckets.values()].sort((a, b) => {
    if (a.isOther && !b.isOther) return 1
    if (b.isOther && !a.isOther) return -1
    return a.label.localeCompare(b.label, 'fr')
  })
})

function onGroupByChange() {
  if (groupBy.value) fetchAllForGrouping()
  else fetchOrders()
}

function toggleGroup(key) {
  if (openGroups.value.has(key)) openGroups.value.delete(key)
  else openGroups.value.add(key)
  openGroups.value = new Set(openGroups.value)
}

// Récupère toutes les commandes (limit 500) pour regroupement client-side.
async function fetchAllForGrouping() {
  loading.value = true
  try {
    const params = { limit: 500 }
    if (filters.status) params.status = filters.status
    const { data } = await api.get('/admin/orders/by-zone', { params })
    // Aplatir les zones du backend en liste plate de commandes (shipping_zone est dans chaque commande)
    allOrders.value = (data.data ?? []).flatMap(g =>
      g.orders.map(o => ({
        ...o,
        // Le backend ne réinjecte pas shipping_zone dans chaque commande individuelle :
        // on le reconstruit à partir du groupe parent.
        shipping_zone: g.zone === 'Hors zone' ? null : { name: g.zone, group: g.group },
      }))
    )
    openGroups.value = new Set()
    if (groupedOrders.value.length) openGroups.value = new Set([groupedOrders.value[0].key])
  } finally {
    loading.value = false
  }
}

// Export CSV d'un groupe (feuille de tournée).
function exportGroupCSV(group) {
  const escape = (v) => {
    const s = String(v ?? '').replace(/"/g, '""')
    return /[",;\n]/.test(s) ? `"${s}"` : s
  }
  const sep    = ';'
  const header = ['N°', 'Client', 'Téléphone', 'Adresse', 'Commune', 'Total', 'Statut', 'Date']
  const rows   = group.orders.map(o => {
    const a = o.shipping_address || {}
    return [
      o.number,
      o.user?.name ?? `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim(),
      a.phone ?? '',
      a.address_line1 ?? '',
      a.commune ?? a.city ?? '',
      o.total ?? '',
      statusLabel(o.status),
      formatDate(o.created_at),
    ]
  })
  const csv  = '﻿' + [header, ...rows].map(r => r.map(escape).join(sep)).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const safe = (s) => String(s ?? '').replace(/[^a-zA-Z0-9\-_]+/g, '_')
  const a    = document.createElement('a')
  a.href     = url
  a.download = `tournee_${groupBy.value}_${safe(group.label)}_${new Date().toISOString().slice(0,10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// ── Modal itinéraire ─────────────────────────────────────────────────────────
const routeMap = ref(null) // { title, orders } | null

function openRouteMapForGroup(group) {
  routeMap.value = { title: group.label, orders: group.orders }
}

const filters = reactive({
  status: '',
  search: '',
  page: 1,
  per_page: 20,
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
  if (groupBy.value) fetchAllForGrouping()
  else fetchOrders()
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

function onPerPageUpdate(n) {
  filters.per_page = n
  filters.page = 1
  fetchOrders()
}

function setStatusFilter(status) {
  filters.status = status
  filters.page = 1
  if (groupBy.value) fetchAllForGrouping()
  else fetchOrders()
}

function fmt(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(Number(v ?? 0))
}

function fmtCompact(v) {
  const n = Number(v ?? 0)
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M FCFA'
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'k FCFA'
  return n.toLocaleString('fr-FR') + ' FCFA'
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
    wave: 'Wave', orange_money: 'Orange Money',
    cinetpay: 'Carte', cod: 'Livraison', delivery: 'Livraison',
  }
  return map[method] ?? method
}

onMounted(() => {
  if (groupBy.value) fetchAllForGrouping()
  else fetchOrders()
})
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

/* ── Sélecteur "Grouper par" ── */
.group-by {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-500);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.group-by__select {
  padding: 6px 28px 6px 12px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--cream-300);
  background: #fff;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-700);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none' stroke='%23999' stroke-width='1.8' stroke-linecap='round'%3E%3Cpolyline points='1 1 5 5 9 1'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: all var(--transition-fast);
  letter-spacing: normal;
  text-transform: none;
}
.group-by__select:hover,
.group-by__select:focus {
  border-color: var(--rose-400);
  color: var(--rose-600);
  outline: none;
}

/* ── Groupes par zone ── */
.zone-groups {
  display: flex;
  flex-direction: column;
}
.zone-group {
  border-bottom: 1px solid var(--cream-200);
}
.zone-group:last-child { border-bottom: none; }
.zone-group--off .zone-group__title strong { color: var(--gold-600, #b45309); }

.zone-group__head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--cream-50);
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: background var(--transition-fast);
}
.zone-group__head:hover { background: var(--cream-100); }
.zone-group__title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.zone-group__title strong {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  color: var(--gray-800);
}
.zone-group__sub {
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gray-400);
}
.zone-group__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.zone-group__total {
  font-weight: 700;
  color: var(--rose-600);
  font-size: 0.9375rem;
}
.zone-group__chevron {
  display: inline-block;
  transition: transform 0.2s ease;
  color: var(--gray-400);
}
.zone-group__chevron.open { transform: rotate(180deg); }

.zone-group__body {
  padding: 0 var(--space-4) var(--space-3);
  background: #fff;
}
.zone-group__body .admin-table { width: 100%; }

.commune-group {
  border-top: 1px dashed var(--cream-200);
  padding: var(--space-2) 0;
}
.commune-group:first-child { border-top: none; }
.commune-group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 6px var(--space-2);
  margin-bottom: 4px;
}
.commune-group__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-700);
}
.commune-group__count {
  font-size: 0.6875rem;
  color: var(--gray-500);
  background: var(--cream-100);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.commune-group__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.commune-group__export {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--rose-600);
  background: #fff;
  border: 1px solid var(--rose-200);
  border-radius: var(--radius-full);
  padding: 2px 10px;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.commune-group__export:hover {
  background: var(--rose-50);
  border-color: var(--rose-400);
}

.admin-table__phone {
  font-size: 0.75rem;
  color: var(--rose-600);
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  margin-top: 2px;
}
.admin-table__phone:hover { text-decoration: underline; }

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
.admin-table__tracking {
  font-family: ui-monospace, monospace;
  font-size: 0.6875rem;
  color: var(--gray-500);
  font-weight: 400;
  margin-top: 2px;
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

/* ── Cartes stats vue d'ensemble ── */
.orders-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid var(--cream-200);
  border-radius: var(--radius-md);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}
.stat-card:hover {
  border-color: var(--rose-300);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(168, 50, 80, 0.08);
}
.stat-card--active {
  border-color: var(--rose-500);
  background: var(--rose-50);
  box-shadow: inset 3px 0 0 var(--rose-500);
}
.stat-card__label {
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gray-500);
  font-weight: 600;
}
.stat-card__value {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-800);
  line-height: 1;
  margin-top: 2px;
}
.stat-card__hint {
  font-size: 0.6875rem;
  color: var(--gray-400);
  margin-top: 4px;
}

/* Accents par statut */
.stat-card--pending .stat-card__value    { color: var(--gold-600, #b45309); }
.stat-card--processing .stat-card__value { color: #2563eb; }
.stat-card--shipped .stat-card__value    { color: #7c3aed; }
.stat-card--delivered .stat-card__value  { color: #15803d; }
.stat-card--revenue {
  background: linear-gradient(135deg, var(--rose-500), #f06292);
  border-color: transparent;
  color: #fff;
  cursor: default;
}
.stat-card--revenue:hover {
  transform: none;
  box-shadow: none;
}
.stat-card--revenue .stat-card__label,
.stat-card--revenue .stat-card__hint  { color: rgba(255,255,255,0.85); }
.stat-card--revenue .stat-card__value { color: #fff; }

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

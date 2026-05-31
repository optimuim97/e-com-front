<template>
  <div class="admin-page">
    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div v-for="kpi in kpis" :key="kpi.label" class="kpi-card card">
        <div class="kpi-card__head">
          <span class="kpi-card__label">{{ kpi.label }}</span>
          <div class="kpi-card__icon" :style="{ background: kpi.bg, color: kpi.color }">
            <component :is="kpi.icon" class="w-5 h-5" />
          </div>
        </div>
        <p class="kpi-card__value">{{ kpi.value }}</p>
      </div>
    </div>

    <div class="dash-grid">
      <!-- Commandes récentes -->
      <section class="card dash-orders">
        <header class="dash-orders__head">
          <div>
            <span class="eyebrow">Activité</span>
            <h2 class="dash-orders__title">Commandes récentes</h2>
          </div>
          <RouterLink to="/admin/orders" class="dash-link">
            Voir tout
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </RouterLink>
        </header>
        <div v-if="loading" class="dash-orders__skel">
          <div v-for="i in 5" :key="i" class="skel"></div>
        </div>
        <table v-else class="dash-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id"
              @click="router.push(`/admin/orders/${order.id}`)">
              <td class="dash-table__num">{{ order.number }}</td>
              <td>{{ order.user?.name ?? 'Invité' }}</td>
              <td class="dash-table__total">{{ formatPrice(order.total) }}</td>
              <td><span :class="statusBadge(order.status)">{{ order.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Stock faible -->
      <section class="card dash-stock">
        <header>
          <span class="eyebrow">Alerte</span>
          <h2 class="dash-stock__title">Stock faible</h2>
        </header>
        <div v-if="loading" class="dash-stock__skel">
          <div v-for="i in 4" :key="i" class="skel"></div>
        </div>
        <div v-else-if="!lowStock.length" class="dash-stock__empty">
          Aucun produit en rupture
        </div>
        <ul v-else class="dash-stock__list">
          <li v-for="p in lowStock" :key="p.id">
            <span class="dash-stock__name">{{ p.name }}</span>
            <span class="badge badge-warning">{{ p.stock }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { BanknotesIcon, ShoppingBagIcon, UserGroupIcon, CubeIcon } from '@heroicons/vue/24/outline';
import api from '@/api';

const router      = useRouter();
const stats       = ref({});
const recentOrders = ref([]);
const lowStock    = ref([]);
const loading     = ref(true);

const kpis = computed(() => [
  { label: 'Chiffre d\'affaires', value: formatPrice(stats.value.revenue ?? 0), icon: BanknotesIcon, bg: '#dcfce7',     color: '#15803d' },
  { label: 'Commandes',          value: stats.value.orders ?? 0,                icon: ShoppingBagIcon, bg: 'var(--rose-100)', color: 'var(--rose-600)' },
  { label: 'Clientes',           value: stats.value.customers ?? 0,             icon: UserGroupIcon,   bg: '#dbeafe',     color: '#1d4ed8' },
  { label: 'Produits actifs',    value: stats.value.products ?? 0,              icon: CubeIcon,        bg: 'var(--gold-200)', color: 'var(--gold-600)' },
]);

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);
}

function statusBadge(status) {
  const map = {
    pending:    'badge badge-warning',
    confirmed:  'badge badge-primary',
    processing: 'badge badge-primary',
    shipped:    'badge badge-success',
    delivered:  'badge badge-success',
    cancelled:  'badge badge-danger',
    refunded:   'badge badge-gray',
  };
  return map[status] ?? 'badge badge-gray';
}

onMounted(async () => {
  const { data } = await api.get('/admin/dashboard');
  stats.value       = data.stats;
  recentOrders.value = data.recent_orders;
  lowStock.value    = data.low_stock;
  loading.value     = false;
});
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* ── KPI ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

.kpi-card {
  padding: var(--space-5);
}
.kpi-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.kpi-card__label {
  font-size: 0.8125rem;
  color: var(--gray-500);
  font-weight: 500;
}
.kpi-card__icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-card__value {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--gray-800);
  letter-spacing: -0.01em;
}

/* ── Dash grid ── */
.dash-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-5);
}

.dash-orders, .dash-stock { padding: var(--space-6); }

.dash-orders__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-5);
}
.dash-orders__title, .dash-stock__title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--gray-800);
  margin-top: 4px;
}

.dash-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--rose-500);
  font-size: 0.8125rem;
  font-weight: 500;
  transition: gap var(--transition-fast);
}
.dash-link:hover { gap: var(--space-2); }

.dash-orders__skel, .dash-stock__skel { display: flex; flex-direction: column; gap: var(--space-2); }
.skel {
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--cream-100);
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }

.dash-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.dash-table thead th {
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gray-500);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--cream-200);
}
.dash-table tbody tr {
  cursor: pointer;
  transition: background var(--transition-fast);
}
.dash-table tbody tr:hover { background: var(--rose-50); }
.dash-table tbody td {
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--cream-100);
  color: var(--gray-600);
}
.dash-table__num {
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--gray-500);
}
.dash-table__total {
  font-weight: 600;
  color: var(--rose-600);
}

.dash-stock__empty {
  text-align: center;
  padding: var(--space-8) 0;
  color: var(--gray-400);
  font-size: 0.875rem;
}

.dash-stock__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.dash-stock__list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--gold-100);
}
.dash-stock__name {
  font-size: 0.8125rem;
  color: var(--gray-700);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: var(--space-2);
}

@media (max-width: 1024px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .dash-grid { grid-template-columns: 1fr; }
}
</style>

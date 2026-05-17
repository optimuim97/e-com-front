<template>
  <div class="space-y-8">
    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
      <div v-for="kpi in kpis" :key="kpi.label" class="card p-6">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">{{ kpi.label }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ kpi.value }}</p>
          </div>
          <div class="size-10 rounded-xl flex items-center justify-center" :class="kpi.bg">
            <component :is="kpi.icon" class="size-5" :class="kpi.color" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Commandes rÃ©centes -->
      <div class="lg:col-span-2 card p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-semibold text-gray-800">Commandes rÃ©centes</h2>
          <RouterLink to="/admin/orders" class="text-primary-500 text-sm hover:underline">Voir tout â†’</RouterLink>
        </div>
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-12 rounded-xl bg-gray-100 animate-pulse" />
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-gray-500 border-b border-gray-100">
              <th class="pb-3 font-medium">NÂ°</th>
              <th class="pb-3 font-medium">Client</th>
              <th class="pb-3 font-medium">Total</th>
              <th class="pb-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="order in recentOrders" :key="order.id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="router.push(`/admin/orders/${order.id}`)">
              <td class="py-3 font-mono text-xs text-gray-600">{{ order.number }}</td>
              <td class="py-3 text-gray-800">{{ order.user?.name ?? 'InvitÃ©' }}</td>
              <td class="py-3 font-semibold text-primary-500">{{ formatPrice(order.total) }}</td>
              <td class="py-3">
                <span :class="statusBadge(order.status)">{{ order.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Stock faible -->
      <div class="card p-6">
        <h2 class="font-semibold text-gray-800 mb-5">âš ï¸ Stock faible</h2>
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-10 rounded-xl bg-gray-100 animate-pulse" />
        </div>
        <div v-else-if="!lowStock.length" class="text-center py-8 text-gray-400 text-sm">
          Aucun produit en rupture
        </div>
        <div v-else class="space-y-3">
          <div v-for="p in lowStock" :key="p.id"
            class="flex items-center justify-between p-3 rounded-xl bg-amber-50">
            <span class="text-sm text-gray-700 line-clamp-1">{{ p.name }}</span>
            <span class="badge-warning shrink-0">{{ p.stock }}</span>
          </div>
        </div>
      </div>
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
  { label: 'Chiffre d\'affaires', value: formatPrice(stats.value.revenue ?? 0), icon: BanknotesIcon, bg: 'bg-green-50',   color: 'text-green-500'  },
  { label: 'Commandes',          value: stats.value.orders ?? 0,                icon: ShoppingBagIcon, bg: 'bg-primary-50', color: 'text-primary-500' },
  { label: 'Clients',            value: stats.value.customers ?? 0,             icon: UserGroupIcon,   bg: 'bg-blue-50',   color: 'text-blue-500'   },
  { label: 'Produits actifs',    value: stats.value.products ?? 0,              icon: CubeIcon,        bg: 'bg-purple-50', color: 'text-purple-500' },
]);

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);
}

function statusBadge(status) {
  const map = {
    pending:    'badge-warning',
    confirmed:  'badge-primary',
    processing: 'badge-primary',
    shipped:    'badge-success',
    delivered:  'badge-success',
    cancelled:  'badge-danger',
    refunded:   'badge-gray',
  };
  return map[status] ?? 'badge-gray';
}

onMounted(async () => {
  const { data } = await api.get('/admin/dashboard');
  stats.value       = data.stats;
  recentOrders.value = data.recent_orders;
  lowStock.value    = data.low_stock;
  loading.value     = false;
});
</script>


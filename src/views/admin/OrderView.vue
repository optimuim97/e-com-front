<template>
  <div class="space-y-6">
    <!-- Back -->
    <RouterLink :to="{ name: 'admin.orders' }" class="admin-back-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Retour aux commandes
    </RouterLink>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Content -->
    <div v-else-if="order" class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- Left: order detail -->
      <div class="xl:col-span-2 space-y-6">

        <!-- Header -->
        <div class="card admin-order-header">
          <div>
            <span class="eyebrow">Commande</span>
            <h1 class="admin-order-header__title">{{ order.number }}</h1>
            <p class="admin-order-header__date">Passée le {{ formatDate(order.created_at) }}</p>
          </div>
          <span :class="statusBadge(order.status)">{{ statusLabel(order.status) }}</span>
        </div>

        <!-- Items -->
        <div class="card p-6">
          <h2 class="font-semibold text-gray-800 mb-4">Articles</h2>
          <table class="w-full text-sm">
            <thead class="border-b border-gray-100">
              <tr class="text-left">
                <th class="pb-2 font-medium text-gray-500">Produit</th>
                <th class="pb-2 font-medium text-gray-500 text-center">Qté</th>
                <th class="pb-2 font-medium text-gray-500 text-right">Prix</th>
                <th class="pb-2 font-medium text-gray-500 text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="item in order.items" :key="item.id">
                <td class="py-3">
                  <div class="flex items-center gap-3">
                    <img :src="item.product_image || '/placeholder.png'" class="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                    <div>
                      <p class="font-medium text-gray-800">{{ item.product_name }}</p>
                      <p v-if="item.variant_name" class="text-xs text-gray-400">{{ item.variant_name }}</p>
                      <p class="text-xs text-gray-400 font-mono">SKU: {{ item.sku ?? '—' }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 text-center text-gray-600">{{ item.quantity }}</td>
                <td class="py-3 text-right text-gray-600">{{ formatPrice(item.price) }}</td>
                <td class="py-3 text-right font-semibold text-gray-800">{{ formatPrice(item.price * item.quantity) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Totals -->
          <div class="mt-4 pt-4 border-t border-gray-100 space-y-1.5 max-w-xs ml-auto">
            <div class="flex justify-between text-sm text-gray-500">
              <span>Sous-total</span><span>{{ formatPrice(order.subtotal) }}</span>
            </div>
            <div v-if="order.discount_amount" class="flex justify-between text-sm text-green-600">
              <span>Réduction</span><span>-{{ formatPrice(order.discount_amount) }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-500">
              <span>Livraison</span><span>{{ order.shipping_amount ? formatPrice(order.shipping_amount) : 'Gratuite' }}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span class="text-primary-500">{{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Shipping address -->
        <div class="card p-6">
          <h2 class="font-semibold text-gray-800 mb-3">Adresse de livraison</h2>
          <address class="text-sm text-gray-600 not-italic leading-relaxed">
            {{ order.shipping_first_name }} {{ order.shipping_last_name }}<br />
            {{ order.shipping_address }}<br />
            {{ order.shipping_city }}, {{ order.shipping_country }}<br />
            Tél : {{ order.phone }}
          </address>
        </div>
      </div>

      <!-- Right: actions -->
      <div class="space-y-4">

        <!-- Client info -->
        <div class="card p-5">
          <h2 class="font-semibold text-gray-800 mb-3">Client</h2>
          <p class="text-sm font-medium text-gray-800">{{ order.user?.name ?? [order.shipping_address?.first_name, order.shipping_address?.last_name].filter(Boolean).join(' ') }}</p>
          <p class="text-sm text-gray-400">{{ order.user?.email ?? '—' }}</p>
          <p class="text-sm text-gray-400 mt-1">{{ order.shipping_address?.phone ?? '—' }}</p>

          <a v-if="clientWaLink" :href="clientWaLink" target="_blank" rel="noopener"
             class="mt-3 flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors w-full justify-center">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Notifier le client WhatsApp
          </a>
          <p v-else-if="order.shipping_address?.phone" class="mt-3 text-xs text-gray-400 text-center">
            Configurez le n° admin WhatsApp dans les paramètres.
          </p>
        </div>

        <!-- Payment -->
        <div class="card p-5">
          <h2 class="font-semibold text-gray-800 mb-2">Paiement</h2>
          <p class="text-sm text-gray-600">{{ paymentLabel(order.payment_method) }}</p>
          <span :class="order.payment_status === 'paid' ? 'badge badge-success' : 'badge badge-warning'" class="mt-2">
            {{ order.payment_status === 'paid' ? 'Payé' : 'En attente' }}
          </span>
        </div>

        <!-- Update status -->
        <div class="card p-5 space-y-4">
          <h2 class="font-semibold text-gray-800">Modifier la commande</h2>

          <div>
            <label class="label">Statut</label>
            <select v-model="editForm.status" class="input">
              <option value="pending">En attente</option>
              <option value="processing">En cours</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
              <option value="refunded">Remboursée</option>
            </select>
          </div>

          <div>
            <label class="label">Numéro de suivi</label>
            <input v-model="editForm.tracking_number" type="text" class="input" placeholder="Ex. CI123456789" />
          </div>

          <button
            @click="updateOrder"
            :disabled="saving"
            class="btn-primary w-full py-2.5 font-medium disabled:opacity-50"
          >
            <span v-if="saving" class="flex items-center justify-center gap-2">
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Enregistrement…
            </span>
            <span v-else>Enregistrer</span>
          </button>

          <p v-if="saveSuccess" class="text-green-600 text-sm text-center">Commande mise à jour.</p>
          <p v-if="saveError" class="text-red-500 text-sm text-center">{{ saveError }}</p>
        </div>
      </div>
    </div>

    <div v-else class="card p-12 text-center">
      <p class="text-gray-400">Commande introuvable.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import api from '@/api'
import { buildClientMessage, buildWaLink } from '@/utils/whatsapp'

const route = useRoute()
const order       = ref(null)
const loading     = ref(true)
const saving      = ref(false)
const saveSuccess = ref(false)
const saveError   = ref('')
const settings    = ref({})

const editForm = reactive({
  status: '',
  tracking_number: '',
})

async function fetchOrder() {
  loading.value = true
  try {
    const [orderRes, settingsRes] = await Promise.all([
      api.get(`/admin/orders/${route.params.id}`),
      api.get('/settings'),
    ])
    order.value    = orderRes.data.data ?? orderRes.data
    settings.value = settingsRes.data
    editForm.status          = order.value.status
    editForm.tracking_number = order.value.tracking_number ?? ''
  } catch {
    order.value = null
  } finally {
    loading.value = false
  }
}

const clientWaLink = computed(() => {
  if (!order.value) return null
  const phone = order.value.shipping_address?.phone
  if (!phone) return null
  const shopName = settings.value.shop_name || 'Rosa Beauty'
  const message  = buildClientMessage(order.value, shopName)
  return buildWaLink(phone, message)
})

async function updateOrder() {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''
  try {
    const { data } = await api.patch(`/admin/orders/${route.params.id}`, editForm)
    order.value = data.data ?? data
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e) {
    saveError.value = e.response?.data?.message ?? 'Erreur lors de la mise à jour.'
  } finally {
    saving.value = false
  }
}

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
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
    virement: 'Virement bancaire', delivery: 'Paiement à la livraison',
  }
  return map[method] ?? method
}

onMounted(fetchOrder)
</script>

<style scoped>
.admin-back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: var(--gray-500);
  transition: color var(--transition-fast);
}
.admin-back-link:hover { color: var(--rose-500); }

.admin-order-header {
  padding: var(--space-6);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}
.admin-order-header__title {
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 500;
  color: var(--gray-800);
  margin-top: 4px;
  letter-spacing: 0.02em;
}
.admin-order-header__date {
  font-size: 0.8125rem;
  color: var(--gray-400);
  margin-top: 4px;
}
</style>

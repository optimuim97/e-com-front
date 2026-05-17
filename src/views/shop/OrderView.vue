<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-3xl mx-auto px-4">
      <!-- Back -->
      <RouterLink to="/orders" class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary-500 mb-6 transition-colors">
        ← Mes commandes
      </RouterLink>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Error -->
      <div v-else-if="!order" class="card p-12 text-center">
        <p class="text-gray-400 mb-4">Commande introuvable.</p>
        <RouterLink to="/orders" class="btn-primary">Retour</RouterLink>
      </div>

      <!-- Detail -->
      <div v-else class="space-y-6">
        <!-- Header -->
        <div class="card p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 class="text-xl font-bold text-gray-900 mb-1">Commande {{ order.number }}</h1>
              <p class="text-sm text-gray-400">Passée le {{ formatDate(order.created_at) }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span :class="statusBadge(order.status)" class="text-sm">{{ statusLabel(order.status) }}</span>
              <button
                @click="showChangePinModal = true"
                class="text-xs text-gray-400 hover:text-primary-500 transition-colors flex items-center gap-1"
                title="Modifier mon code PIN"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3M4.5 10.5h15A1.5 1.5 0 0121 12v7.5A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5V12a1.5 1.5 0 011.5-1.5z" />
                </svg>
                PIN
              </button>
            </div>
          </div>

          <!-- Tracking -->
          <div v-if="order.tracking_number" class="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            Numéro de suivi : <strong>{{ order.tracking_number }}</strong>
          </div>

          <!-- WhatsApp -->
          <div v-if="waLink" class="mt-4 p-4 bg-green-50 rounded-xl flex items-start gap-3">
            <svg class="w-5 h-5 text-green-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <div class="flex-1">
              <p class="text-sm font-medium text-green-800">Envoyer votre commande au vendeur</p>
              <p class="text-xs text-green-600 mt-0.5">Cliquez pour ouvrir WhatsApp avec les détails de votre commande.</p>
            </div>
            <a :href="waLink" target="_blank" rel="noopener"
               class="shrink-0 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Envoyer
            </a>
          </div>
        </div>

        <!-- Items -->
        <div class="card p-6">
          <h2 class="font-semibold text-gray-800 mb-4">Articles commandés</h2>
          <ul class="space-y-4">
            <li
              v-for="item in order.items"
              :key="item.id"
              class="flex items-start gap-4"
            >
              <img
                :src="item.product_image || '/placeholder.png'"
                :alt="item.product_name"
                class="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-800">{{ item.product_name }}</p>
                <p v-if="item.variant_name" class="text-xs text-gray-400">{{ item.variant_name }}</p>
                <p class="text-sm text-gray-500 mt-1">Qté : {{ item.quantity }}</p>
              </div>
              <p class="font-semibold text-gray-800 whitespace-nowrap">
                {{ formatPrice(item.unit_price * item.quantity) }}</p>
            </li>
          </ul>
        </div>

        <!-- Totals -->
        <div class="card p-6">
          <h2 class="font-semibold text-gray-800 mb-4">Récapitulatif</h2>
          <div class="space-y-2">
            <div class="flex justify-between text-sm text-gray-500">
              <span>Sous-total</span>
              <span>{{ formatPrice(order.subtotal) }}</span>
            </div>
            <div v-if="order.discount_amount" class="flex justify-between text-sm text-green-600">
              <span>Réduction</span>
              <span>-{{ formatPrice(order.discount_amount) }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-500">
              <span>Livraison</span>
              <span>{{ order.shipping_cost ? formatPrice(order.shipping_cost) : 'Gratuite' }}</span>
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
          <address class="text-sm text-gray-600 not-italic space-y-1">
            <p class="font-medium text-gray-800">
              {{ order.shipping_address?.first_name }} {{ order.shipping_address?.last_name }}
            </p>
            <p>{{ order.shipping_address?.address_line1 }}</p>
            <p>{{ order.shipping_address?.city }}<span v-if="order.shipping_address?.country"> — {{ countryName(order.shipping_address.country) }}</span></p>
            <p class="flex items-center gap-1 pt-1">
              <span class="text-gray-400">Tél :</span>
              {{ order.shipping_address?.phone }}
            </p>
          </address>
        </div>

        <!-- Payment -->
        <div class="card p-6">
          <h2 class="font-semibold text-gray-800 mb-2">Méthode de paiement</h2>
          <p class="text-sm text-gray-600">{{ paymentLabel(order.payments?.[0]?.provider) }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- PIN verification modal -->
  <PinModal
    v-if="!pinStore.verified"
    @verified="onPinVerified"
    @change-pin="showChangePinModal = true"
  />

  <!-- Change PIN modal -->
  <PinChangeModal
    v-if="showChangePinModal"
    @close="showChangePinModal = false"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import api from '@/api'
import { buildAdminMessage, buildWaLink } from '@/utils/whatsapp'
import { usePinStore } from '@/stores/pin'
import PinModal from '@/components/PinModal.vue'
import PinChangeModal from '@/components/PinChangeModal.vue'

const route = useRoute()
const pinStore = usePinStore()

const order    = ref(null)
const loading  = ref(true)
const settings = ref({})
const showChangePinModal = ref(false)

function onPinVerified() {
  // PIN verified — order content is now visible (pinStore.verified = true)
}

async function fetchOrder() {
  loading.value = true
  try {
    const [orderRes, settingsRes] = await Promise.all([
      api.get(`/orders/${route.params.number}`),
      api.get('/settings'),
    ])
    order.value    = orderRes.data.data ?? orderRes.data
    settings.value = settingsRes.data
  } catch {
    order.value = null
  } finally {
    loading.value = false
  }
}

const waLink = computed(() => {
  if (!order.value || !settings.value.whatsapp_admin_number) return null
  if (settings.value.whatsapp_notify_customer !== 'true') return null
  const message = buildAdminMessage(order.value)
  return buildWaLink(settings.value.whatsapp_admin_number, message)
})

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
}

function statusLabel(status) {
  const map = {
    pending: 'En attente',
    processing: 'En cours',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    refunded: 'Remboursée',
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

function countryName(code) {
  if (!code) return '—'
  try {
    return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

function paymentLabel(method) {
  const map = {
    wave: 'Wave',
    orange_money: 'Orange Money',
    stripe: 'Stripe / Carte bancaire',
    virement: 'Virement bancaire',
    delivery: 'Paiement à la livraison',
  }
  return map[method] ?? method
}

onMounted(fetchOrder)
</script>

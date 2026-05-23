<template>
  <main class="order-page">
    <div class="container order-content">
      <!-- Back -->
      <RouterLink to="/orders" class="order-back">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Mes commandes
      </RouterLink>

      <!-- Loading -->
      <div v-if="loading" class="order-loader">
        <div class="order-loader__spinner"></div>
      </div>

      <!-- Error -->
      <div v-else-if="!order" class="order-empty card">
        <div class="order-empty__icon">🌸</div>
        <h2 class="display-md">Commande introuvable</h2>
        <RouterLink to="/orders" class="btn btn-primary">Retour</RouterLink>
      </div>

      <!-- Detail -->
      <div v-else class="order-blocks">
        <!-- Header -->
        <header class="order-header card">
          <div class="order-header__inner">
            <div>
              <span class="eyebrow">Commande</span>
              <h1 class="display-md order-header__title">{{ order.number }}</h1>
              <p class="order-header__date">Passée le {{ formatDate(order.created_at) }}</p>
            </div>
            <div class="order-header__actions">
              <span :class="statusBadge(order.status)">{{ statusLabel(order.status) }}</span>
              <div class="order-header__btns">
                <button @click="downloadInvoice" :disabled="downloadingPdf" class="order-pdf-btn" title="Télécharger la facture PDF">
                  <svg v-if="!downloadingPdf" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3M3 7V4a1 1 0 011-1h4l2 3h8a1 1 0 011 1v3" />
                  </svg>
                  <svg v-else width="13" height="13" class="order-pdf-btn__spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke-linecap="round"/>
                  </svg>
                  Facture
                </button>
                <button @click="showChangePinModal = true" class="order-pin-btn" title="Modifier mon code PIN">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3M4.5 10.5h15A1.5 1.5 0 0121 12v7.5A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5V12a1.5 1.5 0 011.5-1.5z" />
                </svg>
                PIN
                </button>
              </div>
            </div>
          </div>

          <!-- Tracking -->
          <div v-if="order.tracking_number" class="order-tracking">
            <strong>Numéro de suivi :</strong> {{ order.tracking_number }}
          </div>

          <!-- WhatsApp -->
          <div v-if="waLink" class="order-whatsapp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="order-whatsapp__icon">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <div class="order-whatsapp__text">
              <strong>Envoyer votre commande au vendeur</strong>
              <p>Cliquez pour ouvrir WhatsApp avec les détails de votre commande.</p>
            </div>
            <a :href="waLink" target="_blank" rel="noopener" class="order-whatsapp__btn">
              Envoyer
            </a>
          </div>
        </header>

        <!-- Items -->
        <section class="card order-block">
          <h2 class="order-block__title">Articles commandés</h2>
          <ul class="order-items">
            <li v-for="item in order.items" :key="item.id" class="order-item">
              <img
                :src="item.product_image || '/placeholder.png'"
                :alt="item.product_name"
                class="order-item__img"
              />
              <div class="order-item__info">
                <p class="order-item__name">{{ item.product_name }}</p>
                <p v-if="item.variant_name" class="order-item__variant">{{ item.variant_name }}</p>
                <p class="order-item__qty">Qté : {{ item.quantity }}</p>
              </div>
              <p class="order-item__price">
                {{ formatPrice(item.unit_price * item.quantity) }}
              </p>
            </li>
          </ul>
        </section>

        <!-- Totals -->
        <section class="card order-block">
          <h2 class="order-block__title">Récapitulatif</h2>
          <ul class="order-totals">
            <li>
              <span>Sous-total</span>
              <span>{{ formatPrice(order.subtotal) }}</span>
            </li>
            <li v-if="order.discount_amount" class="order-totals__discount">
              <span>Réduction</span>
              <span>-{{ formatPrice(order.discount_amount) }}</span>
            </li>
            <li>
              <span>Livraison</span>
              <span>{{ order.shipping_cost ? formatPrice(order.shipping_cost) : 'Gratuite' }}</span>
            </li>
            <li class="order-totals__final">
              <span>Total</span>
              <span>{{ formatPrice(order.total) }}</span>
            </li>
          </ul>
        </section>

        <!-- Shipping address -->
        <section class="card order-block">
          <h2 class="order-block__title">Adresse de livraison</h2>
          <address class="order-address">
            <p class="order-address__name">
              {{ order.shipping_address?.first_name }} {{ order.shipping_address?.last_name }}
            </p>
            <p>{{ order.shipping_address?.address_line1 }}</p>
            <p>{{ order.shipping_address?.city }}<span v-if="order.shipping_address?.country"> — {{ countryName(order.shipping_address.country) }}</span></p>
            <p class="order-address__phone">
              <span>Tél :</span> {{ order.shipping_address?.phone }}
            </p>
          </address>
        </section>

        <!-- Payment -->
        <section class="card order-block">
          <h2 class="order-block__title">Méthode de paiement</h2>
          <p class="order-payment">{{ paymentLabel(order.payments?.[0]?.provider) }}</p>
        </section>
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
  </main>
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
const downloadingPdf     = ref(false)

function onPinVerified() {
  // PIN verified — order content is now visible
}

async function downloadInvoice() {
  if (!order.value) return
  downloadingPdf.value = true
  try {
    const response = await api.get(`/orders/${order.value.number}/invoice`, {
      responseType: 'blob',
    })
    const url  = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href  = url
    link.download = `facture-${order.value.number}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch {
    // silent — user can retry
  } finally {
    downloadingPdf.value = false
  }
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

<style scoped>
.order-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding: var(--space-8) 0 var(--space-16);
}

.order-content { max-width: 760px; }

.order-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8125rem;
  color: var(--gray-500);
  margin-bottom: var(--space-6);
  transition: color var(--transition-fast);
}
.order-back:hover { color: var(--rose-500); }

.order-loader { display: flex; justify-content: center; padding: var(--space-16) 0; }
.order-loader__spinner {
  width: 32px; height: 32px;
  border: 2px solid var(--rose-100);
  border-top-color: var(--rose-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.order-empty {
  text-align: center;
  padding: var(--space-16);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}
.order-empty__icon { font-size: 4rem; opacity: 0.6; }

.order-blocks {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* ── Header ── */
.order-header {
  padding: var(--space-6);
}
.order-header__inner {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}
.order-header__title {
  color: var(--gray-800);
  font-family: var(--font-display);
  margin-top: var(--space-1);
}
.order-header__date {
  font-size: 0.8125rem;
  color: var(--gray-400);
  margin-top: var(--space-1);
}
.order-header__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}
.order-header__btns {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.order-pdf-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.75rem;
  color: #fff;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--rose-500);
  border: 1.5px solid var(--rose-500);
  transition: all var(--transition-fast);
  font-weight: 500;
}
.order-pdf-btn:hover:not(:disabled) {
  background: var(--rose-600);
  border-color: var(--rose-600);
}
.order-pdf-btn:disabled { opacity: 0.65; cursor: default; }
.order-pdf-btn__spin {
  animation: spin 0.7s linear infinite;
}

.order-pin-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.75rem;
  color: var(--gray-500);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--cream-300);
  background: #fff;
  transition: all var(--transition-fast);
}
.order-pin-btn:hover { border-color: var(--rose-300); color: var(--rose-500); }

.order-tracking {
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--rose-50);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--rose-700);
}

.order-whatsapp {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background: #dcfce7;
  border-radius: var(--radius-md);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}
.order-whatsapp__icon { color: #16a34a; flex-shrink: 0; }
.order-whatsapp__text { flex: 1; font-size: 0.8125rem; }
.order-whatsapp__text strong { color: #15803d; display: block; }
.order-whatsapp__text p { color: #16a34a; margin-top: 2px; }
.order-whatsapp__btn {
  background: #16a34a;
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  transition: background var(--transition-fast);
  flex-shrink: 0;
}
.order-whatsapp__btn:hover { background: #15803d; }

/* ── Blocks ── */
.order-block { padding: var(--space-6); }
.order-block__title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--gray-800);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--cream-200);
}

/* ── Items ── */
.order-items {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.order-item {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: var(--space-4);
  align-items: center;
}
.order-item__img {
  width: 64px; height: 64px;
  border-radius: var(--radius-md);
  object-fit: cover;
  background: var(--cream-100);
}
.order-item__name {
  font-weight: 500;
  color: var(--gray-800);
  font-size: 0.9375rem;
}
.order-item__variant {
  font-size: 0.75rem;
  color: var(--gray-400);
  margin-top: 2px;
}
.order-item__qty {
  font-size: 0.8125rem;
  color: var(--gray-500);
  margin-top: 4px;
}
.order-item__price {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--gray-800);
  white-space: nowrap;
}

/* ── Totals ── */
.order-totals {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.order-totals li {
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
  color: var(--gray-600);
}
.order-totals__discount { color: #15803d; }
.order-totals__final {
  font-family: var(--font-display);
  font-size: 1.25rem !important;
  font-weight: 600;
  color: var(--gray-800) !important;
  padding-top: var(--space-3);
  border-top: 1px solid var(--cream-200);
}
.order-totals__final span:last-child { color: var(--rose-600); }

/* ── Address ── */
.order-address {
  font-style: normal;
  font-size: 0.9375rem;
  color: var(--gray-600);
  line-height: 1.7;
}
.order-address__name {
  font-weight: 600;
  color: var(--gray-800);
}
.order-address__phone {
  margin-top: var(--space-2);
  font-size: 0.875rem;
}
.order-address__phone span { color: var(--gray-400); }

.order-payment {
  font-size: 0.9375rem;
  color: var(--gray-600);
}
</style>

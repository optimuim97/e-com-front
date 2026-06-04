<template>
  <Teleport to="body">
    <div class="qo-overlay" @click.self="$emit('close')">
      <div class="qo-card">

        <!-- ── Confirmation post-commande ────────────────────────────── -->
        <div v-if="confirmed" class="qo-confirmed">
          <div class="qo-confirmed__icon"><FlowerMark /></div>
          <h2 class="qo-confirmed__title">Commande confirmée !</h2>
          <p class="qo-confirmed__number">N° <strong>{{ confirmedOrder.number }}</strong></p>

          <!-- PIN généré -->
          <div v-if="confirmedOrder.generated_pin" class="qo-pin-box">
            <p class="qo-pin-box__label">Votre code PIN de sécurité</p>
            <div class="qo-pin-box__digits">
              <span v-for="d in confirmedOrder.generated_pin.split('')" :key="d" class="qo-pin-box__digit">{{ d }}</span>
            </div>
            <p class="qo-pin-box__hint">Notez-le précieusement. Il vous servira à accéder à vos commandes.</p>
          </div>

          <!-- Wave : instructions de paiement -->
          <div v-if="isWavePayment && waveNumber" class="qo-wave-box">
            <p class="qo-wave-box__label">Paiement Wave</p>
            <p class="qo-wave-box__number">{{ waveNumber }}</p>
            <p class="qo-wave-box__total">Montant à envoyer : <strong>{{ fmtPrice(confirmedOrder.total) }}</strong></p>
            <p class="qo-wave-box__ref">Référence : <strong>{{ confirmedOrder.number }}</strong></p>
          </div>

          <!-- WhatsApp admin — notifier de la commande -->
          <a v-if="adminWhatsappLink" :href="adminWhatsappLink" target="_blank" rel="noopener"
            class="btn btn-whatsapp qo-wa-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Envoyer ma commande via WhatsApp
          </a>

          <div class="qo-confirmed__actions">
            <button class="btn btn-primary" @click="viewOrder">Voir ma commande</button>
            <button class="btn btn-outline btn-sm" @click="goToProfile">Sécuriser mon compte</button>
          </div>
        </div>

        <!-- ── Formulaire commande rapide ────────────────────────────── -->
        <template v-else>
          <button class="qo-close" @click="$emit('close')" aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>

          <div class="qo-header">
            <span class="eyebrow">Commande rapide</span>
            <h2 class="qo-title">En <em>2 minutes</em> chrono</h2>
            <p class="qo-subtitle">Seulement les infos essentielles pour vous livrer.</p>
          </div>

          <!-- Items résumé -->
          <div class="qo-items-summary">
            <span v-for="item in cartItems" :key="item.id" class="qo-item-chip">
              {{ item.product?.name ?? 'Produit' }} ×{{ item.quantity }}
            </span>
          </div>

          <form @submit.prevent="submit" class="qo-form">
            <!-- Nom -->
            <div class="qo-field">
              <label class="label">Nom complet *</label>
              <input v-model="form.name" type="text" class="input" placeholder="Ex. Fatou Konaté" required />
            </div>

            <!-- Téléphone -->
            <div class="qo-field">
              <label class="label">Téléphone *</label>
              <PhoneInput v-model="form.phone" placeholder="07 00 00 00 00" :required="true" />
            </div>

            <!-- Email (optionnel, pour recevoir la facture) -->
            <div class="qo-field">
              <label class="label">
                E-mail <span class="qo-optional">(optionnel — pour recevoir la facture PDF)</span>
              </label>
              <input v-model="form.email" type="email" class="input" placeholder="vous@exemple.com" />
            </div>

            <!-- Commune -->
            <div class="qo-field">
              <label class="label">Commune / Quartier (Abidjan) *</label>
              <select v-model="form.commune" class="input qo-select" required>
                <option value="" disabled>Choisir votre commune…</option>
                <option v-for="c in COMMUNES" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>

            <!-- Paiement -->
            <div class="qo-field">
              <label class="label">Mode de paiement *</label>
              <div class="qo-payments">
                <label v-for="pm in paymentMethods" :key="pm.value"
                  class="qo-payment" :class="{ 'qo-payment--active': form.payment === pm.value }">
                  <input type="radio" :value="pm.value" v-model="form.payment" required />
                  <span class="qo-payment__icon" v-html="pm.icon"></span>
                  <span class="qo-payment__label">{{ pm.label }}</span>
                </label>
              </div>
            </div>

            <!-- Note optionnelle -->
            <div class="qo-field">
              <label class="label">Note pour le livreur <span class="qo-optional">(optionnel)</span></label>
              <input v-model="form.note" type="text" class="input" placeholder="Ex. Appeler en arrivant" />
            </div>

            <p v-if="error" class="qo-error">{{ error }}</p>

            <!-- Récap prix -->
            <div class="qo-total">
              <span>Total</span>
              <strong>{{ fmtPrice(cartTotal) }}</strong>
            </div>

            <button type="submit" class="btn btn-primary btn-lg qo-submit" :disabled="submitting">
              <span v-if="submitting" class="qo-spinner"></span>
              <span v-else>Commander maintenant</span>
            </button>
          </form>
        </template>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { useCartStore } from '@/features/cart/cart.store'
import { useAuthStore } from '@/features/auth/auth.store'
import { useSettingsStore } from '@/stores/settings'
import PhoneInput from '@/components/ui/PhoneInput.vue'

const emit   = defineEmits(['close'])
const router = useRouter()

const cartStore     = useCartStore()
const authStore     = useAuthStore()
const settingsStore = useSettingsStore()

const cartItems  = computed(() => cartStore.items)
const cartTotal  = computed(() => cartStore.total)
const waveNumber = computed(() => settingsStore.paymentMobileNumber.value)

// WhatsApp admin notification link
const adminWhatsappLink = computed(() => {
  const order = confirmedOrder.value
  if (!order) return null
  const adminNumber = settingsStore.whatsappNumber?.value
  if (!adminNumber) return null

  const phone = form.value.phone
  const methodMap = { wave: 'Wave', orange_money: 'Orange Money', delivery: 'À la livraison' }
  const method = methodMap[form.value.payment] ?? form.value.payment
  const pin = order.generated_pin ?? '—'

  const msg = [
    `🌹 Nouvelle commande Rosa Beauty`,
    `N°: ${order.number}`,
    `Client: ${form.value.name} (${phone})`,
    `Commune: ${form.value.commune}`,
    `Paiement: ${method}`,
    `Total: ${fmtPrice(order.total)}`,
    ``,
    `🔐 PIN généré: ${pin}`,
    form.value.note ? `📝 Note: ${form.value.note}` : null,
    ``,
    `Répondre au client sur ce numéro: ${phone}`,
  ].filter(l => l !== null).join('\n')

  const clean = adminNumber.replace(/\D/g, '')
  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`
})

const COMMUNES = [
  'Abobo', 'Adjamé', 'Anyama', 'Attécoubé', 'Bingerville',
  'Cocody', 'Koumassi', 'Marcory', 'Plateau', 'Port-Bouët',
  'Songon', 'Treichville', 'Yopougon',
  'Autres / Hors Abidjan',
]

const ICON_MOBILE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>'
const ICON_TRUCK  = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'

const paymentMethods = [
  { value: 'wave',         label: 'Wave',           icon: ICON_MOBILE },
  { value: 'orange_money', label: 'Orange Money',   icon: ICON_MOBILE },
  { value: 'delivery',     label: 'À la livraison', icon: ICON_TRUCK },
]

const form = ref({
  name: '',
  phone: '',
  email: '',
  commune: '',
  payment: 'wave',
  note: '',
})

const submitting    = ref(false)
const error         = ref('')
const confirmed     = ref(false)
const confirmedOrder = ref(null)

const isWavePayment = computed(() =>
  confirmedOrder.value && (confirmedOrder.value?.payments?.[0]?.provider === 'wave' || form.value.payment === 'wave')
)

async function submit() {
  if (!form.value.name || !form.value.phone || !form.value.commune || !form.value.payment) return

  submitting.value = true
  error.value = ''

  const items = cartItems.value.map(i => ({
    product_id: i.product_id,
    variant_id: i.variant_id ?? null,
    quantity:   i.quantity,
  }))

  if (!items.length) {
    error.value = 'Votre panier est vide.'
    submitting.value = false
    return
  }

  try {
    const { data } = await api.post('/quick-order', {
      name:           form.value.name,
      phone:          form.value.phone,
      email:          form.value.email?.trim() || null,
      commune:        form.value.commune,
      payment_method: form.value.payment,
      note:           form.value.note || null,
      items,
    })

    // Stocke le token pour permettre l'accès à la commande
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token)
      await authStore.fetchUser()
    }

    cartStore.clear()

    // Paiement en ligne (GeniusPay) : rediriger vers la page de paiement
    if (data.payment_url) {
      window.location.href = data.payment_url
      return
    }

    confirmedOrder.value = data
    confirmed.value = true

  } catch (e) {
    error.value = e.response?.data?.message ?? 'Une erreur est survenue. Réessayez.'
  } finally {
    submitting.value = false
  }
}

function viewOrder() {
  emit('close')
  router.push({ name: 'order', params: { number: confirmedOrder.value?.number } })
}

function goToProfile() {
  emit('close')
  router.push({ name: 'profile' })
}

function fmtPrice(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
}
</script>

<style scoped>
/* ── Overlay ── */
.qo-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.qo-card {
  background: #fff;
  border-radius: var(--radius-2xl, 20px);
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-7) var(--space-6);
  position: relative;
  box-shadow: 0 24px 64px rgba(0,0,0,.18);
}

.qo-close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--cream-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
  transition: all var(--transition-fast);
}
.qo-close:hover { background: var(--rose-100); color: var(--rose-500); }

/* ── Header ── */
.qo-header { margin-bottom: var(--space-4); }
.qo-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--gray-800);
  margin: var(--space-1) 0 var(--space-2);
}
.qo-title em { font-style: italic; color: var(--rose-500); }
.qo-subtitle { font-size: 0.875rem; color: var(--gray-400); }

/* ── Items résumé ── */
.qo-items-summary {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}
.qo-item-chip {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 10px;
  background: var(--rose-50);
  color: var(--rose-600);
  border-radius: var(--radius-full);
  border: 1px solid var(--rose-100);
}

/* ── Formulaire ── */
.qo-form { display: flex; flex-direction: column; gap: var(--space-4); }

.qo-field { display: flex; flex-direction: column; gap: var(--space-1); }

.qo-optional { font-size: 0.75rem; color: var(--gray-400); font-weight: 400; }

.qo-select { appearance: none; cursor: pointer; }

/* ── Paiement ── */
.qo-payments {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}
.qo-payment {
  border: 2px solid var(--cream-300);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-2);
  cursor: pointer;
  text-align: center;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.qo-payment input { display: none; }
.qo-payment__icon { font-size: 1.5rem; }
.qo-payment__label { font-size: 0.7rem; font-weight: 500; color: var(--gray-600); }
.qo-payment--active {
  border-color: var(--rose-400);
  background: var(--rose-50);
}
.qo-payment--active .qo-payment__label { color: var(--rose-600); }

/* ── Total ── */
.qo-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background: var(--cream-50);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  color: var(--gray-600);
}
.qo-total strong {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--rose-600);
}

.qo-submit { width: 100%; justify-content: center; gap: var(--space-2); }

.qo-error {
  font-size: 0.875rem;
  color: #dc2626;
  background: #fef2f2;
  padding: var(--space-3);
  border-radius: var(--radius-md);
}

.qo-spinner {
  display: inline-block;
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: qs-spin 0.7s linear infinite;
}
@keyframes qs-spin { to { transform: rotate(360deg); } }

/* ── Confirmation ── */
.qo-confirmed {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) 0;
}
.qo-confirmed__icon { font-size: 3.5rem; }
.qo-confirmed__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--gray-800);
}
.qo-confirmed__number { font-size: 0.9375rem; color: var(--gray-500); }

/* ── PIN Box ── */
.qo-pin-box {
  width: 100%;
  background: var(--rose-50);
  border: 1.5px solid var(--rose-200);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  text-align: center;
}
.qo-pin-box__label { font-size: 0.8125rem; color: var(--rose-600); margin-bottom: var(--space-3); font-weight: 600; }
.qo-pin-box__digits { display: flex; justify-content: center; gap: var(--space-3); margin-bottom: var(--space-3); }
.qo-pin-box__digit {
  width: 48px; height: 56px;
  background: #fff;
  border: 2px solid var(--rose-300);
  border-radius: var(--radius-md);
  font-size: 1.75rem;
  font-weight: 700;
  font-family: var(--font-display);
  color: var(--rose-700);
  display: flex;
  align-items: center;
  justify-content: center;
}
.qo-pin-box__hint { font-size: 0.75rem; color: var(--rose-500); }

/* ── Wave Box ── */
.qo-wave-box {
  width: 100%;
  background: #eff6ff;
  border: 1.5px solid #bfdbfe;
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  text-align: center;
}
.qo-wave-box__label { font-size: 0.8125rem; color: #1d4ed8; font-weight: 600; margin-bottom: var(--space-2); }
.qo-wave-box__number { font-size: 1.5rem; font-weight: 700; color: #1e40af; letter-spacing: 0.05em; }
.qo-wave-box__total { font-size: 0.875rem; color: #1d4ed8; margin-top: var(--space-2); }
.qo-wave-box__ref { font-size: 0.8125rem; color: #3b82f6; }

.qo-wa-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  background: #25d366;
  color: #fff;
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  transition: background var(--transition-fast);
}
.qo-wa-btn:hover { background: #1ebe5d; }

.qo-confirmed__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}
.qo-confirmed__actions .btn { justify-content: center; }
</style>

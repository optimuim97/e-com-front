<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-2xl font-bold text-gray-900 mb-8">Finaliser la commande</h1>

      <form @submit.prevent="submitOrder" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: form -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Personal info -->
          <div class="card p-6 space-y-4">
            <h2 class="font-semibold text-gray-800 text-lg">Informations personnelles</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="label">PrÃ©nom *</label>
                <input v-model="form.first_name" type="text" class="input" required placeholder="Ex. Fatou" />
              </div>
              <div>
                <label class="label">Nom *</label>
                <input v-model="form.last_name" type="text" class="input" required placeholder="Ex. KonatÃ©" />
              </div>
            </div>
            <div>
              <label class="label">TÃ©lÃ©phone *</label>
              <input v-model="form.phone" type="tel" class="input" required placeholder="+225 07 00 00 00" />
            </div>
          </div>

          <!-- Shipping address -->
          <div class="card p-6 space-y-4">
            <h2 class="font-semibold text-gray-800 text-lg">Adresse de livraison</h2>
            <div>
              <label class="label">Adresse *</label>
              <input v-model="form.address" type="text" class="input" required placeholder="Rue, numÃ©ro, quartier" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="label">Ville *</label>
                <input v-model="form.city" type="text" class="input" required placeholder="Abidjan" />
              </div>
              <div>
                <label class="label">Pays *</label>
                <select v-model="form.country" class="input" required>
                  <option value="">SÃ©lectionner un pays</option>
                  <option value="CI">CÃ´te d'Ivoire</option>
                  <option value="SN">SÃ©nÃ©gal</option>
                  <option value="ML">Mali</option>
                  <option value="BF">Burkina Faso</option>
                  <option value="GN">GuinÃ©e</option>
                  <option value="TG">Togo</option>
                  <option value="BJ">BÃ©nin</option>
                  <option value="GH">Ghana</option>
                  <option value="FR">France</option>
                  <option value="BE">Belgique</option>
                  <option value="CA">Canada</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Payment method -->
          <div class="card p-6 space-y-4">
            <h2 class="font-semibold text-gray-800 text-lg">MÃ©thode de paiement</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                v-for="method in paymentMethods"
                :key="method.value"
                class="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all"
                :class="form.payment_method === method.value
                  ? 'border-primary-500 bg-pink-50'
                  : 'border-gray-100 hover:border-gray-200'"
              >
                <input
                  type="radio"
                  :value="method.value"
                  v-model="form.payment_method"
                  class="accent-primary-500"
                  required
                />
                <span class="text-xl">{{ method.icon }}</span>
                <span class="text-sm font-medium text-gray-700">{{ method.label }}</span>
              </label>
            </div>
          </div>

          <!-- Coupon -->
          <div class="card p-6 space-y-3">
            <h2 class="font-semibold text-gray-800 text-lg">Code promo</h2>
            <div class="flex gap-2">
              <input
                v-model="couponCode"
                type="text"
                class="input flex-1"
                placeholder="BIENVENUE10"
                :disabled="couponApplied"
              />
              <button
                type="button"
                @click="applyCoupon"
                :disabled="couponLoading || couponApplied"
                class="btn-outline px-4"
              >
                {{ couponApplied ? 'AppliquÃ©' : 'Appliquer' }}
              </button>
            </div>
            <p v-if="couponError" class="text-red-500 text-sm">{{ couponError }}</p>
            <p v-if="couponApplied" class="text-green-600 text-sm">Code appliquÃ© â€” {{ couponDiscount }}% de rÃ©duction</p>
          </div>
        </div>

        <!-- Right: summary -->
        <div class="space-y-4">
          <div class="card p-6 sticky top-6">
            <h2 class="font-semibold text-gray-800 text-lg mb-4">RÃ©capitulatif</h2>

            <div v-if="cartStore.items.length === 0" class="text-gray-400 text-sm text-center py-4">
              Votre panier est vide.
            </div>

            <ul v-else class="space-y-3 mb-4">
              <li
                v-for="item in cartStore.items"
                :key="item.id"
                class="flex items-start gap-3"
              >
                <img
                  :src="item.image || '/placeholder.png'"
                  :alt="item.name"
                  class="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ item.name }}</p>
                  <p class="text-xs text-gray-400">QtÃ© : {{ item.quantity }}</p>
                </div>
                <p class="text-sm font-semibold text-gray-800 whitespace-nowrap">
                  {{ formatPrice(item.price * item.quantity) }}
                </p>
              </li>
            </ul>

            <div class="border-t border-gray-100 pt-4 space-y-2">
              <div class="flex justify-between text-sm text-gray-500">
                <span>Sous-total</span>
                <span>{{ formatPrice(cartStore.subtotal) }}</span>
              </div>
              <div v-if="couponApplied" class="flex justify-between text-sm text-green-600">
                <span>RÃ©duction ({{ couponDiscount }}%)</span>
                <span>-{{ formatPrice(cartStore.subtotal * couponDiscount / 100) }}</span>
              </div>
              <div class="flex justify-between text-sm text-gray-500">
                <span>Livraison</span>
                <span class="text-green-600">Gratuite</span>
              </div>
              <div class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span class="text-primary-500">{{ formatPrice(orderTotal) }}</span>
              </div>
            </div>

            <button
              type="submit"
              :disabled="submitting || cartStore.items.length === 0"
              class="btn-primary w-full mt-6 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="submitting" class="flex items-center justify-center gap-2">
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Traitementâ€¦
              </span>
              <span v-else>Confirmer la commande</span>
            </button>

            <p v-if="submitError" class="text-red-500 text-xs text-center mt-3">{{ submitError }}</p>
          </div>
        </div>
      </form>
    </div>
  </div>

  <!-- PIN reveal modal (shown once after order creation if PIN was auto-generated) -->
  <PinRevealModal
    v-if="generatedPin"
    :pin="generatedPin"
    @close="onPinRevealed"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { useCartStore } from '@/stores/cart'
import { usePinStore } from '@/stores/pin'
import PinRevealModal from '@/components/PinRevealModal.vue'

const router    = useRouter()
const cartStore = useCartStore()
const pinStore  = usePinStore()

const generatedPin   = ref(null)
const pendingOrderNr = ref(null)

const form = ref({
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  payment_method: '',
})

const paymentMethods = [
  { value: 'wave', label: 'Wave', icon: 'ðŸ’™' },
  { value: 'orange_money', label: 'Orange Money', icon: 'ðŸŸ ' },
  { value: 'stripe', label: 'Stripe / Carte', icon: 'ðŸ’³' },
  { value: 'virement', label: 'Virement bancaire', icon: 'ðŸ¦' },
  { value: 'delivery', label: 'Paiement Ã  la livraison', icon: 'ðŸšš' },
]

const couponCode = ref('')
const couponApplied = ref(false)
const couponDiscount = ref(0)
const couponError = ref('')
const couponLoading = ref(false)
const submitting = ref(false)
const submitError = ref('')

const orderTotal = computed(() => {
  const sub = cartStore.subtotal ?? 0
  if (couponApplied.value) return sub - sub * couponDiscount.value / 100
  return sub
})

async function applyCoupon() {
  if (!couponCode.value.trim()) return
  couponLoading.value = true
  couponError.value = ''
  try {
    const { data } = await api.post('/coupons/validate', { code: couponCode.value })
    couponApplied.value = true
    couponDiscount.value = data.discount ?? 10
  } catch (e) {
    couponError.value = e.response?.data?.message ?? 'Code invalide.'
  } finally {
    couponLoading.value = false
  }
}

async function submitOrder() {
  submitting.value = true
  submitError.value = ''
  try {
    const payload = {
      ...form.value,
      coupon_code: couponApplied.value ? couponCode.value : null,
      items: cartStore.items.map(i => ({
        product_id: i.product_id,
        variant_id: i.variant_id ?? null,
        quantity: i.quantity,
        price: i.price,
      })),
    }
    const { data } = await api.post('/orders', payload)
    cartStore.clear?.()

    if (data.generated_pin) {
      // PIN was auto-generated: show it once before redirecting
      pinStore.verified = true
      sessionStorage.setItem('pin_verified', '1')
      generatedPin.value   = data.generated_pin
      pendingOrderNr.value = data.number
    } else {
      router.push({ name: 'order', params: { number: data.number } })
    }
  } catch (e) {
    submitError.value = e.response?.data?.message ?? 'Une erreur est survenue. Veuillez rÃ©essayer.'
  } finally {
    submitting.value = false
  }
}

function onPinRevealed() {
  generatedPin.value = null
  router.push({ name: 'order', params: { number: pendingOrderNr.value } })
}

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
}
</script>


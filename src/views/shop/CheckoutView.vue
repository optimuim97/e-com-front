<template>
  <main class="checkout-page">
    <!-- Hero -->
    <section class="checkout-hero">
      <div class="container">
        <span class="eyebrow">Finaliser ma commande</span>
        <h1 class="display-lg checkout-hero__title">
          Plus qu'<em>une étape</em>
        </h1>
        <p class="checkout-hero__desc">Vos informations de livraison & paiement sécurisé.</p>
      </div>
    </section>

    <div class="container checkout-content">
      <form @submit.prevent="submitOrder" class="checkout-grid">
        <!-- Colonne formulaire -->
        <div class="checkout-form">

          <!-- Personal info -->
          <section class="card checkout-section">
            <header class="checkout-section__header">
              <span class="checkout-section__num">1</span>
              <h2>Informations personnelles</h2>
            </header>
            <div class="checkout-section__body">
              <div class="grid-2">
                <div>
                  <label class="label">Prénom *</label>
                  <input v-model="form.first_name" type="text" class="input" required placeholder="Ex. Fatou" />
                </div>
                <div>
                  <label class="label">Nom *</label>
                  <input v-model="form.last_name" type="text" class="input" required placeholder="Ex. Konaté" />
                </div>
              </div>
              <div>
                <label class="label">Téléphone *</label>
                <input v-model="form.phone" type="tel" class="input" required placeholder="+225 07 00 00 00" />
              </div>
              <div>
                <label class="label">Email *</label>
                <input v-model="form.email" type="email" class="input" required placeholder="client@exemple.com" />
              </div>
            </div>
          </section>

          <!-- Shipping address -->
          <section class="card checkout-section">
            <header class="checkout-section__header">
              <span class="checkout-section__num">2</span>
              <h2>Adresse de livraison</h2>
            </header>
            <div class="checkout-section__body">
              <div>
                <label class="label">Adresse ligne 1 *</label>
                <input v-model="form.shipping_address_line1" type="text" class="input" required placeholder="Rue, numéro, quartier" />
              </div>
              <div>
                <label class="label">Adresse ligne 2 <span class="checkout-section__opt">(optionnel)</span></label>
                <input v-model="form.shipping_address_line2" type="text" class="input" placeholder="Bâtiment, appartement, étage" />
              </div>

              <!-- Pays en premier → détermine le mode ville -->
              <div class="grid-2">
                <div>
                  <label class="label">Pays *</label>
                  <select v-model="form.shipping_country" class="input" required @change="onShippingCountryChange">
                    <option value="">Sélectionner un pays</option>
                    <optgroup label="Afrique de l'Ouest">
                      <option value="CI">🇨🇮 Côte d'Ivoire</option>
                      <option value="SN">🇸🇳 Sénégal</option>
                      <option value="ML">🇲🇱 Mali</option>
                      <option value="BF">🇧🇫 Burkina Faso</option>
                      <option value="GN">🇬🇳 Guinée</option>
                      <option value="TG">🇹🇬 Togo</option>
                      <option value="BJ">🇧🇯 Bénin</option>
                      <option value="GH">🇬🇭 Ghana</option>
                      <option value="NG">🇳🇬 Nigeria</option>
                    </optgroup>
                    <optgroup label="Europe">
                      <option value="FR">🇫🇷 France</option>
                      <option value="BE">🇧🇪 Belgique</option>
                      <option value="CH">🇨🇭 Suisse</option>
                      <option value="DE">🇩🇪 Allemagne</option>
                      <option value="GB">🇬🇧 Royaume-Uni</option>
                    </optgroup>
                    <optgroup label="Amérique">
                      <option value="CA">🇨🇦 Canada</option>
                      <option value="US">🇺🇸 États-Unis</option>
                    </optgroup>
                    <optgroup label="Autre">
                      <option value="OTHER">🌍 Autre pays</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label class="label">Code postal</label>
                  <input v-model="form.shipping_postal_code" type="text" class="input" placeholder="Ex: 00225" />
                </div>
              </div>

              <!-- Ville : sélecteur CI ou champ libre international -->
              <template v-if="form.shipping_country === 'CI'">
                <CitySelect
                  v-model:city="form.shipping_city"
                  v-model:commune="form.shipping_commune"
                />
              </template>
              <template v-else-if="form.shipping_country">
                <CityFree
                  v-model:city="form.shipping_city"
                  v-model:region="form.shipping_region"
                  :country="form.shipping_country"
                />
              </template>

              <div>
                <label class="label">Téléphone de livraison</label>
                <input v-model="form.shipping_phone" type="tel" class="input" placeholder="Optionnel, si différent" />
              </div>
            </div>
          </section>

          <!-- Same for billing (optionnel) -->
          <section class="card checkout-section">
            <header class="checkout-section__header">
              <span class="checkout-section__num">3</span>
              <h2>Adresse de facturation</h2>
            </header>
            <div class="checkout-section__body">
              <label class="checkbox">
                <input type="checkbox" v-model="sameAsShipping" />
                <span>Identique à l'adresse de livraison</span>
              </label>

              <div v-if="!sameAsShipping" class="billing-fields">
                <div>
                  <label class="label">Adresse ligne 1 *</label>
                  <input v-model="form.billing_address_line1" type="text" class="input" required placeholder="Rue, numéro, quartier" />
                </div>
                <div>
                  <label class="label">Adresse ligne 2</label>
                  <input v-model="form.billing_address_line2" type="text" class="input" placeholder="Bâtiment, appartement" />
                </div>
                <div class="grid-2">
                  <div>
                    <label class="label">Ville *</label>
                    <input v-model="form.billing_city" type="text" class="input" required />
                  </div>
                  <div>
                    <label class="label">Code postal</label>
                    <input v-model="form.billing_postal_code" type="text" class="input" />
                  </div>
                </div>
                <div class="grid-2">
                  <div>
                    <label class="label">Pays *</label>
                    <select v-model="form.billing_country" class="input" required>
                      <option value="">Sélectionner un pays</option>
                      <option value="CI">Côte d'Ivoire</option>
                      <option value="SN">Sénégal</option>
                      <option value="ML">Mali</option>
                      <option value="BF">Burkina Faso</option>
                      <option value="GN">Guinée</option>
                      <option value="TG">Togo</option>
                      <option value="BJ">Bénin</option>
                      <option value="GH">Ghana</option>
                      <option value="FR">France</option>
                      <option value="BE">Belgique</option>
                      <option value="CA">Canada</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Payment method -->
          <section class="card checkout-section">
            <header class="checkout-section__header">
              <span class="checkout-section__num">4</span>
              <h2>Méthode de paiement</h2>
            </header>
            <div class="checkout-section__body">
              <div class="payment-methods">
                <label
                    v-for="method in paymentMethods"
                    :key="method.value"
                    class="payment-method"
                    :class="{ 'payment-method--active': form.payment_method === method.value }"
                >
                  <input
                      type="radio"
                      :value="method.value"
                      v-model="form.payment_method"
                      required
                  />
                  <span class="payment-method__icon">{{ method.icon }}</span>
                  <span class="payment-method__label">{{ method.label }}</span>
                  <span class="payment-method__dot"></span>
                </label>
              </div>
            </div>
          </section>

          <!-- Shipping method -->
          <section class="card checkout-section">
            <header class="checkout-section__header">
              <span class="checkout-section__num">5</span>
              <h2>Mode de livraison</h2>
            </header>
            <div class="checkout-section__body">
              <div class="shipping-methods">
                <label class="shipping-method">
                  <input type="radio" value="standard" v-model="form.shipping_method" />
                  <span>Livraison standard (2-5 jours) - Gratuite</span>
                </label>
                <label class="shipping-method">
                  <input type="radio" value="express" v-model="form.shipping_method" />
                  <span>Livraison express (24-48h) - 2000 XOF</span>
                </label>
              </div>
            </div>
          </section>

          <!-- Coupon -->
          <section class="card checkout-section">
            <header class="checkout-section__header">
              <span class="checkout-section__num">6</span>
              <h2>Code promo <span class="checkout-section__opt">(optionnel)</span></h2>
            </header>
            <div class="checkout-section__body">
              <div class="checkout-coupon">
                <input
                    v-model="couponCode"
                    type="text"
                    class="input"
                    placeholder="BIENVENUE10"
                    :disabled="couponApplied"
                />
                <button
                    type="button"
                    @click="applyCoupon"
                    :disabled="couponLoading || couponApplied"
                    class="btn btn-outline btn-sm"
                >
                  {{ couponApplied ? '✓ Appliqué' : 'Appliquer' }}
                </button>
              </div>
              <p v-if="couponError" class="checkout-msg checkout-msg--error">{{ couponError }}</p>
              <p v-if="couponApplied" class="checkout-msg checkout-msg--success">
                Code appliqué — {{ couponDiscount }}% de réduction
              </p>
            </div>
          </section>
        </div>

        <!-- Colonne récap -->
        <aside class="checkout-summary card">
          <h2 class="checkout-summary__title">Récapitulatif</h2>

          <div v-if="cartStore.items.length === 0" class="checkout-summary__empty">
            Votre panier est vide.
          </div>

          <ul v-else class="checkout-summary__items">
            <li v-for="item in cartStore.items" :key="item.id">
              <!-- Image : fallback élégant si absente ou cassée -->
              <div class="checkout-summary__item-img">
                <img
                  v-if="item.product?.images?.[0]?.url"
                  :src="item.product.images[0].url"
                  :alt="item.product?.name"
                  @error="e => e.target.style.display = 'none'"
                />
                <span v-else class="checkout-summary__item-fallback">🌹</span>
              </div>

              <div class="checkout-summary__item-info">
                <p>{{ item.product?.name ?? item.name ?? 'Produit' }}</p>
                <span>Qté : {{ item.quantity }}</span>
              </div>
              <p class="checkout-summary__item-price">
                {{ formatPrice(Number(item.unit_price ?? item.price ?? 0) * item.quantity) }}
              </p>
            </li>
          </ul>

          <ul class="checkout-summary__lines">
            <li>
              <span>Sous-total</span>
              <span>{{ formatPrice(Number(cartStore.subtotal)) }}</span>
            </li>
            <li v-if="couponApplied" class="checkout-summary__line--discount">
              <span>Réduction ({{ couponDiscount }}%)</span>
              <span>-{{ formatPrice(Number(cartStore.subtotal) * couponDiscount / 100) }}</span>
            </li>
            <li>
              <span>Livraison</span>
              <span class="checkout-summary__free">Gratuite</span>
            </li>
            <li class="checkout-summary__line--total">
              <span>Total</span>
              <span>{{ formatPrice(orderTotal) }}</span>
            </li>
          </ul>

          <button
              type="submit"
              :disabled="submitting || cartStore.items.length === 0"
              class="btn btn-primary btn-lg checkout-summary__cta"
          >
            <span v-if="submitting" class="checkout-summary__spinner"></span>
            <span v-else>Confirmer la commande</span>
          </button>

          <p v-if="submitError" class="checkout-msg checkout-msg--error">{{ submitError }}</p>

          <p class="checkout-summary__legal">
            🔒 Paiement sécurisé · Vos données restent confidentielles
          </p>
        </aside>
      </form>
    </div>

    <!-- PIN reveal modal -->
    <PinRevealModal
        v-if="generatedPin"
        :pin="generatedPin"
        @close="onPinRevealed"
    />
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { useCartStore } from '@/stores/cart'
import { usePinStore } from '@/stores/pin'
import PinRevealModal from '@/components/PinRevealModal.vue'
import CitySelect from '@/components/shop/CitySelect.vue'
import CityFree from '@/components/shop/CityFree.vue'

const router = useRouter()
const cartStore = useCartStore()
const pinStore = usePinStore()

const generatedPin = ref(null)
const pendingOrderNr = ref(null)
const sameAsShipping = ref(true)

const form = ref({
  // Personal info
  first_name: '',
  last_name: '',
  email: '',
  phone: '',

  // Payment & shipping options
  payment_method: 'wave',
  shipping_method: 'standard',
  coupon_code: null,
  customer_note: '',

  // Shipping address
  shipping_address_line1: '',
  shipping_address_line2: '',
  shipping_city: '',
  shipping_commune: '',   // CI uniquement
  shipping_region: '',    // International : état / région / province
  shipping_postal_code: '',
  shipping_country: 'CI',
  shipping_phone: '',

  // Billing address (optionnel)
  billing_address_line1: '',
  billing_address_line2: '',
  billing_city: '',
  billing_postal_code: '',
  billing_country: 'CI',
})

const paymentMethods = [
  { value: 'wave', label: 'Wave', icon: '💙' },
  { value: 'orange_money', label: 'Orange Money', icon: '🟠' },
  { value: 'stripe', label: 'Stripe / Carte', icon: '💳' },
  { value: 'virement', label: 'Virement bancaire', icon: '🏦' },
  { value: 'delivery', label: 'Paiement à la livraison', icon: '🚚' },
]

const couponCode = ref('')
const couponApplied = ref(false)
const couponDiscount = ref(0)
const couponError = ref('')
const couponLoading = ref(false)
const submitting = ref(false)
const submitError = ref('')

const orderTotal = computed(() => {
  const sub = Number(cartStore.subtotal ?? 0)
  if (couponApplied.value) return sub - sub * couponDiscount.value / 100
  return sub
})

// Remet à zéro les champs ville/commune/région quand le pays change
function onShippingCountryChange() {
  form.value.shipping_city    = ''
  form.value.shipping_commune = ''
  form.value.shipping_region  = ''
}

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
    // Construire l'objet shipping_address selon le format attendu par le backend
    const shipping_address = {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      phone: form.value.shipping_phone || form.value.phone,
      email: form.value.email,
      address_line1: form.value.shipping_address_line1,
      address_line2: form.value.shipping_address_line2,
      city: form.value.shipping_city,
      commune: form.value.shipping_commune || undefined,
      region: form.value.shipping_region  || undefined,
      postal_code: form.value.shipping_postal_code,
      country: form.value.shipping_country,
    }

    // Construire billing_address (identique si case cochée)
    let billing_address
    if (sameAsShipping.value) {
      billing_address = { ...shipping_address }
    } else {
      billing_address = {
        first_name: form.value.first_name,
        last_name: form.value.last_name,
        phone: form.value.phone,
        email: form.value.email,
        address_line1: form.value.billing_address_line1,
        address_line2: form.value.billing_address_line2,
        city: form.value.billing_city,
        postal_code: form.value.billing_postal_code,
        country: form.value.billing_country,
      }
    }

    // Préparer les items du panier
    const items = cartStore.items.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      quantity: item.quantity,
      price: item.price,
    }))

    const payload = {
      shipping_address,
      billing_address,
      shipping_method: form.value.shipping_method,
      payment_method: form.value.payment_method,
      coupon_code: couponApplied.value ? couponCode.value : null,
      customer_note: form.value.customer_note,
      items,
    }

    const { data } = await api.post('/orders', payload)

    // Vider le panier après commande réussie
    cartStore.clear?.()

    // Gérer le PIN généré
    if (data.generated_pin) {
      pinStore.verified = true
      sessionStorage.setItem('pin_verified', '1')
      generatedPin.value = data.generated_pin
      pendingOrderNr.value = data.number
    } else {
      router.push({ name: 'order.show', params: { number: data.number } })
    }
  } catch (e) {
    console.error('Order error:', e.response?.data)
    submitError.value = e.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    submitting.value = false
  }
}

function onPinRevealed() {
  generatedPin.value = null
  router.push({ name: 'order.show', params: { number: pendingOrderNr.value } })
}

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: var(--color-bg);
}

/* ── Hero ── */
.checkout-hero {
  background: linear-gradient(160deg, var(--rose-50) 0%, var(--cream-100) 100%);
  padding: var(--space-12) 0 var(--space-10);
  border-bottom: 1px solid var(--cream-200);
}
.checkout-hero__title {
  color: var(--gray-800);
  margin-top: var(--space-2);
}
.checkout-hero__title em { font-style: italic; color: var(--color-primary); }
.checkout-hero__desc {
  color: var(--gray-500);
  margin-top: var(--space-2);
  font-size: 0.9375rem;
}

.checkout-content { padding: var(--space-10) var(--space-6) var(--space-16); }

/* ── Grid ── */
.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: var(--space-8);
  align-items: start;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* ── Section card ── */
.checkout-section {
  overflow: hidden;
}
.checkout-section__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--cream-200);
}
.checkout-section__header h2 {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--gray-800);
}
.checkout-section__opt {
  font-size: 0.8125rem;
  color: var(--gray-400);
  font-style: italic;
  font-weight: 400;
  font-family: var(--font-body);
}
.checkout-section__num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--rose-100);
  color: var(--rose-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9375rem;
}
.checkout-section__body {
  padding: var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

/* ── Payment methods ── */
.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-3);
}
.payment-method {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--cream-300);
  background: #fff;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}
.payment-method:hover { border-color: var(--rose-300); }
.payment-method--active {
  border-color: var(--rose-500);
  background: var(--rose-50);
}
.payment-method input { display: none; }
.payment-method__icon { font-size: 1.25rem; }
.payment-method__label {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
}
.payment-method__dot {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--cream-300);
  border-radius: 50%;
  transition: all var(--transition-fast);
}
.payment-method--active .payment-method__dot {
  border-color: var(--rose-500);
  background: var(--rose-500);
  box-shadow: inset 0 0 0 3px #fff;
}

/* ── Coupon ── */
.checkout-coupon {
  display: flex;
  gap: var(--space-2);
}
.checkout-coupon .input { flex: 1; }

.checkout-msg {
  font-size: 0.8125rem;
  margin-top: var(--space-1);
}
.checkout-msg--error { color: #b91c1c; }
.checkout-msg--success { color: #15803d; }

/* ── Récap ── */
.checkout-summary {
  padding: var(--space-6);
  position: sticky;
  top: calc(var(--navbar-height) + var(--space-6));
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.checkout-summary__title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--gray-800);
}
.checkout-summary__empty {
  color: var(--gray-400);
  font-size: 0.8125rem;
  text-align: center;
  padding: var(--space-6) 0;
}

.checkout-summary__items {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--cream-200);
}
.checkout-summary__items li {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: var(--space-3);
  align-items: center;
}
.checkout-summary__item-img {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: linear-gradient(145deg, var(--rose-50), var(--cream-100));
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkout-summary__item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.checkout-summary__item-fallback {
  font-size: 1.375rem;
  line-height: 1;
}
.checkout-summary__item-info { min-width: 0; }
.checkout-summary__item-info p {
  font-size: 0.8125rem;
  color: var(--gray-700);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.checkout-summary__item-info span {
  font-size: 0.6875rem;
  color: var(--gray-400);
}
.checkout-summary__item-price {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-800);
  white-space: nowrap;
}

.checkout-summary__lines {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4) 0;
  border-top: 1px solid var(--cream-200);
  border-bottom: 1px solid var(--cream-200);
}
.checkout-summary__lines li {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--gray-600);
}
.checkout-summary__free { color: #15803d; font-weight: 500; }
.checkout-summary__line--discount { color: #15803d; }
.checkout-summary__line--total {
  font-family: var(--font-display);
  font-size: 1.25rem !important;
  color: var(--gray-800) !important;
  font-weight: 600;
  padding-top: var(--space-2);
}
.checkout-summary__line--total span:last-child { color: var(--rose-600); }

.checkout-summary__cta {
  width: 100%;
  justify-content: center;
}
.checkout-summary__spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.checkout-summary__legal {
  font-size: 0.75rem;
  color: var(--gray-400);
  text-align: center;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .checkout-grid { grid-template-columns: 1fr; }
  .checkout-summary { position: static; }
}

@media (max-width: 540px) {
  .grid-2 { grid-template-columns: 1fr; }
  .payment-methods { grid-template-columns: 1fr; }
}


/* Ajouter ces styles supplémentaires */
.checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  margin-bottom: var(--space-4);
  padding: var(--space-2);
  background: var(--cream-50);
  border-radius: var(--radius-sm);
}

.billing-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.shipping-methods {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.shipping-method {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--cream-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.shipping-method:hover {
  border-color: var(--rose-300);
  background: var(--rose-50);
}

.shipping-method input {
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <main class="co-page">

    <!-- ── Stepper header ── -->
    <div class="co-header">
      <div class="container co-header__inner">
        <RouterLink to="/" class="co-header__logo">
          <img src="/logos/rosa-logo-readable-600.png" alt="Rosa Beauty" class="co-header__logo-img" />
        </RouterLink>

        <div class="co-steps">
          <template v-for="(s, i) in STEPS" :key="s.key">
            <button
              class="co-step"
              :class="{
                'co-step--active': currentStep === i + 1,
                'co-step--done':   currentStep > i + 1,
              }"
              :disabled="currentStep < i + 1"
              @click="currentStep > i + 1 && (currentStep = i + 1)"
            >
              <span class="co-step__circle">
                <svg v-if="currentStep > i + 1" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span v-else>{{ i + 1 }}</span>
              </span>
              <span class="co-step__label">{{ s.label }}</span>
            </button>
            <div v-if="i < STEPS.length - 1" class="co-step__line"
              :class="{ 'co-step__line--done': currentStep > i + 1 }">
            </div>
          </template>
        </div>

        <RouterLink to="/cart" class="co-header__back">
          ← Panier
        </RouterLink>
      </div>
    </div>

    <!-- ── Mini récap mobile (total + nb articles) ── -->
    <div class="co-mini-recap hide-desktop">
      <div class="container co-mini-recap__inner">
        <span class="co-mini-recap__count">{{ cartStore.itemCount }} article{{ cartStore.itemCount > 1 ? 's' : '' }}</span>
        <button class="co-mini-recap__toggle" @click="summaryExpanded = !summaryExpanded">
          {{ formatPrice(orderTotal) }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
            :style="{ transform: summaryExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>
      <!-- Récap détaillé dépliable -->
      <Transition name="expand">
        <div v-if="summaryExpanded" class="co-mini-recap__detail container">
          <ul class="co-mini-items">
            <li v-for="item in cartStore.items" :key="item.id" class="co-mini-item">
              <span class="co-mini-item__name">{{ item.product?.name ?? 'Produit' }}</span>
              <span class="co-mini-item__qty">×{{ item.quantity }}</span>
              <span class="co-mini-item__price">{{ formatPrice(Number(item.unit_price ?? item.price ?? 0) * item.quantity) }}</span>
            </li>
          </ul>
          <div class="co-mini-total">
            <span>Livraison</span>
            <span :class="shippingCost === 0 ? 'co-summary__free' : ''">{{ shippingCost > 0 ? formatPrice(shippingCost) : 'Gratuite 🎉' }}</span>
          </div>
          <div class="co-mini-total co-mini-total--bold">
            <span>Total</span>
            <span>{{ formatPrice(orderTotal) }}</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── Contenu ── -->
    <div class="container co-body">
      <div class="co-grid">

        <!-- ── Colonne formulaire ── -->
        <div class="co-form">

          <!-- ÉTAPE 1 : Infos personnelles -->
          <Transition name="step-slide" mode="out-in">
          <section v-if="currentStep === 1" class="card co-section" key="step1">
            <header class="co-section__head">
              <span class="co-section__icon">👤</span>
              <div>
                <h2 class="co-section__title">Informations personnelles</h2>
                <p class="co-section__hint">Comment doit-on vous appeler ?</p>
              </div>
            </header>
            <div class="co-section__body">
              <div class="co-grid-2">
                <CheckoutField :def="FIELDS.first_name" :error="fe('first_name')">
                  <input v-model="form.first_name" type="text" class="input" required placeholder="Prénom" />
                </CheckoutField>
                <CheckoutField :def="FIELDS.last_name" :error="fe('last_name')">
                  <input v-model="form.last_name" type="text" class="input" required placeholder="Nom" />
                </CheckoutField>
              </div>
              <CheckoutField :def="FIELDS.phone" :error="fe('phone')">
                <PhoneInput v-model="form.phone" placeholder="07 00 00 00" :required="true" />
              </CheckoutField>
              <CheckoutField :def="FIELDS.email" :error="fe('email')">
                <input v-model="form.email" type="email" class="input" placeholder="client@exemple.com" />
              </CheckoutField>
            </div>
            <div class="co-section__foot">
              <button
                @click="goStep(2)"
                :disabled="!step1Valid"
                class="btn btn-primary co-next-btn"
              >
                Continuer
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </section>
          </Transition>

          <!-- ÉTAPE 2 : Adresse de livraison -->
          <Transition name="step-slide" mode="out-in">
          <section v-if="currentStep === 2" class="card co-section" key="step2">
            <header class="co-section__head">
              <span class="co-section__icon">📍</span>
              <div>
                <h2 class="co-section__title">Adresse de livraison</h2>
                <p class="co-section__hint">Où souhaitez-vous recevoir votre commande ?</p>
              </div>
            </header>
            <div class="co-section__body">

              <!-- Pays — tabindex=-1 sur le wrapper pour éviter le focus auto -->
              <CheckoutField :def="FIELDS.shipping_country" :error="fe('shipping_country')">
                <div tabindex="-1" @focus.capture.prevent>
                  <AppSelect
                    v-model="form.shipping_country"
                    :options="shippingCountryOptions"
                    :placeholder="$t('checkout.selectCountry')"
                    @update:modelValue="onShippingCountryChange"
                  />
                </div>
              </CheckoutField>

              <!-- Ville selon pays -->
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

              <!-- Adresse + Point de repère -->
              <CheckoutField :def="FIELDS.shipping_address_line1" :error="fe('shipping_address_line1')" optional>
                <input v-model="form.shipping_address_line1" type="text" class="input" :placeholder="$t('checkout.addressPlaceholder')" />
              </CheckoutField>
              <CheckoutField :def="{ label: 'Point de repère' }" optional>
                <input v-model="form.customer_note" type="text" class="input" placeholder="Ex. Face à la pharmacie, immeuble bleu…" />
              </CheckoutField>
            </div>
            <div class="co-section__foot">
              <button @click="currentStep = 1" class="btn btn-outline co-back-btn">
                ← Retour
              </button>
              <button
                @click="goStep(3)"
                :disabled="!step2Valid"
                class="btn btn-primary co-next-btn"
              >
                Continuer
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </section>
          </Transition>

          <!-- ÉTAPE 3 : Paiement -->
          <Transition name="step-slide" mode="out-in">
          <section v-if="currentStep === 3" class="card co-section" key="step3">
            <header class="co-section__head">
              <span class="co-section__icon">💳</span>
              <div>
                <h2 class="co-section__title">Mode de paiement</h2>
                <p class="co-section__hint">Choisissez votre méthode préférée</p>
              </div>
            </header>
            <div class="co-section__body">
              <div class="payment-methods">
                <label
                  v-for="method in paymentMethods"
                  :key="method.value"
                  class="payment-method"
                  :class="{ 'payment-method--active': form.payment_method === method.value }"
                >
                  <input type="radio" :value="method.value" v-model="form.payment_method" required />
                  <span class="payment-method__icon">{{ method.icon }}</span>
                  <div class="payment-method__body">
                    <strong>{{ method.label }}</strong>
                    <span v-if="method.desc">{{ method.desc }}</span>
                  </div>
                  <span class="payment-method__dot"></span>
                </label>
              </div>

              <p v-if="submitError" class="co-msg co-msg--error">{{ submitError }}</p>
            </div>
            <div class="co-section__foot">
              <button @click="currentStep = 2" class="btn btn-outline co-back-btn">
                ← Retour
              </button>
            </div>
          </section>
          </Transition>

        </div>

        <!-- ── Sidebar récapitulatif ── -->
        <aside class="co-summary card">
          <h3 class="co-summary__title">Récapitulatif</h3>

          <!-- Articles -->
          <ul class="co-summary__items">
            <li v-for="item in cartStore.items" :key="item.id" class="co-summary__item">
              <div class="co-summary__item-img">
                <img v-if="item.product?.images?.[0]?.url" :src="item.product.images[0].url" :alt="item.product?.name" @error="e => e.target.style.display='none'" />
                <span v-else>🌹</span>
              </div>
              <div class="co-summary__item-info">
                <p>{{ item.product?.name ?? item.name ?? 'Produit' }}</p>
                <span>× {{ item.quantity }}</span>
              </div>
              <p class="co-summary__item-price">{{ formatPrice(Number(item.unit_price ?? item.price ?? 0) * item.quantity) }}</p>
            </li>
          </ul>

          <!-- Totaux -->
          <ul class="co-summary__lines">
            <li>
              <span>Sous-total</span>
              <span>{{ formatPrice(Number(cartStore.subtotal)) }}</span>
            </li>
            <li v-if="couponApplied" class="co-summary__discount">
              <span>Réduction{{ couponLabelSuffix }}</span>
              <span>-{{ formatPrice(discountAmount) }}</span>
            </li>
            <li>
              <span>Livraison</span>
              <span :class="shippingCost === 0 ? 'co-summary__free' : ''">
                {{ shippingCost > 0 ? formatPrice(shippingCost) : 'Gratuite 🎉' }}
              </span>
            </li>
            <li class="co-summary__total">
              <span>Total</span>
              <span>{{ formatPrice(orderTotal) }}</span>
            </li>
          </ul>

          <!-- Code promo — dans la sidebar, même bloc que le récap -->
          <div class="co-promo">
            <div class="co-promo__input-wrap">
              <input
                v-model="couponCode"
                type="text"
                class="input co-promo__input"
                placeholder="Code promo"
                :disabled="couponApplied"
              />
              <button
                type="button"
                @click="applyCoupon"
                :disabled="couponLoading || couponApplied"
                class="btn btn-outline btn-sm"
              >
                {{ couponApplied ? '✓' : 'Appliquer' }}
              </button>
            </div>
            <p v-if="couponError" class="co-msg co-msg--error">{{ couponError }}</p>
            <p v-if="couponApplied" class="co-msg co-msg--success">🎉 Réduction appliquée !</p>
          </div>

          <!-- Bouton confirmer — visible uniquement à l'étape 3 -->
          <Transition name="fade">
            <button
              v-if="currentStep === 3"
              type="button"
              @click="submitOrder"
              :disabled="submitting || !form.payment_method || cartStore.items.length === 0"
              class="btn btn-primary btn-lg co-summary__cta"
            >
              <span v-if="submitting" class="co-spinner"></span>
              <span v-else>Confirmer — {{ formatPrice(orderTotal) }}</span>
            </button>
          </Transition>

          <p class="co-summary__legal">
            Paiement 100% sécurisé · Satisfait ou remboursé
          </p>
        </aside>

      </div>
    </div>

    <!-- ── CTA fixé en bas sur mobile (step 3) ── -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="currentStep === 3" class="co-mobile-cta hide-desktop">
          <div class="co-mobile-cta__inner">
            <div class="co-mobile-cta__total">
              <span>Total</span>
              <strong>{{ formatPrice(orderTotal) }}</strong>
            </div>
            <button
              @click="submitOrder"
              :disabled="submitting || !form.payment_method || cartStore.items.length === 0"
              class="btn btn-primary co-mobile-cta__btn"
            >
              <span v-if="submitting" class="co-spinner"></span>
              <span v-else>Confirmer la commande</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- PIN reveal modal -->
    <PinRevealModal
      v-if="generatedPin"
      :pin="generatedPin"
      @close="onPinRevealed"
    />
  </main>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCartStore }    from '@/features/cart/cart.store'
import { useAuthStore }    from '@/features/auth/auth.store'
import { useSettingsStore } from '@/stores/settings'
import { usePinStore }     from '@/stores/pin'
import PinRevealModal      from '@/shared/components/modals/PinRevealModal.vue'
import AppSelect           from '@/components/ui/AppSelect.vue'
import PhoneInput          from '@/components/ui/PhoneInput.vue'
import CitySelect          from '@/components/shop/CitySelect.vue'
import CityFree            from '@/components/shop/CityFree.vue'
import { checkoutApi }                from './checkout.api'
import { makeForm, mapErrors, FIELDS } from './checkout.fields'
import CheckoutField                  from '@/shared/components/ui/FormField.vue'

const { t }        = useI18n()
const router       = useRouter()
const cartStore    = useCartStore()
const authStore    = useAuthStore()
const settings     = useSettingsStore()
const pinStore     = usePinStore()

// ── Étapes ──────────────────────────────────────────────────────────────────
const STEPS = [
  { key: 'infos',    label: 'Infos' },
  { key: 'adresse',  label: 'Adresse' },
  { key: 'paiement', label: 'Paiement' },
]
const currentStep    = ref(1)
const summaryExpanded = ref(false)

function goStep(n) {
  currentStep.value = n
}

// Blur auto-focus sur pays au passage à l'étape 2
watch(currentStep, async (val) => {
  if (val === 2) {
    await nextTick()
    document.activeElement?.blur()
  }
})

// ── Formulaire ───────────────────────────────────────────────────────────────
const form           = ref(makeForm())
const fieldErrors    = ref({})
const fe             = (key) => fieldErrors.value[key] ?? ''
const submitting     = ref(false)
const submitError    = ref('')
const generatedPin   = ref(null)
const pendingOrderNr = ref(null)
const couponFromCart = ref(false)

// ── Validations par étape ────────────────────────────────────────────────────
const step1Valid = computed(() =>
  form.value.first_name?.trim() && form.value.last_name?.trim() && form.value.phone?.trim()
)
const step2Valid = computed(() =>
  form.value.shipping_country && form.value.shipping_city?.trim()
)

// ── Options pays ─────────────────────────────────────────────────────────────
const shippingCountryKeys = ['CI','SN','ML','BF','GN','TG','BJ','GH','NG','FR','BE','CH','DE','GB','CA','US','OTHER']
const shippingCountryOptions = computed(() =>
  shippingCountryKeys.map(code => ({ value: code, label: t(`checkout.countries.${code}`) }))
)

function onShippingCountryChange() {
  form.value.shipping_city    = ''
  form.value.shipping_commune = ''
  form.value.shipping_region  = ''
}

// ── Moyens de paiement ────────────────────────────────────────────────────────
const paymentMethods = computed(() => [
  { value: 'wave',         label: 'Wave',              icon: '💙', desc: 'Paiement mobile rapide' },
  { value: 'orange_money', label: 'Orange Money',      icon: '🟠', desc: 'Mobile Money Orange' },
  { value: 'cinetpay',     label: 'Carte bancaire',    icon: '💳', desc: 'Visa, Mastercard — sécurisé' },
  { value: 'cod',          label: 'À la livraison',    icon: '🚚', desc: 'Payez en recevant votre colis' },
])

// ── Coupon ────────────────────────────────────────────────────────────────────
const couponCode     = ref('')
const couponApplied  = ref(false)
const couponDiscount = ref(0)
const couponError    = ref('')
const couponLoading  = ref(false)

const discountAmount = computed(() => {
  if (!couponApplied.value) return 0
  if (couponFromCart.value) return Number(cartStore.cart.discount ?? 0)
  return Number(cartStore.subtotal) * couponDiscount.value / 100
})

const couponLabelSuffix = computed(() => {
  if (!couponApplied.value) return ''
  if (couponFromCart.value) {
    const c = cartStore.coupon
    return c?.type === 'percentage' ? ` (${c.value}%)` : ''
  }
  return couponDiscount.value ? ` (${couponDiscount.value}%)` : ''
})

// ── Frais de livraison depuis les settings (cohérent avec CartDrawer) ────────
const shippingCost = computed(() => {
  const cost      = settings.shippingDefaultCost  ?? 0
  const threshold = settings.shippingFreeThreshold ?? 0
  if (cost <= 0) return 0
  if (threshold > 0 && Number(cartStore.subtotal) >= threshold) return 0
  return cost
})

const orderTotal = computed(() => {
  const base = couponFromCart.value
    ? Number(cartStore.total ?? 0)
    : Number(cartStore.subtotal ?? 0) - discountAmount.value
  return base + shippingCost.value
})

// ── Initialisation ────────────────────────────────────────────────────────────
onMounted(() => {
  const u = authStore.user
  if (u) {
    const parts = (u.name ?? '').trim().split(/\s+/)
    form.value.first_name = parts[0] ?? ''
    form.value.last_name  = parts.slice(1).join(' ')
    form.value.email      = u.email ?? ''
    form.value.phone      = u.phone ?? ''
  }
  const c = cartStore.coupon
  if (c) {
    couponCode.value     = c.code
    couponApplied.value  = true
    couponFromCart.value = true
    couponDiscount.value = c.type === 'percentage' ? c.value : 0
  }
})

// ── Actions ────────────────────────────────────────────────────────────────────
async function applyCoupon() {
  if (!couponCode.value.trim()) return
  couponLoading.value = true
  couponError.value   = ''
  try {
    const { data } = await checkoutApi.validateCoupon(couponCode.value)
    couponApplied.value  = true
    couponDiscount.value = data.discount ?? 10
  } catch (e) {
    couponError.value = e.response?.data?.message ?? t('checkout.couponInvalid')
  } finally {
    couponLoading.value = false
  }
}

async function submitOrder() {
  submitting.value  = true
  submitError.value = ''
  try {
    const shipping_address = {
      first_name:    form.value.first_name,
      last_name:     form.value.last_name,
      phone:         form.value.phone,
      email:         form.value.email,
      address_line1: form.value.shipping_address_line1 || form.value.shipping_city,
      city:          form.value.shipping_city,
      commune:       form.value.shipping_commune || undefined,
      region:        form.value.shipping_region  || undefined,
      country:       form.value.shipping_country,
    }

    const items = cartStore.items.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      quantity:   item.quantity,
      price:      item.price,
    }))

    const payload = {
      shipping_address,
      billing_address: { ...shipping_address },
      payment_method:  form.value.payment_method,
      coupon_code:     couponApplied.value ? couponCode.value : null,
      customer_note:   form.value.customer_note || null,
      items,
    }

    const { data } = await checkoutApi.placeOrder(payload)
    cartStore.clear?.()

    if (data.payment_url) {
      window.location.href = data.payment_url
      return
    }
    if (data.generated_pin) {
      pinStore.verified = true
      sessionStorage.setItem('pin_verified', '1')
      generatedPin.value  = data.generated_pin
      pendingOrderNr.value = data.number
    } else {
      router.push({ name: 'order', params: { number: data.number } })
    }
  } catch (e) {
    if (!e._serverError) {
      submitError.value  = e.response?.data?.message || t('checkout.submitError')
      fieldErrors.value  = mapErrors(e.response?.data?.errors ?? {})
      // Revenir à l'étape concernée si erreur de validation
      const errKeys = Object.keys(fieldErrors.value)
      if (errKeys.some(k => ['first_name','last_name','phone','email'].includes(k))) currentStep.value = 1
      else if (errKeys.some(k => k.startsWith('shipping_'))) currentStep.value = 2
    }
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

<style scoped>
.co-page {
  min-height: 100vh;
  background: var(--color-bg);
}

/* ── Header stepper ── */
.co-header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(255, 252, 250, 0.97);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--cream-200);
  box-shadow: 0 1px 12px rgba(0,0,0,0.04);
}
.co-header__inner {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding-top: var(--space-4);
  padding-bottom: var(--space-4);
}
.co-header__logo { display: flex; }
.co-header__logo-img { height: 52px; width: auto; }
.co-header__back {
  margin-left: auto;
  font-size: 0.8125rem;
  color: var(--gray-500);
  text-decoration: none;
  transition: color var(--transition-fast);
  white-space: nowrap;
}
.co-header__back:hover { color: var(--rose-500); }

/* ── Stepper ── */
.co-steps {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
  justify-content: center;
}

.co-step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: default;
  transition: opacity var(--transition-fast);
}
.co-step[disabled] { opacity: 0.4; cursor: not-allowed; }
.co-step:not([disabled]) { cursor: pointer; }

.co-step__circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--cream-200);
  color: var(--gray-400);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}
.co-step__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-400);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: color var(--transition-fast);
}
.co-step--active .co-step__circle {
  background: var(--rose-500);
  color: #fff;
  box-shadow: 0 2px 12px rgba(232, 51, 109, 0.3);
}
.co-step--active .co-step__label { color: var(--rose-600); }
.co-step--done .co-step__circle {
  background: var(--rose-100);
  color: var(--rose-600);
}
.co-step--done .co-step__label { color: var(--rose-400); }

.co-step__line {
  flex: 0 0 32px;
  height: 1.5px;
  background: var(--cream-300);
  transition: background var(--transition-normal);
}
.co-step__line--done { background: var(--rose-400); }

/* ── Body ── */
.co-body {
  padding: var(--space-8) var(--space-6) var(--space-16);
}
.co-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-8);
  align-items: start;
}

/* ── Form section ── */
.co-section {
  overflow: hidden;
}
.co-section__head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-6);
  border-bottom: 1px solid var(--cream-100);
}
.co-section__icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 2px;
}
.co-section__title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--gray-800);
}
.co-section__hint {
  font-size: 0.8125rem;
  color: var(--gray-400);
  margin-top: 3px;
}
.co-section__body {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.co-section__foot {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6) var(--space-5);
  border-top: 1px solid var(--cream-100);
  background: var(--cream-50);
}
.co-next-btn { margin-left: auto; }
.co-back-btn { font-size: 0.875rem; }

.co-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

/* ── Payment methods ── */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
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
.payment-method__icon { font-size: 1.25rem; flex-shrink: 0; }
.payment-method__body { flex: 1; }
.payment-method__body strong {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}
.payment-method__body span {
  font-size: 0.75rem;
  color: var(--gray-400);
}
.payment-method__dot {
  width: 18px; height: 18px;
  border: 1.5px solid var(--cream-300);
  border-radius: 50%;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}
.payment-method--active .payment-method__dot {
  border-color: var(--rose-500);
  background: var(--rose-500);
  box-shadow: inset 0 0 0 3px #fff;
}

/* ── Sidebar ── */
.co-summary {
  position: sticky;
  top: calc(var(--navbar-height) + var(--space-6));
  padding: var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.co-summary__title {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--gray-800);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--cream-200);
}

.co-summary__items {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-height: 240px;
  overflow-y: auto;
  scrollbar-width: thin;
}
.co-summary__item {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: var(--space-2);
  align-items: center;
}
.co-summary__item-img {
  width: 44px; height: 44px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: linear-gradient(145deg, var(--rose-50), var(--cream-100));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}
.co-summary__item-img img { width: 100%; height: 100%; object-fit: cover; }
.co-summary__item-info p {
  font-size: 0.8125rem;
  color: var(--gray-700);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.co-summary__item-info span { font-size: 0.6875rem; color: var(--gray-400); }
.co-summary__item-price { font-size: 0.8125rem; font-weight: 600; color: var(--gray-800); white-space: nowrap; }

.co-summary__lines {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--cream-200);
}
.co-summary__lines li {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--gray-600);
}
.co-summary__free { color: #15803d; font-weight: 500; }
.co-summary__discount { color: #15803d; }
.co-summary__total {
  font-family: var(--font-display);
  font-size: 1.125rem !important;
  font-weight: 600;
  color: var(--gray-800) !important;
  padding-top: var(--space-2);
  border-top: 1px solid var(--cream-200);
}
.co-summary__total span:last-child { color: var(--rose-600); }

/* ── Promo dans la sidebar ── */
.co-promo {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--cream-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--cream-200);
}
.co-promo__input-wrap {
  display: flex;
  gap: var(--space-2);
}
.co-promo__input {
  flex: 1;
  text-transform: uppercase;
  font-size: 0.8125rem;
  padding: 8px 12px;
}

.co-summary__cta {
  width: 100%;
  justify-content: center;
}
.co-summary__legal {
  font-size: 0.6875rem;
  color: var(--gray-400);
  text-align: center;
}

/* ── Messages ── */
.co-msg { font-size: 0.8125rem; }
.co-msg--error { color: #b91c1c; }
.co-msg--success { color: #15803d; }

/* ── Spinner ── */
.co-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Transitions ── */
.step-slide-enter-active,
.step-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.step-slide-enter-from { opacity: 0; transform: translateX(16px); }
.step-slide-leave-to   { opacity: 0; transform: translateX(-16px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .co-grid {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }
  /* Sidebar sous le formulaire sur tablette/mobile */
  .co-summary {
    position: static;
    order: 2;
  }
  .co-summary__items { max-height: 160px; }
}

@media (max-width: 768px) {
  /* Mini recap mobile visible */
  .co-mini-recap { display: block; }

  /* Sidebar complète masquée sur mobile (remplacée par mini-recap + CTA téléporté) */
  .co-summary { display: none; }

  .co-grid-2 { grid-template-columns: 1fr; }
  .co-step__label { display: none; }
  .co-body {
    padding: var(--space-4) var(--space-3) 100px; /* 100px pour le CTA fixé */
  }
  .co-header__inner {
    padding-top: var(--space-3);
    padding-bottom: var(--space-3);
    gap: var(--space-3);
  }
  .co-header__logo-img { height: 40px; }
  .co-header__back { font-size: 0.75rem; }

  .co-section__head {
    padding: var(--space-4);
    gap: var(--space-3);
  }
  .co-section__icon { font-size: 1.25rem; }
  .co-section__title { font-size: 1rem; }
  .co-section__body { padding: var(--space-4); gap: var(--space-3); }
  .co-section__foot {
    padding: var(--space-3) var(--space-4);
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .co-next-btn, .co-back-btn {
    flex: 1;
    justify-content: center;
    padding: 14px;
    font-size: 0.9375rem;
  }

  .payment-method {
    padding: var(--space-4);
  }

  .co-steps { gap: 0; justify-content: center; }
  .co-step { padding: 4px 6px; }
  .co-step__line { flex: 0 0 20px; }
}

/* ── Mini récap mobile ── */
.co-mini-recap {
  display: none; /* affiché uniquement sur mobile via media query */
  background: #fff;
  border-bottom: 1px solid var(--cream-200);
  position: sticky;
  top: var(--navbar-height);
  z-index: 19;
}
.co-mini-recap__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) 0;
}
.co-mini-recap__count {
  font-size: 0.8125rem;
  color: var(--gray-500);
}
.co-mini-recap__toggle {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--rose-600);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-display);
}
.co-mini-recap__detail {
  padding: var(--space-4) 0;
  border-top: 1px solid var(--cream-100);
}
.co-mini-items {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.co-mini-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--space-2);
  font-size: 0.8125rem;
  color: var(--gray-600);
}
.co-mini-item__qty { color: var(--gray-400); }
.co-mini-item__price { font-weight: 600; color: var(--gray-800); }
.co-mini-total {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--gray-500);
  padding-top: var(--space-2);
  border-top: 1px solid var(--cream-100);
}
.co-mini-total--bold {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1rem;
  color: var(--gray-800);
  border-top: 1px solid var(--cream-200);
  margin-top: var(--space-1);
}
.co-mini-total--bold span:last-child { color: var(--rose-600); }

/* ── CTA mobile fixé en bas ── */
.co-mobile-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 60;
  background: rgba(255, 252, 250, 0.97);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--cream-200);
  padding: var(--space-3) var(--space-4) env(safe-area-inset-bottom, 16px);
  box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
}
.co-mobile-cta__inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.co-mobile-cta__total {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex-shrink: 0;
}
.co-mobile-cta__total span { font-size: 0.6875rem; color: var(--gray-400); }
.co-mobile-cta__total strong {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--rose-600);
}
.co-mobile-cta__btn {
  flex: 1;
  justify-content: center;
  padding: 14px;
  font-size: 0.9375rem;
}

/* Transitions */
.expand-enter-active, .expand-leave-active { transition: opacity 0.2s ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }
</style>

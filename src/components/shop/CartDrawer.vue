<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="overlay">
      <div v-if="cartStore.isOpen"
        class="drawer-overlay"
        @click="cartStore.close()" />
    </Transition>

    <!-- Panel -->
    <Transition name="drawer">
      <aside v-if="cartStore.isOpen" class="drawer" :data-step="step">

        <!-- Stepper bar (shared) -->
        <div class="drawer__topbar">
          <button v-if="step > 1" @click="step--" class="drawer__icon-btn" aria-label="Étape précédente">
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <span v-else class="drawer__icon-spacer"></span>

          <div class="drawer__steps">
            <StepDot :n="1" :active="step === 1" :done="step > 1" label="Panier" />
            <span class="drawer__step-line" :class="{ 'drawer__step-line--active': step > 1 }"></span>
            <StepDot :n="2" :active="step === 2" :done="step > 2" label="Paiement" />
            <span class="drawer__step-line" :class="{ 'drawer__step-line--active': step > 2 }"></span>
            <StepDot :n="3" :active="step === 3" :done="false" label="Livraison" />
          </div>

          <button @click="cartStore.close()" class="drawer__icon-btn" aria-label="Fermer">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- ── ÉTAPE 1 : PANIER ── -->
        <template v-if="step === 1">
          <header class="drawer__header">
            <span class="eyebrow">Votre sélection</span>
            <h2 class="drawer__title">Mon <em>panier</em></h2>
          </header>

          <div class="drawer__body">
            <div v-if="cartStore.items.length === 0" class="drawer__empty">
              <div class="drawer__empty-icon">🌸</div>
              <p>Votre panier est encore vide</p>
              <RouterLink to="/products" @click="cartStore.close()" class="btn btn-outline btn-sm">
                Découvrir nos soins
              </RouterLink>
            </div>

            <div v-else class="drawer__items">
              <div v-for="item in cartStore.items" :key="item.id" class="drawer__item">
                <div class="drawer__item-img">
                  <img
                    v-if="item.product?.images?.[0]?.url && !erroredImages.has(item.id)"
                    :src="item.product.images[0].url"
                    :alt="item.product?.name"
                    @error="erroredImages.add(item.id)"
                  />
                  <span v-else>🌹</span>
                </div>
                <div class="drawer__item-info">
                  <span class="drawer__item-cat">{{ item.product?.category?.name }}</span>
                  <p class="drawer__item-name">{{ item.product?.name ?? item.name ?? 'Produit' }}</p>
                  <p class="drawer__item-price">{{ fmt(Number(item.unit_price ?? item.price ?? 0)) }}</p>
                </div>
                <div class="drawer__item-actions">
                  <button @click="cartStore.remove(item.id)" class="drawer__remove" aria-label="Retirer">
                    <TrashIcon class="w-3.5 h-3.5" />
                  </button>
                  <div class="drawer__qty">
                    <button @click="changeQty(item, -1)" :disabled="loadingItemId === item.id"
                      class="drawer__qty-btn" aria-label="Diminuer">
                      <span v-if="loadingItemId === item.id" class="drawer__mini-spin"></span>
                      <MinusIcon v-else class="w-3 h-3" />
                    </button>
                    <span class="drawer__qty-value">{{ item.quantity }}</span>
                    <button @click="changeQty(item, 1)" :disabled="loadingItemId === item.id"
                      class="drawer__qty-btn drawer__qty-btn--primary" aria-label="Augmenter">
                      <PlusIcon class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="drawer__footer">
            <div class="drawer__totals">
              <div>
                <span>Sous-total</span>
                <span>{{ fmt(cartStore.subtotal) }}</span>
              </div>
              <div class="drawer__totals-final">
                <span>Total</span>
                <span>{{ fmt(cartStore.total) }}</span>
              </div>
            </div>
            <button @click="step = 2" :disabled="cartStore.items.length === 0"
              class="btn btn-primary btn-lg drawer__cta">
              Passer la commande
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </footer>
        </template>

        <!-- ── ÉTAPE 2 : PAIEMENT ── -->
        <template v-if="step === 2">
          <header class="drawer__header">
            <span class="eyebrow">Vos informations</span>
            <h2 class="drawer__title">Contact & <em>paiement</em></h2>
          </header>

          <div class="drawer__body">
            <!-- Contact -->
            <div class="drawer__group">
              <label class="label">Nom complet *</label>
              <input v-model="form.name" type="text" class="input" placeholder="Ex. Fatou Konaté" />
            </div>
            <div class="drawer__group">
              <label class="label">Numéro WhatsApp *</label>
              <input v-model="form.phone" type="tel" class="input" placeholder="+225 07 00 00 00" />
            </div>

            <!-- Code promo -->
            <div class="drawer__group">
              <label class="label">Code promo</label>
              <div class="drawer__coupon">
                <input v-model="couponCode" type="text" class="input drawer__coupon-input"
                  placeholder="ROSABEAUTY10" :disabled="couponApplied" />
                <button @click="applyPromo" :disabled="couponLoading || couponApplied"
                  class="btn btn-outline btn-sm">
                  {{ couponApplied ? '✓ Appliqué' : 'Appliquer' }}
                </button>
              </div>
              <p v-if="couponError" class="drawer__msg drawer__msg--error">{{ couponError }}</p>
              <p v-if="couponApplied" class="drawer__msg drawer__msg--success">Code appliqué !</p>
            </div>

            <!-- Frais livraison -->
            <div class="drawer__notice drawer__notice--info">
              <div>
                <strong>Frais de livraison</strong>
                <p>Calculé selon votre adresse de livraison à l'étape suivante.</p>
              </div>
              <span class="badge badge-gold">À préciser</span>
            </div>

            <!-- Méthodes de paiement -->
            <div class="drawer__group">
              <label class="label">Mode de paiement</label>
              <div class="drawer__payments">
                <label v-for="pm in paymentMethods" :key="pm.value"
                  class="drawer__payment"
                  :class="{ 'drawer__payment--active': form.payment === pm.value }">
                  <input type="radio" :value="pm.value" v-model="form.payment" class="drawer__payment-input" />
                  <span class="drawer__payment-icon">{{ pm.icon }}</span>
                  <div class="drawer__payment-info">
                    <strong>{{ pm.label }}</strong>
                    <span>{{ pm.desc }}</span>
                  </div>
                  <span v-if="pm.badge" class="badge badge-rose">{{ pm.badge }}</span>
                  <span class="drawer__payment-dot"></span>
                </label>
              </div>
            </div>

            <!-- CGV -->
            <label class="drawer__cgv">
              <input type="checkbox" v-model="form.cgv" />
              <span>
                J'accepte les <a href="#">conditions générales de vente</a>
                de Rosa Beauty Facial Care.
              </span>
            </label>
          </div>

          <footer class="drawer__footer">
            <div class="drawer__totals">
              <div>
                <span>Sous-total</span>
                <span>{{ fmt(cartStore.subtotal) }}</span>
              </div>
              <div>
                <span>Livraison</span>
                <span class="drawer__amber">À préciser</span>
              </div>
              <div class="drawer__totals-final">
                <span>Total</span>
                <span>{{ fmt(cartStore.total) }}</span>
              </div>
            </div>
            <button @click="goToDelivery"
              :disabled="!form.name || !form.phone || !form.payment || !form.cgv"
              class="btn btn-primary btn-lg drawer__cta">
              Continuer
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <p v-if="payError" class="drawer__msg drawer__msg--error drawer__msg--center">{{ payError }}</p>
          </footer>
        </template>

        <!-- ── ÉTAPE 3 : LIVRAISON ── -->
        <template v-if="step === 3">
          <header class="drawer__header">
            <span class="eyebrow">Dernière étape</span>
            <h2 class="drawer__title">Adresse de <em>livraison</em></h2>
          </header>

          <div class="drawer__body">
            <!-- Option livraison -->
            <button class="drawer__delivery-option">
              <span class="drawer__delivery-icon">🚚</span>
              <span>Livraison à domicile</span>
            </button>

            <!-- ── Pays ── -->
            <div class="drawer__group">
              <label class="label">Pays *</label>
              <AppSelect
                v-model="form.country"
                :options="countryOptions"
                placeholder="Sélectionner un pays"
                @update:modelValue="onCountryChange"
              />
            </div>

            <!-- ── Ville / Commune ── -->
            <CitySelect
              v-if="form.country === 'CI'"
              v-model:city="form.city"
              v-model:commune="form.commune"
            />
            <CityFree
              v-else-if="form.country"
              v-model:city="form.city"
              v-model:region="form.region"
              :country="form.country"
            />

            <!-- Important notice -->
            <div class="drawer__notice drawer__notice--warn">
              <div>
                <strong>Précisez votre position</strong>
                <p>Cliquez sur la carte ou utilisez "Me localiser" pour que le livreur vous trouve facilement.</p>
              </div>
            </div>

            <!-- Search -->
            <div class="drawer__search">
              <MagnifyingGlassIcon class="drawer__search-icon" />
              <input v-model="mapSearch" @keydown.enter="searchAddress"
                type="text" class="input drawer__search-input"
                placeholder="Rechercher un lieu (quartier, ville…)" />
            </div>

            <!-- Map -->
            <div ref="mapEl" class="drawer__map"></div>

            <!-- Locate -->
            <button @click="locateMe" :disabled="locating" class="btn btn-outline drawer__locate">
              <MapPinIcon class="w-4 h-4" />
              {{ locating ? 'Localisation…' : 'Me localiser' }}
            </button>

            <!-- Selected address -->
            <div v-if="form.address" class="drawer__address-selected">
              <MapPinIcon class="w-4 h-4" />
              <p>{{ form.address }}</p>
            </div>
            <p v-else class="drawer__address-empty">Votre adresse précise apparaîtra ici</p>

            <!-- Instructions -->
            <div class="drawer__group">
              <label class="label">Instructions supplémentaires</label>
              <textarea v-model="form.instructions" class="input drawer__textarea"
                placeholder="Ex. Bâtiment bleu, 3ème étage, sonnez deux fois…" />
            </div>
          </div>

          <footer class="drawer__footer">
            <div class="drawer__totals">
              <div>
                <span>Sous-total</span>
                <span>{{ fmt(cartStore.subtotal) }}</span>
              </div>
              <div class="drawer__totals-final">
                <span>Total</span>
                <span>{{ fmt(cartStore.total) }}</span>
              </div>
            </div>
            <button @click="submitOrder" :disabled="!form.city || submitting"
              class="btn btn-primary btn-lg drawer__cta">
              <span v-if="submitting" class="drawer__spinner"></span>
              <span v-else>Confirmer la commande</span>
            </button>
            <p v-if="submitError" class="drawer__msg drawer__msg--error drawer__msg--center">{{ submitError }}</p>
          </footer>
        </template>

      </aside>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue';
import CitySelect from '@/components/shop/CitySelect.vue';
import CityFree   from '@/components/shop/CityFree.vue';
import { useRouter, RouterLink } from 'vue-router';
import api from '@/api';
import {
  XMarkIcon, ArrowLeftIcon, TrashIcon, MinusIcon, PlusIcon,
  MapPinIcon, MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline';
import { useCartStore } from '@/stores/cart';

const cartStore = useCartStore();
const router    = useRouter();

const step          = ref(1);
const loadingItemId = ref(null);
const erroredImages = reactive(new Set()); // IDs des items avec image cassée

const form = ref({
  name: '', phone: '', payment: '',
  cgv: false,
  // Livraison
  country: 'CI', city: '', commune: '', region: '',
  address: '', lat: null, lng: null, instructions: '',
});

const couponCode    = ref('');
const couponApplied = ref(false);
const couponLoading = ref(false);
const couponError   = ref('');
const payError      = ref('');
const submitError   = ref('');
const submitting    = ref(false);
const mapSearch     = ref('');
const locating      = ref(false);
const mapEl         = ref(null);

let leafletMap    = null;
let leafletMarker = null;

const paymentMethods = [
  { value: 'wave',         label: 'Wave',                       icon: '💙', desc: 'Paiement mobile rapide',         badge: 'RAPIDE' },
  { value: 'orange_money', label: 'Orange Money',               icon: '🟠', desc: 'Mobile Money Orange',            badge: null },
  { value: 'cod',          label: 'Paiement à la livraison',    icon: '🚚', desc: 'Payez en recevant votre colis',  badge: null },
];

watch(() => step.value, async (val) => {
  if (val === 3) {
    await nextTick();
    initMap();
  }
});

watch(() => cartStore.isOpen, (val) => {
  if (!val) {
    step.value = 1;
    erroredImages.clear();
    // Reset livraison
    form.value.country = 'CI';
    form.value.city    = '';
    form.value.commune = '';
    form.value.region  = '';
    form.value.address = '';
    form.value.lat     = null;
    form.value.lng     = null;
    leafletMap?.remove();
    leafletMap = null;
  }
});

const countryOptions = [
  { value: 'CI',    label: '🇨🇮 Côte d\'Ivoire' },
  { value: 'SN',    label: '🇸🇳 Sénégal' },
  { value: 'ML',    label: '🇲🇱 Mali' },
  { value: 'BF',    label: '🇧🇫 Burkina Faso' },
  { value: 'GN',    label: '🇬🇳 Guinée' },
  { value: 'TG',    label: '🇹🇬 Togo' },
  { value: 'BJ',    label: '🇧🇯 Bénin' },
  { value: 'GH',    label: '🇬🇭 Ghana' },
  { value: 'NG',    label: '🇳🇬 Nigeria' },
  { value: 'FR',    label: '🇫🇷 France' },
  { value: 'BE',    label: '🇧🇪 Belgique' },
  { value: 'CH',    label: '🇨🇭 Suisse' },
  { value: 'DE',    label: '🇩🇪 Allemagne' },
  { value: 'GB',    label: '🇬🇧 Royaume-Uni' },
  { value: 'CA',    label: '🇨🇦 Canada' },
  { value: 'US',    label: '🇺🇸 États-Unis' },
  { value: 'OTHER', label: '🌍 Autre pays' },
]

function onCountryChange() {
  form.value.city    = '';
  form.value.commune = '';
  form.value.region  = '';
}

function initMap() {
  if (leafletMap || !mapEl.value) return;
  import('leaflet').then(({ default: L }) => {
    import('leaflet/dist/leaflet.css');
    leafletMap = L.map(mapEl.value).setView([5.3485, -4.0137], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    }).addTo(leafletMap);

    leafletMap.on('click', async (e) => {
      placeMarker(L, e.latlng.lat, e.latlng.lng);
      await resolveAddress(e.latlng.lat, e.latlng.lng);
    });
  });
}

function placeMarker(L, lat, lng) {
  if (leafletMarker) leafletMarker.remove();
  const icon = L.divIcon({
    html: `<div style="width:20px;height:20px;background:#e8336d;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(232,51,109,.4)"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
  leafletMarker = L.marker([lat, lng], { icon }).addTo(leafletMap);
  form.value.lat = lat;
  form.value.lng = lng;
}

async function resolveAddress(lat, lng) {
  try {
    const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`);
    const data = await res.json();
    form.value.address = data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    form.value.address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

async function searchAddress() {
  if (!mapSearch.value.trim() || !leafletMap) return;
  try {
    const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearch.value)}&limit=1&accept-language=fr`);
    const data = await res.json();
    if (data[0]) {
      const { lat, lon, display_name } = data[0];
      import('leaflet').then(({ default: L }) => {
        leafletMap.setView([+lat, +lon], 16);
        placeMarker(L, +lat, +lon);
        form.value.address = display_name;
      });
    }
  } catch { /* ignore */ }
}

async function locateMe() {
  if (!leafletMap) return;
  locating.value = true;
  leafletMap.locate({ setView: true, maxZoom: 16 });
  leafletMap.once('locationfound', async (e) => {
    import('leaflet').then(({ default: L }) => placeMarker(L, e.latlng.lat, e.latlng.lng));
    await resolveAddress(e.latlng.lat, e.latlng.lng);
    locating.value = false;
  });
  leafletMap.once('locationerror', () => { locating.value = false; });
}

async function applyPromo() {
  if (!couponCode.value.trim()) return;
  couponLoading.value = true;
  couponError.value = '';
  try {
    await cartStore.applyCoupon(couponCode.value);
    couponApplied.value = true;
  } catch (e) {
    couponError.value = e.response?.data?.message ?? 'Code invalide.';
  } finally {
    couponLoading.value = false;
  }
}

function goToDelivery() {
  payError.value = '';
  step.value = 3;
}

async function submitOrder() {
  submitting.value = true;
  submitError.value = '';
  try {
    const nameParts = form.value.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName  = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];

    // Payload items as fallback when DB cart was already cleared
    const items = cartStore.items.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      quantity:   item.quantity,
    }))

    const { data } = await api.post('/orders', {
      payment_method: form.value.payment,
      coupon_code:    couponApplied.value ? couponCode.value : null,
      customer_note:  form.value.instructions || null,
      items,
      shipping_address: {
        first_name:    firstName,
        last_name:     lastName,
        phone:         form.value.phone,
        address_line1: form.value.address || `${form.value.city}${form.value.commune ? ', ' + form.value.commune : ''}`,
        city:          form.value.city,
        commune:       form.value.commune  || undefined,
        region:        form.value.region   || undefined,
        country:       form.value.country,
        lat:           form.value.lat      || undefined,
        lng:           form.value.lng      || undefined,
      },
    });
    cartStore.clear();
    cartStore.close();
    // Le backend retourne { number: 'ORD-xxx', ... } — on protège contre un format inattendu
    const orderNumber = data?.number ?? data?.data?.number;
    if (orderNumber) {
      router.push({ name: 'order', params: { number: orderNumber } });
    } else {
      router.push({ name: 'orders' });
    }
  } catch (e) {
    if (!e._serverError) {
      submitError.value = e.response?.data?.message ?? 'Une erreur est survenue.';
    }
  } finally {
    submitting.value = false;
  }
}

async function changeQty(item, delta) {
  if (loadingItemId.value) return;
  loadingItemId.value = item.id;
  try {
    const newQty = item.quantity + delta;
    if (newQty <= 0) await cartStore.remove(item.id);
    else await cartStore.update(item.id, newQty);
  } finally {
    loadingItemId.value = null;
  }
}

function fmt(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(Number(val ?? 0));
}
</script>

<!-- StepDot inline component -->
<script>
const StepDot = {
  props: { n: Number, active: Boolean, done: Boolean, label: String },
  template: `
    <div class="drawer__stepdot" :class="{ 'drawer__stepdot--active': active, 'drawer__stepdot--done': done }">
      <span class="drawer__stepdot-circle">
        <svg v-if="done" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span v-else>{{ n }}</span>
      </span>
      <span class="drawer__stepdot-label">{{ label }}</span>
    </div>
  `,
};
export default { components: { StepDot } };
</script>

<style scoped>
/* ── Overlay & drawer ── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(20, 18, 19, 0.4);
  backdrop-filter: blur(6px);
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  max-width: 460px;
  z-index: 50;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  box-shadow: -16px 0 60px rgba(168, 50, 80, 0.2);
}

/* ── Topbar (stepper) ── */
.drawer__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: #fff;
  border-bottom: 1px solid var(--cream-200);
  gap: var(--space-3);
}

.drawer__icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
  transition: all var(--transition-fast);
}
.drawer__icon-btn:hover { background: var(--cream-200); color: var(--rose-500); }
.drawer__icon-spacer { width: 36px; height: 36px; }

.drawer__steps {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
}
.drawer__step-line {
  flex: 0 0 24px;
  height: 1.5px;
  background: var(--cream-300);
  transition: background var(--transition-normal);
}
.drawer__step-line--active { background: var(--rose-500); }

.drawer__stepdot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.drawer__stepdot-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--cream-200);
  color: var(--gray-400);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.8125rem;
  transition: all var(--transition-normal);
  border: 1.5px solid transparent;
}
.drawer__stepdot--active .drawer__stepdot-circle {
  background: var(--rose-500);
  color: #fff;
  box-shadow: var(--shadow-rose);
}
.drawer__stepdot--done .drawer__stepdot-circle {
  background: var(--rose-100);
  color: var(--rose-600);
  border-color: var(--rose-300);
}
.drawer__stepdot-label {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray-400);
}
.drawer__stepdot--active .drawer__stepdot-label,
.drawer__stepdot--done .drawer__stepdot-label {
  color: var(--rose-600);
}

/* ── Header ── */
.drawer__header {
  padding: var(--space-5) var(--space-5) var(--space-3);
}
.drawer__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--gray-800);
  letter-spacing: -0.01em;
  margin-top: 4px;
}
.drawer__title em { font-style: italic; color: var(--color-primary); }

/* ── Body ── */
.drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--space-5) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ── Empty ── */
.drawer__empty {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  color: var(--gray-500);
}
.drawer__empty-icon { font-size: 3rem; opacity: 0.5; }

/* ── Items ── */
.drawer__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.drawer__item {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3);
  background: #fff;
  border-radius: var(--radius-md);
  border: 1px solid var(--cream-200);
  transition: border-color var(--transition-fast);
}
.drawer__item:hover { border-color: var(--rose-200); }

.drawer__item-img {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: linear-gradient(145deg, var(--rose-50), var(--cream-100));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.drawer__item-img img { width: 100%; height: 100%; object-fit: cover; }

.drawer__item-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.drawer__item-cat {
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--rose-400);
}
.drawer__item-name {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--gray-800);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.drawer__item-price {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--rose-600);
  margin-top: 2px;
}

.drawer__item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}
.drawer__remove {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: var(--gray-300);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}
.drawer__remove:hover { background: #fee2e2; color: #ef4444; }

.drawer__qty {
  display: flex;
  align-items: center;
  gap: 4px;
}
.drawer__qty-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid var(--cream-300);
  background: #fff;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}
.drawer__qty-btn:hover:not(:disabled) {
  border-color: var(--rose-400);
  color: var(--rose-500);
  background: var(--rose-50);
}
.drawer__qty-btn--primary {
  background: var(--rose-500);
  border-color: var(--rose-500);
  color: #fff;
}
.drawer__qty-btn--primary:hover:not(:disabled) {
  background: var(--rose-600);
  border-color: var(--rose-600);
}
.drawer__qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.drawer__qty-value {
  min-width: 16px;
  text-align: center;
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--gray-800);
}
.drawer__mini-spin {
  width: 8px; height: 8px;
  border: 1.5px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ── Form groups ── */
.drawer__group { display: flex; flex-direction: column; gap: var(--space-2); }

.drawer__coupon {
  display: flex;
  gap: var(--space-2);
}
.drawer__coupon-input { text-transform: uppercase; letter-spacing: 0.05em; flex: 1; }

.drawer__msg {
  font-size: 0.75rem;
  margin-top: 2px;
}
.drawer__msg--error { color: #ef4444; }
.drawer__msg--success { color: #15803d; }
.drawer__msg--center { text-align: center; }

/* ── Notice ── */
.drawer__notice {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  align-items: center;
}
.drawer__notice strong {
  display: block;
  font-size: 0.8125rem;
  margin-bottom: 2px;
}
.drawer__notice p {
  font-size: 0.75rem;
  line-height: 1.5;
}
.drawer__notice > div { flex: 1; }
.drawer__notice--info {
  background: var(--rose-50);
  border: 1px solid var(--rose-100);
}
.drawer__notice--info strong { color: var(--rose-700); }
.drawer__notice--info p { color: var(--rose-600); }
.drawer__notice--warn {
  background: var(--gold-100);
  border: 1px solid var(--gold-200);
}
.drawer__notice--warn strong { color: var(--gold-600); }
.drawer__notice--warn p { color: var(--gold-600); }

/* ── Payments ── */
.drawer__payments {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.drawer__payment {
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
.drawer__payment:hover { border-color: var(--rose-300); }
.drawer__payment--active {
  border-color: var(--rose-500);
  background: var(--rose-50);
}
.drawer__payment-input { display: none; }
.drawer__payment-icon {
  width: 36px;
  height: 36px;
  background: var(--cream-100);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
}
.drawer__payment--active .drawer__payment-icon { background: #fff; }
.drawer__payment-info { flex: 1; }
.drawer__payment-info strong {
  display: block;
  font-size: 0.875rem;
  color: var(--gray-800);
  font-weight: 600;
}
.drawer__payment-info span {
  font-size: 0.75rem;
  color: var(--gray-400);
}
.drawer__payment-dot {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--cream-300);
  border-radius: 50%;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}
.drawer__payment--active .drawer__payment-dot {
  border-color: var(--rose-500);
  background: var(--rose-500);
  box-shadow: inset 0 0 0 3px #fff;
}

/* ── CGV ── */
.drawer__cgv {
  display: flex;
  gap: var(--space-3);
  cursor: pointer;
  align-items: flex-start;
  padding: var(--space-2) 0;
}
.drawer__cgv input { flex-shrink: 0; margin-top: 1px; }
.drawer__cgv span {
  font-size: 0.75rem;
  color: var(--gray-500);
  line-height: 1.6;
}
.drawer__cgv a {
  color: var(--rose-600);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ── Delivery (step 3) ── */
.drawer__delivery-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--gray-800);
  color: #fff;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.drawer__delivery-icon { font-size: 1.125rem; }

.drawer__search { position: relative; }
.drawer__search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--gray-400);
  pointer-events: none;
}
.drawer__search-input { padding-left: 38px; }

.drawer__map {
  width: 100%;
  height: 200px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--cream-300);
  position: relative;
  z-index: 0;
}

.drawer__locate {
  width: 100%;
  justify-content: center;
  padding: 10px 16px;
}

.drawer__address-selected {
  display: flex;
  gap: var(--space-2);
  align-items: flex-start;
  padding: var(--space-3) var(--space-4);
  background: var(--rose-50);
  border: 1px solid var(--rose-200);
  border-radius: var(--radius-md);
  color: var(--rose-700);
}
.drawer__address-selected svg { color: var(--rose-500); flex-shrink: 0; margin-top: 2px; }
.drawer__address-selected p {
  font-size: 0.8125rem;
  line-height: 1.5;
}

.drawer__address-empty {
  text-align: center;
  font-size: 0.75rem;
  color: var(--gray-400);
  padding: var(--space-2) 0;
}

.drawer__textarea { height: 80px; resize: none; }

/* ── Footer ── */
.drawer__footer {
  background: #fff;
  border-top: 1px solid var(--cream-200);
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  box-shadow: 0 -8px 24px rgba(168, 50, 80, 0.06);
}

.drawer__totals {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.drawer__totals > div {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--gray-600);
}
.drawer__amber { color: var(--gold-600); font-weight: 500; }
.drawer__totals-final {
  font-family: var(--font-display);
  font-size: 1.125rem !important;
  font-weight: 600;
  color: var(--gray-800) !important;
  padding-top: var(--space-2);
  border-top: 1px solid var(--cream-200);
}
.drawer__totals-final span:last-child { color: var(--rose-600); }

.drawer__cta {
  width: 100%;
  justify-content: center;
}

.drawer__spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Transitions ── */
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.drawer-enter-active, .drawer-leave-active { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }

@media (max-width: 540px) {
  .drawer__stepdot-label { display: none; }
}
</style>

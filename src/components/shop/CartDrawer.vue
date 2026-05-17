<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="overlay">
      <div v-if="cartStore.isOpen"
        class="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        @click="cartStore.close()" />
    </Transition>

    <!-- Panel -->
    <Transition name="drawer">
      <div v-if="cartStore.isOpen"
        class="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl">

        <!-- â”€â”€ Ã‰TAPE 1 : PANIER â”€â”€ -->
        <template v-if="step === 1">
          <header class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 class="text-base font-bold tracking-wider text-gray-900 uppercase">Votre panier</h2>
            <button @click="cartStore.close()" class="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
              <XMarkIcon class="size-5" />
            </button>
          </header>

          <!-- Stepper -->
          <div class="flex items-center gap-0 px-5 py-3 border-b border-gray-100">
            <StepDot :n="1" :active="true" :done="false" label="PANIER" />
            <div class="flex-1 h-px bg-gray-200 mx-2" />
            <StepDot :n="2" :active="false" :done="false" label="LIVRAISON" />
          </div>

          <!-- Items -->
          <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            <div v-if="cartStore.items.length === 0" class="text-center py-16 text-gray-400">
              <span class="text-5xl block mb-3">ðŸ›’</span>
              <p class="text-sm">Votre panier est vide</p>
            </div>
            <div v-for="item in cartStore.items" :key="item.id"
              class="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div class="size-14 rounded-lg bg-primary-50 overflow-hidden shrink-0">
                <img v-if="item.product?.images?.[0]?.url" :src="item.product.images[0].url" :alt="item.product?.name" class="w-full h-full object-cover" />
                <span v-else class="w-full h-full flex items-center justify-center text-xl">🌹</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-primary-400 font-medium">{{ item.product?.category?.name }}</p>
                <p class="text-sm font-semibold text-gray-800 truncate">{{ item.product?.name }}</p>
                <p class="text-sm font-bold text-primary-500 mt-0.5">{{ fmt(item.unit_price) }}</p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <button @click="cartStore.remove(item.id)" class="text-gray-300 hover:text-red-400 transition-colors">
                  <TrashIcon class="size-4" />
                </button>
                <div class="flex items-center gap-1.5">
                  <button @click="changeQty(item, -1)" :disabled="loadingItemId === item.id"
                    class="size-7 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 active:scale-90 active:bg-primary-100 transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed">
                    <span v-if="loadingItemId === item.id" class="size-3 border border-current border-t-transparent rounded-full animate-spin" />
                    <MinusIcon v-else class="size-3.5" />
                  </button>
                  <span class="w-6 text-center text-sm font-bold text-gray-800">{{ item.quantity }}</span>
                  <button @click="changeQty(item, 1)" :disabled="loadingItemId === item.id"
                    class="size-7 rounded-full bg-primary-500 border-2 border-primary-500 flex items-center justify-center text-white hover:bg-primary-600 hover:border-primary-600 active:scale-90 active:bg-primary-700 transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed">
                    <PlusIcon class="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-100 px-5 py-4 space-y-3">
            <div class="flex justify-between text-sm text-gray-500">
              <span>Sous-total</span>
              <span class="font-medium text-gray-800">{{ fmt(cartStore.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span class="text-primary-500 text-lg">{{ fmt(cartStore.total) }}</span>
            </div>
            <button @click="step = 2" :disabled="cartStore.items.length === 0"
              class="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 active:scale-[.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Passer la commande
            </button>
          </div>
        </template>

        <!-- â”€â”€ Ã‰TAPE 2 : PAIEMENT â”€â”€ -->
        <template v-if="step === 2">
          <header class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <button @click="step = 1" class="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
                <ArrowLeftIcon class="size-4" />
              </button>
              <h2 class="text-base font-bold tracking-wider text-gray-900 uppercase">Commande</h2>
            </div>
            <button @click="cartStore.close()" class="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
              <XMarkIcon class="size-5" />
            </button>
          </header>

          <div class="flex items-center gap-0 px-5 py-3 border-b border-gray-100">
            <StepDot :n="1" :active="false" :done="true" label="PANIER" />
            <div class="flex-1 h-px bg-gray-200 mx-2" />
            <StepDot :n="2" :active="true" :done="false" label="LIVRAISON" />
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            <!-- Contact -->
            <div>
              <label class="label">Nom complet *</label>
              <input v-model="form.name" type="text" class="input" placeholder="Ex. Fatou KonatÃ©" />
            </div>
            <div>
              <label class="label">NumÃ©ro WhatsApp *</label>
              <input v-model="form.phone" type="tel" class="input" placeholder="+225 07 00 00 00" />
            </div>

            <!-- Frais livraison -->
            <div class="flex items-start justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-100">
              <div>
                <p class="text-xs font-semibold text-amber-800">Frais de livraison</p>
                <p class="text-xs text-amber-600 mt-0.5">CalculÃ© selon votre adresse de livraison</p>
              </div>
              <span class="text-xs font-bold text-amber-700 whitespace-nowrap">Ã€ prÃ©ciser</span>
            </div>

            <!-- Code promo -->
            <div>
              <p class="label uppercase tracking-wider text-[11px]">Code promo</p>
              <div class="flex gap-2">
                <input v-model="couponCode" type="text" class="input flex-1 uppercase" placeholder="ROSABEAUTY10"
                  :disabled="couponApplied" />
                <button @click="applyPromo" :disabled="couponLoading || couponApplied"
                  class="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-colors disabled:opacity-40">
                  {{ couponApplied ? 'âœ“' : 'Appliquer' }}
                </button>
              </div>
              <p v-if="couponError" class="text-red-500 text-xs mt-1">{{ couponError }}</p>
              <p v-if="couponApplied" class="text-green-600 text-xs mt-1">Code appliquÃ© !</p>
            </div>

            <!-- MÃ©thodes de paiement -->
            <div>
              <p class="label uppercase tracking-wider text-[11px] mb-3">Paiement</p>
              <div class="space-y-2">
                <label v-for="pm in paymentMethods" :key="pm.value"
                  class="flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all"
                  :class="form.payment === pm.value ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'">
                  <input type="radio" :value="pm.value" v-model="form.payment" class="sr-only" />
                  <div class="size-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center text-xl">
                    {{ pm.icon }}
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-gray-800">{{ pm.label }}</p>
                    <p class="text-xs text-gray-400">{{ pm.desc }}</p>
                  </div>
                  <span v-if="pm.badge"
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="pm.badge === 'RAPIDE' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'">
                    {{ pm.badge }}
                  </span>
                  <div class="size-4 rounded-full border-2 flex items-center justify-center shrink-0"
                    :class="form.payment === pm.value ? 'border-gray-900 bg-gray-900' : 'border-gray-300'">
                    <div v-if="form.payment === pm.value" class="size-1.5 rounded-full bg-white" />
                  </div>
                </label>
              </div>
            </div>

            <!-- CGV -->
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" v-model="form.cgv" class="mt-0.5 accent-gray-900" />
              <span class="text-xs text-gray-500 leading-relaxed">
                J'accepte les <a href="#" class="underline text-gray-700">conditions gÃ©nÃ©rales de vente</a>
                de Rosa Beauty Facial Care.
              </span>
            </label>
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-100 px-5 py-4 space-y-2">
            <div class="flex justify-between text-sm text-gray-500">
              <span>Sous-total</span>
              <span>{{ fmt(cartStore.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-500">
              <span>Livraison</span>
              <span class="text-amber-600">Ã€ prÃ©ciser</span>
            </div>
            <div class="flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span class="text-primary-500 text-lg">{{ fmt(cartStore.total) }}</span>
            </div>
            <button @click="goToDelivery"
              :disabled="!form.name || !form.phone || !form.payment || !form.cgv"
              class="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 active:scale-[.99] transition-all mt-1 disabled:opacity-40 disabled:cursor-not-allowed">
              Confirmer la commande â†’
            </button>
            <p v-if="payError" class="text-red-500 text-xs text-center">{{ payError }}</p>
          </div>
        </template>

        <!-- â”€â”€ Ã‰TAPE 3 : LIVRAISON â”€â”€ -->
        <template v-if="step === 3">
          <header class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <button @click="step = 2" class="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
                <ArrowLeftIcon class="size-4" />
              </button>
              <h2 class="text-base font-bold tracking-wider text-gray-900 uppercase">Livraison</h2>
            </div>
            <button @click="cartStore.close()" class="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
              <XMarkIcon class="size-5" />
            </button>
          </header>

          <div class="flex items-center gap-0 px-5 py-3 border-b border-gray-100">
            <StepDot :n="1" :active="false" :done="true" label="PANIER" />
            <div class="flex-1 h-px bg-gray-900 mx-2" />
            <StepDot :n="2" :active="true" :done="false" label="LIVRAISON" />
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <!-- Livraison Ã  domicile -->
            <button class="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gray-900 text-white font-semibold text-sm">
              <span class="text-lg">ðŸšš</span> Livraison Ã  domicile
            </button>

            <!-- Important notice -->
            <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <p class="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Important</p>
              <p class="text-xs text-amber-700">Votre position est requise. Cliquez sur la carte ou utilisez "Me localiser" pour dÃ©finir votre adresse de livraison.</p>
            </div>

            <!-- Search -->
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input v-model="mapSearch" @keydown.enter="searchAddress"
                type="text" class="input !pl-9" placeholder="Rechercher un lieu (quartier, villeâ€¦)" />
            </div>

            <!-- Map -->
            <div ref="mapEl" class="w-full h-52 rounded-xl overflow-hidden border border-gray-200 z-0"></div>

            <!-- Locate -->
            <button @click="locateMe" :disabled="locating"
              class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-colors disabled:opacity-50">
              <MapPinIcon class="size-4" />
              {{ locating ? 'Localisationâ€¦' : 'Me localiser' }}
            </button>

            <!-- Selected address -->
            <div v-if="form.address" class="flex items-start gap-2 p-3 rounded-xl bg-primary-50 border border-primary-100">
              <MapPinIcon class="size-4 text-primary-500 mt-0.5 shrink-0" />
              <p class="text-xs text-primary-700 leading-relaxed">{{ form.address }}</p>
            </div>
            <p v-else class="text-xs text-gray-400 text-center py-1">Votre adresse prÃ©cise apparaÃ®tra ici</p>

            <!-- Instructions -->
            <div>
              <label class="label">Instructions supplÃ©mentaires</label>
              <textarea v-model="form.instructions" class="input !h-20 resize-none" placeholder="Ex. BÃ¢timent bleu, 3Ã¨me Ã©tage, sonnez deux foisâ€¦" />
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-100 px-5 py-4 space-y-2">
            <div class="flex justify-between text-sm text-gray-500">
              <span>Sous-total</span>
              <span>{{ fmt(cartStore.subtotal) }}</span>
            </div>
            <div class="flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span class="text-primary-500 text-lg">{{ fmt(cartStore.total) }}</span>
            </div>
            <button @click="submitOrder" :disabled="!form.address || submitting"
              class="w-full py-3.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 active:scale-[.99] transition-all mt-1 disabled:opacity-40 disabled:cursor-not-allowed">
              <span v-if="submitting" class="flex items-center justify-center gap-2">
                <span class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Traitementâ€¦
              </span>
              <span v-else>Confirmer la commande</span>
            </button>
            <p v-if="submitError" class="text-red-500 text-xs text-center">{{ submitError }}</p>
          </div>
        </template>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
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

const form = ref({
  name: '', phone: '', payment: '',
  cgv: false, address: '', lat: null, lng: null, instructions: '',
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
  { value: 'wave',         label: 'Wave',                   icon: 'ðŸ’™', desc: 'Paiement mobile rapide',    badge: 'RAPIDE' },
  { value: 'orange_money', label: 'Orange Money',           icon: 'ðŸŸ ', desc: 'Mobile Money Orange',        badge: null },
  { value: 'cod',     label: 'Paiement Ã  la livraison',icon: 'ðŸšš', desc: 'Payez en recevant votre colis', badge: null },
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
    leafletMap?.remove();
    leafletMap = null;
  }
});

function initMap() {
  if (leafletMap || !mapEl.value) return;
  import('leaflet').then(({ default: L }) => {
    import('leaflet/dist/leaflet.css');
    leafletMap = L.map(mapEl.value).setView([5.3485, -4.0137], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Â© <a href="https://openstreetmap.org">OpenStreetMap</a>',
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
    html: `<div style="width:20px;height:20px;background:#e8336d;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
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

    const { data } = await api.post('/orders', {
      payment_method: form.value.payment,
      coupon_code:    couponApplied.value ? couponCode.value : null,
      customer_note:  form.value.instructions || null,
      shipping_address: {
        first_name:   firstName,
        last_name:    lastName,
        phone:        form.value.phone,
        address_line1: form.value.address,
        city:         'Abidjan',
        country:      'CI',
        lat:          form.value.lat,
        lng:          form.value.lng,
      },
    });
    cartStore.clear();
    router.push({ name: 'order', params: { number: data.number } });
  } catch (e) {
    submitError.value = e.response?.data?.message ?? 'Une erreur est survenue.';
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
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(val ?? 0);
}
</script>

<!-- StepDot inline component -->
<script>
const StepDot = {
  props: { n: Number, active: Boolean, done: Boolean, label: String },
  template: `
    <div class="flex flex-col items-center gap-1">
      <div class="size-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
        :class="done ? 'bg-gray-900 text-white' : active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'">
        <span v-if="done">âœ“</span>
        <span v-else>{{ n }}</span>
      </div>
      <span class="text-[9px] font-semibold tracking-wider"
        :class="active || done ? 'text-gray-700' : 'text-gray-300'">{{ label }}</span>
    </div>
  `,
};
export default { components: { StepDot } };
</script>


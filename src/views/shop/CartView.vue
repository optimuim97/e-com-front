<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
    <h1 class="text-2xl font-bold text-gray-900 mb-8">Mon panier</h1>

    <div v-if="!cartStore.cart.items?.length" class="text-center py-20">
      <p class="text-5xl mb-4">🛒</p>
      <p class="text-gray-500 mb-6">Votre panier est vide</p>
      <RouterLink to="/products" class="btn-primary">Découvrir nos produits</RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Items -->
      <div class="lg:col-span-2 space-y-4">
        <div v-for="item in cartStore.cart.items" :key="item.id" class="card p-4 flex gap-4">
          <div class="size-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
            <img v-if="item.product?.images?.[0]?.url" :src="item.product.images[0].url"
              :alt="item.product.name" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-800 text-sm line-clamp-2">{{ item.product?.name }}</h3>
            <p v-if="item.variant" class="text-xs text-gray-400 mt-0.5">{{ item.variant.label }}</p>
            <p class="text-primary-500 font-bold mt-1">{{ formatPrice(item.unit_price) }}</p>
          </div>

          <div class="flex flex-col items-end justify-between shrink-0">
            <button @click="cartStore.remove(item.id)" class="text-gray-300 hover:text-red-400 transition-colors">
              <XMarkIcon class="size-5" />
            </button>
            <div class="flex items-center gap-2">
              <button @click="changeQty(item, -1)" :disabled="loadingItemId === item.id"
                class="size-8 rounded-lg border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 active:scale-90 active:bg-primary-100 transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed">
                <span v-if="loadingItemId === item.id" class="size-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                <MinusIcon v-else class="size-3.5" />
              </button>
              <span class="text-sm font-bold w-7 text-center text-gray-800">{{ item.quantity }}</span>
              <button @click="changeQty(item, 1)" :disabled="loadingItemId === item.id"
                class="size-8 rounded-lg bg-primary-500 border-2 border-primary-500 flex items-center justify-center text-white hover:bg-primary-600 hover:border-primary-600 active:scale-90 active:bg-primary-700 transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed">
                <PlusIcon class="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Récap -->
      <div class="card p-6 h-fit sticky top-24 space-y-4">
        <h2 class="font-semibold text-gray-800">Récapitulatif</h2>

        <!-- Coupon -->
        <div>
          <div v-if="!cartStore.cart.coupon" class="flex gap-2">
            <input v-model="couponCode" class="input !py-2 text-sm" placeholder="Code promo" />
            <button @click="applyCoupon" class="btn-outline !py-2 !px-3 text-sm shrink-0">Appliquer</button>
          </div>
          <div v-else class="flex items-center justify-between bg-primary-50 rounded-xl px-3 py-2">
            <span class="text-sm text-primary-600 font-medium">{{ cartStore.cart.coupon.code }}</span>
            <button @click="cartStore.removeCoupon()" class="text-primary-400 hover:text-primary-600">
              <XMarkIcon class="size-4" />
            </button>
          </div>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between text-gray-600">
            <span>Sous-total</span>
            <span>{{ formatPrice(cartStore.cart.subtotal) }}</span>
          </div>
          <div v-if="cartStore.cart.discount > 0" class="flex justify-between text-green-600">
            <span>Réduction</span>
            <span>-{{ formatPrice(cartStore.cart.discount) }}</span>
          </div>
          <div class="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
            <span>Total</span>
            <span class="text-primary-500">{{ formatPrice(cartStore.cart.total) }}</span>
          </div>
        </div>

        <RouterLink to="/checkout" class="btn-primary w-full">
          Passer la commande
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/vue/24/outline';
import { useCartStore } from '@/stores/cart';

const cartStore     = useCartStore();
const couponCode    = ref('');
const loadingItemId = ref(null);

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

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price ?? 0);
}

async function applyCoupon() {
  if (!couponCode.value.trim()) return;
  await cartStore.applyCoupon(couponCode.value.trim());
  couponCode.value = '';
}
</script>

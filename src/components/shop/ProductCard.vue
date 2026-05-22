<template>
  <div class="product-card card-hover group">
    <!-- Image + badges + wishlist -->
    <RouterLink :to="`/products/${product.slug}`" class="product-card__img-wrap block relative">
      <!-- Badges left -->
      <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        <span v-if="product.stock === 0"
          class="badge badge-gray">
          Épuisé
        </span>
        <span v-else-if="product.is_featured"
          class="badge badge-primary">
          Vedette
        </span>
      </div>

      <!-- Discount badge -->
      <div v-if="product.discount_percent" class="absolute top-3 left-3 z-10 mt-0" :class="{'mt-7': product.stock === 0 || product.is_featured}">
        <span class="badge badge-warning font-bold">-{{ product.discount_percent }}%</span>
      </div>

      <!-- Wishlist button (top-right) -->
      <div class="absolute top-3 right-3 z-10" @click.prevent>
        <WishlistButton :productId="product.id" />
      </div>

      <!-- Image -->
      <div class="aspect-square rounded-t-2xl overflow-hidden bg-rose-50">
        <img
          v-if="cover && !imgError"
          :src="cover"
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          :class="{ 'opacity-50 grayscale': product.stock === 0 }"
          @error="imgError = true"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-5xl select-none">🌹</div>
      </div>
    </RouterLink>

    <!-- Info -->
    <div class="p-4">
      <p class="text-xs text-primary-400 font-medium mb-1">{{ product.category?.name }}</p>
      <RouterLink :to="`/products/${product.slug}`">
        <h3 class="text-sm font-semibold text-gray-800 line-clamp-2 mb-3 min-h-[2.5rem] hover:text-primary-500 transition-colors">
          {{ product.name }}
        </h3>
      </RouterLink>

      <div class="flex items-center justify-between gap-2">
        <div class="flex items-baseline gap-1.5">
          <span class="text-primary-500 font-bold text-base">{{ formatPrice(product.price) }}</span>
          <span v-if="product.compare_price" class="text-xs text-gray-400 line-through">
            {{ formatPrice(product.compare_price) }}
          </span>
        </div>
        <div v-if="product.stock > 0 && product.stock <= 5"
          class="text-xs text-amber-600 font-medium shrink-0">
          Plus que {{ product.stock }} !
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import WishlistButton from '@/components/shop/WishlistButton.vue'

const props = defineProps({ product: { type: Object, required: true } })

const imgError = ref(false)
const cover    = computed(() => props.product.images?.[0]?.url ?? null)

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price)
}
</script>

<style scoped>
.product-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
}

.product-card__img-wrap {
  display: block;
  text-decoration: none;
}
</style>

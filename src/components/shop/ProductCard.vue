<template>
  <RouterLink :to="`/products/${product.slug}`" class="card-hover group block relative">
    <!-- Badges -->
    <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
      <span v-if="product.stock === 0"
        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-800 text-white">
        Épuisé
      </span>
      <span v-else-if="product.is_featured"
        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-500 text-white">
        Vedette
      </span>
    </div>
    <div v-if="product.discount_percent" class="absolute top-3 right-3 z-10">
      <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-400 text-white font-bold">
        -{{ product.discount_percent }}%
      </span>
    </div>

    <!-- Image -->
    <div class="aspect-square rounded-t-2xl overflow-hidden bg-primary-50">
      <img v-if="cover" :src="cover" :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        :class="{ 'opacity-50 grayscale': product.stock === 0 }" />
      <div v-else class="w-full h-full flex items-center justify-center text-5xl select-none">🌹</div>
    </div>

    <!-- Info -->
    <div class="p-4">
      <p class="text-xs text-primary-400 font-medium mb-1">{{ product.category?.name }}</p>
      <h3 class="text-sm font-semibold text-gray-800 line-clamp-2 mb-3 min-h-[2.5rem]">{{ product.name }}</h3>

      <div class="flex items-center justify-between">
        <div class="flex items-baseline gap-1.5">
          <span class="text-primary-500 font-bold text-base">{{ formatPrice(product.price) }}</span>
          <span v-if="product.compare_price" class="text-xs text-gray-400 line-through">
            {{ formatPrice(product.compare_price) }}
          </span>
        </div>
        <div v-if="product.stock > 0 && product.stock <= 5"
          class="text-xs text-amber-600 font-medium">
          Plus que {{ product.stock }} !
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({ product: { type: Object, required: true } });

const cover = computed(() => props.product.images?.[0]?.url ?? null);
console.log('ProductCard cover:', cover.value);

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);
}
</script>

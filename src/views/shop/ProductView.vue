<template>
  <div class="min-h-screen bg-white">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-2xl mx-auto px-4 py-32 text-center">
      <p class="text-gray-500 mb-4">Produit introuvable.</p>
      <RouterLink to="/shop" class="btn-primary">Retour à la boutique</RouterLink>
    </div>

    <!-- Product -->
    <div v-else-if="product" class="max-w-6xl mx-auto px-4 py-10">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <RouterLink to="/" class="hover:text-primary-500 transition-colors">Accueil</RouterLink>
        <span>/</span>
        <RouterLink to="/shop" class="hover:text-primary-500 transition-colors">Boutique</RouterLink>
        <span>/</span>
        <span class="text-gray-700">{{ product.name }}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Gallery -->
        <div class="space-y-4">
          <div class="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <img
              :src="activeImage"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div v-if="product.images && product.images.length > 1" class="flex gap-3 overflow-x-auto pb-1">
            <button
              v-for="(img, idx) in product.images"
              :key="idx"
              @click="activeImage = img"
              class="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all"
              :class="activeImage === img ? 'border-primary-500' : 'border-transparent hover:border-gray-200'"
            >
              <img :src="img" :alt="product.name + ' ' + (idx + 1)" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Info -->
        <div class="flex flex-col gap-6">
          <!-- Category badge -->
          <div>
            <span v-if="product.category" class="badge badge-gray text-xs uppercase tracking-wide">
              {{ product.category.name }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-3xl font-bold text-gray-900 leading-tight">{{ product.name }}</h1>

          <!-- Price -->
          <div class="flex items-center gap-3">
            <span class="text-3xl font-bold text-primary-500">{{ formatPrice(product.price) }}</span>
            <span v-if="product.compare_price && product.compare_price > product.price" class="text-xl text-gray-400 line-through">
              {{ formatPrice(product.compare_price) }}
            </span>
            <span v-if="discountPercent > 0" class="badge badge-danger">-{{ discountPercent }}%</span>
          </div>

          <!-- Description -->
          <div v-if="product.description" class="text-gray-600 leading-relaxed text-sm" v-html="product.description"></div>

          <!-- Variants -->
          <div v-if="product.variants && product.variants.length > 0" class="space-y-3">
            <p class="label">Variante</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="variant in product.variants"
                :key="variant.id"
                @click="selectedVariant = variant.id"
                class="px-4 py-2 rounded-lg border text-sm font-medium transition-all"
                :class="selectedVariant === variant.id
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-gray-200 text-gray-700 hover:border-primary-500 hover:text-primary-500'"
              >
                {{ variant.name }}
              </button>
            </div>
          </div>

          <!-- Quantity -->
          <div class="space-y-2">
            <p class="label">Quantité</p>
            <div class="flex items-center gap-3">
              <button
                @click="qty > 1 && qty--"
                class="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 transition-colors"
              >
                <MinusIcon class="w-4 h-4" />
              </button>
              <span class="w-12 text-center font-semibold text-lg">{{ qty }}</span>
              <button
                @click="qty++"
                class="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 transition-colors"
              >
                <PlusIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Stock -->
          <p v-if="product.stock !== undefined" class="text-sm" :class="product.stock > 0 ? 'text-green-600' : 'text-red-500'">
            {{ product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock' }}
          </p>

          <!-- Add to cart -->
          <button
            @click="addToCart"
            :disabled="product.stock === 0 || cartLoading"
            class="btn-primary w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="cartLoading" class="flex items-center justify-center gap-2">
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Ajout en cours…
            </span>
            <span v-else>Ajouter au panier</span>
          </button>

          <!-- Success message -->
          <transition name="fade">
            <p v-if="cartSuccess" class="text-green-600 text-sm text-center font-medium">
              Produit ajouté au panier !
            </p>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import api from '@/api'
import { MinusIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)
const error = ref(false)
const activeImage = ref('')
const selectedVariant = ref(null)
const qty = ref(1)
const cartLoading = ref(false)
const cartSuccess = ref(false)

const discountPercent = computed(() => {
  if (!product.value?.compare_price || product.value.compare_price <= product.value.price) return 0
  return Math.round((1 - product.value.price / product.value.compare_price) * 100)
})

async function fetchProduct() {
  loading.value = true
  error.value = false
  try {
    const { data } = await api.get(`/products/${route.params.slug}`)
    product.value = data.data ?? data
    if (product.value.images?.length) {
      activeImage.value = product.value.images[0]
    } else if (product.value.image) {
      activeImage.value = product.value.image
    }
    if (product.value.variants?.length) {
      selectedVariant.value = product.value.variants[0].id
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function addToCart() {
  cartLoading.value = true
  try {
    await cartStore.add(product.value.id, qty.value, selectedVariant.value)
    cartSuccess.value = true
    setTimeout(() => { cartSuccess.value = false }, 3000)
  } finally {
    cartLoading.value = false
  }
}

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val)
}

onMounted(fetchProduct)
watch(() => route.params.slug, fetchProduct)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

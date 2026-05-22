<template>
  <main class="product-page">
    <!-- Loading -->
    <div v-if="loading" class="product-loader">
      <div class="product-loader__spinner"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="product-error">
      <div class="product-error__icon">🌸</div>
      <h2 class="display-md">Produit introuvable</h2>
      <p>La fleur que vous cherchez s'est envolée…</p>
      <RouterLink to="/products" class="btn btn-primary">Retour à la boutique</RouterLink>
    </div>

    <!-- Product -->
    <div v-else-if="product" class="container product-inner">
      <!-- Breadcrumb -->
      <nav class="product-breadcrumb" aria-label="Fil d'Ariane">
        <RouterLink to="/">Accueil</RouterLink>
        <span aria-hidden="true">/</span>
        <RouterLink to="/products">Boutique</RouterLink>
        <span aria-hidden="true">/</span>
        <span>{{ product.name }}</span>
      </nav>

      <div class="product-grid">
        <!-- Gallery -->
        <div class="product-gallery">
          <div class="product-gallery__main">
            <img :src="activeImage" :alt="product.name" class="product-gallery__img" />
            <span v-if="discountPercent > 0" class="product-gallery__discount badge badge-rose">
              -{{ discountPercent }}%
            </span>
          </div>
          <div v-if="product.images && product.images.length > 1" class="product-gallery__thumbs">
            <button
              v-for="(img, idx) in product.images"
              :key="idx"
              @click="activeImage = img"
              class="product-gallery__thumb"
              :class="{ 'product-gallery__thumb--active': activeImage === img }"
              :aria-label="`Image ${idx + 1}`"
            >
              <img :src="img" :alt="product.name + ' ' + (idx + 1)" />
            </button>
          </div>
        </div>

        <!-- Info -->
        <div class="product-info">
          <span v-if="product.category" class="eyebrow">{{ product.category.name }}</span>

          <h1 class="display-lg product-info__title">{{ product.name }}</h1>

          <!-- Rating (mocked if absent) -->
          <div v-if="product.rating_avg" class="product-info__rating">
            <div class="product-info__stars">
              <span v-for="i in 5" :key="i" class="product-info__star"
                :class="{ 'product-info__star--filled': i <= Math.round(product.rating_avg) }">★</span>
            </div>
            <span class="product-info__reviews">({{ product.reviews_count ?? 0 }} avis)</span>
          </div>

          <!-- Price -->
          <div class="product-info__price">
            <span class="product-info__price-current">{{ formatPrice(product.price) }}</span>
            <span v-if="product.compare_price && product.compare_price > product.price"
              class="product-info__price-old">{{ formatPrice(product.compare_price) }}</span>
          </div>

          <!-- Description -->
          <div v-if="product.description" class="product-info__desc" v-html="product.description"></div>

          <!-- Variants -->
          <div v-if="product.variants && product.variants.length > 0" class="product-info__group">
            <span class="label">Variante</span>
            <div class="product-info__variants">
              <button
                v-for="variant in product.variants"
                :key="variant.id"
                @click="selectedVariant = variant.id"
                class="product-info__variant"
                :class="{ 'product-info__variant--active': selectedVariant === variant.id }"
              >
                {{ variant.name }}
              </button>
            </div>
          </div>

          <!-- Quantity -->
          <div class="product-info__group">
            <span class="label">Quantité</span>
            <div class="product-info__qty">
              <button @click="qty > 1 && qty--" class="product-info__qty-btn" aria-label="Diminuer">
                <MinusIcon class="w-4 h-4" />
              </button>
              <span class="product-info__qty-value">{{ qty }}</span>
              <button @click="qty++" class="product-info__qty-btn" aria-label="Augmenter">
                <PlusIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Stock -->
          <p v-if="product.stock !== undefined" class="product-info__stock"
            :class="product.stock > 0 ? 'product-info__stock--ok' : 'product-info__stock--ko'">
            <span class="product-info__stock-dot"></span>
            {{ product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock' }}
          </p>

          <!-- Actions -->
          <div class="product-info__actions">
            <button @click="addToCart" :disabled="product.stock === 0 || cartLoading"
              class="btn btn-primary btn-lg product-info__cta">
              <span v-if="cartLoading" class="product-info__spinner"></span>
              <span v-else>Ajouter au panier · {{ formatPrice(product.price * qty) }}</span>
            </button>
            <button class="btn btn-outline product-info__wish" aria-label="Ajouter aux favoris">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          <!-- Trust badges -->
          <div class="product-info__trust">
            <div v-for="badge in trustBadges" :key="badge.label" class="product-info__trust-badge">
              <span v-html="badge.icon"></span>
              <span>{{ badge.label }}</span>
            </div>
          </div>

          <!-- Success message -->
          <transition name="fade">
            <p v-if="cartSuccess" class="product-info__success">
              ✓ Produit ajouté au panier
            </p>
          </transition>
        </div>
      </div>
    </div>
  </main>
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

const trustBadges = [
  {
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    label: '100% naturel',
  },
  {
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    label: 'Livraison 48h',
  },
  {
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    label: 'Retour 14 jours',
  },
]

async function fetchProduct() {
  loading.value = true
  error.value = false
  try {
    const { data } = await api.get(`/products/${route.params.slug}`)
    product.value = data.data ?? data
    const imgs = product.value.images?.map(i => i.url ?? i) ?? []
    if (imgs.length) activeImage.value = imgs[0]
    else if (product.value.image) activeImage.value = product.value.image
    product.value.images = imgs
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
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val ?? 0)
}

onMounted(fetchProduct)
watch(() => route.params.slug, fetchProduct)
</script>

<style scoped>
.product-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding: var(--space-8) 0 var(--space-16);
}

/* ── Loader ── */
.product-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
.product-loader__spinner {
  width: 36px;
  height: 36px;
  border: 2px solid var(--rose-100);
  border-top-color: var(--rose-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Error ── */
.product-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-20) var(--space-4);
  text-align: center;
}
.product-error__icon { font-size: 3rem; opacity: 0.5; }
.product-error p { color: var(--gray-400); }

/* ── Layout ── */
.product-breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8125rem;
  color: var(--gray-400);
  margin-bottom: var(--space-8);
}
.product-breadcrumb a {
  color: var(--gray-500);
  transition: color var(--transition-fast);
}
.product-breadcrumb a:hover { color: var(--rose-500); }
.product-breadcrumb > span:last-child { color: var(--gray-700); font-weight: 500; }

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
  align-items: start;
}

/* ── Galerie ── */
.product-gallery { display: flex; flex-direction: column; gap: var(--space-3); }

.product-gallery__main {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: linear-gradient(145deg, var(--rose-50), var(--cream-100));
  box-shadow: var(--shadow-sm);
}
.product-gallery__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-gallery__discount {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
}

.product-gallery__thumbs {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding-bottom: 4px;
}
.product-gallery__thumb {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid transparent;
  background: var(--cream-100);
  transition: border-color var(--transition-fast);
  padding: 0;
}
.product-gallery__thumb img {
  width: 100%; height: 100%; object-fit: cover;
}
.product-gallery__thumb:hover { border-color: var(--rose-200); }
.product-gallery__thumb--active { border-color: var(--rose-500); }

/* ── Infos ── */
.product-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.product-info__title {
  color: var(--gray-800);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
}

.product-info__rating {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.product-info__stars { display: flex; gap: 2px; }
.product-info__star { font-size: 0.875rem; color: var(--cream-300); }
.product-info__star--filled { color: var(--gold-400); }
.product-info__reviews { font-size: 0.8125rem; color: var(--gray-400); }

.product-info__price {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}
.product-info__price-current {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--rose-600);
}
.product-info__price-old {
  font-size: 1.125rem;
  color: var(--gray-400);
  text-decoration: line-through;
}

.product-info__desc {
  color: var(--gray-500);
  line-height: 1.75;
  font-size: 0.9375rem;
  padding: var(--space-4) 0;
  border-top: 1px solid var(--cream-200);
  border-bottom: 1px solid var(--cream-200);
}

.product-info__group { display: flex; flex-direction: column; gap: var(--space-2); }

.product-info__variants {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.product-info__variant {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--cream-300);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-600);
  background: #fff;
  transition: all var(--transition-fast);
}
.product-info__variant:hover { border-color: var(--rose-300); color: var(--rose-500); }
.product-info__variant--active {
  background: var(--rose-500);
  border-color: var(--rose-500);
  color: #fff;
  box-shadow: var(--shadow-rose);
}

.product-info__qty {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-surface);
  border: 1.5px solid var(--cream-300);
  border-radius: var(--radius-full);
  padding: 4px;
  width: fit-content;
}
.product-info__qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
  transition: all var(--transition-fast);
}
.product-info__qty-btn:hover { background: var(--rose-50); color: var(--rose-500); }
.product-info__qty-value {
  min-width: 32px;
  text-align: center;
  font-weight: 600;
  color: var(--gray-800);
}

.product-info__stock {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8125rem;
}
.product-info__stock-dot {
  width: 8px; height: 8px; border-radius: 50%;
}
.product-info__stock--ok { color: #15803d; }
.product-info__stock--ok .product-info__stock-dot { background: #22c55e; }
.product-info__stock--ko { color: #b91c1c; }
.product-info__stock--ko .product-info__stock-dot { background: #ef4444; }

.product-info__actions {
  display: flex;
  gap: var(--space-2);
}
.product-info__cta {
  flex: 1;
  justify-content: center;
}
.product-info__wish {
  padding: 12px;
  width: 48px;
  flex-shrink: 0;
  justify-content: center;
}
.product-info__spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.product-info__trust {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--cream-200);
}
.product-info__trust-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.75rem;
  color: var(--gray-500);
}
.product-info__trust-badge svg { color: var(--rose-400); }

.product-info__success {
  background: #dcfce7;
  color: #15803d;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  text-align: center;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .product-grid { grid-template-columns: 1fr; gap: var(--space-8); }
}
</style>

<template>
  <main v-if="line" class="line-page">
    <!-- Hero gamme -->
    <section
      class="line-hero"
      :style="{
        background: line.cover_url
          ? `linear-gradient(to bottom, ${line.color_hex}22, #fff), url('${line.cover_url}') center/cover`
          : `linear-gradient(135deg, ${line.color_hex}18, ${line.color_hex}06)`
      }"
    >
      <div class="container line-hero__inner">
        <RouterLink to="/products" class="line-breadcrumb">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Tous les produits
        </RouterLink>
        <div class="line-hero__badge" :style="{ background: line.color_hex + '22', color: line.color_hex, borderColor: line.color_hex + '55' }">
          Gamme
        </div>
        <h1 class="line-hero__name" :style="{ color: line.color_hex }">{{ line.name }}</h1>
        <p v-if="line.tagline" class="line-hero__tagline">{{ line.tagline }}</p>
        <p v-if="line.description" class="line-hero__desc">{{ line.description }}</p>
        <p class="line-hero__count">{{ totalProducts }} produit(s) dans cette gamme</p>
      </div>
    </section>

    <!-- ── Chips produits de la gamme ── -->
    <div v-if="products.length" class="container line-chips-wrap">
      <p class="line-chips__label">Produits de cette gamme :</p>
      <div class="line-chips">
        <RouterLink
          v-for="p in products"
          :key="p.id"
          :to="`/products/${p.slug}`"
          class="line-chip"
        >
          {{ p.name }}
        </RouterLink>
      </div>
    </div>

    <!-- Tri -->
    <div class="container line-toolbar">
      <div class="line-sort">
        <AppSelect v-model="sort" :options="sortOptions" placeholder="Nouveautés" @update:modelValue="fetchProducts" />
      </div>
    </div>

    <!-- Produits -->
    <div class="container">
      <div v-if="loading" class="products-grid">
        <div v-for="i in 8" :key="i" class="product-skeleton"></div>
      </div>
      <div v-else-if="products.length === 0" class="empty-state card">
        <div class="empty-state__icon">🌹</div>
        <p>Aucun produit dans cette gamme pour le moment.</p>
      </div>
      <div v-else class="products-grid">
        <ProductCard
          v-for="p in products"
          :key="p.id"
          :product="p"
          @add-to-cart="addToCart"
        />
      </div>

      <!-- Pagination -->
      <div v-if="meta.last_page > 1" class="line-pagination">
        <button
          v-for="p in meta.last_page"
          :key="p"
          @click="changePage(p)"
          class="btn btn-sm"
          :class="p === meta.current_page ? 'btn-primary' : 'btn-outline'"
        >{{ p }}</button>
      </div>
    </div>
  </main>

  <div v-else-if="loading" class="loader-wrap"><div class="loader"></div></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useCartStore } from '@/features/cart/cart.store'
import ProductCard from '@/components/ui/ProductCard.vue'
import api from '@/api'

const route     = useRoute()
const cartStore = useCartStore()

const line           = ref(null)
const products       = ref([])
const loading        = ref(true)
const sort           = ref('')

const sortOptions = [
  { value: 'price_asc',  label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
]
const meta           = ref({ current_page: 1, last_page: 1 })
const totalProducts  = ref(0)
let currentPage      = 1

async function fetchLine() {
  const { data } = await api.get(`/product-lines/${route.params.slug}`)
  line.value          = data.data ?? data
  totalProducts.value = line.value.products_count ?? 0
}

async function fetchProducts() {
  loading.value = true
  try {
    const { data } = await api.get('/products', {
      params: {
        product_line: route.params.slug,
        sort:         sort.value || undefined,
        page:         currentPage,
        per_page:     24,
      }
    })
    products.value = data.data
    meta.value = { current_page: data.current_page, last_page: data.last_page }
    totalProducts.value = data.total
  } finally {
    loading.value = false
  }
}

function changePage(p) { currentPage = p; fetchProducts() }

function addToCart(product) {
  cartStore.add(product.id, 1)
}

onMounted(async () => {
  await Promise.all([fetchLine(), fetchProducts()])
})
</script>

<style scoped>
.line-page { min-height: 80vh; }

.line-hero {
  padding: var(--space-16) 0 var(--space-10);
  border-bottom: 1px solid var(--cream-200);
}
.line-hero__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  max-width: 680px;
}

.line-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--gray-400);
  transition: color var(--transition-fast);
  margin-bottom: var(--space-2);
}
.line-breadcrumb:hover { color: var(--gray-700); }

.line-hero__badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  border: 1.5px solid;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.line-hero__name {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
}
.line-hero__tagline {
  font-size: 1.125rem;
  color: var(--gray-600);
  font-style: italic;
}
.line-hero__desc {
  font-size: 0.9375rem;
  color: var(--gray-500);
  line-height: 1.65;
  max-width: 560px;
}
.line-hero__count { font-size: 0.8125rem; color: var(--gray-400); }

/* ── Chips navigation ── */
.line-chips-wrap {
  padding: var(--space-5) var(--space-4) 0;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.line-chips__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-500);
  white-space: nowrap;
  padding-top: 6px;
  flex-shrink: 0;
}
.line-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.line-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--cream-300);
  background: var(--color-surface);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-600);
  text-decoration: none;
  transition: all var(--transition-fast);
}
.line-chip:hover {
  border-color: var(--rose-300);
  background: var(--rose-50);
  color: var(--color-primary);
}

.line-toolbar {
  padding: var(--space-5) var(--space-4);
  display: flex;
  justify-content: flex-end;
}
.line-sort { width: auto; min-width: 180px; font-size: 0.875rem; }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-5);
  padding-bottom: var(--space-10);
}

.product-skeleton {
  background: linear-gradient(90deg, var(--cream-100) 25%, var(--cream-50) 50%, var(--cream-100) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius-lg);
  aspect-ratio: 3/4;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.line-pagination {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-8) 0 var(--space-12);
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-6);
  margin: var(--space-8) 0;
}
.empty-state__icon { font-size: 3rem; margin-bottom: var(--space-3); }
</style>

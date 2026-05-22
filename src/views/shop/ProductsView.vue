<template>
  <main class="products-page">
    <!-- En-tête de page -->
    <section class="products-hero">
      <div class="container products-hero__inner">
        <div class="products-hero__content">
          <span class="eyebrow animate-fade-up">Notre gamme</span>
          <h1 class="display-lg products-hero__title animate-fade-up animate-fade-up-delay-1">
            Soins à l'eau <br><em>de rose pure</em>
          </h1>
          <p class="products-hero__desc animate-fade-up animate-fade-up-delay-2">
            <template v-if="!loading">{{ meta.total ?? products.length }} produits sélectionnés pour révéler votre beauté naturelle</template>
          </p>
        </div>
        <!-- Barre de recherche -->
        <div class="products-hero__search animate-fade-up animate-fade-up-delay-3">
          <input
            v-model="filters.search"
            type="search"
            placeholder="Rechercher un produit..."
            class="input products-search-input"
            aria-label="Rechercher un produit"
            @input="debouncedSearch"
          />
          <svg class="products-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </div>
    </section>

    <div class="container products-layout">
      <!-- Sidebar filtres -->
      <aside class="products-filters" :class="{ 'products-filters--open': filtersOpen }">
        <div class="products-filters__header">
          <h2 class="products-filters__title">Filtres</h2>
          <button class="products-filters__close hide-desktop" @click="filtersOpen = false">×</button>
        </div>

        <!-- Catégories -->
        <div class="filter-group">
          <h3 class="filter-group__title">Catégorie</h3>
          <ul class="filter-group__list">
            <li>
              <label class="filter-checkbox">
                <input type="radio" v-model="filters.category" :value="null" class="filter-checkbox__input" />
                <span class="filter-checkbox__box"></span>
                <span class="filter-checkbox__label">Toutes</span>
              </label>
            </li>
            <li v-for="cat in categories" :key="cat.id">
              <label class="filter-checkbox">
                <input type="radio" v-model="filters.category" :value="cat.slug" class="filter-checkbox__input" />
                <span class="filter-checkbox__box"></span>
                <span class="filter-checkbox__label">{{ cat.name }}</span>
              </label>
            </li>
          </ul>
        </div>

        <!-- Prix -->
        <div class="filter-group">
          <h3 class="filter-group__title">Prix (FCFA)</h3>
          <div class="filter-price-inputs">
            <input v-model.number="filters.min_price" type="number" placeholder="Min" class="input filter-price-input" />
            <span class="filter-price-sep">–</span>
            <input v-model.number="filters.max_price" type="number" placeholder="Max" class="input filter-price-input" />
          </div>
        </div>

        <!-- Reset -->
        <button v-if="hasActiveFilters" class="filter-reset" @click="resetFilters">
          Effacer tous les filtres
        </button>
      </aside>

      <!-- Grille produits -->
      <div class="products-main">
        <!-- Barre d'outils -->
        <div class="products-toolbar">
          <button class="products-filters-toggle hide-desktop" @click="filtersOpen = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filtres
          </button>

          <p class="products-count">
            <strong>{{ meta.total ?? products.length }}</strong> produit{{ (meta.total ?? products.length) > 1 ? 's' : '' }}
          </p>

          <div class="products-sort">
            <label for="sort-select" class="products-sort__label">Trier par</label>
            <select id="sort-select" v-model="filters.sort" class="input products-sort__select">
              <option value="">Plus récents</option>
              <option value="price_asc">Prix : croissant</option>
              <option value="price_desc">Prix : décroissant</option>
            </select>
          </div>
        </div>

        <!-- Grille -->
        <div v-if="loading" class="products-grid products-grid--grid">
          <div v-for="i in 9" :key="i" class="product-skeleton" />
        </div>
        <div v-else-if="products.length" class="products-grid products-grid--grid">
          <ProductCard
            v-for="p in products"
            :key="p.id"
            :product="normalizeProduct(p)"
            :featured="p.is_featured"
            @add-to-cart="addToCart"
          />
        </div>

        <!-- Aucun résultat -->
        <div v-else class="products-empty">
          <div class="products-empty__icon">🌸</div>
          <h3>Aucun produit trouvé</h3>
          <p>Essayez d'ajuster vos filtres ou votre recherche.</p>
          <button class="btn btn-outline" @click="resetFilters">Effacer les filtres</button>
        </div>

        <!-- Pagination -->
        <div v-if="meta.last_page > 1" class="products-pagination">
          <button
            v-for="page in meta.last_page"
            :key="page"
            class="page-btn"
            :class="{ 'page-btn--active': page === filters.page }"
            @click="filters.page = page"
          >{{ page }}</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import { useCartStore } from '@/stores/cart'
import ProductCard from '@/components/ui/ProductCard.vue'

const route = useRoute()
const cartStore = useCartStore()
const products = ref([])
const categories = ref([])
const meta = ref({})
const loading = ref(true)
const filtersOpen = ref(false)

const filters = reactive({
  category:  route.query.category ?? null,
  search:    route.query.search ?? null,
  min_price: null,
  max_price: null,
  sort:      '',
  page:      1,
  featured:  route.query.featured ?? null,
})

let searchTimer = null
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { filters.page = 1; loadProducts() }, 400)
}

const hasActiveFilters = computed(() =>
  !!(filters.category || filters.search || filters.min_price || filters.max_price)
)

function normalizeProduct(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDesc: p.description_short ?? null,
    category: p.category?.name ?? '',
    price: p.price,
    priceOld: p.compare_price ?? null,
    image: p.images?.[0]?.url ?? null,
    imageAlt: p.images?.[1]?.url ?? null,
    isNew: !!p.is_new,
    isBestSeller: !!p.is_featured,
    discount: p.discount_percent ?? null,
    rating: p.rating_avg ?? null,
    reviewCount: p.reviews_count ?? 0,
    stock: p.stock,
    wishlisted: false,
  }
}

function addToCart(product) {
  const id = product.id ?? product
  if (product.stock === 0) return
  cartStore.add(id, 1)
}

async function loadProducts() {
  loading.value = true
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v != null && v !== '')
  )
  const { data } = await api.get('/products', { params })
  products.value = data.data
  meta.value = data.meta ?? { total: data.total, last_page: data.last_page }
  loading.value = false
}

watch(
  () => [filters.category, filters.min_price, filters.max_price, filters.sort, filters.featured],
  () => { filters.page = 1; loadProducts() }
)

watch(() => filters.page, loadProducts)

onMounted(async () => {
  const [, cats] = await Promise.all([loadProducts(), api.get('/categories')])
  categories.value = cats.data.data ?? cats.data
})

function resetFilters() {
  Object.assign(filters, {
    category: null, search: null, min_price: null, max_price: null,
    sort: '', page: 1, featured: null,
  })
}
</script>

<style scoped>
/* ── Hero page ── */
.products-hero {
  background: linear-gradient(160deg, var(--rose-50) 0%, var(--cream-100) 100%);
  padding: var(--space-12) 0 var(--space-10);
  border-bottom: 1px solid var(--cream-200);
}

.products-hero__inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-8);
  flex-wrap: wrap;
}

.products-hero__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.products-hero__title em {
  font-style: italic;
  color: var(--color-primary);
}

.products-hero__desc {
  color: var(--gray-400);
  font-size: 0.9375rem;
}

/* ── Recherche ── */
.products-hero__search {
  position: relative;
  min-width: 280px;
}

.products-search-input {
  /* Variante de .input avec un padding-left pour laisser place à l'icône loupe */
  padding-left: 44px;
}

.products-search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-300);
  pointer-events: none;
}

/* ── Layout ── */
.products-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--space-8);
  padding-top: var(--space-8);
  padding-bottom: var(--space-16);
  align-items: start;
}

/* ── Filtres ── */
.products-filters {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  padding: var(--space-5);
  position: sticky;
  top: calc(var(--navbar-height) + var(--space-6));
}

.products-filters__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--cream-200);
}

.products-filters__title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--gray-800);
}

.products-filters__close {
  font-size: 1.5rem;
  color: var(--gray-400);
  padding: 4px;
}

/* ── Groupes de filtres ── */
.filter-group {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--cream-200);
}
.filter-group:last-of-type { border-bottom: none; }

.filter-group__title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: var(--space-4);
}

.filter-group__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.filter-checkbox__input { display: none; }

.filter-checkbox__box {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border: 1.5px solid var(--cream-300);
  border-radius: 50%;
  background: #fff;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-checkbox__input:checked + .filter-checkbox__box {
  background: var(--rose-500);
  border-color: var(--rose-500);
}
.filter-checkbox__input:checked + .filter-checkbox__box::after {
  content: '';
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  display: block;
}

.filter-checkbox__label {
  font-size: 0.875rem;
  color: var(--gray-600);
  flex: 1;
}

/* ── Prix ── */
.filter-price-inputs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.filter-price-input {
  /* Variante .input compacte pour les filtres prix min/max */
  flex: 1;
  width: 0;
  padding: 8px 14px;
  font-size: 0.8125rem;
}
.filter-price-sep { color: var(--gray-300); }

.filter-reset {
  width: 100%;
  padding: 10px;
  font-size: 0.8125rem;
  color: var(--rose-500);
  border: 1.5px dashed var(--rose-200);
  border-radius: var(--radius-md);
  background: none;
  margin-top: var(--space-2);
  transition: all var(--transition-fast);
}
.filter-reset:hover { background: var(--rose-50); }

/* ── Toolbar ── */
.products-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--cream-200);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}

.products-filters-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 16px;
  border: 1.5px solid var(--cream-300);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-600);
  background: #fff;
  transition: all var(--transition-fast);
}
.products-filters-toggle:hover { border-color: var(--rose-300); color: var(--rose-500); }

.products-count {
  font-size: 0.875rem;
  color: var(--gray-400);
}

.products-sort {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.products-sort__label {
  font-size: 0.8125rem;
  color: var(--gray-400);
}

.products-sort__select {
  /* Variante .input compacte pour le tri */
  width: auto;
  padding: 8px 36px 8px 16px;
}

/* ── Grille ── */
.products-grid--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-5);
}

.product-skeleton {
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  aspect-ratio: 3/4;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* ── Vide ── */
.products-empty {
  text-align: center;
  padding: var(--space-16) var(--space-8);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.products-empty__icon { font-size: 3rem; opacity: 0.5; }

.products-empty h3 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--gray-600);
}

.products-empty p { color: var(--gray-400); }

/* ── Pagination ── */
.products-pagination {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-10);
}

.page-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  border: 1.5px solid var(--cream-300);
  background: #fff;
  color: var(--gray-600);
  transition: all var(--transition-fast);
}

.page-btn:hover { border-color: var(--rose-300); color: var(--rose-500); }

.page-btn--active {
  background: var(--rose-500);
  border-color: var(--rose-500);
  color: #fff;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .products-layout { grid-template-columns: 1fr; }
  .products-filters {
    position: fixed;
    top: 0;
    left: -100%;
    bottom: 0;
    z-index: var(--z-modal);
    width: 280px;
    border-radius: 0;
    overflow-y: auto;
    transition: left var(--transition-normal);
    box-shadow: var(--shadow-lg);
  }
  .products-filters--open { left: 0; }
  .products-hero__inner { flex-direction: column; align-items: flex-start; }
  .products-hero__search { min-width: unset; width: 100%; }
}
</style>

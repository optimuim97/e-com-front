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
            {{ filteredProducts.length }} produits sélectionnés pour révéler votre beauté naturelle
          </p>
        </div>
        <!-- Barre de recherche -->
        <div class="products-hero__search animate-fade-up animate-fade-up-delay-3">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Rechercher un produit..."
            class="products-search-input"
            aria-label="Rechercher un produit"
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
            <li v-for="cat in categories" :key="cat.value">
              <label class="filter-checkbox">
                <input
                  type="checkbox"
                  v-model="selectedCategories"
                  :value="cat.value"
                  class="filter-checkbox__input"
                />
                <span class="filter-checkbox__box"></span>
                <span class="filter-checkbox__label">
                  {{ cat.label }}
                  <span class="filter-checkbox__count">{{ cat.count }}</span>
                </span>
              </label>
            </li>
          </ul>
        </div>

        <!-- Prix -->
        <div class="filter-group">
          <h3 class="filter-group__title">Prix (FCFA)</h3>
          <div class="filter-range">
            <input
              type="range"
              v-model.number="maxPrice"
              :min="priceRange.min"
              :max="priceRange.max"
              step="500"
              class="filter-range__input"
              :aria-label="`Prix maximum : ${maxPrice.toLocaleString()} FCFA`"
            />
            <div class="filter-range__labels">
              <span>{{ priceRange.min.toLocaleString() }}</span>
              <span class="filter-range__current">≤ {{ maxPrice.toLocaleString() }} FCFA</span>
            </div>
          </div>
        </div>

        <!-- Tags / Caractéristiques -->
        <div class="filter-group">
          <h3 class="filter-group__title">Caractéristiques</h3>
          <div class="filter-tags">
            <button
              v-for="tag in featureTags"
              :key="tag"
              class="filter-tag"
              :class="{ 'filter-tag--active': selectedTags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
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
            <span v-if="activeFilterCount > 0" class="badge badge-rose">{{ activeFilterCount }}</span>
          </button>

          <p class="products-count">
            <strong>{{ filteredProducts.length }}</strong> produit{{ filteredProducts.length > 1 ? 's' : '' }}
          </p>

          <div class="products-sort">
            <label for="sort-select" class="products-sort__label">Trier par</label>
            <select id="sort-select" v-model="sortBy" class="products-sort__select">
              <option value="featured">En vedette</option>
              <option value="newest">Nouveautés</option>
              <option value="price-asc">Prix : croissant</option>
              <option value="price-desc">Prix : décroissant</option>
              <option value="rating">Meilleures notes</option>
            </select>
          </div>

          <!-- Vue grille/liste -->
          <div class="products-view">
            <button
              class="products-view__btn"
              :class="{ 'products-view__btn--active': viewMode === 'grid' }"
              @click="viewMode = 'grid'"
              aria-label="Vue grille"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="9" height="9" rx="1"/><rect x="13" y="2" width="9" height="9" rx="1"/>
                <rect x="2" y="13" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/>
              </svg>
            </button>
            <button
              class="products-view__btn"
              :class="{ 'products-view__btn--active': viewMode === 'list' }"
              @click="viewMode = 'list'"
              aria-label="Vue liste"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Filtres actifs -->
        <div v-if="hasActiveFilters" class="products-active-filters">
          <template v-if="selectedCategories.length">
            <span
              v-for="cat in selectedCategories"
              :key="'cat-' + cat"
              class="active-filter-chip"
              @click="selectedCategories = selectedCategories.filter(c => c !== cat)"
            >
              {{ categories.find(c => c.value === cat)?.label }}
              <span>×</span>
            </span>
          </template>
          <template v-if="selectedTags.length">
            <span
              v-for="tag in selectedTags"
              :key="'tag-' + tag"
              class="active-filter-chip"
              @click="toggleTag(tag)"
            >
              {{ tag }} <span>×</span>
            </span>
          </template>
        </div>

        <!-- Grille -->
        <TransitionGroup
          :name="viewMode === 'grid' ? 'grid-fade' : 'list-fade'"
          tag="div"
          class="products-grid"
          :class="[`products-grid--${viewMode}`]"
        >
          <ProductCard
            v-for="product in sortedProducts"
            :key="product.id"
            :product="product"
            :featured="product.isBestSeller"
            @add-to-cart="$emit('add-to-cart', $event)"
            @toggle-wishlist="$emit('toggle-wishlist', $event)"
          />
        </TransitionGroup>

        <!-- Aucun résultat -->
        <div v-if="sortedProducts.length === 0" class="products-empty">
          <div class="products-empty__icon">🌸</div>
          <h3>Aucun produit trouvé</h3>
          <p>Essayez d'ajuster vos filtres ou votre recherche.</p>
          <button class="btn btn-outline" @click="resetFilters">Effacer les filtres</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import ProductCard from '@/components/ui/ProductCard.vue'

const emit = defineEmits(['add-to-cart', 'toggle-wishlist'])

const searchQuery = ref('')
const selectedCategories = ref([])
const selectedTags = ref([])
const maxPrice = ref(25000)
const sortBy = ref('featured')
const viewMode = ref('grid')
const filtersOpen = ref(false)

const priceRange = { min: 1000, max: 25000 }

const categories = [
  { value: 'hydratation',  label: 'Hydratation',  count: 4 },
  { value: 'soin-visage',  label: 'Soin visage',  count: 3 },
  { value: 'corps',        label: 'Corps',         count: 3 },
  { value: 'nettoyant',    label: 'Nettoyant',     count: 2 },
  { value: 'anti-age',     label: 'Anti-âge',      count: 2 },
]

const featureTags = ['100% naturel', 'Sans paraben', 'Vegan', 'Bio', 'Eau de rose', 'Bestseller']

const products = ref([
  {
    id: 1, slug: 'huile-rose-musquee', name: 'Huile de Rose Musquée Pure',
    shortDesc: 'Hydrate, régénère et illumine le teint',
    category: 'Soin visage', price: 7500, priceOld: 12000,
    image: '/images/huile-rose.png', isNew: false, isBestSeller: true,
    discount: 38, rating: 4.9, reviewCount: 127, wishlisted: false,
    tags: ['100% naturel', 'Eau de rose', 'Bestseller']
  },
  {
    id: 2, slug: 'elixir-de-roses', name: 'Élixir de Roses',
    shortDesc: 'Eau de rose soyeuse pour hydrater et tonifier',
    category: 'Hydratation', price: 6000, priceOld: 8000,
    image: '/images/elixir-roses.png', isNew: true, isBestSeller: true,
    discount: 25, rating: 4.8, reviewCount: 89, wishlisted: false,
    tags: ['Eau de rose', 'Bestseller', '100% naturel']
  },
  {
    id: 3, slug: 'lait-corporel-rose', name: 'Lait Corporel à la Rose',
    shortDesc: 'Lait nourrissant 500 ml pour une peau satinée',
    category: 'Corps', price: 8500, priceOld: null,
    image: '/images/lait-corporel.jpg', isNew: true, isBestSeller: false,
    discount: null, rating: 4.7, reviewCount: 45, wishlisted: false,
    tags: ['100% naturel', 'Vegan']
  },
  {
    id: 4, slug: 'serum-eclat-rose', name: 'Sérum Éclat Rose',
    shortDesc: 'Sérum concentré anti-tâches et luminosité',
    category: 'Soin visage', price: 11000, priceOld: 15000,
    image: '/images/serum-eclat.png', isNew: false, isBestSeller: false,
    discount: 27, rating: 4.6, reviewCount: 62, wishlisted: false,
    tags: ['Anti-âge', 'Sans paraben', 'Eau de rose']
  },
  {
    id: 5, slug: 'nettoyant-mousse-rose', name: 'Mousse Nettoyante Rose',
    shortDesc: 'Nettoie en douceur sans agresser le microbiome',
    category: 'Nettoyant', price: 5500, priceOld: null,
    image: '/images/mousse-nettoyante.png', isNew: false, isBestSeller: false,
    discount: null, rating: 4.5, reviewCount: 38, wishlisted: false,
    tags: ['100% naturel', 'Bio', 'Sans paraben']
  },
  {
    id: 6, slug: 'masque-rose-pur', name: 'Masque Rose Purifiant',
    shortDesc: 'Masque argile & eau de rose pour pores nets',
    category: 'Soin visage', price: 7000, priceOld: 9000,
    image: '/images/masque-rose.png', isNew: false, isBestSeller: false,
    discount: 22, rating: 4.7, reviewCount: 54, wishlisted: false,
    tags: ['100% naturel', 'Eau de rose']
  },
])

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchSearch = !searchQuery.value
      || p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      || p.shortDesc?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchCat = selectedCategories.value.length === 0
      || selectedCategories.value.some(c => p.category.toLowerCase().includes(c.replace('-', ' ')))

    const matchPrice = p.price <= maxPrice.value

    const matchTags = selectedTags.value.length === 0
      || selectedTags.value.every(t => p.tags?.includes(t))

    return matchSearch && matchCat && matchPrice && matchTags
  })
})

const sortedProducts = computed(() => {
  const arr = [...filteredProducts.value]
  switch (sortBy.value) {
    case 'price-asc':  return arr.sort((a,b) => a.price - b.price)
    case 'price-desc': return arr.sort((a,b) => b.price - a.price)
    case 'rating':     return arr.sort((a,b) => (b.rating||0) - (a.rating||0))
    case 'newest':     return arr.sort((a,b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
    default:           return arr.sort((a,b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0))
  }
})

const hasActiveFilters = computed(() =>
  selectedCategories.value.length > 0 || selectedTags.value.length > 0 || maxPrice.value < priceRange.max || searchQuery.value
)

const activeFilterCount = computed(() => selectedCategories.value.length + selectedTags.value.length)

function toggleTag(tag) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
}

function resetFilters() {
  selectedCategories.value = []
  selectedTags.value = []
  maxPrice.value = priceRange.max
  searchQuery.value = ''
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
  width: 100%;
  padding: 12px 20px 12px 44px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--cream-300);
  background: #fff;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--gray-700);
  transition: all var(--transition-fast);
  outline: none;
}

.products-search-input:focus {
  border-color: var(--rose-300);
  box-shadow: 0 0 0 3px var(--rose-100);
}

.products-search-input::placeholder { color: var(--gray-300); }

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

/* ── Checkbox ── */
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
  border-radius: 4px;
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
  height: 4px;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(-45deg) translateY(-1px);
  display: block;
}

.filter-checkbox__label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.filter-checkbox__count {
  font-size: 0.75rem;
  color: var(--gray-300);
  background: var(--cream-100);
  padding: 1px 7px;
  border-radius: var(--radius-full);
}

/* ── Range ── */
.filter-range__input {
  width: 100%;
  accent-color: var(--rose-500);
  margin-bottom: var(--space-2);
}

.filter-range__labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--gray-400);
}

.filter-range__current {
  font-weight: 500;
  color: var(--rose-500);
}

/* ── Tags ── */
.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.filter-tag {
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  border: 1.5px solid var(--cream-300);
  color: var(--gray-500);
  background: #fff;
  transition: all var(--transition-fast);
}

.filter-tag:hover { border-color: var(--rose-300); color: var(--rose-500); }

.filter-tag--active {
  background: var(--rose-50);
  border-color: var(--rose-400);
  color: var(--rose-600);
}

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
  padding: 7px 12px;
  border: 1.5px solid var(--cream-300);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--gray-700);
  background: #fff;
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}
.products-sort__select:focus { border-color: var(--rose-300); }

/* ── Vue ── */
.products-view {
  display: flex;
  gap: 2px;
}

.products-view__btn {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  color: var(--gray-400);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}
.products-view__btn:hover { color: var(--gray-700); background: var(--cream-100); }
.products-view__btn--active { color: var(--rose-500); background: var(--rose-50); }

/* ── Chips filtres actifs ── */
.products-active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-3) 0;
}

.active-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 5px 12px;
  background: var(--rose-50);
  border: 1px solid var(--rose-200);
  color: var(--rose-600);
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.active-filter-chip:hover { background: var(--rose-100); }
.active-filter-chip span { color: var(--rose-400); font-size: 1rem; line-height: 1; }

/* ── Grille ── */
.products-grid {
  padding-top: var(--space-5);
}

.products-grid--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-5);
}

.products-grid--list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
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

/* ── Animations ── */
.grid-fade-enter-active { animation: fadeInUp 0.4s ease both; }
.grid-fade-leave-active { animation: fadeInUp 0.2s ease reverse; }
.list-fade-enter-active { transition: all 0.3s ease; }
.list-fade-leave-active { transition: all 0.2s ease; }
.list-fade-enter-from, .list-fade-leave-to { opacity: 0; transform: translateX(-10px); }

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
}
</style>

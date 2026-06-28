<template>
  <main v-if="line" class="line-page">
    <!-- ── Hero gamme ── -->
    <section class="line-hero" :style="heroStyle">
      <!-- Cover image ou placeholder SVG -->
      <div class="line-hero__cover">
        <img
          v-if="line.cover_url"
          :src="line.cover_url"
          :alt="line.name"
          class="line-hero__cover-img"
        />
        <div v-else class="line-hero__cover-placeholder" :style="placeholderStyle">
          <svg class="line-hero__cover-rose" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="100" cy="100" r="88" fill="rgba(255,255,255,.07)" />
            <ellipse cx="100" cy="60"  rx="22" ry="38" fill="rgba(255,255,255,.18)" transform="rotate(0 100 100)" />
            <ellipse cx="100" cy="60"  rx="22" ry="38" fill="rgba(255,255,255,.15)" transform="rotate(60 100 100)" />
            <ellipse cx="100" cy="60"  rx="22" ry="38" fill="rgba(255,255,255,.15)" transform="rotate(120 100 100)" />
            <ellipse cx="100" cy="60"  rx="22" ry="38" fill="rgba(255,255,255,.12)" transform="rotate(180 100 100)" />
            <ellipse cx="100" cy="60"  rx="22" ry="38" fill="rgba(255,255,255,.12)" transform="rotate(240 100 100)" />
            <ellipse cx="100" cy="60"  rx="22" ry="38" fill="rgba(255,255,255,.10)" transform="rotate(300 100 100)" />
            <circle cx="100" cy="100" r="22" fill="rgba(255,255,255,.22)" />
          </svg>
        </div>
        <div class="line-hero__cover-overlay"></div>
      </div>

      <div class="container line-hero__inner">
        <RouterLink to="/products" class="line-breadcrumb">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Tous les produits
        </RouterLink>

        <div class="line-hero__badge" :style="badgeStyle">Gamme</div>

        <h1 class="line-hero__name">{{ line.name }}</h1>

        <p v-if="line.tagline" class="line-hero__tagline">{{ line.tagline }}</p>
        <p v-if="line.description" class="line-hero__desc">{{ line.description }}</p>

        <!-- Prix + CTA -->
        <div class="line-hero__actions">
          <div v-if="line.price" class="line-hero__price-wrap">
            <span class="line-hero__price-label">Gamme complète</span>
            <span class="line-hero__price">{{ formatPrice(line.price) }}</span>
          </div>

          <button
            class="btn-add-gamme"
            :class="{ 'btn-add-gamme--added': justAdded }"
            @click="addGameToCart"
            :disabled="addingToCart || cartableProducts.length === 0"
          >
            <span class="btn-add-gamme__icon" :class="{ 'btn-add-gamme__icon--spin': addingToCart }">
              <svg v-if="justAdded" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else-if="addingToCart" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </span>
            {{ justAdded ? 'Ajouté !' : addingToCart ? 'Ajout…' : 'Ajouter la gamme au panier' }}
          </button>
        </div>
      </div>
    </section>

    <!-- ── Composition de la gamme ── -->
    <div v-if="compositionProducts.length" class="container line-composition">
      <p class="kit-header">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        Cette gamme contient
      </p>

      <!-- Produits kit -->
      <div class="kit-row">
        <template v-for="(p, idx) in compositionProducts" :key="p.id">
          <a
            :href="`/products/${p.slug}`"
            target="_blank"
            rel="noopener"
            class="kit-product"
          >
            <div class="kit-avatar" :style="avatarStyle(p)">
              <img
                v-if="p.images?.[0]?.url"
                :src="p.images[0].url"
                :alt="p.name"
                class="kit-avatar__img"
              />
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <div class="kit-product__info">
              <span class="kit-product__name">{{ p.name }}</span>
              <span v-if="p.price" class="kit-product__price">{{ formatPrice(p.price) }}</span>
            </div>
            <svg class="kit-product__ext" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
          <!-- Séparateur + entre produits -->
          <span v-if="idx < compositionProducts.length - 1" class="kit-sep" aria-hidden="true">+</span>
        </template>
      </div>

      <!-- Total kit -->
      <div v-if="line.price" class="kit-total">
        <div class="kit-total__left">
          <span class="kit-total__label">Total gamme</span>
          <span v-if="savings > 0" class="kit-total__savings">
            Économisez {{ formatPrice(savings) }} vs achat séparé
          </span>
        </div>
        <span class="kit-total__price">{{ formatPrice(line.price) }}</span>
      </div>
    </div>
  </main>

  <div v-else-if="loading" class="loader-wrap"><div class="loader"></div></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useCartStore } from '@/features/cart/cart.store'
import { useCurrencyStore } from '@/stores/currency'
import { useToast } from 'vue-toastification'
import api from '@/api'

const route     = useRoute()
const cartStore = useCartStore()
const toast     = useToast()

const line           = ref(null)
const itemsProducts  = ref([])
const linkedProducts = ref([])
const loading        = ref(true)
const addingToCart   = ref(false)
const justAdded      = ref(false)

const primaryColor = computed(() => line.value?.color_hex ?? '#E8336D')

// Produits affichés dans la composition : items explicites en priorité,
// sinon produits rattachés à la gamme (product_line_id)
const compositionProducts = computed(() =>
  itemsProducts.value.length ? itemsProducts.value : linkedProducts.value
)
const cartableProducts = computed(() => compositionProducts.value)

// Somme des prix unitaires des produits composants
const itemsTotal = computed(() =>
  compositionProducts.value.reduce((sum, p) => sum + (Number(p.price) || 0), 0)
)
// Économie = somme individuelle - prix gamme (>0 seulement si la gamme est moins chère)
const savings = computed(() => {
  if (!line.value?.price || !itemsTotal.value) return 0
  return Math.max(0, itemsTotal.value - Number(line.value.price))
})

function avatarStyle(p) {
  const color = line.value?.color_hex ?? '#E8336D'
  return p.images?.[0]?.url
    ? {}
    : { background: color + '20', color }
}

const heroStyle = computed(() => ({
  '--line-color': primaryColor.value,
}))

const badgeStyle = computed(() => ({
  background:   primaryColor.value + '22',
  color:        primaryColor.value,
  borderColor:  primaryColor.value + '55',
}))

const placeholderStyle = computed(() => ({
  background: `linear-gradient(135deg, ${primaryColor.value}cc 0%, ${primaryColor.value}88 100%)`,
}))

function formatPrice(val) {
  return useCurrencyStore().format(val ?? 0)
}

async function fetchLine() {
  const { data } = await api.get(`/product-lines/${route.params.slug}`)
  const payload       = data.data ?? data
  line.value          = payload
  itemsProducts.value = payload.items_products ?? []
  // Produits déjà inclus dans la réponse (relation paginée)
  linkedProducts.value = payload.products?.data ?? payload.products ?? []
}

async function addGameToCart() {
  const toAdd = cartableProducts.value
  if (addingToCart.value || !toAdd.length) return
  addingToCart.value = true
  try {
    for (const product of toAdd) {
      await cartStore.add(product.id, 1, null, { silent: true, snapshot: product })
    }
    justAdded.value = true
    toast.success(
      `✓ Gamme "${line.value.name}" ajoutée — ${toAdd.length} produit${toAdd.length > 1 ? 's' : ''} dans votre panier`,
      { timeout: 3500 }
    )
    setTimeout(() => { justAdded.value = false }, 3500)
  } finally {
    addingToCart.value = false
  }
}

onMounted(async () => {
  await fetchLine()
  loading.value = false
})
</script>

<style scoped>
.line-page { min-height: 80vh; }

/* ── Hero ── */
.line-hero {
  position: relative;
  padding: var(--space-16) 0 var(--space-14);
  overflow: hidden;
  min-height: 420px;
  display: flex;
  align-items: center;
}

.line-hero__cover {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.line-hero__cover-img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center;
}
.line-hero__cover-placeholder {
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.line-hero__cover-rose {
  width: min(340px, 70%);
  height: min(340px, 70%);
  opacity: .55;
}
.line-hero__cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(10,2,6,.35) 0%, rgba(10,2,6,.68) 100%);
}

.line-hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  max-width: 680px;
  width: 100%;
}

.line-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: rgba(255,255,255,.7);
  text-decoration: none;
  transition: color var(--transition-fast);
  margin-bottom: var(--space-2);
}
.line-breadcrumb:hover { color: #fff; }

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
  color: #fff;
}

.line-hero__tagline {
  font-size: 1.125rem;
  color: rgba(255,255,255,.85);
  font-style: italic;
}

.line-hero__desc {
  font-size: 0.9375rem;
  color: rgba(255,255,255,.75);
  line-height: 1.65;
  max-width: 560px;
}

/* Actions */
.line-hero__actions {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  flex-wrap: wrap;
  margin-top: var(--space-3);
}

.line-hero__price-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-3) var(--space-5);
  background: rgba(255,255,255,.12);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(255,255,255,.25);
  border-radius: var(--radius-xl);
}
.line-hero__price-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255,255,255,.75);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.line-hero__price {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
  line-height: 1;
}

/* Bouton ajouter gamme */
.btn-add-gamme {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 700;
  font-family: var(--font-body);
  background: #fff;
  color: var(--line-color, #E8336D);
  box-shadow: 0 4px 20px rgba(0,0,0,.2);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.2s, color 0.2s;
}
.btn-add-gamme:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,0,0,.28);
}
.btn-add-gamme:active:not(:disabled) { transform: translateY(0); }
.btn-add-gamme:disabled { opacity: .8; cursor: default; }
.btn-add-gamme--added {
  background: var(--line-color, #E8336D);
  color: #fff;
}

.btn-add-gamme__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.btn-add-gamme__icon--spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Composition ── */
.line-composition {
  padding: var(--space-10) var(--space-4) var(--space-10);
}

.kit-header {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-400);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: var(--space-5);
}
.kit-header svg { flex-shrink: 0; opacity: .6; }

/* ── Rangée produits ── */
.kit-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.kit-sep {
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--gray-300);
  flex-shrink: 0;
  line-height: 1;
  user-select: none;
}

/* ── Carte produit ── */
.kit-product {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-3);
  background: #fff;
  border: 1.5px solid var(--cream-200, #ede8e3);
  border-radius: var(--radius-xl, 14px);
  text-decoration: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  min-width: 0;
}
.kit-product:hover {
  border-color: var(--line-color, #E8336D);
  box-shadow: 0 4px 16px rgba(0,0,0,.07);
  transform: translateY(-1px);
}
.kit-product:active { transform: translateY(0); }

.kit-avatar {
  width: 48px; height: 48px;
  border-radius: 10px;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  background: var(--cream-100, #f5f0ec);
}
.kit-avatar__img { width: 100%; height: 100%; object-fit: cover; }

.kit-product__info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.kit-product__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-800);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}
.kit-product__price {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-500);
}

.kit-product__ext {
  flex-shrink: 0;
  color: var(--gray-300);
  margin-left: var(--space-1);
  transition: color 0.15s;
}
.kit-product:hover .kit-product__ext { color: var(--line-color, #E8336D); }

/* ── Total ── */
.kit-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--cream-200, #ede8e3);
  flex-wrap: wrap;
}
.kit-total__left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.kit-total__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
}
.kit-total__savings {
  font-size: 0.75rem;
  color: #2d9b5e;
  font-weight: 500;
}
.kit-total__price {
  font-family: var(--font-display);
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--line-color, #E8336D);
  letter-spacing: -0.01em;
  white-space: nowrap;
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .line-hero { min-height: 320px; padding: var(--space-12) 0 var(--space-10); }
  .line-hero__actions { flex-direction: column; align-items: flex-start; gap: var(--space-3); }
  .line-hero__price-wrap { width: 100%; }
  .btn-add-gamme { width: 100%; justify-content: center; }
}
</style>

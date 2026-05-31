<template>
  <article class="product-card" :class="{ 'product-card--featured': product.is_featured }">

    <!-- ── Zone image ── -->
    <div
      class="product-card__img-wrap"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <!-- Badges top-left -->
      <div class="product-card__badges">
        <span v-if="product.stock === 0"   class="badge badge-dark">{{ $t('product.soldOut') }}</span>
        <span v-if="product.is_featured"   class="badge badge-rose">{{ $t('product.featured') }}</span>
        <span v-if="discountPercent"       class="badge badge-gold">-{{ discountPercent }}%</span>
      </div>

      <!-- Wishlist -->
      <div class="absolute top-3 right-3 z-10" @click.prevent>
        <WishlistButton :productId="product.id" />
      </div>

      <!-- Image principale -->
      <RouterLink :to="`/products/${product.slug}`" class="product-card__img-link">
        <img
          v-if="cover"
          :src="cover"
          :alt="product.name"
          class="product-card__img"
          :class="{
            'product-card__img--zoom':    hovered && coverAlt,
            'product-card__img--grayscale': product.stock === 0,
          }"
          loading="lazy"
        />
        <!-- Image de survol (2e image du produit) -->
        <img
          v-if="coverAlt"
          :src="coverAlt"
          :alt="product.name + ' — vue alternative'"
          class="product-card__img product-card__img--hover"
          :class="{ 'product-card__img--visible': hovered }"
          loading="lazy"
        />
        <!-- Fallback -->
        <div v-if="!cover" class="product-card__img-placeholder">🌹</div>
      </RouterLink>

      <!-- Ajout rapide au survol -->
      <div
        v-if="product.stock > 0"
        class="product-card__quick-add"
        :class="{ 'product-card__quick-add--visible': hovered }"
      >
        <button class="product-card__add-btn" @click.prevent="addToCart">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {{ $t('product.addToCart') }}
        </button>
      </div>
    </div>

    <!-- ── Infos produit ── -->
    <div class="product-card__info">
      <div class="product-card__meta">
        <span class="product-card__cat">{{ product.category?.name }}</span>
        <RouterLink
          v-if="product.product_line"
          :to="`/gammes/${product.product_line.slug}`"
          class="product-card__line"
          :style="{ color: product.product_line.color_hex, borderColor: product.product_line.color_hex + '44', background: product.product_line.color_hex + '12' }"
          @click.stop
        >
          {{ product.product_line.name }}
        </RouterLink>
      </div>

      <RouterLink :to="`/products/${product.slug}`" class="product-card__name-link">
        <h3 class="product-card__name">{{ product.name }}</h3>
      </RouterLink>

      <p v-if="product.description" class="product-card__desc">
        {{ product.description }}
      </p>

      <!-- Footer : prix + bouton panier -->
      <div class="product-card__footer">
        <div class="product-card__price">
          <span v-if="product.compare_price" class="product-card__price-old">
            {{ formatPrice(product.compare_price) }}
          </span>
          <span class="product-card__price-current">{{ formatPrice(product.price) }}</span>
        </div>

        <button
          class="product-card__cart-btn"
          :class="{ 'product-card__cart-btn--added': added, 'product-card__cart-btn--out': product.stock === 0 }"
          :disabled="product.stock === 0"
          @click.prevent="addToCart"
          :aria-label="$t('product.addToCart') + ' ' + product.name"
        >
          <Transition name="swap" mode="out-in">
            <svg v-if="!added" key="bag" width="17" height="17" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <svg v-else key="check" width="17" height="17" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </Transition>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import WishlistButton from '@/features/wishlist/WishlistButton.vue'


const props = defineProps({
  product:  { type: Object,  required: true },
});

const { t } = useI18n();
const emit = defineEmits(['add-to-cart', 'toggle-wishlist']);

const hovered    = ref(false);
const wishlisted = ref(props.product.wishlisted ?? false);
const added      = ref(false);

/* Images */
const cover    = computed(() => props.product.images?.[0]?.url ?? null);
const coverAlt = computed(() => props.product.images?.[1]?.url ?? null);

/* Remise calculée depuis compare_price */
const discountPercent = computed(() => {
  const { price, compare_price } = props.product;
  if (!compare_price || !price || compare_price <= price) return null;
  return Math.round((1 - price / compare_price) * 100);
});

function formatPrice(val) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'XOF', minimumFractionDigits: 0,
  }).format(val);
}

function addToCart() {
  if (props.product.stock === 0) return;
  emit('add-to-cart', props.product);
  added.value = true;
  setTimeout(() => { added.value = false; }, 1800);
}

function toggleWishlist() {
  wishlisted.value = !wishlisted.value;
  emit('toggle-wishlist', { product: props.product, wishlisted: wishlisted.value });
}
</script>

<style scoped>
/* ── Carte ── */
.product-card {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-normal);
  cursor: pointer;
}
.product-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
  border-color: var(--rose-200);
}
.product-card--featured {
  border: 2px solid var(--rose-300);
  box-shadow: var(--shadow-rose);
}

/* ── Zone image ── */
.product-card__img-wrap {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: linear-gradient(145deg, var(--rose-50), var(--cream-100));
}
.product-card__img-link {
  display: block;
  width: 100%;
  height: 100%;
}
.product-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all var(--transition-slow);
}
.product-card__img--zoom    { transform: scale(1.06); }
.product-card__img--grayscale { opacity: 0.5; filter: grayscale(1); }
.product-card__img--hover {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity var(--transition-normal);
}
.product-card__img--visible { opacity: 1; }
.product-card__img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
}

/* ── Badges ── */
.product-card__badges {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

/* ── Wishlist ── */
.product-card__wish {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  z-index: 2;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.92);
  color: var(--gray-400);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--cream-200);
}
.product-card__wish:hover { background: #fff; color: var(--rose-400); transform: scale(1.1); }
.product-card__wish--active { color: var(--rose-500); background: var(--rose-50); border-color: var(--rose-200); }

/* ── Ajout rapide ── */
.product-card__quick-add {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: var(--space-3);
  background: linear-gradient(to top, rgba(0,0,0,0.38), transparent);
  opacity: 0;
  transform: translateY(8px);
  transition: all var(--transition-normal);
}
.product-card__quick-add--visible { opacity: 1; transform: translateY(0); }
.product-card__add-btn {
  width: 100%;
  padding: 10px;
  background: rgba(255,255,255,0.95);
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-800);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  transition: all var(--transition-fast);
}
.product-card__add-btn:hover { background: var(--rose-500); color: #fff; }

/* ── Infos ── */
.product-card__info {
  padding: var(--space-4) var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}
.product-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-wrap: wrap;
}
/* Catégorie : contexte discret, pas de compétition visuelle */
.product-card__cat {
  font-size: 0.5625rem;
  font-weight: 500;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--gray-400);
}
/* Tag gamme : toute petite pilule colorée, presque un détail */
.product-card__line {
  font-size: 0.5375rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: var(--radius-full);
  border: 1px solid;
  transition: opacity var(--transition-fast);
  line-height: 1.7;
}
.product-card__line:hover { opacity: 0.7; }
.product-card__name-link { display: block; }
/* Nom : vedette principale de la carte */
.product-card__name {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-800);
  line-height: 1.25;
  transition: color var(--transition-fast);
}
.product-card__name-link:hover .product-card__name { color: var(--color-primary); }
.product-card__desc {
  font-size: 0.8125rem;
  color: var(--gray-400);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Footer ── */
.product-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: var(--space-3);
  border-top: 1px solid var(--cream-200);
}
.product-card__price {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.product-card__price-old {
  font-size: 0.75rem;
  color: var(--gray-300);
  text-decoration: line-through;
}
.product-card__price-current {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--rose-600);
}

/* ── Bouton panier ── */
.product-card__cart-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--rose-50);
  border: 1.5px solid var(--rose-200);
  color: var(--rose-500);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}
.product-card__cart-btn:hover {
  background: var(--rose-500);
  border-color: var(--rose-500);
  color: #fff;
  transform: scale(1.08);
  box-shadow: var(--shadow-rose);
}
.product-card__cart-btn--added {
  background: var(--rose-500);
  border-color: var(--rose-500);
  color: #fff;
}
.product-card__cart-btn--out {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

/* ── Transition icône panier ↔ check ── */
.swap-enter-active, .swap-leave-active { transition: all 0.18s; }
.swap-enter-from { opacity: 0; transform: scale(0.5) rotate(20deg); }
.swap-leave-to   { opacity: 0; transform: scale(0.5) rotate(-20deg); }
</style>

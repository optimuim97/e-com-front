<template>
  <main class="product-page">
    <!-- Loading -->
    <div v-if="loading" class="product-loader">
      <div class="product-loader__spinner"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="product-error">
      <div class="product-error__icon"><FlowerMark /></div>
      <h2 class="display-md">{{ $t('product.notFound') }}</h2>
      <p>{{ $t('product.notFoundDesc') }}</p>
      <RouterLink to="/products" class="btn btn-primary">{{ $t('product.backToShop') }}</RouterLink>
    </div>

    <!-- Product -->
    <div v-else-if="product" class="container product-inner">
      <!-- Breadcrumb -->
      <nav class="product-breadcrumb" :aria-label="$t('product.breadcrumbHome')">
        <RouterLink to="/">{{ $t('product.breadcrumbHome') }}</RouterLink>
        <span aria-hidden="true">/</span>
        <RouterLink to="/products">{{ $t('product.breadcrumbShop') }}</RouterLink>
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
            <span class="product-info__reviews">{{ $t('product.reviews', { count: product.reviews_count ?? 0 }) }}</span>
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
            <span class="label">{{ $t('product.variant') }}</span>
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
            <span class="label">{{ $t('product.quantity') }}</span>
            <div class="product-info__qty">
              <button @click="qty > 1 && qty--" class="product-info__qty-btn" :aria-label="$t('product.decrease')">
                <MinusIcon class="w-4 h-4" />
              </button>
              <span class="product-info__qty-value">{{ qty }}</span>
              <button @click="qty++" class="product-info__qty-btn" :aria-label="$t('product.increase')">
                <PlusIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Stock -->
          <p v-if="product.stock !== undefined" class="product-info__stock"
            :class="product.stock > 0 ? 'product-info__stock--ok' : 'product-info__stock--ko'">
            <span class="product-info__stock-dot"></span>
            {{ product.stock > 0 ? $t('product.inStock', { count: product.stock }) : $t('product.outOfStock') }}
          </p>

          <!-- Actions -->
          <div class="product-info__actions">
            <button @click="addToCart" :disabled="product.stock === 0 || cartLoading"
              class="btn btn-primary btn-lg product-info__cta">
              <span v-if="cartLoading" class="product-info__spinner"></span>
              <span v-else>{{ $t('product.addToCartWithPrice', { price: formatPrice(product.price * qty) }) }}</span>
            </button>
            <WishlistButton
              v-if="product?.id"
              :product-id="product.id"
              class="product-info__wish"
            />
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
              {{ $t('product.addedToCart') }}
            </p>
          </transition>
        </div>
      </div>

      <!-- ─── Reviews Section ─────────────────────────────────────── -->
      <section class="reviews-section" v-if="product">
        <div class="reviews-section__header">
          <h2 class="reviews-section__title">
            {{ $t('reviews.title') }}
            <span v-if="product.reviews_count" class="reviews-section__count">
              ({{ product.reviews_count }})
            </span>
          </h2>

          <!-- Average rating summary -->
          <div v-if="product.rating_avg" class="reviews-section__avg">
            <span class="reviews-section__avg-score">{{ product.rating_avg }}</span>
            <div class="reviews-section__avg-stars">
              <StarRating :model-value="Math.round(product.rating_avg)" />
              <span class="reviews-section__avg-label">{{ $t('reviews.outOf5') }}</span>
            </div>
          </div>
        </div>

        <!-- Review form -->
        <div v-if="isAuth" class="review-form-card">
          <h3 class="review-form-card__title">{{ $t('reviews.leaveReview') }}</h3>

          <div v-if="reviewSubmitted" class="review-form-card__success">
            {{ $t('reviews.submitted') }}
          </div>

          <div v-else-if="reviewAlreadyExists" class="review-form-card__info">
            {{ $t('reviews.alreadyExists') }}
          </div>

          <form v-else @submit.prevent="submitReview" class="review-form">
            <div class="review-form__field">
              <label class="label">{{ $t('reviews.ratingLabel') }}</label>
              <StarRating
                v-model="reviewForm.rating"
                :interactive="true"
              />
              <span v-if="reviewErrors.rating" class="review-form__error">{{ reviewErrors.rating }}</span>
            </div>

            <div class="review-form__field">
              <label class="label">{{ $t('reviews.titleLabel') }}</label>
              <input
                v-model="reviewForm.title"
                type="text"
                class="input"
                :placeholder="$t('reviews.titlePlaceholder')"
                maxlength="120"
              />
            </div>

            <div class="review-form__field">
              <label class="label">{{ $t('reviews.commentLabel') }}</label>
              <textarea
                v-model="reviewForm.comment"
                class="input"
                rows="4"
                :placeholder="$t('reviews.commentPlaceholder')"
                maxlength="2000"
              ></textarea>
              <span v-if="reviewErrors.comment" class="review-form__error">{{ reviewErrors.comment }}</span>
            </div>

            <div class="review-form__footer">
              <button type="submit" class="btn btn-primary" :disabled="reviewForm.rating === 0 || reviewLoading">
                <span v-if="reviewLoading" class="product-info__spinner"></span>
                <span v-else>{{ $t('reviews.submit') }}</span>
              </button>
              <span class="review-form__note">{{ $t('reviews.moderationNote') }}</span>
            </div>
          </form>
        </div>

        <div v-else class="review-form-card review-form-card--guest">
          <RouterLink to="/login" class="btn btn-outline">
            {{ $t('reviews.loginToReview') }}
          </RouterLink>
        </div>

        <!-- Reviews list -->
        <div v-if="reviewsLoading" class="reviews-list__loading">{{ $t('reviews.loading') }}</div>

        <div v-else-if="reviews.length === 0" class="reviews-list__empty">
          <span class="reviews-list__empty-icon">✍️</span>
          <p>{{ $t('reviews.empty') }}</p>
        </div>

        <ul v-else class="reviews-list">
          <li v-for="review in reviews" :key="review.id" class="review-card">
            <div class="review-card__header">
              <StarRating :model-value="review.rating" />
              <span class="review-card__author">{{ review.user?.name ?? $t('reviews.anonymous') }}</span>
              <span class="review-card__date">{{ review.created_at }}</span>
            </div>
            <p v-if="review.title" class="review-card__title">{{ review.title }}</p>
            <p v-if="review.comment" class="review-card__comment">{{ review.comment }}</p>
          </li>
        </ul>

        <!-- Pagination -->
        <div v-if="reviewsMeta && reviewsMeta.last_page > 1" class="reviews-pagination">
          <button
            class="btn btn-outline btn-sm"
            :disabled="reviewsPage <= 1"
            @click="reviewsPage--; loadReviews()"
          >{{ $t('reviews.previous') }}</button>
          <span class="reviews-pagination__info">{{ reviewsPage }} / {{ reviewsMeta.last_page }}</span>
          <button
            class="btn btn-outline btn-sm"
            :disabled="reviewsPage >= reviewsMeta.last_page"
            @click="reviewsPage++; loadReviews()"
          >{{ $t('reviews.next') }}</button>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import { MinusIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { useCartStore } from '@/features/cart/cart.store'
import { useAuthStore } from '@/features/auth/auth.store'
import StarRating from '@/features/reviews/StarRating.vue'
import { reviewApi } from '@/features/reviews/review.api'
import WishlistButton from '@/features/wishlist/WishlistButton.vue'

const { t } = useI18n()
const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()
const isAuth = computed(() => !!authStore.user)

const product = ref(null)
const loading = ref(true)
const error = ref(false)
const activeImage = ref('')
const selectedVariant = ref(null)
const qty = ref(1)
const cartLoading = ref(false)
const cartSuccess = ref(false)

// ─── Reviews state ────────────────────────────────────────────────
const reviews        = ref([])
const reviewsMeta    = ref(null)
const reviewsLoading = ref(false)
const reviewsPage    = ref(1)

const reviewForm = ref({ rating: 0, title: '', comment: '' })
const reviewErrors       = ref({})
const reviewLoading      = ref(false)
const reviewSubmitted    = ref(false)
const reviewAlreadyExists = ref(false)

const discountPercent = computed(() => {
  if (!product.value?.compare_price || product.value.compare_price <= product.value.price) return 0
  return Math.round((1 - product.value.price / product.value.compare_price) * 100)
})

const trustBadges = computed(() => [
  {
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    label: t('product.natural'),
  },
  {
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    label: t('product.delivery48h'),
  },
  {
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    label: t('product.return14d'),
  },
])

async function loadReviews() {
  reviewsLoading.value = true
  try {
    const { data } = await reviewApi.list(route.params.slug, { page: reviewsPage.value })
    reviews.value   = data.data ?? data
    reviewsMeta.value = data.meta ?? null
  } catch {
    // silently fail
  } finally {
    reviewsLoading.value = false
  }
}

async function submitReview() {
  reviewErrors.value = {}
  reviewLoading.value = true
  try {
    await reviewApi.store(route.params.slug, reviewForm.value)
    reviewSubmitted.value = true
  } catch (err) {
    if (err.response?.status === 409) {
      reviewAlreadyExists.value = true
    } else if (err.response?.status === 422) {
      const errs = err.response.data.errors ?? {}
      reviewErrors.value = Object.fromEntries(
        Object.entries(errs).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
      )
    }
  } finally {
    reviewLoading.value = false
  }
}

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

onMounted(() => { fetchProduct(); loadReviews() })
watch(() => route.params.slug, () => {
  fetchProduct()
  reviewsPage.value = 1
  reviewSubmitted.value = false
  reviewAlreadyExists.value = false
  reviewForm.value = { rating: 0, title: '', comment: '' }
  loadReviews()
})
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
  /* Aligne le WishlistButton (qui est circulaire par défaut) sur la
     hauteur du CTA panier qui est en btn-lg (~52px) */
  width: 52px !important;
  height: 52px !important;
  flex-shrink: 0;
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

/* ── Reviews Section ── */
.reviews-section {
  margin-top: var(--space-16);
  padding-top: var(--space-10);
  border-top: 2px solid var(--cream-200);
}

.reviews-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.reviews-section__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-800);
}

.reviews-section__count {
  font-size: 1rem;
  font-weight: 400;
  color: var(--gray-400);
}

.reviews-section__avg {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--rose-50);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-xl);
}

.reviews-section__avg-score {
  font-size: 2rem;
  font-weight: 700;
  color: var(--rose-600);
  line-height: 1;
}

.reviews-section__avg-stars {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reviews-section__avg-label {
  font-size: 0.75rem;
  color: var(--gray-500);
}

/* Review form card */
.review-form-card {
  background: var(--color-surface);
  border: 1.5px solid var(--cream-200);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
}

.review-form-card--guest {
  text-align: center;
  padding: var(--space-8);
}

.review-form-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: var(--space-5);
}

.review-form-card__success {
  background: #dcfce7;
  color: #15803d;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.review-form-card__info {
  background: #fef3c7;
  color: #92400e;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.review-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.review-form__error {
  font-size: 0.75rem;
  color: var(--rose-500);
}

.review-form__footer {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.review-form__note {
  font-size: 0.75rem;
  color: var(--gray-400);
  font-style: italic;
}

/* Reviews list */
.reviews-list__loading,
.reviews-list__empty {
  text-align: center;
  padding: var(--space-10);
  color: var(--gray-400);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.reviews-list__empty-icon { font-size: 2rem; }

.reviews-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.review-card {
  background: var(--color-surface);
  border: 1px solid var(--cream-200);
  border-radius: var(--radius-xl);
  padding: var(--space-5) var(--space-6);
  transition: box-shadow var(--transition-fast);
}

.review-card:hover { box-shadow: var(--shadow-sm); }

.review-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}

.review-card__author {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--gray-700);
}

.review-card__date {
  font-size: 0.75rem;
  color: var(--gray-400);
  margin-left: auto;
}

.review-card__title {
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: var(--space-1);
  font-size: 0.9375rem;
}

.review-card__comment {
  color: var(--gray-500);
  font-size: 0.875rem;
  line-height: 1.6;
}

/* Pagination */
.reviews-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.reviews-pagination__info {
  font-size: 0.875rem;
  color: var(--gray-500);
}
</style>

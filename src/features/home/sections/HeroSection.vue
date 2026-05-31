<template>
  <section class="hero">

    <!-- ── Carousel fond ─────────────────────────────────────────────────── -->
    <div class="hero__carousel" aria-hidden="true">
      <TransitionGroup name="carousel-fade" tag="div" class="hero__carousel-track">
        <div
          v-for="(img, i) in carouselImages"
          v-show="i === currentSlide"
          :key="img"
          class="hero__carousel-slide"
        >
          <img :src="img" alt="" class="hero__carousel-img" loading="lazy" />
        </div>
      </TransitionGroup>
      <!-- Fondu gradient pour lisibilité du texte -->
      <div class="hero__carousel-overlay"></div>

      <!-- Dots -->
      <div class="hero__carousel-dots">
        <button
          v-for="(_, i) in carouselImages"
          :key="i"
          class="hero__carousel-dot"
          :class="{ 'hero__carousel-dot--active': i === currentSlide }"
          @click="goToSlide(i)"
          :aria-label="`Image ${i + 1}`"
        ></button>
      </div>
    </div>

    <!-- Fond décoratif blobs (sur le carousel) -->
    <div class="hero__bg" aria-hidden="true">
      <div class="hero__bg-blob hero__bg-blob--1"></div>
      <div class="hero__bg-blob hero__bg-blob--2"></div>
    </div>

    <div class="container hero__inner">

      <!-- Colonne gauche : texte -->
      <div class="hero__content">
        <div class="hero__eyebrow animate-fade-up">
          <span class="badge badge-rose">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="5"/></svg>
            {{ eyebrowText }}
          </span>
        </div>

        <h1 class="display-xl hero__title animate-fade-up animate-fade-up-delay-1">
          <template v-if="heroTitle">{{ heroTitle }}</template>
          <template v-else>
            {{ $t('hero.defaultTitle').split(' ').slice(0, 2).join(' ') }} <br>
            <em class="hero__title-em">{{ $t('hero.titleNatural') }}</em><br>
            {{ $t('hero.titleRevealed') }}
          </template>
        </h1>

        <p class="hero__desc animate-fade-up animate-fade-up-delay-2">
          {{ subtitleText }}
        </p>

        <!-- Preuves sociales — uniquement si données réelles -->
        <div v-if="hasRealReviews" class="hero__trust animate-fade-up animate-fade-up-delay-3">
          <div class="hero__stars">
            <span v-for="i in 5" :key="i" class="hero__star" :class="{ 'hero__star--filled': i <= Math.round(ratingAvg) }">★</span>
            <span class="hero__rating">
              {{ ratingAvg.toFixed(1).replace('.', ',') }}
              <span class="hero__reviews">{{ reviewsLabel }}</span>
            </span>
          </div>
          <div v-if="clientsCount > 0" class="hero__trust-divider"></div>
          <div v-if="clientsCount > 0" class="hero__avatars">
            <img v-for="(a, i) in avatars" :key="i" :src="a" alt="" class="hero__avatar" :style="{ zIndex: avatars.length - i }" v-img-fallback />
            <span class="hero__avatars-text">{{ clientsLabel }}</span>
          </div>
        </div>

        <!-- CTAs -->
        <div class="hero__ctas animate-fade-up animate-fade-up-delay-4">
          <RouterLink to="/products" class="btn btn-primary btn-lg">
            {{ $t('hero.cta') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </RouterLink>
          <RouterLink to="/programme" class="btn btn-outline btn-lg">
            {{ $t('hero.ctaProgram') }}
          </RouterLink>
        </div>

        <!-- Badges de confiance -->
        <div class="hero__badges animate-fade-up animate-fade-up-delay-4">
          <div class="hero__trust-badge" v-for="badge in trustBadges" :key="badge.label">
            <span class="hero__trust-icon" v-html="badge.icon"></span>
            <span>{{ badge.label }}</span>
          </div>
        </div>
      </div>

      <!-- Colonne droite : produit -->
      <div class="hero__visual animate-fade-up animate-fade-up-delay-2">

        <!-- Carte produit -->
        <div class="hero__product-card">
          <div class="hero__product-img-wrap">
            <img
              v-if="displayProduct.image"
              :src="displayProduct.image"
              :alt="displayProduct.name"
              class="hero__product-img"
              @error="$event.target.style.display='none'"
            />
            <div v-else class="hero__product-img-placeholder">🌹</div>

            <!-- Badge best-seller ou flash -->
            <div class="hero__product-badge" :class="displayProduct.isFlash ? 'hero__product-badge--flash' : 'hero__product-badge--bs'">
              <template v-if="displayProduct.isFlash">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                {{ $t('hero.flashBadge') }}
              </template>
              <template v-else>
                🏆 {{ $t('common.bestseller') }}
              </template>
            </div>
          </div>

          <div class="hero__product-info">
            <RouterLink v-if="displayProduct.slug" :to="`/products/${displayProduct.slug}`" class="hero__product-name-link">
              <h3 class="hero__product-name">{{ displayProduct.name }}</h3>
            </RouterLink>
            <h3 v-else class="hero__product-name">{{ displayProduct.name }}</h3>

            <div class="hero__product-price">
              <span v-if="displayProduct.priceOld" class="hero__price-old">{{ displayProduct.priceOld }}</span>
              <span class="hero__price-new">{{ displayProduct.price }}</span>
            </div>
            <button class="btn btn-primary hero__product-btn" @click="$emit('add-to-cart', displayProduct)">
              {{ $t('common.addToCart') }}
            </button>
          </div>
        </div>

        <!-- Carte avis flottante — UNIQUEMENT si avis réel disponible -->
<!--        <div v-if="featuredReview" class="hero__float-review">-->
<!--          <div class="hero__float-avatar">{{ featuredReview.initial }}</div>-->
<!--          <div>-->
<!--            <div class="hero__float-stars">-->
<!--              <span v-for="i in 5" :key="i" :class="{ 'hero__float-star&#45;&#45;off': i > featuredReview.rating }">★</span>-->
<!--            </div>-->
<!--            <p class="hero__float-text">"{{ featuredReview.quote }}"</p>-->
<!--            <span class="hero__float-name">{{ featuredReview.name }} · {{ featuredReview.location }}</span>-->
<!--          </div>-->
<!--        </div>-->

        <div class="hero__visual-bg" aria-hidden="true"></div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="hero__scroll" aria-hidden="true">
      <div class="hero__scroll-line"></div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'

// ── Carousel ──────────────────────────────────────────────────────────────────
const carouselImages = [
  '/image_site/FLS_8032.jpeg',
  '/image_site/FLS_8111.jpeg',
  '/image_site/FLS_8130.jpeg',
  '/image_site/FLS_8142.jpeg',
  '/image_site/DSC_7542.jpeg',
  '/image_site/DSC_7553.jpeg',
  '/image_site/DSC_7629.jpeg',
]
const SLIDE_DURATION = 5000
const currentSlide = ref(0)
let timer = null

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % carouselImages.length
}
function goToSlide(i) {
  currentSlide.value = i
  resetTimer()
}
function resetTimer() {
  clearInterval(timer)
  timer = setInterval(nextSlide, SLIDE_DURATION)
}

onMounted(() => resetTimer())
onBeforeUnmount(() => clearInterval(timer))

defineEmits(['add-to-cart'])

const props = defineProps({
  heroProduct:    { type: Object, default: null },
  flashProduct:   { type: Object, default: null },
  ratingAvg:      { type: Number, default: 0 },
  reviewsCount:   { type: Number, default: 0 },
  clientsCount:   { type: Number, default: 0 },
  featuredReview: { type: Object, default: null },  // null = pas d'avis réel
  heroEyebrow:    { type: String, default: '' },
  heroTitle:      { type: String, default: '' },
  heroSubtitle:   { type: String, default: '' },
})

const { t } = useI18n()
const settings = useSettingsStore()

/* Affiche la zone trust uniquement si des vrais avis existent */
const hasRealReviews = computed(() => props.reviewsCount > 0 && props.ratingAvg > 0)

/* Produit affiché : flash si actif, sinon best-seller/hero */
const displayProduct = computed(() => {
  const source = props.flashProduct?.is_flash_active ? props.flashProduct : props.heroProduct
  if (source) {
    const isFlash = !!props.flashProduct?.is_flash_active
    return {
      id:       source.id,
      name:     source.name,
      price:    settings.formatPrice(isFlash ? (source.flash_price ?? source.price) : source.price),
      priceOld: isFlash
        ? settings.formatPrice(source.price)
        : (source.compare_price ? settings.formatPrice(source.compare_price) : null),
      image:    source.images?.[0]?.url ?? null,
      slug:     source.slug,
      isFlash,
    }
  }
  // Fallback minimal sans données bidon
  return {
    id: null, name: t('hero.defaultProductName'),
    price: settings.formatPrice(7000), priceOld: null,
    image: null, slug: null, isFlash: false,
  }
})

const eyebrowText  = computed(() => props.heroEyebrow  || t('hero.defaultEyebrow'))
const subtitleText = computed(() => props.heroSubtitle || t('hero.defaultSubtitle'))

const reviewsLabel = computed(() =>
  props.reviewsCount > 0 ? t('hero.reviews', { count: props.reviewsCount }) : ''
)
const clientsLabel = computed(() =>
  props.clientsCount > 0 ? t('hero.clients', { count: props.clientsCount.toLocaleString('fr-FR') }) : ''
)

const avatars = ['/images/avatar-1.jpg', '/images/avatar-2.jpg', '/images/avatar-3.jpg']

const trustBadges = computed(() => [
  {
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    label: t('hero.natural'),
  },
  {
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    label: t('hero.noParaben'),
  },
  {
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    label: t('hero.delivery48h'),
  },
  {
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    label: t('hero.return14d'),
  },
])
</script>

<style scoped>
.hero {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: var(--space-10) 0 var(--space-8);
  background: var(--cream-50);
  min-height: 88vh;
}

/* ── Carousel ──────────────────────────────────────────────────────────────── */
.hero__carousel {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero__carousel-track {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero__carousel-slide {
  position: absolute;
  inset: 0;
}

.hero__carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  display: block;
}

/* Fondu gradient pour lisibilité du texte à gauche */
.hero__carousel-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      to right,
      rgba(253, 247, 243, 0.96) 0%,
      rgba(253, 247, 243, 0.88) 28%,
      rgba(253, 247, 243, 0.50) 52%,
      rgba(253, 247, 243, 0.10) 72%,
      transparent 100%
    ),
    linear-gradient(
      to bottom,
      rgba(253, 247, 243, 0.4) 0%,
      transparent 15%,
      transparent 80%,
      rgba(253, 247, 243, 0.5) 100%
    );
}

/* Dots */
.hero__carousel-dots {
  position: absolute;
  bottom: 28px;
  right: 40px;
  display: flex;
  gap: 8px;
  z-index: 2;
}
.hero__carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.45);
  border: 1.5px solid rgba(255,255,255,0.6);
  transition: all 0.3s ease;
  cursor: pointer;
}
.hero__carousel-dot--active {
  background: #fff;
  width: 24px;
  border-radius: 4px;
}

/* Cross-fade transition */
.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 1.2s ease;
  position: absolute;
  inset: 0;
}
.carousel-fade-enter-from,
.carousel-fade-leave-to { opacity: 0; }
.carousel-fade-enter-to,
.carousel-fade-leave-from { opacity: 1; }

/* ── Blobs décoratifs ──────────────────────────────────────────────────────── */
.hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.hero__bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
}
.hero__bg-blob--1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, var(--rose-200), transparent 70%);
  top: -80px; right: -80px;
  animation: floatY 8s ease-in-out infinite;
}
.hero__bg-blob--2 {
  width: 280px; height: 280px;
  background: radial-gradient(circle, var(--gold-200), transparent 70%);
  bottom: -60px; left: -40px;
  animation: floatY 10s ease-in-out infinite reverse;
}

/* petals removed */

/* ── Layout ── */
.hero__inner {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
  align-items: center;
}

/* ── Contenu gauche ── */
.hero__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.hero__title { color: var(--gray-800); }
.hero__title-em {
  font-style: italic;
  color: var(--color-primary);
}
.hero__desc {
  font-size: 1.0625rem;
  color: var(--gray-600);
  line-height: 1.75;
  max-width: 440px;
}

/* ── Trust ── */
.hero__trust {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.hero__stars { display: flex; align-items: center; gap: 4px; }
.hero__star { color: #e2d5c8; font-size: 0.875rem; }
.hero__star--filled { color: #f0b462; }
.hero__rating {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-left: 4px;
}
.hero__reviews { font-weight: 400; color: var(--gray-400); }

.hero__trust-divider { width: 1px; height: 24px; background: var(--cream-300); }

.hero__avatars { display: flex; align-items: center; gap: var(--space-2); }
.hero__avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 2px solid #fff;
  object-fit: cover;
  margin-left: -8px;
  background: var(--rose-200);
}
.hero__avatar:first-child { margin-left: 0; }
.hero__avatars-text { font-size: 0.8125rem; color: var(--gray-500); margin-left: var(--space-2); }

/* ── CTAs ── */
.hero__ctas { display: flex; gap: var(--space-3); flex-wrap: wrap; }

/* ── Badges confiance ── */
.hero__badges {
  display: flex;
  gap: var(--space-5);
  flex-wrap: wrap;
  padding-top: var(--space-2);
  border-top: 1px solid var(--cream-300);
}
.hero__trust-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.75rem;
  color: var(--gray-500);
}
.hero__trust-icon { color: var(--color-primary); display: flex; }

/* ── Visuel droite ── */
.hero__visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero__visual-bg {
  position: absolute;
  inset: -60px;
  /* Halo ambiant plus profond — enveloppe la carte dans la lumière du décor */
  background:
    radial-gradient(ellipse 80% 70% at 50% 50%, rgba(255, 200, 215, 0.42) 0%, transparent 65%),
    radial-gradient(ellipse 60% 50% at 60% 60%, rgba(248, 180, 140, 0.14) 0%, transparent 60%);
  border-radius: 50%;
  z-index: 0;
  filter: blur(8px);
}

/* ── Carte produit ── */
.hero__product-card {
  position: relative;
  z-index: 1;
  /* Glassmorphisme teinté crème/rose — la carte respire avec le décor */
  background: linear-gradient(
    155deg,
    rgba(255, 248, 246, 0.76) 0%,
    rgba(253, 240, 241, 0.70) 100%
  );
  backdrop-filter: blur(22px) saturate(1.4);
  -webkit-backdrop-filter: blur(22px) saturate(1.4);
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(255, 210, 218, 0.38);
  box-shadow:
    0 24px 64px rgba(168, 50, 80, 0.13),
    0 6px 20px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  overflow: hidden;
  width: 320px;
  animation: scaleIn 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
}

.hero__product-img-wrap {
  position: relative;
  height: 260px;
  /* Fond image plus translucide pour laisser transparaître l'ambiance */
  background: linear-gradient(145deg, rgba(255, 236, 240, 0.55), rgba(253, 242, 232, 0.70));
  overflow: hidden;
}

.hero__product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  animation: floatY 5s ease-in-out infinite;
}

.hero__product-img-placeholder {
  font-size: 5rem;
  opacity: 0.4;
}

/* Badge best-seller / flash */
.hero__product-badge {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 4px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.hero__product-badge--bs {
  /* Badge givré — s'intègre naturellement dans la carte */
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  color: var(--color-primary);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.hero__product-badge--flash {
  background: var(--rose-500);
  color: #fff;
  box-shadow: 0 2px 12px rgba(232, 51, 109, 0.3);
}

.hero__product-info {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  /* Séparateur image/info en fondu au lieu d'une coupure nette */
  background: linear-gradient(to bottom,
    rgba(253, 242, 242, 0.18) 0%,
    rgba(255, 248, 246, 0.32) 100%
  );
  border-top: 1px solid rgba(232, 170, 180, 0.18);
}

.hero__product-name-link { text-decoration: none; }
.hero__product-name {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--gray-800);
  line-height: 1.3;
  transition: color 0.15s;
}
.hero__product-name-link:hover .hero__product-name { color: var(--color-primary); }

.hero__product-price { display: flex; align-items: center; gap: var(--space-3); }
.hero__price-old { font-size: 0.875rem; color: var(--gray-400); text-decoration: line-through; }
.hero__price-new {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
}
.hero__product-btn { width: 100%; justify-content: center; }

/* ── Carte avis flottante (uniquement si avis réel) ─────────────────────── */
.hero__float-review {
  position: absolute;
  bottom: var(--space-4);
  left: -40px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  max-width: 240px;
  z-index: 2;
  animation: fadeInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both;
  border: 1px solid var(--rose-100);
}

.hero__float-avatar {
  width: 36px; height: 36px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--rose-400), var(--rose-600));
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.hero__float-stars { color: #f0b462; font-size: 0.75rem; letter-spacing: 1px; }
.hero__float-star--off { color: #e2d5c8; }

.hero__float-text {
  font-size: 0.75rem;
  color: var(--gray-700);
  line-height: 1.4;
  margin: 2px 0;
  font-style: italic;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero__float-name { font-size: 0.6875rem; color: var(--gray-400); }

/* ── Scroll indicator ── */
.hero__scroll {
  position: absolute;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}
.hero__scroll-line {
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, var(--rose-400), transparent);
  animation: shimmer 2s ease-in-out infinite;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .hero {
    min-height: 65vh;
    padding: var(--space-8) 0 var(--space-6);
  }
  .hero__inner {
    grid-template-columns: 1fr;
    gap: var(--space-8);
    text-align: center;
  }
  .hero__desc { max-width: 100%; }
  .hero__ctas, .hero__trust, .hero__badges { justify-content: center; }
  /* Carte produit masquée sur mobile → libère de la place pour le contenu */
  .hero__visual { display: none; }
}

@media (max-width: 640px) {
  .hero { min-height: auto; padding: var(--space-10) 0 var(--space-8); }
  .hero__title { font-size: 2rem; }
  .hero__ctas { flex-direction: column; }
  .hero__ctas .btn { justify-content: center; }
  .hero__badges { gap: var(--space-3); }
}
</style>

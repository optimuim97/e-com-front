<template>
  <section class="hero">

    <!-- ── Décor botanique en watermark (SVG, anti-template) ──────────────── -->
    <div class="hero__decor" aria-hidden="true">
      <!-- Branche de roses en haut à gauche -->
      <svg class="hero__decor-branch hero__decor-branch--tl" viewBox="0 0 220 320" fill="none">
        <path d="M30 0c0 60 18 92 48 132 30 40 60 92 60 168" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.45"/>
        <ellipse cx="60" cy="48" rx="14" ry="6" fill="currentColor" opacity="0.18" transform="rotate(-32 60 48)"/>
        <ellipse cx="80" cy="92" rx="18" ry="7" fill="currentColor" opacity="0.14" transform="rotate(-18 80 92)"/>
        <ellipse cx="105" cy="148" rx="20" ry="7" fill="currentColor" opacity="0.13" transform="rotate(8 105 148)"/>
        <ellipse cx="120" cy="200" rx="22" ry="8" fill="currentColor" opacity="0.12" transform="rotate(28 120 200)"/>
        <!-- Bourgeon rose stylisé -->
        <g transform="translate(38 22)" opacity="0.22">
          <path d="M0 8c0-5 4-8 8-8s8 3 8 8c0 2-1 4-3 5 2 1 4 3 4 6s-3 6-7 6-9-2-9-7c0-2 1-3 2-4-2-1-3-3-3-6z" fill="currentColor"/>
        </g>
      </svg>

      <!-- Branche en bas à droite -->
      <svg class="hero__decor-branch hero__decor-branch--br" viewBox="0 0 240 280" fill="none">
        <path d="M210 280c-20-60-40-110-90-170S30 50 30 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.4"/>
        <ellipse cx="170" cy="210" rx="22" ry="8" fill="currentColor" opacity="0.13" transform="rotate(40 170 210)"/>
        <ellipse cx="125" cy="155" rx="22" ry="8" fill="currentColor" opacity="0.13" transform="rotate(60 125 155)"/>
        <ellipse cx="80"  cy="98"  rx="18" ry="7" fill="currentColor" opacity="0.14" transform="rotate(80 80 98)"/>
        <g transform="translate(196 246) rotate(20)" opacity="0.22">
          <path d="M0 8c0-5 4-8 8-8s8 3 8 8c0 2-1 4-3 5 2 1 4 3 4 6s-3 6-7 6-9-2-9-7c0-2 1-3 2-4-2-1-3-3-3-6z" fill="currentColor"/>
        </g>
      </svg>

      <!-- Pétales flottants minimalistes -->
      <svg class="hero__petal hero__petal--1" viewBox="0 0 60 80" fill="none">
        <path d="M30 0c12 18 18 36 18 50s-8 28-18 30c-10-2-18-16-18-30S18 18 30 0z" fill="currentColor" opacity="0.6"/>
      </svg>
      <svg class="hero__petal hero__petal--2" viewBox="0 0 60 80" fill="none">
        <path d="M30 0c12 18 18 36 18 50s-8 28-18 30c-10-2-18-16-18-30S18 18 30 0z" fill="currentColor" opacity="0.45"/>
      </svg>
    </div>

    <div class="container hero__inner">

      <!-- ── Colonne gauche : texte éditorial ──────────────────────────── -->
      <div class="hero__content">
        <span class="hero__eyebrow">
          <span class="hero__eyebrow-line"></span>
          {{ eyebrowText.toUpperCase() }}
        </span>

        <h1 class="hero__title">
          <template v-if="heroTitle">{{ heroTitle }}</template>
          <template v-else>
            Révélez l'<em>éclat naturel</em><br>
            de votre peau
          </template>
        </h1>

        <p class="hero__desc">
          {{ subtitleText }}
        </p>

        <!-- CTA + lien secondaire textuel (style Esthetic) -->
        <div class="hero__ctas">
          <RouterLink to="/products" class="hero__cta-primary">
            <span>{{ $t('hero.cta') }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </RouterLink>
          <RouterLink to="/programme" class="hero__cta-text">
            {{ $t('hero.ctaProgram') }}
          </RouterLink>
        </div>

        <!-- Preuves de confiance — version éditoriale minimale -->
        <div v-if="hasRealReviews || clientsCount > 0" class="hero__proof">
          <div v-if="hasRealReviews" class="hero__proof-block">
            <strong class="hero__proof-value">{{ ratingAvg.toFixed(1).replace('.', ',') }}/5</strong>
            <span class="hero__proof-label">{{ reviewsLabel }}</span>
          </div>
          <span v-if="hasRealReviews && clientsCount > 0" class="hero__proof-sep"></span>
          <div v-if="clientsCount > 0" class="hero__proof-block">
            <strong class="hero__proof-value">{{ clientsCount.toLocaleString('fr-FR') }}+</strong>
            <span class="hero__proof-label">{{ $t('hero.clientsLabel') }}</span>
          </div>
        </div>
      </div>

      <!-- ── Colonne droite : carrousel lifestyle en cercle ────────────── -->
      <div class="hero__visual">
        <!-- Disque crème de fond -->
        <div class="hero__disc" aria-hidden="true"></div>

        <!-- Carrousel de photos lifestyle (fondu) -->
        <div class="hero__photo">
          <TransitionGroup name="hero-fade" tag="div" class="hero__photo-track">
            <img
              v-for="(src, i) in heroPhotos"
              v-show="i === currentPhoto"
              :key="src"
              :src="src"
              :alt="'Rosabeauty — soin visage ' + (i + 1)"
              class="hero__photo-img"
              :loading="i === 0 ? 'eager' : 'lazy'"
              @error="onPhotoError(i)"
            />
          </TransitionGroup>

          <!-- Dots du carrousel -->
          <div v-if="heroPhotos.length > 1" class="hero__photo-dots">
            <button
              v-for="(_, i) in heroPhotos"
              :key="i"
              class="hero__photo-dot"
              :class="{ 'hero__photo-dot--active': i === currentPhoto }"
              @click="goToPhoto(i)"
              :aria-label="`Photo ${i + 1}`"
            ></button>
          </div>
        </div>

        <!-- Badge de réassurance flottant (pas de produit) -->
        <div class="hero__badge">
          <span class="hero__badge-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </span>
          <div class="hero__badge-text">
            <strong>{{ $t('hero.natural') }}</strong>
            <span>{{ $t('hero.madeInCI') }}</span>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'

defineEmits(['add-to-cart'])

// Pool de photos lifestyle locales (fallback si l'admin n'a rien configuré)
const FALLBACK_HERO_PHOTOS = [
  '/image_site/FLS_8032.jpeg',
  '/image_site/DSC_7553.jpeg',
  '/image_site/FLS_8111.jpeg',
]

const props = defineProps({
  heroProduct:    { type: Object, default: null },
  flashProduct:   { type: Object, default: null },
  ratingAvg:      { type: Number, default: 0 },
  reviewsCount:   { type: Number, default: 0 },
  clientsCount:   { type: Number, default: 0 },
  featuredReview: { type: Object, default: null },
  heroEyebrow:    { type: String, default: '' },
  heroTitle:      { type: String, default: '' },
  heroSubtitle:   { type: String, default: '' },
})

const { t } = useI18n()
const settings = useSettingsStore()

const hasRealReviews = computed(() => props.reviewsCount > 0 && props.ratingAvg > 0)

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
  return {
    id: null, name: t('hero.defaultProductName'),
    price: settings.formatPrice(7000), priceOld: null,
    image: null, slug: null, isFlash: false,
  }
})

const eyebrowText  = computed(() => props.heroEyebrow  || t('hero.defaultEyebrow'))
const subtitleText = computed(() => props.heroSubtitle || t('hero.defaultSubtitle'))

// ── Carrousel de photos lifestyle ───────────────────────────────────────────
// Source : settings.heroImages (liste configurée en admin) sinon fallback local.
const heroPhotos = computed(() => {
  const configured = settings.heroImages // array (voir store)
  if (Array.isArray(configured) && configured.length) return configured
  return FALLBACK_HERO_PHOTOS
})

const currentPhoto = ref(0)
let photoTimer = null
const PHOTO_DURATION = 5000

function nextPhoto() {
  currentPhoto.value = (currentPhoto.value + 1) % heroPhotos.value.length
}
function goToPhoto(i) {
  currentPhoto.value = i
  resetPhotoTimer()
}
function resetPhotoTimer() {
  clearInterval(photoTimer)
  if (heroPhotos.value.length > 1) photoTimer = setInterval(nextPhoto, PHOTO_DURATION)
}
function onPhotoError(i) {
  // Si une photo configurée échoue, on la remplace par un fallback local
  const fb = FALLBACK_HERO_PHOTOS[i % FALLBACK_HERO_PHOTOS.length]
  const imgs = heroPhotos.value
  if (imgs[i] !== fb) imgs[i] = fb
}

onMounted(resetPhotoTimer)
onBeforeUnmount(() => clearInterval(photoTimer))

const reviewsLabel = computed(() =>
  props.reviewsCount > 0 ? t('hero.reviews', { count: props.reviewsCount }) : ''
)
</script>

<style scoped>
/* ───────────────────────────────────────────────────────────────────────────
   Hero éditorial — inspiration Esthetic / Beautifo
   Direction : crème, asymétrique, botanique très subtil, typographie serif
─────────────────────────────────────────────────────────────────────────── */
.hero {
  position: relative;
  overflow: hidden;
  padding: clamp(48px, 8vw, 96px) 0 clamp(40px, 6vw, 80px);
  background:
    /* Image de fond très en transparence pour donner de la matière */
    linear-gradient(
      105deg,
      rgba(255, 250, 246, 0.96) 0%,
      rgba(255, 245, 240, 0.85) 45%,
      rgba(253, 226, 218, 0.45) 75%,
      rgba(248, 200, 200, 0.25) 100%
    ),
    url('/image_site/FLS_8130.jpeg') no-repeat right center / cover,
    linear-gradient(180deg, #fffaf6 0%, #fdf3ef 100%);
  isolation: isolate;
}

/* ── Décor botanique (couleur héritée → rose discret) ────────────────────── */
.hero__decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  color: var(--rose-400, #f06292);
}

.hero__decor-branch {
  position: absolute;
  width: clamp(140px, 14vw, 220px);
  height: auto;
}
.hero__decor-branch--tl { top: -10px; left: -10px; }
.hero__decor-branch--br {
  bottom: -20px;
  right: -10px;
  transform: scaleX(-1);
}

.hero__petal {
  position: absolute;
  color: var(--rose-300, #f8a8b8);
  filter: blur(0.3px);
}
.hero__petal--1 {
  width: 36px;
  top: 22%;
  right: 8%;
  transform: rotate(28deg);
  animation: petalDrift 14s ease-in-out infinite;
}
.hero__petal--2 {
  width: 28px;
  bottom: 24%;
  left: 6%;
  transform: rotate(-20deg);
  animation: petalDrift 18s ease-in-out infinite reverse;
}

@keyframes petalDrift {
  0%, 100% { transform: translateY(0) rotate(28deg); }
  50%      { transform: translateY(-14px) rotate(32deg); }
}

/* ── Layout asymétrique ──────────────────────────────────────────────────── */
.hero__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr; /* texte légèrement plus large */
  gap: clamp(32px, 6vw, 96px);
  align-items: center;
  min-height: 78vh;
}

/* ── Contenu gauche ──────────────────────────────────────────────────────── */
.hero__content {
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2vw, 28px);
  max-width: 540px;
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: var(--rose-600, #c0386b);
  text-transform: uppercase;
}
.hero__eyebrow-line {
  display: inline-block;
  width: 28px;
  height: 1px;
  background: currentColor;
  opacity: 0.6;
}

.hero__title {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 5vw, 3.75rem);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.015em;
  color: #2a1f24;
  margin: 0;
}
.hero__title em {
  font-style: italic;
  font-weight: 400;
  color: var(--rose-500, #e8336d);
  /* Soulignement crayonné subtil */
  background: linear-gradient(transparent 78%, rgba(232,51,109,0.16) 78%);
  padding: 0 2px;
}

.hero__desc {
  font-size: 1.0625rem;
  line-height: 1.7;
  color: #6b5e60;
  max-width: 460px;
  margin: 0;
}

/* ── CTAs ────────────────────────────────────────────────────────────────── */
.hero__ctas {
  display: flex;
  align-items: center;
  gap: clamp(16px, 3vw, 32px);
  flex-wrap: wrap;
  margin-top: 8px;
}

.hero__cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 36px;
  background: linear-gradient(135deg, var(--rose-500, #e8336d), var(--rose-600, #c0386b));
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-decoration: none;
  border-radius: 999px;
  box-shadow:
    0 10px 24px -8px rgba(232, 51, 109, 0.45),
    inset 0 1px 0 rgba(255,255,255,0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.hero__cta-primary:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 32px -10px rgba(232, 51, 109, 0.55),
    inset 0 1px 0 rgba(255,255,255,0.3);
  background: linear-gradient(135deg, var(--rose-600, #c0386b), var(--rose-700, #a02858));
}
.hero__cta-primary svg { transition: transform 0.2s ease; }
.hero__cta-primary:hover svg { transform: translateX(4px); }

/* CTA secondaire : bouton outline rose qui s'aligne avec le primaire */
.hero__cta-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 26px;
  border: 1.5px solid var(--rose-300, #f8a8b8);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  color: var(--rose-700, #a02858);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-decoration: none;
  border-radius: 999px;
  transition: all 0.2s ease;
}
.hero__cta-text:hover {
  border-color: var(--rose-500, #e8336d);
  background: #fff;
  color: var(--rose-600, #c0386b);
  transform: translateY(-1px);
}

/* ── Preuves discrètes ──────────────────────────────────────────────────── */
.hero__proof {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 20px;
  margin-top: 4px;
  border-top: 1px solid rgba(168, 50, 80, 0.1);
}
.hero__proof-block { display: flex; flex-direction: column; gap: 2px; }
.hero__proof-value {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  color: #2a1f24;
  line-height: 1;
}
.hero__proof-label {
  font-size: 0.6875rem;
  color: #8e7f82;
  letter-spacing: 0.04em;
}
.hero__proof-sep {
  display: inline-block;
  width: 1px;
  height: 28px;
  background: rgba(168, 50, 80, 0.18);
}

/* ── Visuel droite ───────────────────────────────────────────────────────── */
.hero__visual {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 520px;
  margin-left: auto;
}

/* Disque crème en arrière-plan, légèrement décalé */
.hero__disc {
  position: absolute;
  inset: 4% 8% 12% 0;
  background:
    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 50%),
    linear-gradient(140deg, #fbe8e1 0%, #f5d6cf 100%);
  border-radius: 50%;
  z-index: 0;
}

/* Photo principale ronde, légèrement excentrée */
.hero__photo {
  position: absolute;
  top: 6%;
  right: 0;
  bottom: 14%;
  left: 12%;
  border-radius: 50%;
  overflow: hidden;
  background: var(--cream-100, #fdf2ec);
  box-shadow:
    0 30px 60px -20px rgba(168, 50, 80, 0.22),
    inset 0 0 0 1px rgba(255,255,255,0.4);
  z-index: 1;
}
.hero__photo-track {
  position: absolute;
  inset: 0;
}
.hero__photo-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Transition fondu entre photos */
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 1s ease;
}
.hero-fade-enter-from,
.hero-fade-leave-to { opacity: 0; }

/* Dots du carrousel (en bas du cercle) */
.hero__photo-dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 7px;
  z-index: 2;
}
.hero__photo-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}
.hero__photo-dot--active {
  background: #fff;
  width: 20px;
}

/* Badge réassurance flottant (remplace la carte produit) */
.hero__badge {
  position: absolute;
  left: -6%;
  bottom: 8%;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 16px;
  padding: 14px 18px;
  box-shadow:
    0 16px 32px -10px rgba(168, 50, 80, 0.18),
    0 2px 6px rgba(0,0,0,0.04);
  border: 1px solid rgba(255,255,255,0.8);
}
.hero__badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--rose-50, #fdeef2);
  color: var(--rose-500, #e8336d);
  flex-shrink: 0;
}
.hero__badge-text { display: flex; flex-direction: column; gap: 2px; }
.hero__badge-text strong {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 600;
  color: #2a1f24;
  line-height: 1.2;
}
.hero__badge-text span {
  font-size: 0.6875rem;
  color: #8e7f82;
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .hero__inner {
    grid-template-columns: 1fr;
    text-align: left;
    gap: 48px;
    min-height: auto;
  }
  .hero__content { max-width: 100%; margin: 0 auto; }
  .hero__visual { max-width: 420px; margin: 0 auto; }
  .hero__decor-branch--tl { width: 120px; }
  .hero__decor-branch--br { width: 120px; }
}

@media (max-width: 640px) {
  .hero { padding: 56px 0 48px; }
  .hero__title { font-size: 2rem; }
  .hero__desc { font-size: 0.9375rem; }
  .hero__ctas { flex-direction: column; align-items: flex-start; gap: 16px; }
  .hero__cta-primary { width: 100%; justify-content: center; }
  .hero__visual { max-width: 320px; aspect-ratio: 1; }
  .hero__badge { left: -2%; bottom: 4%; padding: 10px 14px; gap: 8px; }
  .hero__badge-icon { width: 32px; height: 32px; }
  .hero__decor-branch { display: none; }
  .hero__petal { display: none; }
  .hero__proof { gap: 16px; }
}
</style>

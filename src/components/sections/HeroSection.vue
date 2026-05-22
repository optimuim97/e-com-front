<template>
  <section class="hero">
    <!-- Fond décoratif -->
    <div class="hero__bg" aria-hidden="true">
      <div class="hero__bg-blob hero__bg-blob--1"></div>
      <div class="hero__bg-blob hero__bg-blob--2"></div>
      <div class="hero__bg-petal hero__bg-petal--1">🌸</div>
      <div class="hero__bg-petal hero__bg-petal--2">🌺</div>
      <div class="hero__bg-petal hero__bg-petal--3">🌸</div>
    </div>

    <div class="container hero__inner">
      <!-- Colonne gauche : texte -->
      <div class="hero__content">
        <div class="hero__eyebrow animate-fade-up">
          <span class="badge badge-rose">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="5"/></svg>
            Nouveau · Collection Eau de Rose
          </span>
        </div>

        <h1 class="display-xl hero__title animate-fade-up animate-fade-up-delay-1">
          La beauté <br>
          <em class="hero__title-em">naturelle</em><br>
          révélée
        </h1>

        <p class="hero__desc animate-fade-up animate-fade-up-delay-2">
          Des soins formulés à l'eau de rose pure pour illuminer, hydrater
          et sublimer votre peau au quotidien. 100 % naturel, fabriqué avec amour.
        </p>

        <!-- Preuves sociales -->
        <div class="hero__trust animate-fade-up animate-fade-up-delay-3">
          <div class="hero__stars">
            <span v-for="i in 5" :key="i" class="hero__star">★</span>
            <span class="hero__rating">4,9 <span class="hero__reviews">(284 avis)</span></span>
          </div>
          <div class="hero__trust-divider"></div>
          <div class="hero__avatars">
            <img
              v-for="(a, i) in avatars"
              :key="i"
              :src="a"
              alt=""
              class="hero__avatar"
              :style="{ zIndex: avatars.length - i }"
            />
            <span class="hero__avatars-text">+2 000 clientes</span>
          </div>
        </div>

        <!-- CTAs -->
        <div class="hero__ctas animate-fade-up animate-fade-up-delay-4">
          <RouterLink to="/produits" class="btn btn-primary btn-lg">
            Découvrir les soins
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </RouterLink>
          <RouterLink to="/programme" class="btn btn-outline btn-lg">
            Notre programme
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

      <!-- Colonne droite : image produit -->
      <div class="hero__visual animate-fade-up animate-fade-up-delay-2">
        <!-- Carte produit flottante -->
        <div class="hero__product-card">
          <div class="hero__product-img-wrap">
            <img
              :src="heroProduct.image"
              :alt="heroProduct.name"
              class="hero__product-img"
            />
            <!-- Badge "Vente flash" -->
            <div class="hero__flash-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Vente flash
            </div>
          </div>
          <div class="hero__product-info">
            <span class="eyebrow">Bestseller</span>
            <h3 class="hero__product-name">{{ heroProduct.name }}</h3>
            <div class="hero__product-price">
              <span class="hero__price-old">{{ heroProduct.priceOld }}</span>
              <span class="hero__price-new">{{ heroProduct.price }}</span>
            </div>
            <button class="btn btn-primary hero__product-btn" @click="$emit('add-to-cart', heroProduct)">
              Ajouter au panier
            </button>
          </div>
        </div>

        <!-- Carte flottante avis -->
        <div class="hero__float-review">
          <div class="hero__float-avatar">M</div>
          <div>
            <div class="hero__float-stars">★★★★★</div>
            <p class="hero__float-text">"Ma peau est transformée en 2 semaines !"</p>
            <span class="hero__float-name">Mariam K. · Abidjan</span>
          </div>
        </div>

        <!-- Fond décoratif image -->
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
import { RouterLink } from 'vue-router'

defineEmits(['add-to-cart'])

const heroProduct = {
  name: 'Huile de Rose Musquée Pure',
  price: '7 500 FCFA',
  priceOld: '12 000 FCFA',
  image: '/images/huile-rose-musquee.png',
}

const avatars = [
  '/images/avatar-1.jpg',
  '/images/avatar-2.jpg',
  '/images/avatar-3.jpg',
]

const trustBadges = [
  {
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    label: '100% naturel',
  },
  {
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    label: 'Sans paraben',
  },
  {
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    label: 'Livraison 48h',
  },
  {
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    label: 'Retour 14 jours',
  },
]
</script>

<style scoped>
.hero {
  position: relative;
  min-height: calc(100vh - var(--navbar-height));
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: var(--space-16) 0 var(--space-12);
  background: linear-gradient(160deg, var(--cream-50) 0%, var(--rose-50) 60%, var(--cream-100) 100%);
}

/* ── Fond ── */
.hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero__bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.hero__bg-blob--1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--rose-200), transparent 70%);
  top: -100px;
  right: -100px;
  animation: floatY 8s ease-in-out infinite;
}

.hero__bg-blob--2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, var(--gold-200), transparent 70%);
  bottom: -80px;
  left: -60px;
  animation: floatY 10s ease-in-out infinite reverse;
}

.hero__bg-petal {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.15;
  animation: floatY 6s ease-in-out infinite;
}
.hero__bg-petal--1 { top: 15%; left: 8%; animation-delay: 0s; }
.hero__bg-petal--2 { top: 60%; right: 5%; animation-delay: 2s; font-size: 2rem; }
.hero__bg-petal--3 { bottom: 20%; left: 40%; animation-delay: 4s; }

/* ── Layout ── */
.hero__inner {
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

.hero__title {
  color: var(--gray-800);
}

.hero__title-em {
  font-style: italic;
  color: var(--color-primary);
  position: relative;
}

.hero__desc {
  font-size: 1.0625rem;
  color: var(--gray-500);
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
.hero__star { color: #f0b462; font-size: 0.875rem; }
.hero__rating {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-left: 4px;
}
.hero__reviews {
  font-weight: 400;
  color: var(--gray-400);
}

.hero__trust-divider {
  width: 1px;
  height: 24px;
  background: var(--cream-300);
}

.hero__avatars {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.hero__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #fff;
  object-fit: cover;
  margin-left: -8px;
  background: var(--rose-200);
}
.hero__avatar:first-child { margin-left: 0; }

.hero__avatars-text {
  font-size: 0.8125rem;
  color: var(--gray-500);
  margin-left: var(--space-2);
}

/* ── CTAs ── */
.hero__ctas {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

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
.hero__trust-icon {
  color: var(--color-primary);
  display: flex;
}

/* ── Visuel droite ── */
.hero__visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero__visual-bg {
  position: absolute;
  inset: -20px;
  background: radial-gradient(ellipse at center, var(--rose-100) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
}

/* ── Carte produit ── */
.hero__product-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg), 0 0 0 1px var(--rose-100);
  overflow: hidden;
  width: 320px;
  animation: scaleIn 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
}

.hero__product-img-wrap {
  position: relative;
  height: 280px;
  background: linear-gradient(145deg, var(--rose-50), var(--cream-100));
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero__product-img {
  height: 240px;
  width: auto;
  object-fit: contain;
  animation: floatY 5s ease-in-out infinite;
}

.hero__flash-badge {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  background: var(--rose-500);
  color: #fff;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 4px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hero__product-info {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.hero__product-name {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--gray-800);
  line-height: 1.3;
}

.hero__product-price {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.hero__price-old {
  font-size: 0.875rem;
  color: var(--gray-400);
  text-decoration: line-through;
}

.hero__price-new {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
}

.hero__product-btn {
  width: 100%;
  justify-content: center;
}

/* ── Carte avis flottante ── */
.hero__float-review {
  position: absolute;
  bottom: var(--space-4);
  left: -var(--space-10);
  left: -40px;
  background: #fff;
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
  width: 36px;
  height: 36px;
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

.hero__float-stars { color: #f0b462; font-size: 0.75rem; }

.hero__float-text {
  font-size: 0.75rem;
  color: var(--gray-700);
  line-height: 1.4;
  margin: 2px 0;
  font-style: italic;
}

.hero__float-name {
  font-size: 0.6875rem;
  color: var(--gray-400);
}

/* ── Scroll ── */
.hero__scroll {
  position: absolute;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero__scroll-line {
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, var(--rose-400), transparent);
  animation: shimmer 2s ease-in-out infinite;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .hero__inner {
    grid-template-columns: 1fr;
    gap: var(--space-10);
    text-align: center;
  }
  .hero__desc { max-width: 100%; }
  .hero__ctas,
  .hero__trust,
  .hero__badges { justify-content: center; }
  .hero__visual { order: -1; }
  .hero__float-review { left: 0; }
}

@media (max-width: 480px) {
  .hero__product-card { width: 280px; }
  .hero__ctas { flex-direction: column; }
  .hero__ctas .btn { justify-content: center; }
  .hero__float-review { display: none; }
  .hero { padding: var(--space-10) 0 var(--space-8); }
}
</style>

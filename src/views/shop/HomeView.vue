<template>
  <div>
    <!-- Hero -->
    <HeroSection @add-to-cart="addToCart" />

    <!-- Bénéfices -->
    <section class="benefits-section">
      <div class="container benefits-grid">
        <div v-for="b in benefits" :key="b.title" class="benefit-card">
          <div class="benefit-icon" v-html="b.icon"></div>
          <h3 class="benefit-title">{{ b.title }}</h3>
          <p class="benefit-desc">{{ b.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Gammes de soins -->
    <section class="categories-section">
      <div class="container">
        <div class="section-header">
          <span class="eyebrow animate-fade-up">Collections</span>
          <h2 class="display-md section-title animate-fade-up animate-fade-up-delay-1">
            Nos gammes de <em>soins</em>
          </h2>
          <p class="section-desc animate-fade-up animate-fade-up-delay-2">
            Chaque produit, une promesse de douceur et d'éclat
          </p>
        </div>
        <div v-if="loadingCats" class="categories-grid">
          <div v-for="i in 5" :key="i" class="category-skeleton" />
        </div>
        <div v-else class="categories-grid">
          <RouterLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/products?category=${cat.slug}`"
            class="category-card card"
          >
            <div class="category-img-wrap">
              <img v-if="cat.image" :src="cat.image" :alt="cat.name" class="category-img" />
              <span v-else class="category-fallback">🌹</span>
            </div>
            <span class="category-name">{{ cat.name }}</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Best-sellers -->
    <section class="featured-section">
      <div class="container">
        <div class="featured-header">
          <div>
            <span class="eyebrow">Coups de cœur</span>
            <h2 class="display-md featured-title">Nos <em>best-sellers</em></h2>
            <p class="section-desc">Les favoris de nos clientes</p>
          </div>
          <RouterLink to="/products" class="btn btn-outline hide-mobile">
            Voir toute la gamme
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </RouterLink>
        </div>
        <div v-if="loadingProducts" class="products-grid-skeleton">
          <div v-for="i in 4" :key="i" class="product-skeleton" />
        </div>
        <div v-else class="products-grid">
          <ProductCard
            v-for="p in featured"
            :key="p.id"
            :product="normalizeProduct(p)"
            :featured="p.is_featured"
            @add-to-cart="addToCart"
          />
        </div>
        <div class="featured-cta hide-desktop">
          <RouterLink to="/products" class="btn btn-outline">Voir toute la gamme</RouterLink>
        </div>
      </div>
    </section>

    <!-- Pourquoi Rosa Beauty -->
    <section class="about-section">
      <div class="container about-inner">
        <div class="about-content">
          <span class="eyebrow animate-fade-up">Notre histoire</span>
          <h2 class="display-md about-title animate-fade-up animate-fade-up-delay-1">
            La première marque d'eau de rose<br>
            <em>née en Côte d'Ivoire</em>
          </h2>
          <p class="about-desc animate-fade-up animate-fade-up-delay-2">
            Rosa Beauty Facial Care est née d'une conviction simple : la rose est l'un des ingrédients
            les plus puissants pour la beauté naturelle. Nous formulons chaque produit avec des actifs
            d'origine naturelle pour offrir des soins efficaces, doux et respectueux de votre peau.
          </p>
          <ul class="about-promises animate-fade-up animate-fade-up-delay-3">
            <li v-for="p in promises" :key="p" class="promise-item">
              <span class="promise-check">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              {{ p }}
            </li>
          </ul>
        </div>
        <div class="stats-grid">
          <div v-for="s in stats" :key="s.label" class="stat-card card">
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Témoignages -->
    <section class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <span class="eyebrow">Témoignages</span>
          <h2 class="display-md section-title">Ce que disent <em>nos clientes</em></h2>
          <p class="section-desc">Des résultats visibles, des femmes épanouies</p>
        </div>
        <div class="testimonials-grid">
          <div v-for="t in testimonials" :key="t.name" class="testimonial-card card">
            <div class="testimonial-stars">
              <span v-for="i in 5" :key="i" class="star">★</span>
            </div>
            <p class="testimonial-quote">"{{ t.quote }}"</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">{{ t.name[0] }}</div>
              <div>
                <p class="testimonial-name">{{ t.name }}</p>
                <p class="testimonial-location">{{ t.location }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api'
import { useCartStore } from '@/stores/cart'
import HeroSection from '@/components/sections/HeroSection.vue'
import ProductCard from '@/components/ui/ProductCard.vue'

const cartStore = useCartStore()
const categories = ref([])
const featured = ref([])
const loadingCats = ref(true)
const loadingProducts = ref(true)

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
    wishlisted: false,
  }
}

function addToCart(product) {
  cartStore.add(product.id ?? product, 1)
}

onMounted(async () => {
  const [cats, prods] = await Promise.all([
    api.get('/categories'),
    api.get('/products', { params: { featured: true, per_page: 4 } }),
  ])
  categories.value = cats.data.data ?? cats.data
  featured.value = prods.data.data
  loadingCats.value = false
  loadingProducts.value = false
})

const benefits = [
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    title: 'Formules 100 % naturelles',
    desc: 'Actifs d\'origine naturelle, sans parabènes ni perturbateurs endocriniens.',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    title: 'Rose pure ivoirienne',
    desc: 'Eau de rose et extraits floraux issus de roses cultivées localement.',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    title: 'Résultats visibles',
    desc: 'Peaux visiblement plus lumineuses, douces et hydratées dès les premières utilisations.',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    title: 'Livraison rapide & suivie',
    desc: 'Commandes expédiées sous 24h avec suivi en temps réel jusqu\'à votre porte.',
  },
]

const promises = [
  'Ingrédients soigneusement sélectionnés pour leur pureté',
  'Formules testées dermatologiquement',
  'Sans cruauté, respectueux de la nature',
  'Fabriqué en Côte d\'Ivoire avec fierté',
]

const stats = [
  { value: '2 000+', label: 'Clientes satisfaites' },
  { value: '100%',   label: 'Naturel & pur' },
  { value: '5',      label: 'Gammes de soins' },
  { value: '48h',    label: 'Délai de livraison' },
]

const testimonials = [
  {
    name: 'Aminata K.',
    location: 'Abidjan',
    quote: 'L\'élixir de roses a transformé ma peau en deux semaines. Mon teint est plus unifié et ma peau respire vraiment. Je ne peux plus m\'en passer !',
  },
  {
    name: 'Fatoumata D.',
    location: 'Abidjan',
    quote: 'L\'eau de rose pure est incroyable. Je l\'utilise matin et soir et ma peau est tellement plus douce. Un produit que je recommande à toutes mes amies.',
  },
  {
    name: 'Nathalie B.',
    location: 'Bouaké',
    quote: 'Le lait corporel à la rose sent divinement bon et hydrate vraiment. Ma peau est soyeuse toute la journée. La livraison était rapide, super expérience !',
  },
]
</script>

<style scoped>
/* ── Bénéfices ── */
.benefits-section {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--space-16) 0;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
}

.benefit-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
}

.benefit-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--rose-50);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.benefit-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-800);
}

.benefit-desc {
  font-size: 0.8125rem;
  color: var(--gray-400);
  line-height: 1.6;
}

/* ── Sections communes ── */
.section-header {
  text-align: center;
  margin-bottom: var(--space-10);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  align-items: center;
}

.section-title em {
  font-style: italic;
  color: var(--color-primary);
}

.section-desc {
  font-size: 0.9375rem;
  color: var(--gray-400);
}

/* ── Catégories ── */
.categories-section {
  padding: var(--space-16) 0;
  background: var(--color-bg);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-4);
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6);
  text-align: center;
  text-decoration: none;
  transition: all var(--transition-normal);
}

.category-img-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--rose-50);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: background var(--transition-fast);
}

.category-card:hover .category-img-wrap {
  background: var(--rose-100);
}

.category-img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 50%;
}

.category-fallback {
  font-size: 1.5rem;
}

.category-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-700);
  line-height: 1.3;
}

.category-skeleton {
  height: 140px;
  border-radius: var(--radius-lg);
  background: var(--gray-100);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* ── Featured / Best-sellers ── */
.featured-section {
  padding: var(--space-16) 0;
  background: linear-gradient(160deg, var(--rose-50) 0%, var(--cream-100) 100%);
}

.featured-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: var(--space-10);
  gap: var(--space-4);
}

.featured-title em {
  font-style: italic;
  color: var(--color-primary);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-5);
}

.products-grid-skeleton {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-5);
}

.product-skeleton {
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  aspect-ratio: 3/4;
  animation: pulse 1.5s ease-in-out infinite;
}

.featured-cta {
  text-align: center;
  margin-top: var(--space-8);
}

/* ── À propos ── */
.about-section {
  padding: var(--space-20) 0;
  background: var(--color-surface);
}

.about-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
  align-items: center;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.about-title em {
  font-style: italic;
  color: var(--color-primary);
}

.about-desc {
  color: var(--gray-500);
  line-height: 1.75;
}

.about-promises {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.promise-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: 0.875rem;
  color: var(--gray-700);
}

.promise-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--rose-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--rose-600);
  flex-shrink: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.stat-card {
  padding: var(--space-6);
  text-align: center;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--gray-400);
}

/* ── Témoignages ── */
.testimonials-section {
  padding: var(--space-16) 0;
  background: linear-gradient(160deg, var(--rose-50) 0%, var(--cream-100) 100%);
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

.testimonial-card {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.testimonial-stars {
  display: flex;
  gap: 2px;
}

.star {
  color: var(--gold-400);
  font-size: 0.875rem;
}

.testimonial-quote {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-style: italic;
  line-height: 1.7;
  flex: 1;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--cream-200);
}

.testimonial-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--rose-400), var(--rose-600));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.testimonial-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-800);
}

.testimonial-location {
  font-size: 0.75rem;
  color: var(--gray-400);
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .benefits-grid { grid-template-columns: repeat(2, 1fr); }
  .categories-grid { grid-template-columns: repeat(3, 1fr); }
  .products-grid, .products-grid-skeleton { grid-template-columns: repeat(2, 1fr); }
  .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
  .about-inner { grid-template-columns: 1fr; }
  .featured-header { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 640px) {
  .categories-grid { grid-template-columns: repeat(2, 1fr); }
  .testimonials-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

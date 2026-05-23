<template>
  <div>
    <HeroSection        :heroProduct="heroProduct"    @add-to-cart="addToCart" />
    <BenefitsSection    :items="benefits" />
    <CategoriesSection  :categories="categories"  :loading="loadingCats" />
    <BestSellersSection :products="featured"      :loading="loadingProducts" @add-to-cart="addToCart" />
    <AboutSection
      :shopName="settings.shopName"
      :tagline="settings.shopTagline || FALLBACK_TAGLINE"
      :promises="promises"
      :stats="stats"
    />
    <TestimonialsSection :items="testimonials" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
import { useCartStore }     from '@/stores/cart'
import { useSettingsStore } from '@/stores/settings'

import HeroSection         from '@/components/sections/HeroSection.vue'
import BenefitsSection     from '@/components/sections/BenefitsSection.vue'
import CategoriesSection   from '@/components/sections/CategoriesSection.vue'
import BestSellersSection  from '@/components/sections/BestSellersSection.vue'
import AboutSection        from '@/components/sections/AboutSection.vue'
import TestimonialsSection from '@/components/sections/TestimonialsSection.vue'

/* ── Stores ─────────────────────────────────────────────────────────────── */
const cartStore = useCartStore()
const settings  = useSettingsStore()

/* ── État local ─────────────────────────────────────────────────────────── */
const categories      = ref([])
const featured        = ref([])
const heroProduct     = ref(null)
const loadingCats     = ref(true)
const loadingProducts = ref(true)

const FALLBACK_TAGLINE = "Rosa Beauty Facial Care est née d'une conviction simple : la rose est l'un des ingrédients les plus puissants pour la beauté naturelle. Nous formulons chaque produit avec des actifs d'origine naturelle pour offrir des soins efficaces, doux et respectueux de votre peau."

/* ── Chargement ─────────────────────────────────────────────────────────── */
onMounted(async () => {
  const [cats, prods] = await Promise.all([
    api.get('/categories'),
    api.get('/products', { params: { featured: true, per_page: 4 } }),
  ])
  categories.value  = cats.data.data ?? cats.data
  featured.value    = prods.data.data ?? []
  heroProduct.value = featured.value[0] ?? null
  loadingCats.value     = false
  loadingProducts.value = false
})

/* ── Panier ─────────────────────────────────────────────────────────────── */
function addToCart(product) {
  cartStore.add(product.id ?? product, 1)
}

/* ── Données statiques (décoratives) ────────────────────────────────────── */
const benefits = computed(() => [
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    title: 'Formules 100 % naturelles',
    desc:  "Actifs d'origine naturelle, sans parabènes ni perturbateurs endocriniens.",
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    title: 'Rose pure ivoirienne',
    desc:  'Eau de rose et extraits floraux issus de roses cultivées localement.',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    title: 'Résultats visibles',
    desc:  'Peaux visiblement plus lumineuses, douces et hydratées dès les premières utilisations.',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    title: `Livraison ${settings.shippingDelay || 'rapide'} & suivie`,
    desc:  settings.shippingFreeThreshold > 0
      ? `Livraison offerte dès ${settings.shippingFreeThreshold.toLocaleString('fr-FR')} ${settings.shopCurrency}. Commandes expédiées rapidement avec suivi.`
      : "Commandes expédiées sous 24h avec suivi en temps réel jusqu'à votre porte.",
  },
])

const promises = [
  'Ingrédients soigneusement sélectionnés pour leur pureté',
  'Formules testées dermatologiquement',
  'Sans cruauté, respectueux de la nature',
  "Fabriqué en Côte d'Ivoire avec fierté",
]

const stats = computed(() => [
  { value: '2 000+', label: 'Clientes satisfaites' },
  { value: '100%',   label: 'Naturel & pur' },
  { value: '5',      label: 'Gammes de soins' },
  { value: settings.shippingDelay || '48h', label: 'Délai de livraison' },
])

const testimonials = [
  {
    name: 'Aminata K.',
    location: 'Abidjan',
    quote: "L'élixir de roses a transformé ma peau en deux semaines. Mon teint est plus unifié et ma peau respire vraiment. Je ne peux plus m'en passer !",
  },
  {
    name: 'Fatoumata D.',
    location: 'Abidjan',
    quote: "L'eau de rose pure est incroyable. Je l'utilise matin et soir et ma peau est tellement plus douce. Un produit que je recommande à toutes mes amies.",
  },
  {
    name: 'Nathalie B.',
    location: 'Bouaké',
    quote: 'Le lait corporel à la rose sent divinement bon et hydrate vraiment. Ma peau est soyeuse toute la journée. La livraison était rapide, super expérience !',
  },
]
</script>

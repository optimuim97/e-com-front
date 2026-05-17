<template>
  <div>
    <!-- â”€â”€ Hero â”€â”€ -->
    <section class="relative bg-gradient-to-br from-primary-50 via-white to-rose-50 overflow-hidden">
      <div class="absolute inset-0 pointer-events-none opacity-30"
        style="background-image: radial-gradient(circle at 20% 50%, #f6a9cb 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fad0e3 0%, transparent 40%);">
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 flex flex-col lg:flex-row items-center gap-12">
        <!-- Text -->
        <div class="flex-1 text-center lg:text-left">
          <span class="badge-primary text-sm mb-5 inline-block">ðŸŒ¹ PremiÃ¨re eau de rose ivoirienne</span>
          <h1 class="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            La rose,<br />
            <span class="text-primary-500">au cÅ“ur de<br />votre beautÃ©</span>
          </h1>
          <p class="text-lg text-gray-500 mb-10 max-w-lg mx-auto lg:mx-0">
            Des soins du visage 100&nbsp;% naturels, formulÃ©s Ã  base de rose pure pour sublimer et nourrir votre peau au quotidien.
          </p>
          <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <RouterLink to="/products" class="btn-primary text-base px-8 py-3">
              DÃ©couvrir nos soins
            </RouterLink>
            <RouterLink to="/products?featured=true" class="btn-outline text-base px-8 py-3">
              Nos best-sellers
            </RouterLink>
          </div>
        </div>
        <!-- Visual -->
        <div class="flex-1 flex justify-center lg:justify-end">
          <div class="relative w-72 h-72 lg:w-96 lg:h-96">
            <div class="absolute inset-0 rounded-full bg-primary-100 opacity-60"></div>
            <div class="absolute inset-6 rounded-full bg-primary-50 flex items-center justify-center">
              <span class="text-8xl lg:text-9xl select-none">ðŸŒ¹</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- â”€â”€ BÃ©nÃ©fices â”€â”€ -->
    <section class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="b in benefits" :key="b.title" class="flex flex-col items-center text-center gap-3">
          <div class="size-14 rounded-2xl bg-primary-50 flex items-center justify-center text-2xl">
            {{ b.icon }}
          </div>
          <h3 class="font-semibold text-gray-800 text-sm">{{ b.title }}</h3>
          <p class="text-xs text-gray-500 leading-relaxed">{{ b.desc }}</p>
        </div>
      </div>
    </section>

    <!-- â”€â”€ Gammes de soins â”€â”€ -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Nos gammes de soins</h2>
        <p class="text-gray-400 text-sm">Chaque produit, une promesse de douceur et d'Ã©clat</p>
      </div>
      <div v-if="loadingCats" class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div v-for="i in 5" :key="i" class="h-28 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <RouterLink v-for="cat in categories" :key="cat.id"
          :to="`/products?category=${cat.slug}`"
          class="card-hover flex flex-col items-center justify-center gap-3 p-6 text-center group">
          <div class="size-14 rounded-full bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
            <img v-if="cat.image" :src="cat.image" :alt="cat.name" class="size-8 object-cover rounded-full" />
            <span v-else class="text-primary-400 text-2xl">ðŸŒ¹</span>
          </div>
          <span class="text-xs font-semibold text-gray-700 leading-tight">{{ cat.name }}</span>
        </RouterLink>
      </div>
    </section>

    <!-- â”€â”€ Best-sellers â”€â”€ -->
    <section class="bg-primary-50/40 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-end justify-between mb-10">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-1">Nos best-sellers</h2>
            <p class="text-gray-400 text-sm">Les favoris de nos clientes</p>
          </div>
          <RouterLink to="/products" class="text-primary-500 text-sm font-medium hover:underline hidden sm:block">
            Voir toute la gamme â†’
          </RouterLink>
        </div>
        <div v-if="loadingProducts" class="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div v-for="i in 4" :key="i" class="rounded-2xl bg-white animate-pulse aspect-[3/4]" />
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <ProductCard v-for="p in featured" :key="p.id" :product="p" />
        </div>
        <div class="text-center mt-8 sm:hidden">
          <RouterLink to="/products" class="btn-outline">Voir toute la gamme</RouterLink>
        </div>
      </div>
    </section>

    <!-- â”€â”€ Pourquoi Rosa Beauty â”€â”€ -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span class="badge-primary mb-4 inline-block">Notre histoire</span>
          <h2 class="text-3xl font-bold text-gray-900 mb-5 leading-snug">
            La premiÃ¨re marque d'eau de rose<br />
            <span class="text-primary-500">nÃ©e en CÃ´te d'Ivoire</span>
          </h2>
          <p class="text-gray-500 leading-relaxed mb-6">
            Rosa Beauty Facial Care est nÃ©e d'une conviction simple : la rose est l'un des ingrÃ©dients les plus puissants pour la beautÃ© naturelle. Nous formulons chaque produit avec des actifs d'origine naturelle pour offrir des soins efficaces, doux et respectueux de votre peau.
          </p>
          <ul class="space-y-3">
            <li v-for="p in promises" :key="p" class="flex items-center gap-3 text-sm text-gray-700">
              <span class="size-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0 text-xs">âœ“</span>
              {{ p }}
            </li>
          </ul>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="s in stats" :key="s.label"
            class="card p-6 text-center">
            <div class="text-3xl font-bold text-primary-500 mb-1">{{ s.value }}</div>
            <div class="text-xs text-gray-500">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- â”€â”€ TÃ©moignages â”€â”€ -->
    <section class="bg-gradient-to-br from-primary-50 to-rose-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Ce que disent nos clientes</h2>
          <p class="text-gray-400 text-sm">Des rÃ©sultats visibles, des femmes Ã©panouies</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div v-for="t in testimonials" :key="t.name" class="card p-6 flex flex-col gap-4">
            <div class="flex gap-1">
              <span v-for="i in 5" :key="i" class="text-amber-400 text-sm">â˜…</span>
            </div>
            <p class="text-sm text-gray-600 italic leading-relaxed flex-1">"{{ t.quote }}"</p>
            <div class="flex items-center gap-3 pt-2 border-t border-gray-100">
              <div class="size-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                {{ t.name[0] }}
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ t.name }}</p>
                <p class="text-xs text-gray-400">{{ t.location }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- â”€â”€ Newsletter â”€â”€ -->
    <section class="bg-primary-500 py-14">
      <div class="max-w-xl mx-auto px-4 text-center">
        <span class="text-primary-200 text-sm font-medium uppercase tracking-widest">Newsletter</span>
        <h2 class="text-2xl font-bold text-white mt-2 mb-3">
          Recevez nos conseils beautÃ© & offres exclusives
        </h2>
        <p class="text-primary-100 text-sm mb-7">
          Rejoignez plus de 2 000 femmes qui prennent soin d'elles avec Rosa Beauty.
        </p>
        <form @submit.prevent="subscribeNewsletter" class="flex gap-2 max-w-md mx-auto">
          <input v-model="email" type="email" placeholder="Votre adresse email"
            class="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none border-2 border-transparent focus:border-white/50 bg-white/20 text-white placeholder:text-primary-200" />
          <button type="submit" class="rounded-xl bg-white text-primary-600 font-semibold text-sm px-5 py-2.5 hover:bg-primary-50 transition-colors">
            S'inscrire
          </button>
        </form>
        <p v-if="subscribed" class="text-white text-sm mt-3">âœ“ Merci ! Vous Ãªtes inscrite.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import api from '@/api';
import ProductCard from '@/components/shop/ProductCard.vue';

const categories      = ref([]);
const featured        = ref([]);
const loadingCats     = ref(true);
const loadingProducts = ref(true);
const email           = ref('');
const subscribed      = ref(false);

const benefits = [
  { icon: 'ðŸŒ¿', title: 'Formules 100 % naturelles',   desc: 'Actifs d\'origine naturelle, sans parabÃ¨nes ni perturbateurs endocriniens.' },
  { icon: 'ðŸŒ¹', title: 'Rose pure ivoirienne',         desc: 'Eau de rose et extraits floraux issus de roses cultivÃ©es localement.' },
  { icon: 'âœ¨', title: 'RÃ©sultats visibles',            desc: 'Peaux visiblement plus lumineuses, douces et hydratÃ©es dÃ¨s les premiÃ¨res utilisations.' },
  { icon: 'ðŸšš', title: 'Livraison rapide & suivie',    desc: 'Commandes expÃ©diÃ©es sous 24h avec suivi en temps rÃ©el jusqu\'Ã  votre porte.' },
];

const promises = [
  'IngrÃ©dients soigneusement sÃ©lectionnÃ©s pour leur puretÃ©',
  'Formules testÃ©es dermatologiquement',
  'Sans cruautÃ©, respectueux de la nature',
  'FabriquÃ© en CÃ´te d\'Ivoire avec fiertÃ©',
];

const stats = [
  { value: '2 000+', label: 'Clientes satisfaites' },
  { value: '100%',   label: 'Naturel & pur' },
  { value: '5',      label: 'Gammes de soins' },
  { value: '0585',   label: 'Contactez-nous\n05 85 82 55 55' },
];

const testimonials = [
  {
    name: 'Aminata K.',
    location: 'Abidjan',
    quote: 'L\'Ã©lixir de roses a transformÃ© ma peau en deux semaines. Mon teint est plus unifiÃ© et ma peau respire vraiment. Je ne peux plus m\'en passer !',
  },
  {
    name: 'Fatoumata D.',
    location: 'Abidjan',
    quote: 'L\'eau de rose pure est incroyable. Je l\'utilise matin et soir et ma peau est tellement plus douce. Un produit que je recommande Ã  toutes mes amies.',
  },
  {
    name: 'Nathalie B.',
    location: 'BouakÃ©',
    quote: 'Le lait corporel Ã  la rose sent divinement bon et hydrate vraiment. Ma peau est soyeuse toute la journÃ©e. La livraison Ã©tait rapide, super expÃ©rience !',
  },
];

onMounted(async () => {
  const [cats, prods] = await Promise.all([
    api.get('/categories'),
    api.get('/products', { params: { featured: true, per_page: 4 } }),
  ]);
  categories.value     = cats.data.data ?? cats.data;
  featured.value       = prods.data.data;
  loadingCats.value    = false;
  loadingProducts.value = false;
});

function subscribeNewsletter() {
  if (email.value) {
    subscribed.value = true;
    email.value = '';
  }
}
</script>


<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 shrink-0">
          <span class="text-2xl">🌹</span>
          <div class="leading-tight">
            <span class="block font-bold text-base text-primary-600 tracking-wide">Rosa Beauty</span>
            <span class="block text-[10px] text-gray-400 uppercase tracking-widest -mt-0.5">Facial Care</span>
          </div>
        </RouterLink>

        <!-- Search -->
        <div class="flex-1 max-w-md hidden md:block">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input v-model="search" @keydown.enter="doSearch"
              placeholder="Rechercher un produit…"
              class="input !pl-9 !py-2" />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button @click="cartStore.open()" class="btn-ghost relative !px-2">
            <ShoppingCartIcon class="size-6" />
            <span v-if="cartStore.itemCount > 0"
              class="absolute -top-1 -right-1 size-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">
              {{ cartStore.itemCount }}
            </span>
          </button>

          <template v-if="auth.isLoggedIn">
            <RouterLink v-if="auth.isAdmin" to="/admin" class="btn-outline !py-2 !px-3 text-xs">
              Admin
            </RouterLink>
            <button @click="auth.logout()" class="btn-ghost !px-2 text-gray-500">
              <ArrowLeftOnRectangleIcon class="size-5" />
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="btn-outline !py-2">Connexion</RouterLink>
          </template>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>

    <CartDrawer />

    <!-- Footer -->
    <footer class="bg-gray-50 border-t border-gray-100 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <!-- Brand -->
        <div class="sm:col-span-2 lg:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-2xl">🌹</span>
            <div class="leading-tight">
              <span class="block font-bold text-sm text-primary-600 tracking-wide">Rosa Beauty</span>
              <span class="block text-[10px] text-gray-400 uppercase tracking-widest">Facial Care</span>
            </div>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed mb-4">
            Première marque d'eau de rose ivoirienne.<br />
            Des soins 100&nbsp;% naturels pour sublimer votre beauté.
          </p>
          <p class="text-xs text-gray-500">📞 <a href="tel:0585825555" class="hover:text-primary-500">05 85 82 55 55</a></p>
        </div>

        <!-- Navigation -->
        <div>
          <h4 class="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-4">Navigation</h4>
          <ul class="space-y-2.5">
            <li v-for="l in footerNav" :key="l.to">
              <RouterLink :to="l.to" class="text-xs text-gray-500 hover:text-primary-500 transition-colors">
                {{ l.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Informations -->
        <div>
          <h4 class="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-4">Informations</h4>
          <ul class="space-y-2.5 text-xs text-gray-500">
            <li>Livraison sous 24–48h</li>
            <li>Retours sous 7 jours</li>
            <li>Paiement sécurisé</li>
            <li>Wave & Orange Money</li>
          </ul>
        </div>

        <!-- Réseaux -->
        <div>
          <h4 class="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-4">Suivez-nous</h4>
          <div class="flex gap-3">
            <a href="https://www.facebook.com/p/Rosa-Beauty-Facial-Care-100083989341314/"
              target="_blank" rel="noopener"
              class="size-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-sm hover:border-primary-300 hover:text-primary-500 transition-colors">
              f
            </a>
            <a href="#" class="size-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-sm hover:border-primary-300 hover:text-primary-500 transition-colors">
              ig
            </a>
            <a href="#" class="size-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-sm hover:border-primary-300 hover:text-primary-500 transition-colors">
              tk
            </a>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-100 py-4">
        <p class="text-center text-xs text-gray-400">
          © {{ new Date().getFullYear() }} Rosa Beauty Facial Care · Tous droits réservés
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router';
import { MagnifyingGlassIcon, ShoppingCartIcon, ArrowLeftOnRectangleIcon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import CartDrawer from '@/components/shop/CartDrawer.vue';

const auth      = useAuthStore();
const cartStore = useCartStore();
const router    = useRouter();
const route     = useRoute();
const search    = ref('');

const footerNav = [
  { to: '/',         label: 'Accueil' },
  { to: '/products', label: 'Tous les produits' },
  { to: '/orders',   label: 'Mes commandes' },
  { to: '/login',    label: 'Mon compte' },
];

cartStore.fetch().catch(() => {});

function doSearch() {
  if (search.value.trim()) {
    router.push({ name: 'products', query: { search: search.value.trim() } });
  }
}
</script>

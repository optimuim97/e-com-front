<template>
  <div class="min-h-screen flex flex-col" style="background: var(--color-bg);">
    <AppNavbar
      :cart-count="cartStore.itemCount"
      :wishlist-count="wishlistStore.count"
      @open-search="handleSearch"
    />

    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <!--
            keep-alive pour les pages "liste" : la data et le DOM sont préservés
            entre navigations. Les pages détail (ProductView, OrderView…) ne sont
            PAS dans include, donc elles se recréent normalement avec la bonne clé.
          -->
          <keep-alive :include="CACHED_VIEWS" :max="6">
            <component
              :is="Component"
              :key="route.meta.stableKey ?? route.path"
            />
          </keep-alive>
        </Transition>
      </RouterView>
    </main>

    <CartDrawer />
    <AppFooter />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'

// Pages dont le DOM + état est préservé entre navigations
// Le nom doit correspondre à l'option `name` du composant Vue (ou au nom du fichier)
const CACHED_VIEWS = ['HomeView', 'ProductsView', 'BlogView', 'WishlistView']
import { useCartStore }     from '@/features/cart/cart.store'
import { useWishlistStore } from '@/features/wishlist/wishlist.store'
import { useAuthStore }     from '@/features/auth/auth.store'
import AppNavbar  from '@/components/layout/AppNavbar.vue'
import AppFooter  from '@/components/layout/AppFooter.vue'
import CartDrawer from '@/features/cart/CartDrawer.vue'

const cartStore     = useCartStore()
const wishlistStore = useWishlistStore()
const authStore     = useAuthStore()
const router = useRouter()
const route  = useRoute()

// Chargement initial
cartStore.fetch().catch(() => {})

// Charger la wishlist dès que l'user est authentifié
watch(
  () => authStore.user,
  (user) => {
    if (user) {
      wishlistStore.fetch()
    } else {
      wishlistStore.clear()
    }
  },
  { immediate: true }
)

function handleSearch() {
  router.push({ name: 'products' })
}
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>

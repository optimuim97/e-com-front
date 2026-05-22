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
          <component :is="Component" :key="route.path" />
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
import { useCartStore }     from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore }     from '@/stores/auth'
import AppNavbar  from '@/components/layout/AppNavbar.vue'
import AppFooter  from '@/components/layout/AppFooter.vue'
import CartDrawer from '@/components/shop/CartDrawer.vue'

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

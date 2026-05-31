<template>
  <Transition name="bottom-nav-slide">
  <nav v-show="!cartStore.isOpen" class="bottom-nav" aria-label="Navigation principale">
    <RouterLink to="/" class="bottom-nav__item" :class="{ 'bottom-nav__item--active': route.path === '/' }">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span>Accueil</span>
    </RouterLink>

    <RouterLink to="/products" class="bottom-nav__item" :class="{ 'bottom-nav__item--active': route.path.startsWith('/products') }">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <span>Produits</span>
    </RouterLink>

    <button class="bottom-nav__item bottom-nav__item--cart" @click="cartStore.open()">
      <div class="bottom-nav__cart-wrap">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span v-if="cartStore.itemCount > 0" class="bottom-nav__badge">{{ cartStore.itemCount }}</span>
      </div>
      <span>Panier</span>
    </button>

    <RouterLink
      :to="authStore.user ? '/account' : '/login'"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': route.path.startsWith('/account') }"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span>{{ authStore.user ? 'Compte' : 'Connexion' }}</span>
    </RouterLink>
  </nav>
  </Transition>
</template>

<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { useCartStore } from '@/features/cart/cart.store'
import { useAuthStore } from '@/features/auth/auth.store'

const route     = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()
</script>

<style scoped>
.bottom-nav {
  display: none; /* visible uniquement sur mobile via media query */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(255, 252, 250, 0.97);
  backdrop-filter: blur(16px);
  border-top: 1px solid var(--cream-200);
  padding: var(--space-2) var(--space-4) env(safe-area-inset-bottom, 8px);
  grid-template-columns: repeat(4, 1fr);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06);
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-1) var(--space-2);
  color: var(--gray-400);
  text-decoration: none;
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: none;
  background: none;
  cursor: pointer;
  transition: color var(--transition-fast);
}
.bottom-nav__item svg { transition: transform var(--transition-fast); }
.bottom-nav__item:hover { color: var(--rose-400); }
.bottom-nav__item:hover svg { transform: translateY(-1px); }

.bottom-nav__item--active {
  color: var(--rose-500);
}
.bottom-nav__item--active svg {
  stroke: var(--rose-500);
}

/* Bouton panier — légèrement mis en avant */
.bottom-nav__item--cart {
  position: relative;
}
.bottom-nav__cart-wrap {
  position: relative;
  display: flex;
}
.bottom-nav__badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  background: var(--rose-500);
  color: #fff;
  border-radius: 9999px;
  font-size: 0.5625rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  border: 1.5px solid #fff;
}

@media (max-width: 768px) {
  .bottom-nav { display: grid; }
}

.bottom-nav-slide-enter-active,
.bottom-nav-slide-leave-active { transition: transform 0.25s ease; }
.bottom-nav-slide-enter-from,
.bottom-nav-slide-leave-to { transform: translateY(100%); }
</style>

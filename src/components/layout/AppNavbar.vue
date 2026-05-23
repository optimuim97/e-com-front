<template>
  <header class="navbar" :class="{ 'navbar--scrolled': isScrolled, 'navbar--open': mobileMenuOpen }">
    <!-- Bande d'annonce -->
    <div class="navbar__announce" v-if="!announceDismissed">
      <div class="navbar__announce-inner container">
        <span>{{ settings.announceText }}</span>
        <button class="navbar__announce-close" @click="announceDismissed = true" aria-label="Fermer">
          ×
        </button>
      </div>
    </div>

    <!-- Navbar principale -->
    <nav class="navbar__main container">
      <!-- Logo -->
      <RouterLink to="/" class="navbar__logo" aria-label="Rosa Beauty - Accueil">
        <div class="navbar__logo-icon">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
            <circle cx="20" cy="20" r="19" fill="#fff0f5" stroke="#e8336d" stroke-width="1.5"/>
            <path d="M20 10 C20 10 14 14 14 20 C14 26 20 30 20 30 C20 30 26 26 26 20 C26 14 20 10 20 10Z"
                  fill="#e8336d" opacity="0.9"/>
            <path d="M14 17 C14 17 9 18 9 22 C9 26 14 27 14 27" stroke="#f9518a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <path d="M26 17 C26 17 31 18 31 22 C31 26 26 27 26 27" stroke="#f9518a" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <circle cx="20" cy="20" r="3" fill="#fff" opacity="0.9"/>
          </svg>
        </div>
        <div class="navbar__logo-text">
          <span class="navbar__logo-name">Rosa Beauty</span>
          <span class="navbar__logo-sub">Facial Care</span>
        </div>
      </RouterLink>

      <!-- Navigation desktop -->
      <ul class="navbar__nav" role="list">
        <li v-for="link in navLinks" :key="link.to">
          <RouterLink
            :to="link.to"
            class="navbar__link"
            :class="{ 'navbar__link--active': $route.path === link.to }"
          >
            {{ link.label }}
            <span v-if="link.badge" class="navbar__link-badge">{{ link.badge }}</span>
          </RouterLink>
        </li>
      </ul>

      <!-- Actions droite -->
      <div class="navbar__actions">
        <!-- Recherche -->
        <button class="navbar__icon-btn" @click="$emit('open-search')" aria-label="Rechercher">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        <!-- Compte / Déconnexion -->
        <RouterLink v-if="!auth.isLoggedIn" to="/login" class="navbar__icon-btn" aria-label="Se connecter">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </RouterLink>
        <template v-else>
          <RouterLink v-if="auth.isAdmin" to="/admin" class="navbar__icon-btn" aria-label="Administration">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </RouterLink>

          <!-- Favoris -->
          <RouterLink to="/wishlist" class="navbar__icon-btn navbar__icon-btn--relative" aria-label="Mes favoris">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span v-if="wishlistCount > 0" class="navbar__badge navbar__badge--wish">{{ wishlistCount }}</span>
          </RouterLink>

          <!-- Commandes / Profil -->
          <RouterLink to="/orders" class="navbar__icon-btn" aria-label="Mes commandes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </RouterLink>
          <button class="navbar__icon-btn" @click="auth.logout()" aria-label="Se déconnecter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </template>

        <!-- Panier -->
        <RouterLink to="/cart" class="navbar__cart-btn" aria-label="Mon panier">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span v-if="cartCount > 0" class="navbar__badge navbar__badge--cart">{{ cartCount }}</span>
        </RouterLink>

        <!-- Burger mobile -->
        <button
          class="navbar__burger"
          @click="mobileMenuOpen = !mobileMenuOpen"
          :aria-expanded="mobileMenuOpen"
          aria-label="Menu"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>

    <!-- Menu mobile -->
    <Transition name="slide-down">
      <div v-if="mobileMenuOpen" class="navbar__mobile">
        <ul role="list">
          <li v-for="link in navLinks" :key="link.to">
            <RouterLink
              :to="link.to"
              class="navbar__mobile-link"
              @click="mobileMenuOpen = false"
            >
              {{ link.label }}
              <span v-if="link.badge" class="badge badge-rose">{{ link.badge }}</span>
            </RouterLink>
          </li>
        </ul>
        <div class="navbar__mobile-cta">
          <RouterLink to="/products" class="btn btn-primary" @click="mobileMenuOpen = false">
            Voir tous les produits
          </RouterLink>
        </div>
      </div>
    </Transition>
  </header>

  <!-- Spacer pour compenser la navbar fixed -->
  <div :style="{ height: spacerHeight + 'px' }"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore }     from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  cartCount:     { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 },
})

defineEmits(['open-search'])

const route    = useRoute()
const auth     = useAuthStore()
const settings = useSettingsStore()
const isScrolled = ref(false)
const mobileMenuOpen = ref(false)
const announceDismissed = ref(false)

const navLinks = computed(() => [
  { to: '/',          label: 'Accueil' },
  { to: '/products',  label: 'Produits' },
  { to: '/blog',      label: 'Blog' },
  ...(auth.isLoggedIn ? [{ to: '/wishlist', label: 'Favoris', badge: props.wishlistCount > 0 ? props.wishlistCount : null }] : []),
  ...(auth.isLoggedIn ? [{ to: '/orders',   label: 'Mes commandes' }] : []),
])

const spacerHeight = computed(() => {
  const base = 72
  const announce = announceDismissed.value ? 0 : 40
  return base + announce
})

function handleScroll() {
  isScrolled.value = window.scrollY > 16
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* ── Bande annonce ── */
.navbar__announce {
  background: var(--rose-500);
  color: #fff;
  padding: 8px 0;
  font-size: 0.75rem;
  letter-spacing: 0.03em;
  font-weight: 500;
  position: relative;
  z-index: calc(var(--z-sticky) + 1);
}
.navbar__announce-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}
.navbar__announce-close {
  margin-left: auto;
  color: rgba(255,255,255,0.7);
  font-size: 1.25rem;
  line-height: 1;
  transition: color var(--transition-fast);
}
.navbar__announce-close:hover { color: #fff; }

/* ── Navbar principale ── */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  background: rgba(253, 250, 247, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid transparent;
  transition: all var(--transition-normal);
}

.navbar--scrolled {
  background: rgba(253, 250, 247, 0.98);
  border-bottom-color: var(--cream-300);
  box-shadow: 0 2px 20px rgba(168, 50, 80, 0.07);
}

.navbar__main {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  height: 72px;
}

/* ── Logo ── */
.navbar__logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
  transition: opacity var(--transition-fast);
}
.navbar__logo:hover { opacity: 0.85; }

.navbar__logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.navbar__logo-name {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--gray-800);
  letter-spacing: -0.01em;
}
.navbar__logo-sub {
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-primary);
}

/* ── Nav links ── */
.navbar__nav {
  display: flex;
  align-items: center;
  gap: 0;
  list-style: none;
  margin-left: auto;
}

.navbar__link {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--gray-600);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  position: relative;
}

.navbar__link:hover {
  color: var(--color-primary);
  background: var(--rose-50);
}

.navbar__link--active {
  color: var(--color-primary);
  font-weight: 500;
}

.navbar__link--active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.navbar__link-badge {
  background: var(--rose-500);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Actions ── */
.navbar__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-left: var(--space-2);
}

.navbar__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  color: var(--gray-600);
  transition: all var(--transition-fast);
  position: relative;
}
.navbar__icon-btn:hover {
  background: var(--rose-50);
  color: var(--color-primary);
}

.navbar__cart-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--rose-500);
  color: #fff;
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
  position: relative;
  box-shadow: var(--shadow-rose);
}
.navbar__cart-btn:hover {
  background: var(--rose-600);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(232, 51, 109, 0.35);
}

.navbar__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  background: var(--gray-800);
  color: #fff;
  font-size: 0.625rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 1.5px solid var(--cream-50);
}

.navbar__badge--cart {
  background: #fff;
  color: var(--rose-600);
  top: 2px;
  right: 2px;
}

.navbar__badge--wish {
  top: 2px;
  right: 2px;
  background: var(--rose-500);
  color: #fff;
}

.navbar__icon-btn--relative {
  position: relative;
}

/* ── Burger ── */
.navbar__burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}
.navbar__burger span {
  display: block;
  width: 22px;
  height: 1.5px;
  background: var(--gray-700);
  border-radius: 1px;
  transition: all var(--transition-normal);
}
.navbar--open .navbar__burger span:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}
.navbar--open .navbar__burger span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.navbar--open .navbar__burger span:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}

/* ── Mobile menu ── */
.navbar__mobile {
  background: var(--color-surface);
  border-top: 1px solid var(--cream-200);
  padding: var(--space-4) 0 var(--space-6);
  box-shadow: 0 16px 40px rgba(0,0,0,0.08);
}

.navbar__mobile ul {
  list-style: none;
  padding: 0 var(--space-4);
}

.navbar__mobile-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-2);
  font-size: 1.0625rem;
  font-weight: 400;
  color: var(--gray-700);
  border-bottom: 1px solid var(--cream-200);
  transition: color var(--transition-fast);
}
.navbar__mobile-link:hover { color: var(--color-primary); }

.navbar__mobile-cta {
  padding: var(--space-6) var(--space-6) 0;
  display: flex;
  gap: var(--space-3);
}
.navbar__mobile-cta .btn { flex: 1; justify-content: center; }

/* ── Transitions ── */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--transition-normal);
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .navbar__nav { display: none; }
  .navbar__burger { display: flex; }
}

@media (max-width: 480px) {
  .navbar__logo-sub { display: none; }
}
</style>

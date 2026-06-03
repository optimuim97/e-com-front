<template>
  <div class="admin-shell">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <!-- Logo -->
      <RouterLink to="/" class="admin-sidebar__logo" aria-label="Rosa Beauty — Accueil">
        <img
          src="/logos/rosa-logo-readable-400.png"
          alt="Rosa Beauty"
          class="admin-sidebar__logo-img"
        />
        <div class="admin-sidebar__logo-text">
          <span class="admin-sidebar__logo-sub">Administration</span>
        </div>
      </RouterLink>

      <!-- Nav -->
      <nav class="admin-sidebar__nav">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="admin-nav-link"
          :class="{ 'admin-nav-link--active': isActive(item.to) }"
        >
          <component :is="item.icon" class="admin-nav-link__icon" />
          <span>{{ item.label }}</span>
          <span
            v-if="badgeFor(item.to)"
            class="admin-nav-link__badge"
            :title="`${badgeFor(item.to)} en attente`"
          >{{ badgeFor(item.to) }}</span>
        </RouterLink>
      </nav>

      <!-- User -->
      <div class="admin-sidebar__user">
        <div class="admin-sidebar__avatar">
          {{ auth.user?.name?.[0]?.toUpperCase() }}
        </div>
        <div class="admin-sidebar__user-info">
          <p>{{ auth.user?.name }}</p>
          <span>{{ auth.user?.email }}</span>
        </div>
        <button @click="handleLogout" class="admin-sidebar__logout" aria-label="Se déconnecter">
          <ArrowLeftOnRectangleIcon class="w-4 h-4" />
        </button>
      </div>
    </aside>

    <!-- Content -->
    <div class="admin-main">
      <!-- Topbar -->
      <header class="admin-topbar">
        <div>
          <span class="eyebrow">Espace admin</span>
          <h1 class="admin-topbar__title">{{ currentTitle }}</h1>
        </div>
        <div class="admin-topbar__right">
          <NotificationBell />
          <RouterLink to="/" class="admin-topbar__shop-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" transform="rotate(180 12 12)"/>
            </svg>
            Voir la boutique
          </RouterLink>
        </div>
      </header>

      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import {
  Squares2X2Icon, ShoppingBagIcon, TagIcon, TicketIcon,
  UsersIcon, ArrowLeftOnRectangleIcon, FolderIcon, Cog6ToothIcon,
  NewspaperIcon, SparklesIcon, StarIcon, ChatBubbleLeftRightIcon,
  EnvelopeIcon, TruckIcon,
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/features/auth/auth.store';
import { useAdminNotificationsStore } from '@/admin/stores/adminNotifications.store';
import { useOrderStatsStore } from '@/admin/stores/orderStats.store';
import NotificationBell from '@/admin/components/NotificationBell.vue';

const auth    = useAuthStore();
const route   = useRoute();
const router  = useRouter();
const notifStore = useAdminNotificationsStore();
const orderStats = useOrderStatsStore();

onMounted(() => {
  notifStore.subscribe();
  orderStats.start();
});
onBeforeUnmount(() => {
  notifStore.unsubscribe();
  orderStats.stop();
});

// Mapping nav.to -> count à afficher en badge
function badgeFor(to) {
  if (to === '/admin/orders') return orderStats.pending || null;
  return null;
}

const nav = [
  { to: '/admin',            label: 'Dashboard',    icon: Squares2X2Icon  },
  { to: '/admin/products',   label: 'Produits',     icon: ShoppingBagIcon },
  { to: '/admin/categories',    label: 'Catégories',  icon: FolderIcon    },
  { to: '/admin/product-lines', label: 'Gammes',      icon: SparklesIcon  },
  { to: '/admin/orders',        label: 'Commandes',   icon: TagIcon       },
  { to: '/admin/deliveries',    label: 'Livraisons',  icon: TruckIcon     },
  { to: '/admin/delivery-zones',label: 'Zones livr.', icon: TruckIcon     },
  { to: '/admin/coupons',       label: 'Coupons',     icon: TicketIcon    },
  { to: '/admin/blog',          label: 'Blog',        icon: NewspaperIcon },
  { to: '/admin/programme',    label: 'Club fidélité',icon: StarIcon                   },
  { to: '/admin/reviews',          label: 'Avis clients',    icon: ChatBubbleLeftRightIcon },
  { to: '/admin/abandoned-carts',  label: 'Paniers abandonnés', icon: EnvelopeIcon        },
  { to: '/admin/users',        label: 'Clients',     icon: UsersIcon                   },
  { to: '/admin/settings',   label: 'Paramètres',   icon: Cog6ToothIcon   },
];

const titles = {
  'admin.dashboard':  'Vue d\'ensemble',
  'admin.products':   'Produits',
  'admin.categories': 'Catégories',
  'admin.orders':     'Commandes',
  'admin.order':      'Détail commande',
  'admin.deliveries': 'Gestion des livraisons',
  'admin.delivery-zones': 'Zones de livraison',
  'admin.coupons':    'Coupons & promotions',
  'admin.users':      'Clientes & clients',
  'admin.settings':   'Paramètres boutique',
  'admin.products.create': 'Nouveau produit',
  'admin.products.edit':   'Modifier le produit',
  'admin.blog':                  'Blog & Actualités',
  'admin.blog.create':           'Nouvel article',
  'admin.blog.edit':             'Modifier l\'article',
  'admin.product-lines':         'Gammes de produits',
  'admin.product-lines.create':  'Nouvelle gamme',
  'admin.product-lines.edit':    'Modifier la gamme',
  'admin.program':               'Rosa Beauty Club — Fidélité',
  'admin.reviews':               'Avis & Modération',
  'admin.abandoned-carts':       'Relances — Paniers abandonnés',
};

const currentTitle = computed(() => titles[route.name] ?? 'Admin');
const isActive = (path) => route.path === path || (path !== '/admin' && route.path.startsWith(path));

async function handleLogout() {
  await auth.logout();
  router.push('/login');
}
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  display: flex;
  background: var(--cream-50);
}

/* ── Sidebar ── */
.admin-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid var(--cream-200);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: sticky;
  top: 0;
}

.admin-sidebar__logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-3) var(--space-3);
  border-bottom: 1px solid var(--cream-200);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}
.admin-sidebar__logo:hover { opacity: 0.85; }

.admin-sidebar__logo-img {
  width: 100%;
  max-width: 180px;
  height: auto;
  display: block;
  object-fit: contain;
}

.admin-sidebar__logo-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.1;
}
.admin-sidebar__logo-sub {
  font-size: 0.625rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-primary);
  font-weight: 600;
}

.admin-sidebar__nav {
  flex: 1;
  padding: var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.admin-nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-500);
  transition: all var(--transition-fast);
  position: relative;
}
.admin-nav-link__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
.admin-nav-link > span:first-of-type { flex: 1; }
.admin-nav-link__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 9999px;
  background: var(--rose-500);
  color: #fff;
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1;
}
.admin-nav-link--active .admin-nav-link__badge {
  background: #fff;
  color: var(--rose-600);
}
.admin-nav-link:hover {
  background: var(--rose-50);
  color: var(--rose-600);
}
.admin-nav-link--active {
  background: var(--rose-50);
  color: var(--rose-600);
  font-weight: 600;
}
.admin-nav-link--active::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 22px;
  background: var(--rose-500);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.admin-sidebar__user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--cream-200);
}
.admin-sidebar__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--rose-400), var(--rose-600));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9375rem;
  flex-shrink: 0;
}
.admin-sidebar__user-info {
  flex: 1;
  min-width: 0;
}
.admin-sidebar__user-info p {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.admin-sidebar__user-info span {
  font-size: 0.6875rem;
  color: var(--gray-400);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
.admin-sidebar__logout {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  color: var(--gray-400);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}
.admin-sidebar__logout:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* ── Main ── */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  height: 80px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--cream-200);
  padding: 0 var(--space-8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
}
.admin-topbar__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--gray-800);
  letter-spacing: -0.01em;
}
.admin-topbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.admin-topbar__shop-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--cream-300);
  background: #fff;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-600);
  transition: all var(--transition-fast);
}
.admin-topbar__shop-link:hover {
  border-color: var(--rose-300);
  color: var(--rose-500);
}

.admin-content {
  flex: 1;
  padding: var(--space-8);
  overflow: auto;
}

@media (max-width: 900px) {
  .admin-sidebar { width: 80px; }
  .admin-sidebar__logo-text,
  .admin-sidebar__user-info,
  .admin-nav-link span { display: none; }
  .admin-nav-link { justify-content: center; padding: 12px; }
  .admin-sidebar__logo { justify-content: center; padding: var(--space-3); }
  .admin-sidebar__logo-img { max-width: 64px; }
  .admin-sidebar__user { justify-content: center; }
  .admin-topbar { padding: 0 var(--space-4); }
  .admin-content { padding: var(--space-4); }
}
</style>

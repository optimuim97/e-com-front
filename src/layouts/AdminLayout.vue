<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 shrink-0 flex flex-col bg-white border-r border-gray-100 min-h-screen">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <span class="text-xl">🌹</span>
          <div class="leading-tight">
            <span class="block font-bold text-sm text-primary-600 tracking-wide">Rosa Beauty</span>
            <span class="block text-[9px] text-gray-400 uppercase tracking-widest -mt-0.5">Admin</span>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <RouterLink v-for="item in nav" :key="item.to" :to="item.to"
          class="nav-link" :class="{ 'nav-link-active': isActive(item.to) }">
          <component :is="item.icon" class="size-5 shrink-0" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- User -->
      <div class="p-4 border-t border-gray-100">
        <div class="flex items-center gap-3">
          <div class="size-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
            {{ auth.user?.name?.[0]?.toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">{{ auth.user?.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ auth.user?.email }}</p>
          </div>
          <button @click="handleLogout" class="btn-ghost !p-1.5 !rounded-lg text-gray-400 hover:text-red-500">
            <ArrowLeftOnRectangleIcon class="size-5" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Topbar -->
      <header class="h-16 bg-white border-b border-gray-100 flex items-center px-6">
        <h1 class="text-lg font-semibold text-gray-800">{{ currentTitle }}</h1>
      </header>

      <main class="flex-1 p-6 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import {
  Squares2X2Icon, ShoppingBagIcon, TagIcon, TicketIcon,
  UsersIcon, ArrowLeftOnRectangleIcon, FolderIcon, Cog6ToothIcon,
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/stores/auth';

const auth   = useAuthStore();
const route  = useRoute();
const router = useRouter();

const nav = [
  { to: '/admin',            label: 'Dashboard',    icon: Squares2X2Icon  },
  { to: '/admin/products',   label: 'Produits',     icon: ShoppingBagIcon },
  { to: '/admin/categories', label: 'Catégories',   icon: FolderIcon      },
  { to: '/admin/orders',     label: 'Commandes',    icon: TagIcon         },
  { to: '/admin/coupons',    label: 'Coupons',      icon: TicketIcon      },
  { to: '/admin/users',      label: 'Clients',      icon: UsersIcon       },
  { to: '/admin/settings',   label: 'Paramètres',   icon: Cog6ToothIcon   },
];

const titles = {
  'admin.dashboard':  'Dashboard',
  'admin.products':   'Produits',
  'admin.categories': 'Catégories',
  'admin.orders':     'Commandes',
  'admin.coupons':    'Coupons',
  'admin.users':      'Clients',
  'admin.settings':   'Paramètres',
};

const currentTitle = computed(() => titles[route.name] ?? 'Admin');
const isActive = (path) => route.path === path || (path !== '/admin' && route.path.startsWith(path));

async function handleLogout() {
  await auth.logout();
  router.push('/login');
}
</script>

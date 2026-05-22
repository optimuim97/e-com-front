import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  // ── AUTH ──────────────────────────────────────────────────────────────
  { path: '/login',    name: 'login',    component: () => import('@/views/auth/LoginView.vue'),    meta: { guest: true } },
  { path: '/register', name: 'register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guest: true } },

  // ── BOUTIQUE ──────────────────────────────────────────────────────────
  {
    path: '/',
    component: () => import('@/layouts/ShopLayout.vue'),
    children: [
      { path: '',               name: 'home',     component: () => import('@/views/shop/HomeView.vue') },
      { path: 'products',       name: 'products', component: () => import('@/views/shop/ProductsView.vue') },
      { path: 'products/:slug', name: 'product',  component: () => import('@/views/shop/ProductView.vue') },
      { path: 'cart',           name: 'cart',     component: () => import('@/views/shop/CartView.vue') },
      { path: 'checkout',       name: 'checkout', component: () => import('@/views/shop/CheckoutView.vue'), meta: { requiresAuth: true } },
      { path: 'orders',         name: 'orders',   component: () => import('@/views/shop/OrdersView.vue'),    meta: { requiresAuth: true } },
      { path: 'orders/:number', name: 'order',    component: () => import('@/views/shop/OrderView.vue'),    meta: { requiresAuth: true } },
      { path: 'wishlist',       name: 'wishlist', component: () => import('@/views/shop/WishlistView.vue'), meta: { requiresAuth: true } },
    ],
  },

  // ── ADMIN ─────────────────────────────────────────────────────────────
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '',                   name: 'admin.dashboard',        component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'products',           name: 'admin.products',         component: () => import('@/views/admin/ProductsView.vue') },
      { path: 'products/create',    name: 'admin.products.create',  component: () => import('@/views/admin/ProductFormView.vue') },
      { path: 'products/:id/edit',  name: 'admin.products.edit',    component: () => import('@/views/admin/ProductFormView.vue') },
      { path: 'categories',         name: 'admin.categories',       component: () => import('@/views/admin/CategoriesView.vue') },
      { path: 'orders',             name: 'admin.orders',           component: () => import('@/views/admin/OrdersView.vue') },
      { path: 'orders/:id',         name: 'admin.order',            component: () => import('@/views/admin/OrderView.vue') },
      { path: 'coupons',            name: 'admin.coupons',          component: () => import('@/views/admin/CouponsView.vue') },
      { path: 'users',              name: 'admin.users',            component: () => import('@/views/admin/UsersView.vue') },
      { path: 'settings',           name: 'admin.settings',         component: () => import('@/views/admin/SettingsView.vue') },
    ],
  },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // Le store s'auto-initialise si token présent, on attend juste le checked
  if (!auth.checked) {
    await new Promise((resolve) => {
      const stop = setInterval(() => { if (auth.checked) { clearInterval(stop); resolve(); } }, 50);
    });
  }

  if (to.meta.requiresAuth  && !auth.user)    return { name: 'login', query: { redirect: to.fullPath } };
  if (to.meta.requiresAdmin && !auth.isAdmin) return { name: 'home' };
  if (to.meta.guest         && auth.user)     return { name: 'home' };
});

export default router;

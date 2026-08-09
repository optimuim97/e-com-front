import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/auth.store'

// ── Feature routes ────────────────────────────────────────────────────────────
import authRoutes     from '@/features/auth/auth.routes'
import homeRoutes     from '@/features/home/home.routes'
import cartRoutes     from '@/features/cart/cart.routes'
import checkoutRoutes from '@/features/checkout/checkout.routes'
import productsRoutes from '@/features/products/products.routes'
import ordersRoutes   from '@/features/orders/orders.routes'
import blogRoutes     from '@/features/blog/blog.routes'
import wishlistRoutes from '@/features/wishlist/wishlist.routes'
import programRoutes  from '@/features/program/program.routes'
import accountRoutes  from '@/features/account/account.routes'
import aboutRoutes   from '@/features/about/about.routes'
import contactRoutes from '@/features/contact/contact.routes'
import paymentRoutes from '@/features/payment/payment.routes'

// ── Admin routes ──────────────────────────────────────────────────────────────
import adminRoutes from '@/admin/admin.routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Auth (hors layout boutique)
    ...authRoutes,

    // Boutique (dans ShopLayout)
    {
      path: '/',
      component: () => import('@/layouts/ShopLayout.vue'),
      children: [
        ...homeRoutes,
        ...cartRoutes,
        ...checkoutRoutes,
        ...productsRoutes,
        ...ordersRoutes,
        ...blogRoutes,
        ...wishlistRoutes,
        ...programRoutes,
        ...accountRoutes,
        ...aboutRoutes,
        ...contactRoutes,
        ...paymentRoutes,
      ],
    },

    // Admin (dans AdminLayout)
    adminRoutes,

    // 404
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.checked) {
    await new Promise((resolve) => {
      const stop = setInterval(() => { if (auth.checked) { clearInterval(stop); resolve() } }, 50)
    })
  }

  if (to.meta.requiresAuth  && !auth.user)    return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.requiresAdmin && !auth.isAdmin) return { name: 'home' }
  // Espace admin : réservé au personnel (admin / manager / staff)
  if (to.meta.requiresStaff && !auth.isStaff) return { name: 'home' }
  // Contrôle fin par permission : si l'agent n'a pas la permission requise,
  // on le renvoie vers le tableau de bord (accessible à tout le staff).
  if (to.meta.permission && !auth.can(to.meta.permission)) {
    return to.name === 'admin.dashboard' ? true : { name: 'admin.dashboard' }
  }
  if (to.meta.guest         && auth.user)     return { name: 'home' }
})

/**
 * Ligne de base SEO, posée à chaque navigation.
 *
 * Les pages publiques la remplacent aussitôt via useSeo() — leur composant est
 * monté après ce hook, donc leurs valeurs gagnent. Elle sert aux écrans privés
 * (panier, tunnel, compte, admin) qui n'appellent pas useSeo : sans elle, ils
 * héritaient du titre et de l'URL canonique de la page précédente, et Google
 * pouvait indexer « /checkout » sous le nom d'un produit.
 */
router.afterEach((to) => {
  const prive = to.path.startsWith('/admin')
    || to.meta.requiresAuth
    || to.meta.guest
    || ['cart', 'checkout', 'not-found'].includes(to.name)

  if (!prive) return

  const robots = document.head.querySelector('meta[name="robots"]')
    ?? document.head.appendChild(
      Object.assign(document.createElement('meta'), { name: 'robots' })
    )
  robots.setAttribute('content', 'noindex, nofollow')

  document.head.querySelector('link[rel="canonical"]')?.remove()
  document.head
    .querySelectorAll('script[data-seo-jsonld]')
    .forEach(el => el.remove())
})

export default router

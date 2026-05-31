export default [
  // Page liste — stable key → keep-alive la préserve
  { path: 'products',       name: 'products',     component: () => import('./ProductsView.vue'),  meta: { stableKey: 'products' } },
  // Pages détail — key = chemin complet → remount si slug change (comportement voulu)
  { path: 'products/:slug', name: 'product',      component: () => import('./ProductView.vue') },
  { path: 'gammes/:slug',   name: 'product-line', component: () => import('./ProductLineView.vue') },
]

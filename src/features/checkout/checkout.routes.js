export default [
  {
    path: 'checkout',
    name: 'checkout',
    component: () => import('./CheckoutView.vue'),
    meta: { requiresAuth: true },
  },
]

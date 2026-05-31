export default [
  { path: '/login',    name: 'login',    component: () => import('./LoginView.vue'),    meta: { guest: true } },
  { path: '/register', name: 'register', component: () => import('./RegisterView.vue'), meta: { guest: true } },
]

export default [
  { path: 'blog',       name: 'blog',      component: () => import('./BlogView.vue'),     meta: { stableKey: 'blog' } },
  { path: 'blog/:slug', name: 'blog.post', component: () => import('./BlogPostView.vue') },
]

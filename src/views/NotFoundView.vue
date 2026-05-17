<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <!-- 404 number -->
      <div class="relative mb-8">
        <span class="text-[10rem] font-black text-gray-100 leading-none select-none">404</span>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <span class="text-3xl">🌺</span>
          </div>
        </div>
      </div>

      <h1 class="text-2xl font-bold text-gray-900 mb-3">Page introuvable</h1>
      <p class="text-gray-400 mb-8 leading-relaxed">
        La page que vous cherchez n'existe pas ou a été déplacée.<br />
        Vérifiez l'URL ou retournez à l'accueil.
      </p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <RouterLink to="/" class="btn-primary px-8 py-3">
          Retour à l'accueil
        </RouterLink>
        <RouterLink to="/shop" class="btn-outline px-8 py-3">
          Voir la boutique
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

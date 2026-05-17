<template>
  <div class="min-h-screen bg-primary-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <RouterLink to="/" class="text-3xl font-bold text-primary-500">🌺 Commerce</RouterLink>
        <p class="text-gray-500 mt-2 text-sm">Bienvenue ! Connectez-vous à votre compte.</p>
      </div>

      <div class="card p-8">
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="label">Email</label>
            <input v-model="form.email" type="email" class="input" placeholder="vous@exemple.com" required />
          </div>
          <div>
            <label class="label">Mot de passe</label>
            <input v-model="form.password" type="password" class="input" placeholder="••••••••" required />
          </div>

          <p v-if="error" class="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{{ error }}</p>

          <button type="submit" class="btn-primary w-full" :disabled="loading">
            <span v-if="loading">Connexion…</span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?
          <RouterLink to="/register" class="text-primary-500 font-medium hover:underline">S'inscrire</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth   = useAuthStore();
const router = useRouter();
const route  = useRoute();

const form    = ref({ email: '', password: '' });
const error   = ref('');
const loading = ref(false);

async function handleSubmit() {
  error.value   = '';
  loading.value = true;
  try {
    const user = await auth.login(form.value.email, form.value.password);
    const redirect = route.query.redirect || (user.roles?.includes('admin') ? '/admin' : '/');
    router.push(redirect);
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Identifiants incorrects.';
  } finally {
    loading.value = false;
  }
}
</script>

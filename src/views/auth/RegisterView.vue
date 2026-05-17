<template>
  <div class="min-h-screen bg-primary-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <RouterLink to="/" class="text-3xl font-bold text-primary-500">🌺 Commerce</RouterLink>
        <p class="text-gray-500 mt-2 text-sm">Créez votre compte en quelques secondes.</p>
      </div>

      <div class="card p-8">
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="label">Nom complet</label>
            <input v-model="form.name" type="text" class="input" placeholder="Jean Dupont" required />
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="form.email" type="email" class="input" placeholder="vous@exemple.com" required />
          </div>
          <div>
            <label class="label">Téléphone</label>
            <input v-model="form.phone" type="tel" class="input" placeholder="+221 00 000 00 00" />
          </div>
          <div>
            <label class="label">Mot de passe</label>
            <input v-model="form.password" type="password" class="input" placeholder="8 caractères minimum" required />
          </div>
          <div>
            <label class="label">Confirmer le mot de passe</label>
            <input v-model="form.password_confirmation" type="password" class="input" placeholder="••••••••" required />
          </div>

          <p v-if="error" class="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{{ error }}</p>

          <button type="submit" class="btn-primary w-full" :disabled="loading">
            <span v-if="loading">Création…</span>
            <span v-else>Créer mon compte</span>
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?
          <RouterLink to="/login" class="text-primary-500 font-medium hover:underline">Se connecter</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth   = useAuthStore();
const router = useRouter();

const form    = ref({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
const error   = ref('');
const loading = ref(false);

async function handleSubmit() {
  error.value   = '';
  loading.value = true;
  try {
    await auth.register(form.value);
    router.push('/');
  } catch (e) {
    const errors = e.response?.data?.errors;
    error.value = errors ? Object.values(errors).flat()[0] : 'Une erreur est survenue.';
  } finally {
    loading.value = false;
  }
}
</script>

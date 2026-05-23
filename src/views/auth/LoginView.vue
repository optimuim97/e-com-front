<template>
  <AuthShell
    eyebrow="Connexion"
    title="Bon <em>retour</em>"
    desc="Connectez-vous pour retrouver vos commandes & soins favoris."
    footer-text="Pas encore de compte ?"
    footer-link="/register"
    footer-link-text="Créer un compte"
  >
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div>
        <label class="label">Email</label>
        <input v-model="form.email" type="email" class="input" placeholder="vous@exemple.com" required />
      </div>
      <div>
        <label class="label">Mot de passe</label>
        <input v-model="form.password" type="password" class="input" placeholder="••••••••" required />
      </div>

      <p v-if="error" class="auth-error">{{ error }}</p>

      <button type="submit" class="btn btn-primary btn-lg auth-submit" :disabled="loading">
        <span v-if="loading" class="spinner spinner--sm"></span>
        <span v-else>Se connecter</span>
      </button>
    </form>
  </AuthShell>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AuthShell from '@/components/auth/AuthShell.vue';

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
    if (!e._serverError) {
      error.value = e.response?.data?.message ?? 'Identifiants incorrects.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auth-error {
  background: #fee2e2;
  color: #b91c1c;
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 0.8125rem;
}

.auth-submit {
  width: 100%;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
</style>

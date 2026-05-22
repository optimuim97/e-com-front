<template>
  <AuthShell
    eyebrow="Création de compte"
    title="Rejoignez <em>la fleur</em>"
    desc="Créez votre compte en quelques secondes & profitez d'offres exclusives."
    footer-text="Déjà un compte ?"
    footer-link="/login"
    footer-link-text="Se connecter"
  >
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div>
        <label class="label">Nom complet</label>
        <input v-model="form.name" type="text" class="input" placeholder="Fatou Konaté" required />
      </div>
      <div>
        <label class="label">Email</label>
        <input v-model="form.email" type="email" class="input" placeholder="vous@exemple.com" required />
      </div>
      <div>
        <label class="label">Téléphone</label>
        <input v-model="form.phone" type="tel" class="input" placeholder="+225 07 00 00 00" />
      </div>
      <div>
        <label class="label">Mot de passe</label>
        <input v-model="form.password" type="password" class="input" placeholder="8 caractères minimum" required />
      </div>
      <div>
        <label class="label">Confirmer le mot de passe</label>
        <input v-model="form.password_confirmation" type="password" class="input" placeholder="••••••••" required />
      </div>

      <p v-if="error" class="auth-error">{{ error }}</p>

      <button type="submit" class="btn btn-primary btn-lg auth-submit" :disabled="loading">
        <span v-if="loading" class="spinner spinner--sm"></span>
        <span v-else>Créer mon compte</span>
      </button>
    </form>
  </AuthShell>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AuthShell from '@/components/auth/AuthShell.vue';

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

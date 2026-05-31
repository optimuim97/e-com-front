<template>
  <AuthShell
    :eyebrow="$t('auth.loginEyebrow')"
    :title="$t('auth.loginTitle')"
    :desc="$t('auth.loginDesc')"
    :footer-text="$t('auth.loginFooter')"
    footer-link="/register"
    :footer-link-text="$t('auth.loginFooterLink')"
  >
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div>
        <label class="label">{{ $t('auth.email') }}</label>
        <input v-model="form.email" type="email" class="input" :placeholder="$t('auth.emailPlaceholder')" required />
      </div>
      <div>
        <label class="label">{{ $t('auth.password') }}</label>
        <input v-model="form.password" type="password" class="input" :placeholder="$t('auth.passwordPlaceholder')" required />
      </div>

      <p v-if="error" class="auth-error">{{ error }}</p>

      <button type="submit" class="btn btn-primary btn-lg auth-submit" :disabled="loading">
        <span v-if="loading" class="spinner spinner--sm"></span>
        <span v-else>{{ $t('auth.loginSubmit') }}</span>
      </button>
    </form>
  </AuthShell>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/features/auth/auth.store';
import AuthShell from '@/components/auth/AuthShell.vue';

const { t } = useI18n();
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
      error.value = e.response?.data?.message ?? t('auth.loginError');
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

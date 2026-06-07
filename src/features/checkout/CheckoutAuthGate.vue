<template>
  <section class="gate card">

    <!-- ── En-tête ── -->
    <div class="gate__head">
      <div class="gate__icon">🌹</div>
      <div class="gate__head-text">
        <h2 class="gate__title">Finalisez votre commande</h2>
        <p class="gate__hint">Connectez-vous ou créez un compte pour confirmer</p>
      </div>
      <button class="gate__close" @click="$emit('close')" type="button" aria-label="Fermer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- ── Facebook ── -->
    <div class="gate__social">
      <FacebookButton
        label="Continuer avec Facebook"
        @success="onFacebookSuccess"
        @error="socialError = $event"
      />
      <p v-if="socialError" class="gate__error">{{ socialError }}</p>
    </div>

    <div class="gate__sep"><span>ou par e-mail</span></div>

    <!-- ── Tabs ── -->
    <div class="gate__tabs">
      <button class="gate__tab" :class="{ 'gate__tab--active': tab === 'login' }"    @click="tab = 'login'">Connexion</button>
      <button class="gate__tab" :class="{ 'gate__tab--active': tab === 'register' }" @click="tab = 'register'">Créer un compte</button>
    </div>

    <!-- ── Formulaire connexion ── -->
    <Transition name="fade" mode="out-in">
    <form v-if="tab === 'login'" key="login" @submit.prevent="doLogin" class="gate__form">
      <div class="gate__field">
        <label class="label">Email</label>
        <input v-model="loginForm.email" type="email" class="input" placeholder="vous@exemple.com" required autocomplete="email" />
      </div>
      <div class="gate__field">
        <label class="label">Mot de passe</label>
        <input v-model="loginForm.password" type="password" class="input" placeholder="••••••••" required autocomplete="current-password" />
      </div>
      <p v-if="loginError" class="gate__error">{{ loginError }}</p>
      <button type="submit" :disabled="loginLoading" class="btn btn-primary gate__submit">
        <span v-if="loginLoading" class="gate__spinner"></span>
        <span v-else>Se connecter et continuer →</span>
      </button>
    </form>

    <!-- ── Formulaire inscription ── -->
    <form v-else key="register" @submit.prevent="doRegister" class="gate__form">
      <div class="gate__field">
        <label class="label">Nom complet</label>
        <input v-model="regForm.name" type="text" class="input" placeholder="Fatou Konaté" required autocomplete="name" />
      </div>
      <div class="gate__field">
        <label class="label">Téléphone</label>
        <input v-model="regForm.phone" type="tel" class="input" placeholder="+225 07 00 00 00 00" required autocomplete="tel" />
      </div>
      <div class="gate__field">
        <label class="label">Email</label>
        <input v-model="regForm.email" type="email" class="input" placeholder="vous@exemple.com" required autocomplete="email" />
      </div>
      <div class="gate__field">
        <label class="label">Mot de passe</label>
        <input v-model="regForm.password" type="password" class="input" placeholder="8 caractères min." required autocomplete="new-password" minlength="8" />
      </div>
      <p v-if="regError" class="gate__error">{{ regError }}</p>
      <button type="submit" :disabled="regLoading" class="btn btn-primary gate__submit">
        <span v-if="regLoading" class="gate__spinner"></span>
        <span v-else>Créer mon compte et continuer →</span>
      </button>
    </form>
    </Transition>

    <!-- ── Séparateur + Commande rapide ── -->
    <div v-if="quickOrderEnabled" class="gate__sep">
      <span>ou</span>
    </div>

    <button v-if="quickOrderEnabled" type="button" class="gate__quick" @click="$emit('quick-order')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      Commander rapidement sans compte
    </button>

  </section>
</template>

<script setup>
import {nextTick, ref} from 'vue'
import { useAuthStore }     from '@/features/auth/auth.store'
import { useSettingsStore } from '@/stores/settings'
import FacebookButton       from '@/features/auth/FacebookButton.vue'

const emit = defineEmits(['authenticated', 'quick-order', 'close'])

const auth     = useAuthStore()
const settings = useSettingsStore()

const tab = ref('login')

// ── Login ──────────────────────────────────────────────────────────────────
const loginForm    = ref({ email: '', password: '' })
const loginLoading = ref(false)
const loginError   = ref('')

async function doLogin() {
  loginLoading.value = true
  loginError.value   = ''
  try {
    await auth.login(loginForm.value.email, loginForm.value.password)
    // Attendre que le store soit mis à jour
    await nextTick()
    emit('authenticated')
  } catch (e) {
    loginError.value = e.response?.data?.message ?? 'Email ou mot de passe incorrect'
  } finally {
    loginLoading.value = false
  }
}

// ── Register ───────────────────────────────────────────────────────────────
const regForm    = ref({ name: '', phone: '', email: '', password: '' })
const regLoading = ref(false)
const regError   = ref('')

async function doRegister() {
  regLoading.value = true
  regError.value   = ''
  try {
    await auth.register({
      name:                  regForm.value.name,
      phone:                 regForm.value.phone,
      email:                 regForm.value.email,
      password:              regForm.value.password,
      password_confirmation: regForm.value.password,
    })
    emit('authenticated')
  } catch (e) {
    const errs = e.response?.data?.errors
    regError.value = errs
      ? Object.values(errs).flat().join(' ')
      : (e.response?.data?.message ?? 'Erreur lors de la création du compte')
  } finally {
    regLoading.value = false
  }
}

const quickOrderEnabled = settings.enableQuickOrder

// ── Facebook ───────────────────────────────────────────────────────────────
const socialError = ref('')

async function onFacebookSuccess() {
  socialError.value = ''
  try { await useCartStore().mergeLocalCart() } catch {}
  emit('authenticated')
}

import { useCartStore } from '@/features/cart/cart.store'
</script>

<style scoped>
.gate {
  overflow: hidden;
  max-width: 520px;
  margin: 0 auto;
}

.gate__head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) var(--space-4);
  border-bottom: 1px solid var(--cream-100);
}
.gate__icon { font-size: 1.5rem; flex-shrink: 0; margin-top: 2px; }
.gate__head-text { flex: 1; }
.gate__title {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--gray-800);
}
.gate__hint { font-size: 0.8125rem; color: var(--gray-400); margin-top: 2px; }
.gate__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px; height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--cream-100);
  color: var(--gray-500);
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}
.gate__close:hover { background: var(--cream-200); }

.gate__social {
  padding: var(--space-4) var(--space-5) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.gate__tabs {
  display: flex;
  border-bottom: 1px solid var(--cream-200);
}
.gate__tab {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-500);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: -1px;
}
.gate__tab--active {
  color: var(--rose-600);
  border-bottom-color: var(--rose-500);
  background: var(--rose-50);
}

.gate__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
}
.gate__field { display: flex; flex-direction: column; gap: var(--space-1); }
.gate__error {
  font-size: 0.8125rem;
  color: #b91c1c;
  padding: var(--space-2) var(--space-3);
  background: #fef2f2;
  border-radius: var(--radius-sm);
}
.gate__submit { width: 100%; justify-content: center; position: relative; }

.gate__spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

.gate__sep {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  color: var(--gray-400);
  font-size: 0.75rem;
}
.gate__sep::before, .gate__sep::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--cream-200);
}

.gate__quick {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: calc(100% - var(--space-10));
  margin: var(--space-2) var(--space-5) var(--space-5);
  padding: var(--space-3) var(--space-4);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--rose-600);
  background: var(--rose-50);
  border: 1.5px dashed var(--rose-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.gate__quick:hover {
  background: var(--rose-100);
  border-color: var(--rose-300);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<template>
  <section class="gate card">

    <!-- ── En-tête ── -->
    <div class="gate__head">
      <div class="gate__icon">🌹</div>
      <div class="gate__head-text">
        <h2 class="gate__title">Finalisez votre commande</h2>
        <p class="gate__hint">Choisissez la méthode qui vous convient</p>
      </div>
      <button class="gate__close" @click="$emit('close')" type="button" aria-label="Fermer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- ══ COMMANDE RAPIDE — en premier, mise en évidence ══ -->
    <div v-if="quickOrderEnabled" class="gate__quick-hero">
      <!-- <div class="gate__quick-hero__badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        Recommandé
      </div> -->
      <div class="gate__quick-hero__body">
        <div class="gate__quick-hero__icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <div>
          <strong class="gate__quick-hero__title">Commande rapide</strong>
          <p class="gate__quick-hero__desc">Juste votre nom et téléphone — livré en 24h</p>
        </div>
      </div>
      <button type="button" class="btn gate__quick-hero__btn" @click="$emit('quick-order')">
        Commander maintenant
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>

    <!-- ── Séparateur ── -->
    <div class="gate__sep">
      <span>{{ quickOrderEnabled ? 'ou connectez-vous' : 'Connexion' }}</span>
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

    <div class="gate__sep gate__sep--sm"><span>ou par e-mail</span></div>

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
      <button type="submit" :disabled="loginLoading" class="btn btn-outline gate__submit">
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
      <button type="submit" :disabled="regLoading" class="btn btn-outline gate__submit">
        <span v-if="regLoading" class="gate__spinner"></span>
        <span v-else>Créer mon compte et continuer →</span>
      </button>
    </form>
    </Transition>

  </section>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { useAuthStore }     from '@/features/auth/auth.store'
import { useSettingsStore } from '@/stores/settings'
import { useCartStore }     from '@/features/cart/cart.store'
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
</script>

<style scoped>
.gate {
  overflow: hidden;
  max-width: 520px;
  margin: 0 auto;
}

/* ── Header ── */
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

/* ══ Commande rapide hero — bien mise en évidence ══ */
.gate__quick-hero {
  margin: var(--space-5) var(--space-5) 0;
  background: linear-gradient(135deg, #fff0f6 0%, #fce7f0 100%);
  border: 2px solid var(--rose-300);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  position: relative;
  overflow: hidden;
}
/* Accent strip gauche */
.gate__quick-hero::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: linear-gradient(180deg, var(--rose-400), var(--rose-600));
  border-radius: 4px 0 0 4px;
}

.gate__quick-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--rose-600);
  background: var(--rose-100);
  border: 1px solid var(--rose-200);
  padding: 2px 10px 2px 8px;
  border-radius: 20px;
  width: fit-content;
}

.gate__quick-hero__body {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.gate__quick-hero__icon {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  background: var(--rose-500);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(232, 51, 109, 0.35);
}
.gate__quick-hero__title {
  display: block;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-800);
  line-height: 1.2;
}
.gate__quick-hero__desc {
  font-size: 0.8125rem;
  color: var(--gray-500);
  margin-top: 2px;
}
.gate__quick-hero__btn {
  width: 100%;
  justify-content: center;
  gap: var(--space-2);
  background: var(--rose-500);
  color: #fff;
  border: none;
  padding: 13px var(--space-5);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: 0 4px 14px rgba(232, 51, 109, 0.3);
  display: flex;
  align-items: center;
}
.gate__quick-hero__btn:hover {
  background: var(--rose-600);
  box-shadow: 0 6px 18px rgba(232, 51, 109, 0.4);
  transform: translateY(-1px);
}
.gate__quick-hero__btn:active { transform: translateY(0); }

/* ── Séparateurs ── */
.gate__sep {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  color: var(--gray-400);
  font-size: 0.75rem;
}
.gate__sep--sm { padding-top: var(--space-2); padding-bottom: var(--space-2); }
.gate__sep::before, .gate__sep::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--cream-200);
}

/* ── Social ── */
.gate__social {
  padding: 0 var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* ── Tabs ── */
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

/* ── Formulaire ── */
.gate__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-5) var(--space-6);
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
  border: 2px solid rgba(0,0,0,0.2);
  border-top-color: var(--rose-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

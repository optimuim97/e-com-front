<template>
  <div class="fs-overlay" @click.self="$emit('close')">
    <div class="fs-modal">
      <button class="fs-close" @click="$emit('close')" aria-label="Fermer">✕</button>

      <header class="fs-head">
        <span class="fs-icon">🔒</span>
        <h3>{{ title }}</h3>
        <p>{{ subtitle }}</p>
      </header>

      <!-- ── Étape 1 : identifiant + canal ── -->
      <form v-if="step === 'request'" @submit.prevent="askCode" class="fs-form">
        <label class="fs-label">Email ou téléphone</label>
        <input
          v-model="identifier"
          type="text"
          class="input"
          placeholder="ex. moi@exemple.com ou 07 00 00 00"
          required
          autofocus
        />

        <p class="fs-label fs-label--top">Recevoir le code via</p>
        <div class="fs-channels">
          <label class="fs-channel" :class="{ active: channel === 'email' }">
            <input type="radio" v-model="channel" value="email" />
            <span class="fs-channel__icon">📧</span>
            <span>Email</span>
          </label>
          <label class="fs-channel" :class="{ active: channel === 'whatsapp' }">
            <input type="radio" v-model="channel" value="whatsapp" />
            <span class="fs-channel__icon">💬</span>
            <span>WhatsApp</span>
          </label>
        </div>

        <p v-if="error" class="fs-error">{{ error }}</p>

        <button type="submit" class="btn btn-primary fs-cta" :disabled="busy || !identifier">
          {{ busy ? 'Envoi…' : 'Recevoir le code' }}
        </button>
      </form>

      <!-- ── Étape 2 : code + nouveau secret ── -->
      <form v-else @submit.prevent="resetSecret" class="fs-form">
        <p class="fs-info">Code envoyé via {{ channel === 'whatsapp' ? 'WhatsApp' : 'email' }}. Valable 10 min.</p>

        <label class="fs-label">Code à 6 chiffres</label>
        <input
          v-model="code"
          type="text"
          inputmode="numeric"
          maxlength="6"
          pattern="\d{6}"
          class="input fs-code-input"
          placeholder="• • • • • •"
          required
          autofocus
        />

        <template v-if="mode === 'password'">
          <label class="fs-label fs-label--top">Nouveau mot de passe</label>
          <input v-model="password" type="password" class="input" placeholder="8 caractères min." minlength="8" required />
          <label class="fs-label fs-label--top">Confirmer</label>
          <input v-model="passwordConfirm" type="password" class="input" minlength="8" required />
        </template>
        <template v-else>
          <label class="fs-label fs-label--top">Nouveau code PIN (4 chiffres)</label>
          <input
            v-model="pin"
            type="text"
            inputmode="numeric"
            maxlength="4"
            pattern="\d{4}"
            class="input fs-code-input"
            placeholder="• • • •"
            required
          />
        </template>

        <p v-if="error" class="fs-error">{{ error }}</p>
        <p v-if="success" class="fs-success">{{ success }}</p>

        <div class="fs-actions">
          <button type="button" class="btn btn-outline" @click="step = 'request'">← Renvoyer un code</button>
          <button type="submit" class="btn btn-primary" :disabled="busy">
            {{ busy ? 'Validation…' : 'Réinitialiser' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api'

const props = defineProps({
  // 'password' | 'pin'
  mode: { type: String, default: 'password' },
})
const emit = defineEmits(['close', 'reset'])

const title = props.mode === 'pin' ? 'Code PIN oublié' : 'Mot de passe oublié'
const subtitle = props.mode === 'pin'
  ? 'Recevez un code par email ou WhatsApp pour définir un nouveau PIN.'
  : 'Recevez un code par email ou WhatsApp pour définir un nouveau mot de passe.'

const step      = ref('request') // 'request' | 'reset'
const identifier = ref('')
const channel   = ref('whatsapp')
const code      = ref('')
const password  = ref('')
const passwordConfirm = ref('')
const pin       = ref('')
const busy      = ref(false)
const error     = ref('')
const success   = ref('')

const endpoints = props.mode === 'pin'
  ? { ask: '/auth/pin/forgot',      reset: '/auth/pin/reset' }
  : { ask: '/auth/password/forgot', reset: '/auth/password/reset' }

async function askCode() {
  busy.value = true
  error.value = ''
  try {
    await api.post(endpoints.ask, {
      identifier: identifier.value.trim(),
      channel:    channel.value,
    })
    step.value = 'reset'
  } catch (e) {
    error.value = e.response?.data?.message
      || Object.values(e.response?.data?.errors ?? {})[0]?.[0]
      || 'Erreur. Réessayez.'
  } finally {
    busy.value = false
  }
}

async function resetSecret() {
  busy.value = true
  error.value = ''
  success.value = ''

  if (props.mode === 'password' && password.value !== passwordConfirm.value) {
    error.value = 'Les mots de passe ne correspondent pas.'
    busy.value = false
    return
  }

  try {
    const body = {
      identifier: identifier.value.trim(),
      code:       code.value.trim(),
    }
    if (props.mode === 'pin') body.pin = pin.value
    else {
      body.password              = password.value
      body.password_confirmation = passwordConfirm.value
    }

    await api.post(endpoints.reset, body)
    success.value = props.mode === 'pin'
      ? '✓ Code PIN réinitialisé.'
      : '✓ Mot de passe réinitialisé. Reconnectez-vous.'
    emit('reset')
    setTimeout(() => emit('close'), 1500)
  } catch (e) {
    error.value = e.response?.data?.message
      || Object.values(e.response?.data?.errors ?? {})[0]?.[0]
      || 'Erreur. Vérifiez le code.'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.fs-overlay {
  position: fixed; inset: 0; z-index: 250;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.fs-modal {
  position: relative;
  background: #fff;
  border-radius: var(--radius-lg);
  width: 100%; max-width: 440px;
  padding: var(--space-5);
}
.fs-close {
  position: absolute; top: 12px; right: 12px;
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--cream-100); border: none; cursor: pointer;
  color: var(--gray-600);
}
.fs-close:hover { background: var(--rose-500); color: #fff; }

.fs-head { text-align: center; margin-bottom: var(--space-4); }
.fs-icon { font-size: 1.75rem; }
.fs-head h3 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  margin: 6px 0 4px;
}
.fs-head p {
  font-size: 0.8125rem;
  color: var(--gray-500);
  margin: 0;
}

.fs-form { display: flex; flex-direction: column; gap: 6px; }
.fs-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-600);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 2px;
}
.fs-label--top { margin-top: var(--space-3); }
.fs-info {
  font-size: 0.8125rem;
  color: var(--gray-500);
  background: var(--cream-50);
  padding: 10px 12px;
  border-radius: var(--radius-md);
  margin: 0 0 var(--space-2);
}

.fs-channels { display: flex; gap: var(--space-2); }
.fs-channel {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border: 1.5px solid var(--cream-300);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  transition: all var(--transition-fast);
}
.fs-channel input { display: none; }
.fs-channel.active {
  border-color: var(--rose-500);
  background: var(--rose-50);
  color: var(--rose-700);
}
.fs-channel__icon { font-size: 1.125rem; }

.fs-code-input {
  font-family: ui-monospace, monospace;
  font-size: 1.25rem;
  text-align: center;
  letter-spacing: 0.5em;
}

.fs-cta { margin-top: var(--space-4); width: 100%; }
.fs-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
}
.fs-actions .btn { flex: 1; }

.fs-error { color: #b91c1c; font-size: 0.8125rem; margin: 6px 0 0; }
.fs-success { color: #15803d; font-size: 0.8125rem; margin: 6px 0 0; }
</style>

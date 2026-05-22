<template>
  <div class="admin-page settings-page">
    <header class="page-header">
      <div>
        <span class="eyebrow">Configuration</span>
        <h1 class="page-header__title">Paramètres boutique</h1>
      </div>
    </header>

    <div v-if="loading" class="loader-wrap">
      <div class="loader"></div>
    </div>

    <form v-else @submit.prevent="save" class="settings-form">
      <!-- WhatsApp -->
      <section class="card settings-section">
        <header class="settings-section__head">
          <div class="settings-section__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <h2>WhatsApp</h2>
            <p>Configurez la notification de commandes via WhatsApp.</p>
          </div>
        </header>

        <div class="settings-section__body">
          <div>
            <label class="label">Numéro WhatsApp de la boutique</label>
            <input
              v-model="form.whatsapp_admin_number"
              type="text"
              class="input"
              placeholder="Ex: 2250700000000 (sans espaces ni +)"
            />
            <p class="settings-hint">Format international sans le +, ex : 2250701234567</p>
          </div>

          <label class="settings-toggle">
            <button
              type="button"
              @click="form.whatsapp_notify_customer = form.whatsapp_notify_customer === 'true' ? 'false' : 'true'"
              class="toggle"
              :class="{ 'toggle--on': form.whatsapp_notify_customer === 'true' }"
            >
              <span class="toggle__dot"></span>
            </button>
            <div class="settings-toggle__text">
              <strong>Afficher le bouton WhatsApp au client</strong>
              <span>Le client voit un bouton pour envoyer sa commande sur WhatsApp depuis la page de confirmation.</span>
            </div>
          </label>
        </div>
      </section>

      <!-- Actions -->
      <div class="settings-actions">
        <button type="submit" :disabled="saving" class="btn btn-primary">
          <span v-if="saving" class="settings-spinner"></span>
          <span v-else>Enregistrer</span>
        </button>
        <p v-if="success" class="settings-msg settings-msg--success">✓ Paramètres enregistrés.</p>
        <p v-if="error" class="settings-msg settings-msg--error">{{ error }}</p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const loading = ref(true)
const saving  = ref(false)
const success = ref(false)
const error   = ref('')

const form = ref({
  whatsapp_admin_number:   '',
  whatsapp_notify_customer: 'false',
  shop_name: '',
})

async function fetchSettings() {
  try {
    const { data } = await api.get('/admin/settings')
    form.value.whatsapp_admin_number   = data.whatsapp_admin_number   ?? ''
    form.value.whatsapp_notify_customer = data.whatsapp_notify_customer ?? 'false'
    form.value.shop_name               = data.shop_name               ?? ''
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value  = true
  success.value = false
  error.value   = ''
  try {
    await api.put('/admin/settings', { settings: form.value })
    success.value = true
    setTimeout(() => { success.value = false }, 3000)
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Erreur lors de la sauvegarde.'
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>

<style scoped>
.settings-page { display: flex; flex-direction: column; gap: var(--space-5); max-width: 720px; }

.settings-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.settings-section { padding: 0; }
.settings-section__head {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--cream-200);
  align-items: center;
}
.settings-section__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: #dcfce7;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.settings-section__head h2 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--gray-800);
}
.settings-section__head p {
  font-size: 0.8125rem;
  color: var(--gray-500);
  margin-top: 2px;
}
.settings-section__body {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.settings-hint {
  font-size: 0.75rem;
  color: var(--gray-400);
  margin-top: 6px;
}

.settings-toggle {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
  padding: var(--space-4);
  background: var(--cream-100);
  border-radius: var(--radius-md);
}
.settings-toggle__text { flex: 1; }
.settings-toggle__text strong {
  display: block;
  font-size: 0.875rem;
  color: var(--gray-800);
  margin-bottom: 2px;
}
.settings-toggle__text span {
  font-size: 0.75rem;
  color: var(--gray-500);
  line-height: 1.5;
}

.settings-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}
.settings-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.settings-msg { font-size: 0.875rem; }
.settings-msg--success { color: #15803d; font-weight: 500; }
.settings-msg--error { color: #b91c1c; }
</style>

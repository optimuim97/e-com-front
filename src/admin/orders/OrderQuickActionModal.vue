<template>
  <component
    :is="inline ? 'div' : 'div'"
    :class="inline ? 'qa-inline' : 'modal-overlay'"
    @click="inline ? null : ($event.target === $event.currentTarget && $emit('close'))"
  >
    <div :class="inline ? 'qa-panel' : 'modal'">
      <header :class="inline ? 'qa-header' : 'modal__header'">
        <div>
          <span class="eyebrow">Traitement rapide</span>
          <h3>Commande {{ order.number }}</h3>
        </div>
        <button :class="inline ? 'qa-close' : 'modal__close'" @click="$emit('close')" aria-label="Fermer">✕</button>
      </header>

      <!-- Récap commande -->
      <div class="modal__section">
        <div class="recap-grid">
          <div>
            <span class="recap-label">Client</span>
            <strong>{{ clientName }}</strong>
            <span class="recap-sub">{{ clientPhone || '—' }}</span>
          </div>
          <div>
            <span class="recap-label">Total</span>
            <strong>{{ fmt(order.total) }}</strong>
            <span class="recap-sub">{{ order.items?.length || 0 }} article(s)</span>
          </div>
          <div>
            <span class="recap-label">Moyen de paiement</span>
            <strong>{{ paymentLabel(order.payment_method) }}</strong>
            <span class="recap-sub" :class="['pmt-state', order.paid_at ? 'pmt-state--ok' : 'pmt-state--pending']">
              {{ order.paid_at ? '✓ Payée' : '⏳ Non payée' }}
            </span>
          </div>
          <div>
            <span class="recap-label">Statut</span>
            <strong>{{ statusLabel(order.status) }}</strong>
            <span v-if="order.tracking_number" class="recap-sub">Suivi : {{ order.tracking_number }}</span>
          </div>
        </div>
      </div>

      <!-- Action paiement -->
      <div class="modal__section" v-if="!order.paid_at">
        <h4>1. Paiement</h4>
        <div class="action-row">
          <button
            class="btn btn-success"
            :disabled="busy === 'mark-paid'"
            @click="markPaid"
          >
            {{ busy === 'mark-paid' ? 'Validation…' : '✓ Marquer comme payée (cash / COD)' }}
          </button>
          <button
            class="btn btn-outline"
            :disabled="busy === 'pay-link'"
            @click="generatePaymentLink"
          >
            {{ busy === 'pay-link' ? 'Génération…' : '🔗 Générer lien de paiement en ligne' }}
          </button>
        </div>
        <div v-if="paymentLink" class="payment-link-box">
          <p>Lien généré (CinetPay) :</p>
          <div class="payment-link-row">
            <input :value="paymentLink" readonly class="input" />
            <button class="btn btn-xs btn-outline" @click="copy(paymentLink)">Copier</button>
            <a :href="waPayLink" target="_blank" rel="noopener" class="btn btn-xs btn-primary">
              📲 Envoyer via WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div class="modal__section" v-else>
        <p class="modal__info">✓ Paiement déjà enregistré.</p>
      </div>

      <!-- Action tracking -->
      <div class="modal__section">
        <h4>2. Numéro de suivi & envoi client</h4>
        <div class="action-row">
          <input
            v-model="tracking"
            type="text"
            class="input"
            placeholder="Ex. RB-2026-00123"
            :disabled="busy === 'tracking'"
          />
          <button
            class="btn btn-outline"
            type="button"
            :disabled="busy === 'gen-tracking' || busy === 'tracking'"
            @click="generateTracking"
            title="Générer un numéro de suivi"
          >
            {{ busy === 'gen-tracking' ? '…' : '🎲 Générer' }}
          </button>
          <button
            class="btn btn-primary"
            :disabled="!tracking.trim() || busy === 'tracking'"
            @click="saveTracking"
          >
            {{ busy === 'tracking' ? 'Enregistrement…' : 'Confirmer + marquer expédiée' }}
          </button>
        </div>
        <p v-if="tracking.trim() && clientPhone" class="modal__hint">
          Après confirmation, un lien WhatsApp pré-rempli s'ouvrira pour notifier le client.
        </p>
      </div>

      <!-- Lien détails -->
      <footer class="modal__footer">
        <RouterLink
          :to="{ name: 'admin.order', params: { id: order.id } }"
          class="btn btn-outline"
          @click="$emit('close')"
        >
          Voir détails complets →
        </RouterLink>
        <p v-if="error" class="form-error">{{ error }}</p>
        <p v-if="success" class="form-success">{{ success }}</p>
      </footer>
    </div>
  </component>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import api from '@/api';

const props = defineProps({
  order:  { type: Object,  required: true },
  inline: { type: Boolean, default: false },
});
const emit = defineEmits(['close', 'updated']);

const tracking      = ref(props.order.tracking_number ?? '');
const busy          = ref(null); // 'mark-paid' | 'pay-link' | 'tracking'
const error         = ref('');
const success       = ref('');
const paymentLink   = ref(null);

const clientName = computed(() => {
  const addr = props.order.shipping_address || {};
  return props.order.user?.name
    ?? [addr.first_name, addr.last_name].filter(Boolean).join(' ')
    ?? '—';
});
const clientPhone = computed(() => {
  return props.order.shipping_address?.phone ?? props.order.user?.phone ?? '';
});

const waPayLink = computed(() => buildWaLink(
  clientPhone.value,
  `Bonjour ${clientName.value.split(' ')[0]} 🌹\n\nVoici le lien de paiement pour votre commande ${props.order.number} (${fmt(props.order.total)}) :\n${paymentLink.value}\n\nMerci de procéder au paiement pour finaliser votre commande.\n\nRosabeauty Facial Care`,
));

function buildWaLink(phoneRaw, message) {
  if (!phoneRaw) return '#';
  const phone = String(phoneRaw).replace(/[^0-9]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

async function markPaid() {
  busy.value = 'mark-paid';
  error.value = ''; success.value = '';
  try {
    const { data } = await api.post(`/admin/orders/${props.order.id}/mark-paid`);
    emit('updated', data.data ?? data);
    success.value = '✓ Commande marquée comme payée.';
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Erreur.';
  } finally {
    busy.value = null;
  }
}

async function generatePaymentLink() {
  busy.value = 'pay-link';
  error.value = ''; success.value = '';
  try {
    const { data } = await api.post(`/admin/orders/${props.order.id}/payment-link`);
    paymentLink.value = data.url;
    success.value = 'Lien généré. Tu peux l\'envoyer au client.';
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Impossible de générer le lien.';
  } finally {
    busy.value = null;
  }
}

async function generateTracking() {
  busy.value = 'gen-tracking';
  error.value = '';
  try {
    const { data } = await api.post(`/admin/orders/${props.order.id}/generate-tracking`);
    tracking.value = data.tracking_number;
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Impossible de générer un numéro.';
  } finally {
    busy.value = null;
  }
}

async function saveTracking() {
  busy.value = 'tracking';
  error.value = ''; success.value = '';
  try {
    const { data } = await api.patch(`/admin/orders/${props.order.id}`, {
      tracking_number: tracking.value.trim(),
      status: 'shipped',
    });
    emit('updated', data.data ?? data);
    success.value = '✓ Numéro enregistré, commande marquée expédiée.';

    // Pré-remplir WhatsApp pour notifier le client
    if (clientPhone.value) {
      const msg = `Bonjour ${clientName.value.split(' ')[0]} 🌹\n\nVotre commande ${props.order.number} a été expédiée !\n\n📦 Numéro de suivi : ${tracking.value.trim()}\n\nVous serez livré(e) très bientôt.\n\nMerci de votre confiance.\nRosabeauty Facial Care`;
      window.open(buildWaLink(clientPhone.value, msg), '_blank', 'noopener');
    }
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Erreur.';
  } finally {
    busy.value = null;
  }
}

function copy(text) {
  navigator.clipboard?.writeText(text);
  success.value = 'Copié dans le presse-papier.';
}

function fmt(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(Number(v ?? 0));
}

const STATUS_LABELS = {
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En préparation',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
};
function statusLabel(s) { return STATUS_LABELS[s] ?? s; }

const PAYMENT_LABELS = {
  wave: 'Wave 💙', orange_money: 'Orange Money 🟠', cinetpay: 'Carte bancaire 💳',
  cod: 'Paiement à la livraison 🚚', delivery: 'Paiement à la livraison 🚚', cash: 'Espèces',
};
function paymentLabel(p) { return PAYMENT_LABELS[p] ?? p ?? '—'; }
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-4);
}

/* ── Mode inline (dans la ligne du tableau) ── */
.qa-inline {
  background: var(--cream-50);
  padding: 0;
}
.qa-panel {
  background: #fff;
  border-left: 3px solid var(--rose-500);
  margin: 0;
  padding: 0;
}
.qa-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--cream-200);
  background: var(--cream-50);
}
.qa-header h3 { font-family: var(--font-display); font-size: 1rem; margin: 2px 0 0; }
.qa-close {
  width: 26px; height: 26px; border-radius: 50%;
  background: transparent; color: var(--gray-500);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem; cursor: pointer; border: 1px solid var(--cream-300);
}
.qa-close:hover { background: var(--rose-500); color: #fff; border-color: var(--rose-500); }
.qa-inline .modal__section { padding: var(--space-3) var(--space-4); }
.qa-inline .recap-grid { grid-template-columns: repeat(4, 1fr); }
.qa-inline .modal__footer { padding: var(--space-3) var(--space-4); }
@media (max-width: 900px) {
  .qa-inline .recap-grid { grid-template-columns: repeat(2, 1fr); }
}
.modal {
  background: #fff;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 92vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.modal__header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--cream-200);
}
.modal__header h3 { font-family: var(--font-display); font-size: 1.125rem; margin: 0; }
.modal__close {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--cream-100); color: var(--gray-600);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; cursor: pointer; border: none;
}
.modal__close:hover { background: var(--rose-500); color: #fff; }

.modal__section {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--cream-100);
}
.modal__section h4 {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin: 0 0 var(--space-3);
}
.modal__info { color: var(--gray-500); font-size: 0.875rem; }
.modal__hint { font-size: 0.75rem; color: var(--gray-400); margin-top: var(--space-2); }

.recap-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3) var(--space-4);
}
.recap-grid > div { display: flex; flex-direction: column; gap: 2px; }
.recap-label {
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gray-400);
  font-weight: 600;
}
.recap-grid strong { font-size: 0.9375rem; color: var(--gray-800); }
.recap-sub { font-size: 0.75rem; color: var(--gray-500); }

.pmt-state--ok      { color: #15803d; font-weight: 600; }
.pmt-state--pending { color: var(--gold-600, #b45309); font-weight: 600; }

.action-row {
  display: flex; gap: var(--space-2); flex-wrap: wrap;
}
.action-row .input { flex: 1; min-width: 200px; }
.action-row .btn { white-space: nowrap; }

.btn-success {
  background: #15803d; color: #fff; border: none;
}
.btn-success:hover:not(:disabled) { background: #166534; }

.payment-link-box {
  margin-top: var(--space-3);
  padding: var(--space-3);
  background: var(--rose-50);
  border-radius: var(--radius-md);
}
.payment-link-box p { font-size: 0.75rem; color: var(--rose-700); margin: 0 0 var(--space-2); }
.payment-link-row {
  display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap;
}
.payment-link-row .input { flex: 1; min-width: 200px; font-size: 0.75rem; }

.modal__footer {
  padding: var(--space-4) var(--space-5);
  display: flex; flex-direction: column; gap: var(--space-2);
  align-items: flex-start;
}
.form-error   { color: #ef4444; font-size: 0.8125rem; }
.form-success { color: #15803d; font-size: 0.8125rem; }
.btn-xs { padding: 4px 8px !important; font-size: 0.6875rem !important; }
</style>

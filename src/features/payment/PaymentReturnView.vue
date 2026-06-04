<template>
  <main class="pay-return">
    <div class="pay-return__card">
      <!-- Loading -->
      <template v-if="checking">
        <div class="pay-return__icon pay-return__icon--spin">💳</div>
        <h1 class="display-sm">Vérification du paiement…</h1>
        <p class="pay-return__desc">Merci de patienter, nous confirmons votre paiement.</p>
        <div class="pay-return__spinner"></div>
      </template>

      <!-- Succès -->
      <template v-else-if="paid">
        <div class="pay-return__icon">✅</div>
        <h1 class="display-sm">Paiement confirmé !</h1>
        <p class="pay-return__desc">
          Votre commande <strong>{{ orderNumber }}</strong> a bien été payée.<br>
          Vous recevrez une confirmation sous peu.
        </p>
        <RouterLink :to="`/orders/${orderNumber}`" class="btn btn-primary">
          Suivre ma commande
        </RouterLink>
      </template>

      <!-- En attente (paiement en cours de vérification) -->
      <template v-else-if="pending">
        <div class="pay-return__icon">⏳</div>
        <h1 class="display-sm">Paiement en cours de vérification</h1>
        <p class="pay-return__desc">
          Votre paiement est en cours de traitement. Vous recevrez une confirmation dès que le paiement sera validé.
        </p>
        <RouterLink :to="`/orders/${orderNumber}`" class="btn btn-primary">
          Voir ma commande
        </RouterLink>
      </template>

      <!-- Échec -->
      <template v-else>
        <div class="pay-return__icon">❌</div>
        <h1 class="display-sm">Paiement non abouti</h1>
        <p class="pay-return__desc">
          Le paiement n'a pas pu être traité. Votre commande est conservée — vous pouvez réessayer ou choisir un autre mode de paiement.
        </p>
        <div class="pay-return__actions">
          <RouterLink :to="`/orders/${orderNumber}`" class="btn btn-outline">
            Voir ma commande
          </RouterLink>
          <RouterLink to="/" class="btn btn-primary">
            Retour à l'accueil
          </RouterLink>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import api from '@/api'

const route       = useRoute()
const router      = useRouter()
const orderNumber = route.query.order
const checking    = ref(true)
const paid        = ref(false)
const pending     = ref(false)

onMounted(async () => {
  if (!orderNumber) { checking.value = false; return }

  // Interroger le backend pour le statut (max 3 tentatives, 2s entre chaque).
  // On essaie GeniusPay d'abord, puis CinetPay en repli.
  async function fetchStatus() {
    for (const provider of ['geniuspay', 'cinetpay']) {
      try {
        const { data } = await api.get(`/payment/${provider}/status/${orderNumber}`)
        return data
      } catch {
        // provider suivant
      }
    }
    return null
  }

  for (let i = 0; i < 3; i++) {
    const data = await fetchStatus()
    if (data) {
      if (data.paid) { paid.value = true; break }
      else if (['payment_failed', 'cancelled'].includes(data.status)) { break }
      else { pending.value = true; break }
    }
    if (i < 2) await new Promise(r => setTimeout(r, 2000))
  }

  checking.value = false

  // Paiement confirmé → on ramène l'utilisateur sur le détail de SA commande
  // après un court instant (il voit le message de succès puis est redirigé).
  if (paid.value && orderNumber) {
    setTimeout(() => {
      router.push({ name: 'order', params: { number: orderNumber } })
    }, 2500)
  }
})
</script>

<style scoped>
.pay-return {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-4);
  background: var(--gray-50);
}

.pay-return__card {
  background: white;
  border-radius: var(--radius-2xl);
  padding: var(--space-12) var(--space-8);
  text-align: center;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
}

.pay-return__icon {
  font-size: 3.5rem;
  margin-bottom: var(--space-4);
  display: block;
}

.pay-return__icon--spin {
  animation: spin 2s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.pay-return__desc {
  color: var(--gray-600);
  margin: var(--space-4) 0 var(--space-6);
  line-height: 1.6;
}

.pay-return__spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: var(--space-4) auto 0;
}

.pay-return__actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}
</style>

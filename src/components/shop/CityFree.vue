<template>
  <div class="cf-wrap">

    <!-- Bouton géolocalisation -->
    <button
      type="button"
      class="cf-geo-btn"
      :class="{ 'cf-geo-btn--loading': detecting }"
      :disabled="detecting"
      @click="detectLocation"
    >
      <span v-if="detecting" class="cf-spinner" />
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="cf-geo-icon">
        <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.757.433l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd"/>
      </svg>
      <span>{{ detecting ? 'Détection en cours…' : 'Détecter ma position' }}</span>
    </button>

    <p v-if="geoError" class="cf-error">{{ geoError }}</p>
    <p v-if="geoSuccess" class="cf-success">✓ Position détectée — vérifiez les champs ci-dessous</p>

    <!-- Ville -->
    <div class="cf-field">
      <label class="label">Ville *</label>
      <input
        :value="city"
        type="text"
        class="input"
        required
        placeholder="Ex : Paris, Dakar, Montréal…"
        @input="emit('update:city', $event.target.value)"
      />
    </div>

    <!-- État / Région (optionnel selon le pays) -->
    <div class="cf-field">
      <label class="label">
        {{ regionLabel }}
        <span class="cf-opt">(optionnel)</span>
      </label>
      <input
        :value="region"
        type="text"
        class="input"
        :placeholder="regionPlaceholder"
        @input="emit('update:region', $event.target.value)"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  city:    { type: String, default: '' },
  region:  { type: String, default: '' },
  country: { type: String, default: '' },
})

const emit = defineEmits(['update:city', 'update:region'])

// ── Labels adaptatifs selon le pays ─────────────────────────────────────────
const regionLabel = computed(() => {
  const map = {
    FR: 'Département / Région',
    BE: 'Province',
    CA: 'Province / Territoire',
    US: 'État',
    SN: 'Région',
    ML: 'Région',
    BF: 'Province',
    GN: 'Préfecture',
    TG: 'Région',
    BJ: 'Département',
    GH: 'Région',
  }
  return map[props.country] ?? 'État / Région / Province'
})

const regionPlaceholder = computed(() => {
  const map = {
    FR: 'Ex : Île-de-France, Auvergne…',
    BE: 'Ex : Bruxelles-Capitale…',
    CA: 'Ex : Québec, Ontario…',
    US: 'Ex : California, Texas…',
    SN: 'Ex : Dakar, Thiès…',
    GH: 'Ex : Greater Accra…',
  }
  return map[props.country] ?? 'Ex : votre région'
})

// ── Géolocalisation ──────────────────────────────────────────────────────────
const detecting  = ref(false)
const geoError   = ref('')
const geoSuccess = ref(false)

function detectLocation() {
  geoError.value   = ''
  geoSuccess.value = false

  if (!navigator.geolocation) {
    geoError.value = 'La géolocalisation n\'est pas supportée par votre navigateur.'
    return
  }

  detecting.value = true

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&accept-language=fr`,
          { headers: { 'Accept-Language': 'fr' } }
        )
        if (!res.ok) throw new Error('Erreur réseau')
        const data = await res.json()

        const addr = data.address ?? {}

        // Ville : on prend la valeur la plus précise disponible
        const detectedCity =
          addr.city || addr.town || addr.village || addr.municipality || addr.county || ''

        // Région
        const detectedRegion =
          addr.state || addr.region || addr.county || ''

        if (detectedCity) emit('update:city', detectedCity)
        if (detectedRegion) emit('update:region', detectedRegion)

        geoSuccess.value = true
      } catch {
        geoError.value = 'Impossible de récupérer votre adresse. Saisissez-la manuellement.'
      } finally {
        detecting.value = false
      }
    },
    (err) => {
      detecting.value = false
      const messages = {
        1: 'Accès à la position refusé. Autorisez la géolocalisation dans votre navigateur.',
        2: 'Position introuvable. Saisissez votre ville manuellement.',
        3: 'La détection a pris trop de temps. Réessayez.',
      }
      geoError.value = messages[err.code] ?? 'Erreur de géolocalisation.'
    },
    { timeout: 8000, maximumAge: 60000 }
  )
}
</script>

<style scoped>
.cf-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
}

/* ── Bouton géo ── */
.cf-geo-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1.5px dashed var(--rose-300, #fda4af);
  border-radius: var(--radius-md, 0.5rem);
  background: var(--rose-50, #fff1f2);
  color: var(--rose-600, #e11d48);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  align-self: flex-start;
}
.cf-geo-btn:hover:not(:disabled) {
  background: var(--rose-100, #ffe4e6);
  border-color: var(--rose-400, #fb7185);
}
.cf-geo-btn--loading {
  opacity: 0.7;
  cursor: wait;
}

.cf-geo-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* ── Spinner ── */
.cf-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--rose-200, #fecdd3);
  border-top-color: var(--rose-500, #f43f5e);
  border-radius: 50%;
  animation: cf-spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes cf-spin { to { transform: rotate(360deg); } }

/* ── Messages ── */
.cf-error {
  font-size: 0.8125rem;
  color: #b91c1c;
  margin: 0;
}
.cf-success {
  font-size: 0.8125rem;
  color: #15803d;
  margin: 0;
}

/* ── Fields ── */
.cf-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.cf-opt {
  font-size: 0.8125rem;
  color: var(--gray-400, #9ca3af);
  font-style: italic;
  font-weight: 400;
}
</style>

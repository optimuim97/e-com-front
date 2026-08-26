<template>
  <button
    type="button"
    class="geo-btn"
    :class="`geo-btn--${state}`"
    :disabled="state === 'loading'"
    :title="title"
    @click="$emit('click')"
  >
    <span v-if="state === 'loading'" class="geo-btn__spin"></span>

    <svg v-else-if="state !== 'success'" width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
    </svg>

    <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>

    <span>{{ label }}</span>
  </button>
</template>

<script setup>
/**
 * Bouton « Ma position » — purement visuel.
 *
 * Aucune logique de géolocalisation ici : elle vit là où sont les champs à
 * remplir (CitySelect pour ville/commune, la commande rapide pour la sienne).
 * Ce composant n'existe que pour que le même bouton s'affiche à l'identique
 * aux trois endroits où il apparaît, au lieu d'être recopié trois fois.
 *
 * @prop  state  idle | loading | success | partial | outside-ci | error
 * @prop  label  libellé déjà traduit, fourni par l'appelant
 */
defineProps({
  state: { type: String, default: 'idle' },
  label: { type: String, default: '' },
  title: { type: String, default: '' },
})

defineEmits(['click'])
</script>

<style scoped>
.geo-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border: 1px solid var(--rose-100, #f5dcd4);
  border-radius: 999px;
  background: var(--rose-50, #fdf5f2);
  color: var(--rose-600, #b5876a);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s ease, border-color .15s ease, color .15s ease;
}

.geo-btn:hover:not(:disabled) {
  background: var(--rose-100, #f9e7e0);
}

.geo-btn:disabled {
  opacity: .7;
  cursor: default;
}

.geo-btn--success {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}

.geo-btn--partial,
.geo-btn--outside-ci {
  border-color: #fde68a;
  background: #fffbeb;
  color: #92400e;
}

.geo-btn--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.geo-btn__spin {
  width: 11px;
  height: 11px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: geo-btn-spin .7s linear infinite;
}

@keyframes geo-btn-spin {
  to { transform: rotate(360deg); }
}
</style>

<template>
  <!--
    Shown when the customer is about to order what she already has coming.
    It is a question, not a refusal: she confirms and the order goes through
    unchanged. So the existing order must be recognisable at a glance — its
    number, when it was placed, where it stands, and what is in it.
  -->
  <div class="dup-backdrop" @click.self="$emit('cancel')">
    <div class="dup" role="dialog" aria-modal="true" :aria-label="$t('duplicate.title')">
      <h2 class="dup__title">{{ $t('duplicate.title') }}</h2>
      <p class="dup__lead">{{ $t('duplicate.lead') }}</p>

      <div class="dup__card">
        <div class="dup__head">
          <strong class="dup__number">{{ order.number }}</strong>
          <span class="dup__status">{{ order.status_label }}</span>
        </div>
        <p class="dup__date">{{ $t('duplicate.placedOn', { date: placedOn }) }}</p>

        <ul class="dup__items">
          <li v-for="(item, i) in order.items" :key="i">
            {{ item.quantity }} × {{ item.name }}
            <span v-if="item.variant" class="dup__variant">({{ item.variant }})</span>
          </li>
        </ul>

        <p v-if="order.total" class="dup__total">
          {{ $t('common.total') }} : <strong>{{ formattedTotal }}</strong>
        </p>
      </div>

      <div class="dup__actions">
        <button type="button" class="btn btn-outline" @click="$emit('cancel')">
          {{ $t('duplicate.cancel') }}
        </button>
        <button type="button" class="btn btn-primary" :disabled="busy" @click="$emit('confirm')">
          {{ busy ? $t('common.loading') : $t('duplicate.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  order: { type: Object, required: true },
  busy:  { type: Boolean, default: false },
})

defineEmits(['confirm', 'cancel'])

const { locale } = useI18n()

const placedOn = computed(() => {
  const value = props.order.created_at
  if (!value) return ''
  return new Date(value).toLocaleString(locale.value, {
    day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
  })
})

const formattedTotal = computed(() => new Intl.NumberFormat(locale.value, {
  style: 'currency',
  currency: props.order.currency || 'XOF',
  minimumFractionDigits: 0,
}).format(Number(props.order.total ?? 0)))
</script>

<style scoped>
.dup-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: rgba(0, 0, 0, 0.45);
}

.dup {
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-5);
  border-radius: var(--radius-lg, 12px);
  background: #fff;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.dup__title {
  margin: 0 0 6px;
  font-size: 1.0625rem;
  color: var(--gray-800);
}

.dup__lead {
  margin: 0 0 var(--space-4);
  font-size: 0.875rem;
  color: var(--gray-600);
  line-height: 1.5;
}

.dup__card {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--cream-200);
  border-radius: var(--radius-md, 8px);
  background: var(--cream-50);
}

.dup__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.dup__number { font-size: 0.9375rem; color: var(--gray-800); }
.dup__status {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full, 999px);
  background: #fef3c7;
  color: #b45309;
  white-space: nowrap;
}

.dup__date { margin: 2px 0 var(--space-3); font-size: 0.75rem; color: var(--gray-500); }

.dup__items {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.8125rem;
  color: var(--gray-700);
}
.dup__items li { padding: 2px 0; }
.dup__variant { color: var(--gray-400); }

.dup__total {
  margin: var(--space-3) 0 0;
  padding-top: var(--space-2);
  border-top: 1px solid var(--cream-200);
  font-size: 0.8125rem;
  color: var(--gray-600);
}

.dup__actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
}
.dup__actions .btn { flex: 1; justify-content: center; }
</style>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">

      <!-- Icon -->
      <div class="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg class="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3M4.5 10.5h15A1.5 1.5 0 0121 12v7.5A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5V12a1.5 1.5 0 011.5-1.5z" />
        </svg>
      </div>

      <h2 class="text-lg font-bold text-gray-900 mb-1">
        {{ hasPin ? 'Entrez votre code PIN' : 'Définir un code PIN' }}
      </h2>
      <p class="text-sm text-gray-400 mb-7">
        {{ hasPin
          ? 'Ce code protège l\'accès à vos commandes.'
          : 'Créez un code PIN à 4 chiffres pour sécuriser vos commandes.' }}
      </p>

      <!-- 4-digit inputs -->
      <div class="flex justify-center gap-3 mb-6">
        <input
          v-for="i in 4"
          :key="i"
          :ref="el => { if (el) inputs[i - 1] = el }"
          v-model="digits[i - 1]"
          type="password"
          inputmode="numeric"
          maxlength="1"
          class="w-14 h-14 text-center text-xl font-bold rounded-xl border-2 transition-colors outline-none
                 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          :class="error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'"
          @input="onInput(i - 1, $event)"
          @keydown.backspace="onBackspace(i - 1)"
          @paste.prevent="onPaste"
        />
      </div>

      <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>

      <button
        @click="submit"
        :disabled="pin.length < 4 || loading"
        class="btn-primary w-full py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Vérification…
        </span>
        <span v-else>{{ hasPin ? 'Confirmer' : 'Créer le PIN' }}</span>
      </button>

      <button
        v-if="hasPin"
        @click="$emit('change-pin')"
        class="mt-4 text-xs text-gray-400 hover:text-primary-500 transition-colors"
      >
        Modifier mon code PIN
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { usePinStore } from '@/stores/pin'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['verified', 'change-pin'])

const pinStore  = usePinStore()
const authStore = useAuthStore()

const hasPin = computed(() => authStore.user?.has_pin ?? true)

const digits  = ref(['', '', '', ''])
const inputs  = ref([])
const loading = ref(false)
const error   = ref('')

const pin = computed(() => digits.value.join(''))

onMounted(() => nextTick(() => inputs.value[0]?.focus()))

function onInput(index, event) {
  const val = event.target.value.replace(/\D/g, '')
  digits.value[index] = val.slice(-1)
  error.value = ''
  if (val && index < 3) {
    nextTick(() => inputs.value[index + 1]?.focus())
  }
  if (pin.value.length === 4) submit()
}

function onBackspace(index) {
  if (!digits.value[index] && index > 0) {
    digits.value[index - 1] = ''
    nextTick(() => inputs.value[index - 1]?.focus())
  }
}

function onPaste(event) {
  const text = (event.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4)
  text.split('').forEach((ch, i) => { digits.value[i] = ch })
  nextTick(() => inputs.value[Math.min(text.length, 3)]?.focus())
  if (text.length === 4) submit()
}

async function submit() {
  if (pin.value.length < 4 || loading.value) return
  loading.value = true
  error.value   = ''
  try {
    if (hasPin.value) {
      await pinStore.verify(pin.value)
    } else {
      await pinStore.setPin(pin.value)
      // Refresh user so has_pin becomes true
      await authStore.fetchUser()
      pinStore.verified = true
      sessionStorage.setItem('pin_verified', '1')
    }
    emit('verified')
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Code incorrect.'
    digits.value = ['', '', '', '']
    nextTick(() => inputs.value[0]?.focus())
  } finally {
    loading.value = false
  }
}
</script>

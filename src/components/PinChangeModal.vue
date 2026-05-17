<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">

      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-900">Modifier mon code PIN</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-5">
        <div>
          <label class="label">Code PIN actuel</label>
          <div class="flex gap-2 mt-1">
            <input
              v-for="i in 4" :key="'c'+i"
              :ref="el => { if (el) currentInputs[i-1] = el }"
              v-model="currentDigits[i-1]"
              type="password" inputmode="numeric" maxlength="1"
              class="w-12 h-12 text-center text-lg font-bold rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-colors"
              @input="onCurrentInput(i-1, $event)"
              @keydown.backspace="onCurrentBackspace(i-1)"
            />
          </div>
        </div>

        <div>
          <label class="label">Nouveau code PIN</label>
          <div class="flex gap-2 mt-1">
            <input
              v-for="i in 4" :key="'n'+i"
              :ref="el => { if (el) newInputs[i-1] = el }"
              v-model="newDigits[i-1]"
              type="password" inputmode="numeric" maxlength="1"
              class="w-12 h-12 text-center text-lg font-bold rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-colors"
              @input="onNewInput(i-1, $event)"
              @keydown.backspace="onNewBackspace(i-1)"
            />
          </div>
        </div>
      </div>

      <p v-if="error"   class="text-red-500 text-sm mt-4">{{ error }}</p>
      <p v-if="success" class="text-green-600 text-sm mt-4">Code PIN modifié avec succès.</p>

      <button
        @click="submit"
        :disabled="currentPin.length < 4 || newPin.length < 4 || loading"
        class="btn-primary w-full mt-6 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Enregistrement…
        </span>
        <span v-else>Enregistrer</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { usePinStore } from '@/stores/pin'

const emit = defineEmits(['close'])

const pinStore = usePinStore()

const currentDigits = ref(['', '', '', ''])
const newDigits     = ref(['', '', '', ''])
const currentInputs = ref([])
const newInputs     = ref([])
const loading = ref(false)
const error   = ref('')
const success = ref(false)

const currentPin = computed(() => currentDigits.value.join(''))
const newPin     = computed(() => newDigits.value.join(''))

onMounted(() => nextTick(() => currentInputs.value[0]?.focus()))

function makeInputHandler(digits, inputs, nextRowInputs) {
  return function (index, event) {
    const val = event.target.value.replace(/\D/g, '')
    digits[index] = val.slice(-1)
    error.value = ''
    if (val && index < 3) nextTick(() => inputs[index + 1]?.focus())
    else if (val && index === 3 && nextRowInputs) nextTick(() => nextRowInputs[0]?.focus())
  }
}

function makeBackspaceHandler(digits, inputs) {
  return function (index) {
    if (!digits[index] && index > 0) {
      digits[index - 1] = ''
      nextTick(() => inputs[index - 1]?.focus())
    }
  }
}

function onCurrentInput(i, e)   { makeInputHandler(currentDigits.value, currentInputs.value, newInputs.value)(i, e) }
function onCurrentBackspace(i)  { makeBackspaceHandler(currentDigits.value, currentInputs.value)(i) }
function onNewInput(i, e)        { makeInputHandler(newDigits.value, newInputs.value, null)(i, e) }
function onNewBackspace(i)       { makeBackspaceHandler(newDigits.value, newInputs.value)(i) }

async function submit() {
  if (loading.value) return
  loading.value = true
  error.value   = ''
  success.value = false
  try {
    await pinStore.setPin(newPin.value, currentPin.value)
    success.value = true
    setTimeout(() => emit('close'), 1200)
  } catch (e) {
    error.value = e.response?.data?.message ?? 'Une erreur est survenue.'
    currentDigits.value = ['', '', '', '']
    nextTick(() => currentInputs.value[0]?.focus())
  } finally {
    loading.value = false
  }
}
</script>

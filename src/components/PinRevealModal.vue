<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">

      <div class="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg class="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>

      <h2 class="text-lg font-bold text-gray-900 mb-2">Notez votre code PIN</h2>
      <p class="text-sm text-gray-500 mb-6">
        Ce code PIN a été créé automatiquement pour sécuriser l'accès à vos commandes.<br>
        <strong class="text-gray-700">Il ne sera affiché qu'une seule fois.</strong>
      </p>

      <!-- PIN display -->
      <div class="flex justify-center gap-3 mb-6">
        <span
          v-for="(digit, i) in pin.split('')"
          :key="i"
          class="w-14 h-14 flex items-center justify-center text-2xl font-bold text-primary-600
                 bg-primary-50 border-2 border-primary-200 rounded-xl"
        >{{ digit }}</span>
      </div>

      <p class="text-xs text-gray-400 mb-6">
        Vous pourrez modifier ce code depuis la page de votre commande.
      </p>

      <button @click="$emit('close')" class="btn-primary w-full py-3 font-semibold">
        J'ai noté mon code PIN
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({ pin: { type: String, required: true } })
defineEmits(['close'])
</script>

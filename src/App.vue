<template>
  <RouterView />
  <WhatsAppButton
    v-if="!isAdminRoute && settings.whatsappNumber"
    :phone="settings.whatsappNumber"
  />
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import WhatsAppButton from '@/components/shop/WhatsAppButton.vue';
import { useSettingsStore } from '@/stores/settings';

const route    = useRoute();
const toast    = useToast();
const settings = useSettingsStore();

// Charger les settings dès le démarrage de l'app (tous les layouts en profitent)
settings.fetch().catch(() => {})

const isAdminRoute = computed(() => route.path.startsWith('/admin'));

function onServerError() {
  toast.error(
    'Un souci technique vient de se produire. Pas d\'inquiétude — réessayez dans un instant, notre équipe est déjà informée.',
    { timeout: 7000, closeOnClick: true },
  );
}

onMounted(()  => window.addEventListener('api:server-error', onServerError));
onUnmounted(() => window.removeEventListener('api:server-error', onServerError));
</script>

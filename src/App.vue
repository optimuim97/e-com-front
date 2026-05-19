<template>
  <RouterView />
  <WhatsAppButton v-if="!isAdminRoute" />
</template>

<script setup>
import { computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import WhatsAppButton from '@/components/shop/WhatsAppButton.vue';

const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith('/admin'));
</script>

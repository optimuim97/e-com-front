<template>
  <div class="social-cb">
    <div class="social-cb__spinner"></div>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/auth.store'

const router = useRouter()
const auth   = useAuthStore()
const message = ref('Connexion en cours…')

onMounted(async () => {
  // Le backend renvoie le résultat dans le hash (#<json url-encodé>)
  const raw = window.location.hash.slice(1)
  if (!raw) { router.replace('/login'); return }

  let data
  try { data = JSON.parse(decodeURIComponent(raw)) } catch { data = null }

  if (!data || data.error || !data.token) {
    message.value = 'Connexion impossible. Redirection…'
    setTimeout(() => router.replace('/login'), 1500)
    return
  }

  try {
    await auth.setSession(data.token, data.user)
    router.replace('/')
  } catch {
    router.replace('/login')
  }
})
</script>

<style scoped>
.social-cb {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--gray-500);
}
.social-cb__spinner {
  width: 32px; height: 32px;
  border: 2px solid var(--rose-100, #fbd7e1);
  border-top-color: var(--rose-500, #e8336d);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>

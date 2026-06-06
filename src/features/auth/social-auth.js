/**
 * Authentification sociale par popup OAuth — module réutilisable.
 *
 * Ouvre une popup vers le backend ({backend}/auth/{provider}/redirect),
 * écoute le postMessage de retour (token + user) et établit la session.
 *
 * Usage :
 *   import { useSocialAuth } from '@/features/auth/social-auth'
 *   const { loginWith, loading, error } = useSocialAuth()
 *   loginWith('facebook').then(() => router.push('/'))
 */
import { ref } from 'vue'
import { useAuthStore } from '@/features/auth/auth.store'

/** Origine du backend (sans /api). Dérivée de VITE_API_URL ou fallback dev. */
function backendOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl) {
    try {
      // VITE_API_URL peut être absolu (https://api...) ou relatif (/api)
      if (/^https?:\/\//.test(apiUrl)) return new URL(apiUrl).origin
    } catch { /* ignore */ }
  }
  // Dev : backend Laravel sur :8000 ; Prod : même origine que le site
  if (import.meta.env.DEV) return 'http://localhost:8000'
  return window.location.origin
}

export function useSocialAuth() {
  const auth    = useAuthStore()
  const loading = ref(false)
  const error   = ref('')

  function loginWith(provider = 'facebook') {
    return new Promise((resolve, reject) => {
      loading.value = true
      error.value = ''

      const url = `${backendOrigin()}/auth/${provider}/redirect`
      const w = 600, h = 720
      const left = window.screenX + (window.outerWidth - w) / 2
      const top  = window.screenY + (window.outerHeight - h) / 2
      const popup = window.open(
        url, 'social-auth',
        `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no`
      )

      if (!popup) {
        loading.value = false
        error.value = 'Popup bloquée. Autorisez les fenêtres surgissantes.'
        return reject(new Error('popup_blocked'))
      }

      let settled = false

      async function onMessage(event) {
        const data = event.data
        if (!data || data.source !== 'social-auth') return
        cleanup()

        if (data.error) {
          error.value = friendly(data.error)
          loading.value = false
          return reject(new Error(data.error))
        }
        try {
          await auth.setSession(data.token, data.user)
          loading.value = false
          resolve(data)
        } catch (e) {
          error.value = 'Connexion impossible.'
          loading.value = false
          reject(e)
        }
      }

      // Si l'utilisateur ferme la popup sans finir
      const poll = setInterval(() => {
        if (popup.closed && !settled) {
          cleanup()
          loading.value = false
          reject(new Error('popup_closed'))
        }
      }, 600)

      function cleanup() {
        settled = true
        clearInterval(poll)
        window.removeEventListener('message', onMessage)
        try { if (!popup.closed) popup.close() } catch { /* ignore */ }
      }

      window.addEventListener('message', onMessage)
    })
  }

  function friendly(code) {
    const map = {
      access_denied:  'Connexion annulée.',
      invalid_state:  'Session expirée, réessayez.',
      auth_failed:    'Connexion impossible pour le moment.',
      unsupported_provider: 'Méthode de connexion indisponible.',
    }
    return map[code] ?? 'Connexion impossible.'
  }

  return { loginWith, loading, error }
}

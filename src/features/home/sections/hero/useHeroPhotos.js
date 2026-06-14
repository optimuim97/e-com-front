import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useSettingsStore } from '@/stores/settings'

// Photos éditoriales par défaut (la fondatrice dans les pétales + champs de rose).
const FALLBACK_HERO_PHOTOS = [
  '/image_site/FLS_8142.jpeg',
  '/image_site/FLS_8130.jpeg',
  '/image_site/DSC_7553.jpeg',
]

/**
 * Logique de carrousel hero partagée entre les variantes.
 * Source : settings.heroImages (admin) sinon fallback local.
 */
export function useHeroPhotos(duration = 7000) {
  const settings = useSettingsStore()

  const heroPhotos = computed(() => {
    const configured = settings.heroImages
    if (Array.isArray(configured) && configured.length) return configured
    return FALLBACK_HERO_PHOTOS
  })

  const currentPhoto = ref(0)
  let timer = null

  function next() {
    currentPhoto.value = (currentPhoto.value + 1) % heroPhotos.value.length
  }
  function onPhotoError(i) {
    const fb = FALLBACK_HERO_PHOTOS[i % FALLBACK_HERO_PHOTOS.length]
    if (heroPhotos.value[i] !== fb) heroPhotos.value[i] = fb
  }

  onMounted(() => {
    if (heroPhotos.value.length > 1) timer = setInterval(next, duration)
  })
  onBeforeUnmount(() => clearInterval(timer))

  return { heroPhotos, currentPhoto, onPhotoError }
}

export { FALLBACK_HERO_PHOTOS }

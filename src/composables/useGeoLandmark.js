import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCurrentPosition, reverseGeocodeCI, geoErrorMessage } from '@/composables/useGeolocation.js'

/**
 * « Ma position » — détection destinée au seul champ d'indication de livraison.
 *
 * La détection ne touche à AUCUNE sélection : ni la ville, ni le pays, ni la
 * commune, ni le choix Abidjan / hors Abidjan. Elle produit un texte libre —
 * rue, quartier, ville — et rien d'autre.
 *
 * C'est un choix délibéré. Auparavant, un clic pouvait basculer la destination
 * sur « Hors Abidjan » et réécrire la ville : la cliente voyait ses réponses
 * changer sous ses yeux, et avec elles les frais de livraison et les moyens de
 * paiement proposés. Une aide à la saisie n'a pas à décider de la commande.
 *
 * Usage :
 *   const geo = useGeoLandmark()
 *   <GeoLocateButton :state="geo.state" :label="geo.label" @click="geo.fill(form, 'landmark')" />
 */
export function useGeoLandmark() {
  // 'idle' | 'loading' | 'success' | 'partial' | 'error'
  const state   = ref('idle')
  const message = ref('')

  const LABEL_KEYS = {
    idle:    'geo.btnIdle',
    loading: 'geo.btnLoading',
    success: 'geo.btnSuccess',
    partial: 'geo.btnPartial',
    error:   'geo.btnError',
  }

  const { t } = useI18n()
  const label = computed(() => t(LABEL_KEYS[state.value] ?? 'geo.btnIdle'))

  let minuteur = null
  function effacerPlusTard(delai = 8000) {
    clearTimeout(minuteur)
    minuteur = setTimeout(() => { message.value = '' }, delai)
  }

  /**
   * Détecte la position et renvoie un libellé de lieu, ou null.
   * Ne modifie rien : c'est l'appelant qui décide quoi en faire.
   */
  async function detect() {
    const pos    = await getCurrentPosition()
    const result = await reverseGeocodeCI(pos.coords.latitude, pos.coords.longitude)

    // Du plus précis au plus large — c'est l'ordre dans lequel on décrit un
    // endroit à un livreur : la rue d'abord, la ville en dernier.
    const morceaux = result.inCI
      ? [result.road, result.commune, result.city?.name]
      : [result.road, result.cityName, result.region]

    const lieu = morceaux.filter(Boolean).join(', ')

    return lieu || null
  }

  /**
   * Écrit le lieu détecté dans un champ de texte libre.
   *
   * N'écrase jamais une saisie existante : ce que la cliente a écrit vaut
   * mieux qu'une rue déduite d'un point GPS. Dans ce cas le lieu est tout de
   * même annoncé, pour qu'elle puisse le recopier si elle le souhaite.
   *
   * @param {import('vue').Ref<Object>} form   objet réactif du formulaire
   * @param {string}                    champ  nom du champ à remplir
   */
  async function fill(form, champ) {
    state.value   = 'loading'
    message.value = ''

    try {
      const lieu = await detect()

      if (!lieu) {
        state.value   = 'partial'
        message.value = t('geo.notFoundMsg')
        return
      }

      const actuel = String(form.value[champ] ?? '').trim()

      if (actuel) {
        state.value   = 'partial'
        message.value = t('geo.landmarkKept', { place: lieu })
        effacerPlusTard(10000)
        return
      }

      form.value[champ] = lieu
      state.value       = 'success'
      message.value     = t('geo.landmarkFilled', { place: lieu })
      effacerPlusTard()
    } catch (err) {
      state.value   = 'error'
      message.value = geoErrorMessage(err.code)
    }
  }

  return { state, message, label, detect, fill }
}

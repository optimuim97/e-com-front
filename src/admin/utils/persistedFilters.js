import { reactive, watch } from 'vue'

/**
 * Filtres d'écran conservés d'une visite à l'autre.
 *
 * La gérante revient dix fois par jour sur le même écran avec les mêmes
 * critères. Les lui faire ressaisir à chaque fois, c'est la pousser à travailler
 * sur la liste brute — et à manquer ce qu'elle cherchait.
 *
 * Conservé dans le navigateur, pas sur le serveur : ce sont des préférences
 * d'affichage, propres au poste, et personne ne doit attendre un aller-retour
 * réseau pour retrouver son écran.
 *
 * @param {string} cle       Identifiant de l'écran, préfixé à l'enregistrement.
 * @param {object} defauts   Valeurs de départ. Leur forme fait foi : une clé
 *                           disparue du code est ignorée à la relecture.
 * @returns {object}         Objet réactif à lier aux champs du formulaire.
 */
export function usePersistedFilters(cle, defauts) {
  const rangement = `rosa.filters.${cle}`
  const filtres   = reactive({ ...defauts, ...relire(rangement, defauts) })

  watch(filtres, (valeurs) => {
    try {
      window.localStorage.setItem(rangement, JSON.stringify(valeurs))
    } catch {
      // Navigation privée, quota plein : perdre ses filtres est sans gravité,
      // planter l'écran ne l'est pas.
    }
  }, { deep: true })

  /** Revient aux valeurs de départ, et oublie ce qui était conservé. */
  filtres.$reset = () => {
    Object.assign(filtres, defauts)
  }

  return filtres
}

/**
 * Relit ce qui était conservé, en n'acceptant que les clés encore attendues.
 *
 * Un écran dont les filtres ont changé depuis la dernière visite ne doit pas
 * ressusciter un critère qu'il ne sait plus appliquer : le serveur le refuserait
 * et la liste resterait vide sans qu'on comprenne pourquoi.
 */
function relire(rangement, defauts) {
  try {
    const brut = window.localStorage.getItem(rangement)
    if (!brut) return {}

    const lu = JSON.parse(brut)
    if (!lu || typeof lu !== 'object') return {}

    return Object.fromEntries(
      Object.keys(defauts).filter(k => lu[k] !== undefined).map(k => [k, lu[k]]),
    )
  } catch {
    return {}
  }
}

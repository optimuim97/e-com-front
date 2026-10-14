/**
 * Le district d'Abidjan, tel qu'on le livre réellement.
 *
 * Les zones de livraison de l'administration font foi. Le district desservi
 * est plus large que le découpage officiel : Abatta, Faya, Riviera, Angré,
 * Gonzagueville, N'Dotré sont livrés et tarifés sans être des communes au
 * sens administratif. Une liste figée les laissait dehors — la cliente ne
 * pouvait pas les choisir, et l'adresse était traitée comme l'intérieur du
 * pays : prépaiement Wave/Orange imposé au lieu du paiement à la livraison.
 *
 * Ajouter une zone au groupe « Grand Abidjan » suffit désormais à la
 * proposer, ici comme au back (voir AbidjanZone côté Laravel).
 */
import { ref } from 'vue'
import api from '@/api'

/**
 * Repli : les treize communes du district autonome. Sert tant que l'appel
 * n'a pas répondu, et s'il échoue — mieux vaut un choix incomplet qu'un
 * sélecteur vide.
 */
export const COMMUNES_OFFICIELLES = [
  'Abobo', 'Adjamé', 'Anyama', 'Attécoubé', 'Bingerville',
  'Cocody', 'Koumassi', 'Marcory', 'Plateau', 'Port-Bouët',
  'Songon', 'Treichville', 'Yopougon',
]

/** Communes proposées à la cliente, ordre alphabétique. */
export const communesAbidjan = ref([...COMMUNES_OFFICIELLES])

/**
 * Toutes les zones actives, telles que l'administration les tarife.
 *
 * Abidjan n'en est qu'une partie : l'intérieur du pays a besoin des mêmes
 * données pour annoncer un prix au lieu d'un « frais à confirmer ».
 * Voir destinations-ci.js, qui les fusionne avec le découpage administratif.
 */
export const zonesLivraison = ref([])

/** Normalisation partagée : minuscules, sans accents, espaces resserrés. */
export function normalizeLoc(v) {
  return String(v || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

let chargement = null

/**
 * Charge les communes depuis l'administration. Idempotent : plusieurs écrans
 * peuvent l'appeler au montage sans multiplier les requêtes.
 */
export function chargerCommunesAbidjan() {
  if (chargement) return chargement

  chargement = api.get('/shipping/destinations')
    .then(({ data }) => {
      zonesLivraison.value = data?.data ?? []

      const noms = zonesLivraison.value
        .filter(z => z.is_abidjan)
        .map(z => z.name)
        .filter(Boolean)

      // Deux zones peuvent porter le même nom à des tarifs différents : la
      // cliente n'a pas à voir « Cocody » deux fois.
      const uniques = [...new Set(noms)].sort((a, b) => a.localeCompare(b, 'fr'))
      if (uniques.length) communesAbidjan.value = uniques
      return communesAbidjan.value
    })
    .catch(() => {
      // On garde le repli, et on autorise une nouvelle tentative plus tard.
      chargement = null
      return communesAbidjan.value
    })

  return chargement
}

/**
 * Les quartiers qu'une zone ne couvre pas.
 *
 * Abobo est une zone à son tarif ; N'Dotré est dans Abobo mais forme une zone
 * à part, plus chère. Une cliente de N'Dotré qui choisit « Abobo » de bonne foi
 * paie le mauvais tarif, et l'écart se découvre devant sa porte, avec un
 * livreur qui réclame un complément.
 *
 * L'administration saisit ces exclusions zone par zone ; ici on ne fait que les
 * retrouver pour les afficher. Rien n'en dépend côté prix : c'est le résolveur
 * du serveur qui tarife, et il fait déjà gagner la commune la plus précise.
 *
 * @returns {string[]} vide tant que les zones ne sont pas chargées.
 */
export function exclusionsDe(nom) {
  const cible = normalizeLoc(nom)
  if (!cible) return []

  const zone = zonesLivraison.value.find(z => normalizeLoc(z.name) === cible)

  return zone?.excluded_areas ?? []
}

/**
 * L'adresse est-elle dans Abidjan ?
 *
 * Synchrone à dessein : appelée depuis des propriétés calculées. Tant que la
 * liste n'est pas chargée, elle répond sur les communes officielles — soit
 * exactement l'ancien comportement, jamais pire.
 */
export function isAbidjan(city, commune) {
  const ville = normalizeLoc(city)
  const com   = normalizeLoc(commune)

  if (ville && ville.includes('abidjan')) return true

  const connues = [...COMMUNES_OFFICIELLES, ...communesAbidjan.value].map(normalizeLoc)

  if (com && connues.includes(com)) return true
  // Certains flux mettent la commune dans la ville (ex. « Cocody »).
  if (ville && connues.includes(ville)) return true

  return false
}

/**
 * Tous les pays où la boutique peut livrer.
 *
 * Le tunnel n'en proposait que seize, plus une entrée « OTHER ». Une cliente
 * d'ailleurs enregistrait donc « OTHER » comme pays : ni la zone d'expédition,
 * ni les frais, ni le tarif DHL ne pouvaient être calculés, et sa commande
 * n'aboutissait pas.
 *
 * La liste retenue croise deux conditions : un nom de pays connu du navigateur,
 * et un indicatif téléphonique. Sans indicatif, on ne peut pas joindre la
 * cliente, et la livraison n'a pas de sens — c'est ce qui écarte l'Antarctique,
 * l'île Bouvet ou les Antilles néerlandaises, dissoutes depuis 2010.
 *
 * Écartés aussi : les agrégats (Union européenne, zone euro, Nations unies) et
 * les territoires déjà couverts par leur pays (Canaries, Ceuta et Melilla,
 * Diego Garcia). Le Kosovo est conservé : on y livre.
 */
export const COUNTRY_CODES = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AR', 'AS', 'AT', 'AU',
  'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ',
  'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ', 'CA',
  'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR',
  'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ',
  'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO',
  'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN',
  'GP', 'GQ', 'GR', 'GT', 'GU', 'GW', 'GY', 'HK', 'HN', 'HR', 'HT', 'HU',
  'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
  'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY',
  'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
  'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO',
  'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
  'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM',
  'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PR', 'PS', 'PT', 'PW',
  'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE',
  'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST',
  'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM',
  'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ',
  'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'XK', 'YE', 'YT',
  'ZA', 'ZM', 'ZW',
]

/**
 * Nos marchés, proposés en tête de liste.
 *
 * L'ordre alphabétique seul enterrerait le Sénégal ou le Burkina sous deux
 * cents pays où nous n'expédions presque jamais.
 */
export const PINNED_CODES = [
  'CI', 'SN', 'ML', 'BF', 'GN', 'TG', 'BJ', 'GH', 'NG', 'CM', 'MA',
  'FR', 'BE', 'CH', 'CA', 'US',
]

/**
 * Nom du pays dans la langue de la cliente.
 *
 * Traduire deux cent quarante noms à la main dans les fichiers de langue les
 * ferait doubler, et ils vieilliraient mal. Le navigateur les connaît déjà.
 */
export function countryName(code, locale = 'fr') {
  try {
    return new Intl.DisplayNames([locale], { type: 'region', fallback: 'code' }).of(code)
  } catch {
    return code
  }
}

/**
 * La liste prête pour un sélecteur : nos marchés d'abord, puis tous les autres
 * par ordre alphabétique de la langue affichée.
 *
 * @param {string} locale
 * @param {{ exclude?: string[] }} options
 * @returns {{ code: string, name: string }[]}
 */
export function countryOptions(locale = 'fr', { exclude = [] } = {}) {
  const retenus = COUNTRY_CODES.filter((code) => !exclude.includes(code))
  const enTete  = PINNED_CODES.filter((code) => retenus.includes(code))

  const autres = retenus
    .filter((code) => !enTete.includes(code))
    .map((code) => ({ code, name: countryName(code, locale) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale))

  return [
    ...enTete.map((code) => ({ code, name: countryName(code, locale) })),
    ...autres,
  ]
}

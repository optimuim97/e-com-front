<template>
  <div class="phone-block">
    <div
      class="phone-wrap"
      :class="{ 'phone-wrap--error': hasError || showError }"
      v-bind="$attrs"
    >
      <input
        ref="inputEl"
        type="tel"
        class="phone-field"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        @blur="onBlur"
        @input="onInput"
        @countrychange="onInput"
      />
    </div>

    <!--
      Dit ce qui cloche, une fois le champ quitté. En Côte d'Ivoire c'est une
      erreur — la commande ne partira pas ; ailleurs un simple avertissement,
      parce qu'une cliente à l'étranger ne doit jamais être bloquée.
    -->
    <p v-if="showError" class="phone-msg" :class="{ 'phone-msg--hard': strict }">
      {{ message }}
    </p>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import intlTelInput from 'intl-tel-input'
import fr from 'intl-tel-input/locale/fr'
import 'intl-tel-input/styles'

// Les attributs du parent vont au champ, pas au bloc qui le contient.
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue:     { type: String,  default: '' },
  placeholder:    { type: String,  default: '07 00 00 00 00' },
  required:       { type: Boolean, default: false },
  disabled:       { type: Boolean, default: false },
  hasError:       { type: Boolean, default: false },
  autocomplete:   { type: String,  default: 'tel' },
  defaultCountry: { type: String,  default: 'CI' },
})

const emit = defineEmits(['update:modelValue', 'validity'])

const { t, locale } = useI18n()

/**
 * Pays refusés quand le numéro est mal formé.
 *
 * La Côte d'Ivoire seulement : c'est là que le livreur appelle à la porte.
 * Ailleurs le champ avertit, jamais il ne bloque — le serveur applique la même
 * distinction, et c'est lui qui a le dernier mot.
 */
const STRICT = ['ci']

const inputEl  = ref(null)
const touched  = ref(false)
const valid    = ref(true)
const strict   = ref(true)
const showError = ref(false)
const message  = ref('')

let iti = null

/*
 * La table de numérotation arrive après le champ, et six méthodes de la
 * bibliothèque — dont getNumber() et isValidNumber() — **lèvent une exception**
 * tant qu'elle n'est pas là. Une exception dans un gestionnaire coupe la suite :
 * c'est ce qui rendait inertes le bouton « Commander » et le choix de la
 * commune. Rien ne les appelle donc avant qu'elle soit chargée.
 */
const utilsReady = () => Boolean(intlTelInput.utils)

/** Ce que le champ rend au parent : « +225 0709080706 ». */
function currentValue() {
  if (!iti) return ''

  const dial   = '+' + (iti.getSelectedCountry()?.dialCode ?? '')
  const digits = (inputEl.value?.value ?? '').replace(/\D/g, '')

  if (!digits) return ''

  if (utilsReady()) {
    try {
      const e164 = iti.getNumber() // format E.164 : +2250709080706
      // L'indicatif reste séparé du numéro national : c'est sous cette forme
      // que les numéros sont déjà enregistrés, et changer de format créerait
      // des comptes en double.
      if (e164) return e164.startsWith(dial) ? dial + ' ' + e164.slice(dial.length) : e164
    } catch {
      // On retombe sur la saisie brute, ci-dessous.
    }
  }

  return dial + ' ' + digits
}

function refreshValidity() {
  if (!iti) return

  const country = iti.getSelectedCountry()?.iso2 ?? ''
  const digits  = (inputEl.value?.value ?? '').replace(/\D/g, '')

  strict.value = STRICT.includes(country)

  // Tant que la table n'est pas chargée, on ne sait pas : rien n'est déclaré
  // invalide, et surtout rien n'est appelé qui puisse lever.
  let verdict = null

  if (utilsReady()) {
    try {
      verdict = iti.isValidNumber()
    } catch {
      verdict = null
    }
  }

  valid.value = verdict === null ? true : verdict || digits === ''

  showError.value = touched.value && digits !== '' && verdict === false
  message.value = strict.value
    ? t('phone.invalidCI')
    : t('phone.invalidAbroad', { country: iti.getSelectedCountry()?.name ?? '' })

  emit('validity', { valid: valid.value, strict: strict.value, country: country.toUpperCase() })
}

function onInput() {
  emit('update:modelValue', currentValue())
  refreshValidity()
}

function onBlur() {
  touched.value = true
  refreshValidity()
}

onMounted(() => {
  iti = intlTelInput(inputEl.value, {
    initialCountry: props.defaultCountry.toLowerCase(),
    // Les marchés de la boutique en tête de liste ; le reste du monde suit.
    countryOrder: ['ci', 'sn', 'ml', 'bf', 'gn', 'tg', 'bj', 'gh', 'ng', 'cm', 'fr', 'be', 'ch', 'ca', 'us'],
    separateDialCode: true,
    // Empêche de taper autre chose qu'un numéro plausible, et borne la
    // longueur selon le pays choisi.
    strictMode: true,
    i18n: locale.value === 'fr' ? fr : undefined,
    // La table de numérotation (libphonenumber) n'est chargée qu'ici, à la
    // demande : elle pèse plus que le reste du champ, et la page d'accueil
    // n'en a pas besoin.
    loadUtils: () => import('intl-tel-input/utils'),
  })

  if (props.modelValue) iti.setNumber(props.modelValue)

  // La validité n'est connue qu'une fois la table chargée : on la réévalue.
  iti.promise.then(refreshValidity).catch(() => refreshValidity())

  refreshValidity()
})


onBeforeUnmount(() => {
  iti?.destroy()
  iti = null
})

watch(() => props.modelValue, (value) => {
  if (!iti || value === currentValue()) return

  iti.setNumber(value ?? '')
  refreshValidity()
})
</script>

<style scoped>
.phone-block { width: 100%; }

/*
 * Le champ de la bibliothèque reprend l'allure de `.input` : même pilule, même
 * crème, même rose au focus. Sans quoi il jurerait au milieu des autres champs.
 */
.phone-wrap {
  position: relative;
  width: 100%;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--cream-300);
  background: var(--cream-50);
  transition:
    border-color var(--transition-fast),
    background   var(--transition-fast),
    box-shadow   var(--transition-fast);
}
.phone-wrap:hover:not(:focus-within) {
  border-color: var(--rose-200);
  background: #fff;
}
.phone-wrap:focus-within {
  background: #fff;
  border-color: var(--rose-400);
  box-shadow: 0 0 0 3px rgba(232, 51, 109, 0.10);
}
.phone-wrap--error {
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.12);
}

.phone-wrap :deep(.iti) { width: 100%; }

.phone-field {
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--gray-800);
}
/* Mobile : 16px pour empêcher le zoom automatique d'iOS au focus. */
@media (max-width: 768px) {
  .phone-field { font-size: 16px; }
}
.phone-field::placeholder {
  color: var(--gray-400);
  font-style: italic;
  opacity: 1;
}

/* Drapeau et indicatif, à gauche du champ. */
.phone-wrap :deep(.iti__selected-country) {
  border-radius: var(--radius-full) 0 0 var(--radius-full);
  padding-left: 6px;
}
.phone-wrap :deep(.iti__selected-dial-code) {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-700);
}

/* Liste des pays : mêmes arrondis et mêmes roses que le reste de la boutique. */
.phone-wrap :deep(.iti__dropdown-content) {
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--cream-200);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  font-family: inherit;
}
.phone-wrap :deep(.iti__country.iti__highlight) { background: var(--rose-50); }
.phone-wrap :deep(.iti__country-name) { font-size: 0.8125rem; color: var(--gray-700); }
.phone-wrap :deep(.iti__dial-code) { font-size: 0.75rem; color: var(--gray-400); }
.phone-wrap :deep(.iti__search-input) {
  font-family: inherit;
  font-size: 0.8125rem;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.phone-msg {
  margin: 4px 0 0;
  padding-left: 14px;
  font-size: 0.75rem;
  color: #b45309;
}
.phone-msg--hard { color: #b91c1c; }
</style>

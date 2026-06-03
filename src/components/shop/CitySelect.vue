<template>
  <div class="city-select">

    <!-- ── Ville ── -->
    <div class="cs-field">
      <label class="label">Ville *</label>
      <div class="cs-combo" :class="{ 'cs-combo--open': cityOpen }">
        <div class="cs-input-wrap">
          <svg class="cs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.757.433l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
          </svg>
          <input
            ref="cityInput"
            v-model="cityQuery"
            type="text"
            class="cs-input"
            :placeholder="selectedCity ? selectedCity.name : 'Rechercher une ville…'"
            :class="{ 'cs-input--has-value': selectedCity }"
            autocomplete="off"
            @focus="openCity"
            @blur="handleCityBlur"
            @input="onCityInput"
            @keydown.down.prevent="moveCity(1)"
            @keydown.up.prevent="moveCity(-1)"
            @keydown.enter.prevent="selectHighlightedCity"
            @keydown.escape="closeCity"
          />
          <button
            v-if="selectedCity"
            type="button"
            class="cs-clear"
            @mousedown.prevent="clearCity"
            aria-label="Effacer la ville"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="cs-clear-icon">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
          <svg class="cs-caret" :class="{ 'cs-caret--up': cityOpen }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </div>

        <!-- Dropdown villes -->
        <Transition name="cs-drop">
          <ul v-if="cityOpen && filteredCities.length" class="cs-dropdown" role="listbox">
            <li
              v-for="(city, i) in filteredCities"
              :key="city.id"
              class="cs-option"
              :class="{ 'cs-option--highlighted': i === cityHighlight, 'cs-option--selected': selectedCity?.id === city.id }"
              role="option"
              :aria-selected="selectedCity?.id === city.id"
              @mousedown.prevent="selectCity(city)"
              @mousemove="cityHighlight = i"
            >
              <span class="cs-option__name">{{ city.name }}</span>
              <span class="cs-option__sub">{{ city.communes.length }} commune{{ city.communes.length > 1 ? 's' : '' }}</span>
            </li>
          </ul>
          <div v-else-if="cityOpen && cityQuery && !filteredCities.length" class="cs-empty">
            Aucune ville trouvée pour « {{ cityQuery }} »
          </div>
        </Transition>
      </div>
    </div>

    <!-- ── Commune (cascadée) ── -->
    <Transition name="cs-slide">
      <div v-if="selectedCity" class="cs-field">
        <label class="label">Commune *</label>
        <div class="cs-combo" :class="{ 'cs-combo--open': communeOpen }">
          <div class="cs-input-wrap">
            <svg class="cs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.9 0 .232.134.551.33.793z" />
              <path fill-rule="evenodd" d="M1 10a9 9 0 1118 0 9 9 0 01-18 0zm8.25-6a.75.75 0 01.75.75V5.5a2.942 2.942 0 011.652.757.75.75 0 01-1.004 1.115 1.442 1.442 0 00-.648-.357V8.5c.1.029.202.063.305.103.666.261 1.484.79 1.484 1.897 0 1.108-.818 1.637-1.484 1.898a4.458 4.458 0 01-.305.104V13.5a.75.75 0 01-1.5 0V12.4a3.413 3.413 0 01-1.86-.955.75.75 0 011.06-1.062c.305.306.721.51 1.05.609v-2.07a4.12 4.12 0 01-.28-.096c-.614-.238-1.47-.742-1.47-1.826 0-1.084.856-1.588 1.47-1.826A4.12 4.12 0 019.25 5.5V4.75A.75.75 0 0110 4z" clip-rule="evenodd" />
            </svg>
            <input
              ref="communeInput"
              v-model="communeQuery"
              type="text"
              class="cs-input"
              :placeholder="selectedCommune || 'Rechercher une commune…'"
              :class="{ 'cs-input--has-value': selectedCommune }"
              autocomplete="off"
              @focus="openCommune"
              @blur="handleCommuneBlur"
              @input="onCommuneInput"
              @keydown.down.prevent="moveCommune(1)"
              @keydown.up.prevent="moveCommune(-1)"
              @keydown.enter.prevent="selectHighlightedCommune"
              @keydown.escape="closeCommune"
            />
            <button
              v-if="selectedCommune"
              type="button"
              class="cs-clear"
              @mousedown.prevent="clearCommune"
              aria-label="Effacer la commune"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="cs-clear-icon">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
            <svg class="cs-caret" :class="{ 'cs-caret--up': communeOpen }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
            </svg>
          </div>

          <!-- Dropdown communes -->
          <Transition name="cs-drop">
            <ul v-if="communeOpen && filteredCommunes.length" class="cs-dropdown" role="listbox">
              <li
                v-for="(commune, i) in filteredCommunes"
                :key="commune"
                class="cs-option"
                :class="{ 'cs-option--highlighted': i === communeHighlight, 'cs-option--selected': selectedCommune === commune }"
                role="option"
                :aria-selected="selectedCommune === commune"
                @mousedown.prevent="selectCommune(commune)"
                @mousemove="communeHighlight = i"
              >
                {{ commune }}
              </li>
            </ul>
            <div v-else-if="communeOpen && communeQuery && !filteredCommunes.length" class="cs-empty">
              Aucune commune trouvée pour « {{ communeQuery }} »
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { citiesCI } from '@/data/cities-ci.js'

// ── Props / Emits ────────────────────────────────────────────────────────────
const props = defineProps({
  city:    { type: String, default: '' },
  commune: { type: String, default: '' },
})

const emit = defineEmits(['update:city', 'update:commune'])

// ── State ────────────────────────────────────────────────────────────────────
const cityInput    = ref(null)
const communeInput = ref(null)

const cityQuery    = ref('')
const communeQuery = ref('')

const selectedCity    = ref(null)
const selectedCommune = ref('')

const cityOpen    = ref(false)
const communeOpen = ref(false)

const cityHighlight    = ref(-1)
const communeHighlight = ref(-1)

// Debounce timers
let cityTimer    = null
let communeTimer = null

// ── Filtered lists ───────────────────────────────────────────────────────────
const filteredCities = computed(() => {
  const q = cityQuery.value.trim().toLowerCase()
  if (!q) return citiesCI
  return citiesCI.filter(c => c.name.toLowerCase().includes(q))
})

const filteredCommunes = computed(() => {
  if (!selectedCity.value) return []
  const q = communeQuery.value.trim().toLowerCase()
  if (!q) return selectedCity.value.communes
  return selectedCity.value.communes.filter(c => c.toLowerCase().includes(q))
})

// ── City handlers ────────────────────────────────────────────────────────────
function openCity() {
  cityOpen.value = true
  cityHighlight.value = -1
}

function closeCity() {
  cityOpen.value = false
  // Restaurer le texte du champ si rien de sélectionné
  if (!selectedCity.value) cityQuery.value = ''
}

function handleCityBlur() {
  setTimeout(() => {
    closeCity()
    // Si le texte ne correspond plus à la sélection, reset
    if (selectedCity.value && cityQuery.value && cityQuery.value !== selectedCity.value.name) {
      cityQuery.value = selectedCity.value.name
    }
  }, 150)
}

function onCityInput() {
  clearTimeout(cityTimer)
  cityHighlight.value = -1
  cityTimer = setTimeout(() => {
    cityOpen.value = true
  }, 200)
}

function selectCity(city) {
  selectedCity.value   = city
  cityQuery.value      = city.name
  cityOpen.value       = false
  cityHighlight.value  = -1

  // Reset commune
  selectedCommune.value = ''
  communeQuery.value    = ''
  emit('update:city', city.name)
  emit('update:commune', '')

  // Auto-sélection si commune unique
  if (city.communes.length === 1) {
    selectCommune(city.communes[0])
  } else {
    nextTick(() => communeInput.value?.focus())
  }
}

function clearCity() {
  selectedCity.value    = null
  cityQuery.value       = ''
  selectedCommune.value = ''
  communeQuery.value    = ''
  emit('update:city', '')
  emit('update:commune', '')
  nextTick(() => cityInput.value?.focus())
}

function moveCity(dir) {
  if (!cityOpen.value) { openCity(); return }
  const max = filteredCities.value.length - 1
  cityHighlight.value = Math.min(Math.max(cityHighlight.value + dir, 0), max)
}

function selectHighlightedCity() {
  if (cityHighlight.value >= 0 && filteredCities.value[cityHighlight.value]) {
    selectCity(filteredCities.value[cityHighlight.value])
  }
}

// ── Commune handlers ─────────────────────────────────────────────────────────
function openCommune() {
  communeOpen.value    = true
  communeHighlight.value = -1
}

function closeCommune() {
  communeOpen.value = false
  if (!selectedCommune.value) communeQuery.value = ''
}

function handleCommuneBlur() {
  setTimeout(() => {
    closeCommune()
    if (selectedCommune.value && communeQuery.value && communeQuery.value !== selectedCommune.value) {
      communeQuery.value = selectedCommune.value
    }
  }, 150)
}

function onCommuneInput() {
  clearTimeout(communeTimer)
  communeHighlight.value = -1
  communeTimer = setTimeout(() => {
    communeOpen.value = true
  }, 200)
}

function selectCommune(commune) {
  selectedCommune.value  = commune
  communeQuery.value     = commune
  communeOpen.value      = false
  communeHighlight.value = -1
  emit('update:commune', commune)
}

function clearCommune() {
  selectedCommune.value = ''
  communeQuery.value    = ''
  emit('update:commune', '')
  nextTick(() => communeInput.value?.focus())
}

function moveCommune(dir) {
  if (!communeOpen.value) { openCommune(); return }
  const max = filteredCommunes.value.length - 1
  communeHighlight.value = Math.min(Math.max(communeHighlight.value + dir, 0), max)
}

function selectHighlightedCommune() {
  if (communeHighlight.value >= 0 && filteredCommunes.value[communeHighlight.value]) {
    selectCommune(filteredCommunes.value[communeHighlight.value])
  }
}

// ── Sync depuis l'extérieur ──────────────────────────────────────────────────
// IMPORTANT : ne PAS appeler clearCity() ici, sinon le champ ville reçoit
// un .focus() au montage du composant, ce qui fait scroller la page vers
// le haut quand on arrive à l'étape 2 du checkout.
watch(() => props.city, (val) => {
  if (!val) {
    // Reset silencieux (pas de focus, pas d'emit — l'extérieur a déjà la valeur vide)
    selectedCity.value    = null
    cityQuery.value       = ''
    selectedCommune.value = ''
    communeQuery.value    = ''
    return
  }
  const found = citiesCI.find(c => c.name.toLowerCase() === val.toLowerCase())
  if (found && found.id !== selectedCity.value?.id) {
    selectedCity.value = found
    cityQuery.value    = found.name
  }
}, { immediate: true })

watch(() => props.commune, (val) => {
  if (val && val !== selectedCommune.value) {
    selectedCommune.value = val
    communeQuery.value    = val
  }
}, { immediate: true })
</script>

<style scoped>
.city-select {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
}

/* ── Field wrapper ── */
.cs-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

/* ── Combo box ── */
.cs-combo {
  position: relative;
}

.cs-input-wrap {
  display: flex;
  align-items: center;
  position: relative;
}

.cs-icon {
  position: absolute;
  left: 0.75rem;
  width: 1.125rem;
  height: 1.125rem;
  color: var(--gray-400, #9ca3af);
  pointer-events: none;
  flex-shrink: 0;
}

.cs-input {
  width: 100%;
  height: 2.625rem;
  padding: 0 2.5rem 0 2.5rem;
  border: 1.5px solid var(--cream-300, #e5e7eb);
  border-radius: var(--radius-md, 0.5rem);
  background: #fff;
  font-size: 0.9375rem;
  color: var(--gray-800, #1f2937);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
}

.cs-input::placeholder {
  color: var(--gray-400, #9ca3af);
}

.cs-input:focus {
  border-color: var(--rose-400, #fb7185);
  box-shadow: 0 0 0 3px rgba(251, 113, 133, 0.15);
}

.cs-input--has-value {
  color: var(--gray-800, #1f2937);
  font-weight: 500;
}

.cs-combo--open .cs-input {
  border-color: var(--rose-400, #fb7185);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

/* ── Clear button ── */
.cs-clear {
  position: absolute;
  right: 2rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  color: var(--gray-400, #9ca3af);
  transition: color 0.15s;
}
.cs-clear:hover { color: var(--gray-600, #4b5563); }
.cs-clear-icon { width: 1rem; height: 1rem; }

/* ── Caret ── */
.cs-caret {
  position: absolute;
  right: 0.625rem;
  width: 1.125rem;
  height: 1.125rem;
  color: var(--gray-400, #9ca3af);
  pointer-events: none;
  transition: transform 0.2s;
}
.cs-caret--up { transform: rotate(180deg); }

/* ── Dropdown ── */
.cs-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1.5px solid var(--rose-400, #fb7185);
  border-top: none;
  border-bottom-left-radius: var(--radius-md, 0.5rem);
  border-bottom-right-radius: var(--radius-md, 0.5rem);
  max-height: 240px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.cs-dropdown::-webkit-scrollbar { width: 4px; }
.cs-dropdown::-webkit-scrollbar-track { background: transparent; }
.cs-dropdown::-webkit-scrollbar-thumb { background: var(--cream-300, #e5e7eb); border-radius: 4px; }

/* ── Option ── */
.cs-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.875rem;
  cursor: pointer;
  transition: background 0.1s;
  font-size: 0.9375rem;
  color: var(--gray-700, #374151);
}

.cs-option--highlighted {
  background: var(--rose-50, #fff1f2);
  color: var(--rose-700, #be123c);
}

.cs-option--selected {
  background: var(--rose-50, #fff1f2);
  font-weight: 600;
  color: var(--rose-600, #e11d48);
}

.cs-option__name { font-weight: 500; }
.cs-option__sub {
  font-size: 0.75rem;
  color: var(--gray-400, #9ca3af);
}

/* ── Empty state ── */
.cs-empty {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1.5px solid var(--rose-400, #fb7185);
  border-top: none;
  border-bottom-left-radius: var(--radius-md, 0.5rem);
  border-bottom-right-radius: var(--radius-md, 0.5rem);
  padding: 0.875rem;
  font-size: 0.875rem;
  color: var(--gray-400, #9ca3af);
  text-align: center;
  z-index: 200;
}

/* ── Transitions ── */
.cs-drop-enter-active,
.cs-drop-leave-active { transition: opacity 0.15s, transform 0.15s; }
.cs-drop-enter-from,
.cs-drop-leave-to { opacity: 0; transform: translateY(-4px); }

.cs-slide-enter-active,
.cs-slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.cs-slide-enter-from,
.cs-slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>

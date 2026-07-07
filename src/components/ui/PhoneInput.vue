<template>
  <div
    class="phone-wrap"
    :class="{
      'phone-wrap--focused': focused,
      'phone-wrap--open':    open,
      'phone-wrap--error':   hasError,
    }"
    ref="wrapRef"
  >
    <!-- ── Trigger : drapeau + indicatif ── -->
    <button
      type="button"
      class="phone-trigger"
      @click="toggleDropdown"
      :tabindex="0"
      :aria-label="'Indicatif : ' + selected.dial"
    >
      <span class="phone-trigger__flag">{{ selected.flag }}</span>
      <span class="phone-trigger__code">{{ selected.dial }}</span>
      <svg
        class="phone-trigger__chevron"
        :class="{ 'phone-trigger__chevron--up': open }"
        width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>

    <!-- Séparateur vertical -->
    <span class="phone-sep"></span>

    <!-- ── Champ numéro ── -->
    <input
      ref="inputRef"
      :value="localNumber"
      type="tel"
      inputmode="numeric"
      class="phone-field"
      :placeholder="dynamicPlaceholder"
      :required="required"
      :disabled="disabled"
      :autocomplete="autocomplete"
      @focus="onFocus"
      @blur="onBlur"
      @keypress="onKeypress"
      @input="onInput"
    />

    <!-- ── Dropdown pays ── -->
    <Transition name="pd">
      <div v-if="open" class="phone-dropdown" role="listbox">
        <!-- Recherche -->
        <div class="phone-dropdown__search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref="searchRef"
            v-model="search"
            type="text"
            class="phone-dropdown__search-field"
            placeholder="Rechercher un pays…"
            @click.stop
          />
        </div>

        <!-- Liste -->
        <ul class="phone-dropdown__list">
          <li
            v-for="c in filtered"
            :key="c.code"
            class="phone-dropdown__item"
            :class="{ 'phone-dropdown__item--active': c.code === selected.code }"
            role="option"
            :aria-selected="c.code === selected.code"
            @click="selectCountry(c)"
          >
            <span class="phone-dropdown__item-flag">{{ c.flag }}</span>
            <span class="phone-dropdown__item-name">{{ c.name }}</span>
            <span class="phone-dropdown__item-dial">{{ c.dial }}</span>
          </li>
          <li v-if="filtered.length === 0" class="phone-dropdown__empty">Aucun résultat</li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

// ── Props / Emits ─────────────────────────────────────────────────────────────
const props = defineProps({
  modelValue:   { type: String, default: '' },
  placeholder:  { type: String, default: 'Ex. 07 00 00 00' },
  required:     { type: Boolean, default: false },
  disabled:     { type: Boolean, default: false },
  hasError:     { type: Boolean, default: false },
  autocomplete: { type: String, default: 'tel' },
  defaultCountry: { type: String, default: 'CI' },
})
const emit = defineEmits(['update:modelValue'])

// ── Données pays ──────────────────────────────────────────────────────────────
// `len` = nombre de chiffres nationaux attendus (sert de masque/limite).
const COUNTRIES = [
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', dial: '+225', len: 10 },
  { code: 'SN', name: 'Sénégal',       flag: '🇸🇳', dial: '+221', len: 9  },
  { code: 'ML', name: 'Mali',          flag: '🇲🇱', dial: '+223', len: 8  },
  { code: 'BF', name: 'Burkina Faso',  flag: '🇧🇫', dial: '+226', len: 8  },
  { code: 'GN', name: 'Guinée',        flag: '🇬🇳', dial: '+224', len: 9  },
  { code: 'TG', name: 'Togo',          flag: '🇹🇬', dial: '+228', len: 8  },
  { code: 'BJ', name: 'Bénin',         flag: '🇧🇯', dial: '+229', len: 10 },
  { code: 'GH', name: 'Ghana',         flag: '🇬🇭', dial: '+233', len: 9  },
  { code: 'NG', name: 'Nigeria',       flag: '🇳🇬', dial: '+234', len: 10 },
  { code: 'CM', name: 'Cameroun',      flag: '🇨🇲', dial: '+237', len: 9  },
  { code: 'MA', name: 'Maroc',         flag: '🇲🇦', dial: '+212', len: 9  },
  { code: 'DZ', name: 'Algérie',       flag: '🇩🇿', dial: '+213', len: 9  },
  { code: 'TN', name: 'Tunisie',       flag: '🇹🇳', dial: '+216', len: 8  },
  { code: 'FR', name: 'France',        flag: '🇫🇷', dial: '+33',  len: 9  },
  { code: 'BE', name: 'Belgique',      flag: '🇧🇪', dial: '+32',  len: 9  },
  { code: 'CH', name: 'Suisse',        flag: '🇨🇭', dial: '+41',  len: 9  },
  { code: 'DE', name: 'Allemagne',     flag: '🇩🇪', dial: '+49',  len: 11 },
  { code: 'GB', name: 'Royaume-Uni',   flag: '🇬🇧', dial: '+44',  len: 10 },
  { code: 'ES', name: 'Espagne',       flag: '🇪🇸', dial: '+34',  len: 9  },
  { code: 'IT', name: 'Italie',        flag: '🇮🇹', dial: '+39',  len: 10 },
  { code: 'PT', name: 'Portugal',      flag: '🇵🇹', dial: '+351', len: 9  },
  { code: 'CA', name: 'Canada',        flag: '🇨🇦', dial: '+1',   len: 10 },
  { code: 'US', name: 'États-Unis',    flag: '🇺🇸', dial: '+1',   len: 10 },
]

// ── État interne ──────────────────────────────────────────────────────────────
const wrapRef   = ref(null)
const inputRef  = ref(null)
const searchRef = ref(null)
const open      = ref(false)
const focused   = ref(false)
const search    = ref('')

const selected = ref(
  COUNTRIES.find(c => c.code === props.defaultCountry) ?? COUNTRIES[0]
)
const localNumber = ref('')

// ── Formatage / masque ────────────────────────────────────────────────────────
/** Chiffres bruts saisis (sans espaces ni indicatif). */
const digits = () => localNumber.value.replace(/\D/g, '')

/** Espace tous les 2 chiffres pour la lisibilité (ex. 07 00 00 00 00). */
function formatDisplay(d) {
  return d.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
}

/** Placeholder dynamique reflétant la longueur attendue du pays. */
const dynamicPlaceholder = computed(() => {
  const len = selected.value.len ?? 0
  return len ? formatDisplay('0'.repeat(len)) : props.placeholder
})

/** Valeur émise : "indicatif chiffres" (sans espaces). */
function currentEmit() {
  const d = digits()
  return d ? `${selected.value.dial} ${d}` : ''
}

// ── Initialisation à partir de modelValue ─────────────────────────────────────
function parseValue(val) {
  if (!val) { localNumber.value = ''; return }

  // Chercher l'indicatif le plus long en premier
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)
  for (const c of sorted) {
    if (val.startsWith(c.dial)) {
      selected.value    = c
      localNumber.value = formatDisplay(val.slice(c.dial.length).replace(/\D/g, '').slice(0, c.len ?? 15))
      return
    }
  }
  // Aucun indicatif reconnu → ne garder que les chiffres
  localNumber.value = formatDisplay(val.replace(/\D/g, ''))
}

onMounted(() => parseValue(props.modelValue))

watch(() => props.modelValue, (v) => {
  if (v !== currentEmit()) parseValue(v)
})

// ── Filtre pays ───────────────────────────────────────────────────────────────
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return COUNTRIES
  return COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.dial.includes(q) ||
    c.code.toLowerCase().includes(q)
  )
})

// ── Actions ───────────────────────────────────────────────────────────────────
/** Bloque toute touche non numérique (lettres, symboles). */
function onKeypress(e) {
  if (e.key && !/[0-9]/.test(e.key)) e.preventDefault()
}

/** Sanitize + limite à la longueur du pays + reformate. */
function onInput(e) {
  const max = selected.value.len ?? 15
  const d   = e.target.value.replace(/\D/g, '').slice(0, max)
  localNumber.value = formatDisplay(d)
  emit('update:modelValue', currentEmit())
}

async function toggleDropdown() {
  open.value = !open.value
  if (open.value) {
    search.value = ''
    await nextTick()
    searchRef.value?.focus()
  }
}

async function selectCountry(c) {
  selected.value = c
  // Re-limiter le numéro à la longueur du nouveau pays
  localNumber.value = formatDisplay(digits().slice(0, c.len ?? 15))
  open.value     = false
  search.value   = ''
  emit('update:modelValue', currentEmit())
  await nextTick()
  inputRef.value?.focus()
}

function onFocus()  { focused.value = true  }
function onBlur()   { focused.value = false }

// Fermer au clic extérieur
function onOutsideClick(e) {
  if (!wrapRef.value?.contains(e.target)) {
    open.value = false
  }
}
onMounted(()   => document.addEventListener('click', onOutsideClick))
onUnmounted(() => document.removeEventListener('click', onOutsideClick))
</script>

<style scoped>
/* ── Wrapper — reproduit exactement .input ── */
.phone-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--cream-300);
  background: var(--cream-50);
  font-size: 0.9375rem;
  color: var(--gray-800);
  transition:
    border-color var(--transition-fast),
    background   var(--transition-fast),
    box-shadow   var(--transition-fast);
  overflow: visible;   /* Pour le dropdown */
}

.phone-wrap:hover:not(.phone-wrap--focused) {
  border-color: var(--rose-200);
  background: #fff;
}
.phone-wrap--focused,
.phone-wrap--open {
  background: #fff;
  border-color: var(--rose-400);
  box-shadow: 0 0 0 3px rgba(232, 51, 109, 0.10);
}
.phone-wrap--error {
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.12);
}

/* ── Trigger (flag + code) ── */
.phone-trigger {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 6px 10px 14px;
  flex-shrink: 0;
  border-radius: var(--radius-full) 0 0 var(--radius-full);
  background: transparent;
  cursor: pointer;
  transition: background var(--transition-fast);
  white-space: nowrap;
  user-select: none;
}
.phone-trigger:hover {
  background: var(--rose-50);
}
.phone-trigger__flag {
  font-size: 1.125rem;
  line-height: 1;
}
.phone-trigger__code {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-700);
  letter-spacing: 0.01em;
}
.phone-trigger__chevron {
  color: var(--gray-400);
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}
.phone-trigger__chevron--up {
  transform: rotate(180deg);
}

/* ── Séparateur ── */
.phone-sep {
  width: 1px;
  height: 20px;
  background: var(--cream-300);
  flex-shrink: 0;
}

/* ── Champ numéro ── */
.phone-field {
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  color: var(--gray-800);
  font-family: inherit;
  line-height: 1.5;
}
/* Mobile : 16px pour empêcher le zoom auto d'iOS Safari au focus */
@media (max-width: 768px) {
  .phone-field { font-size: 16px; }
}
.phone-field::placeholder {
  color: var(--gray-400);
  font-style: italic;
  opacity: 1;
}
.phone-field:disabled {
  color: var(--gray-400);
  cursor: not-allowed;
}

/* ── Dropdown ── */
.phone-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 999;
  width: 280px;
  background: #fff;
  border: 1.5px solid var(--cream-200);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(232, 51, 109, 0.08);
  overflow: hidden;
}

/* Recherche */
.phone-dropdown__search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--cream-200);
  background: var(--cream-50);
}
.phone-dropdown__search svg {
  flex-shrink: 0;
  color: var(--gray-400);
}
.phone-dropdown__search-field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.8125rem;
  color: var(--gray-700);
  font-family: inherit;
}
.phone-dropdown__search-field::placeholder {
  color: var(--gray-400);
  font-style: italic;
}

/* Liste */
.phone-dropdown__list {
  max-height: 220px;
  overflow-y: auto;
  list-style: none;
  padding: var(--space-1) 0;
  scroll-behavior: smooth;
}
.phone-dropdown__list::-webkit-scrollbar { width: 4px; }
.phone-dropdown__list::-webkit-scrollbar-track { background: transparent; }
.phone-dropdown__list::-webkit-scrollbar-thumb {
  background: var(--cream-300);
  border-radius: 2px;
}

/* Item */
.phone-dropdown__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 14px;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.phone-dropdown__item:hover {
  background: var(--rose-50);
}
.phone-dropdown__item--active {
  background: var(--rose-50);
}
.phone-dropdown__item-flag {
  font-size: 1.125rem;
  flex-shrink: 0;
  line-height: 1;
}
.phone-dropdown__item-name {
  flex: 1;
  font-size: 0.8125rem;
  color: var(--gray-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.phone-dropdown__item--active .phone-dropdown__item-name {
  color: var(--rose-600);
  font-weight: 600;
}
.phone-dropdown__item-dial {
  font-size: 0.75rem;
  color: var(--gray-400);
  font-weight: 500;
  flex-shrink: 0;
}

.phone-dropdown__empty {
  padding: 12px 14px;
  font-size: 0.8125rem;
  color: var(--gray-400);
  text-align: center;
}

/* ── Transition dropdown ── */
.pd-enter-active, .pd-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.pd-enter-from, .pd-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>

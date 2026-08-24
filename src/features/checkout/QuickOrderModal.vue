<template>
  <Teleport to="body">
    <div class="qo-overlay" @click.self="$emit('close')">
      <div class="qo-card">

        <!-- ── Zone scrollable ── -->
        <div class="qo-body">

          <!-- ── Confirmation post-commande ────────────────────────────── -->
          <div v-if="confirmed" class="qo-confirmed">
            <div class="qo-confirmed__checkmark">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="28" fill="#dcfce7"/>
                <path d="M18 28l8 8 12-14" stroke="#15803d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 class="qo-confirmed__title">{{ $t('quickOrder.confirmedTitle') }}</h2>
            <p class="qo-confirmed__number">{{ $t('quickOrder.confirmedNumber') }} <strong>{{ confirmedOrder.number }}</strong></p>

            <!-- Paiement Wave : montant + bouton payer -->
            <div v-if="isWavePayment" class="qo-wave-box">
              <p class="qo-wave-box__label">{{ $t('quickOrder.wavePayLabel') }}</p>
              <p class="qo-wave-box__total">{{ $t('quickOrder.waveAmount') }} <strong>{{ fmtPrice(confirmedOrder.total) }}</strong></p>
              <p v-if="!wavePayUrl && waveNumber" class="qo-wave-box__number">{{ waveNumber }}</p>

              <a v-if="wavePayUrl" :href="wavePayUrl" target="_blank" rel="noopener" class="qo-wave-pay">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Payer {{ fmtPrice(confirmedOrder.total) }} avec Wave
              </a>
            </div>

            <!-- Étape 2 : envoyer la capture du paiement sur WhatsApp -->
            <a v-if="adminWhatsappLink" :href="adminWhatsappLink" target="_blank" rel="noopener"
              class="btn btn-whatsapp qo-wa-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {{ isWavePayment ? 'Envoyer la capture du paiement' : $t('quickOrder.whatsapp') }}
            </a>

            <!-- ── Widget complétion profil ──────────────────────── -->
            <div v-if="profileNudge" class="qo-nudge">
              <p class="qo-nudge__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                {{ profileNudge.title }}
              </p>
              <p class="qo-nudge__desc">{{ profileNudge.desc }}</p>

              <!-- Cas : compte rapide → ajouter email + mot de passe -->
              <form v-if="profileNudge.type === 'setup'" @submit.prevent="doSetup" class="qo-nudge__form">
                <input v-model="nudgeForm.email" type="email" class="input input--sm" placeholder="votre@email.com" required />
                <input v-model="nudgeForm.password" type="password" class="input input--sm" placeholder="Mot de passe (8 car. min)" required minlength="8" />
                <p v-if="nudgeError" class="qo-nudge__err">{{ nudgeError }}</p>
                <button type="submit" class="btn btn-primary btn-sm" :disabled="nudgeSaving">
                  <span v-if="nudgeSaving" class="qo-geo-spin"></span>
                  <span v-else>Sécuriser →</span>
                </button>
                <p v-if="nudgeSuccess" class="qo-nudge__ok">✓ {{ nudgeSuccess }}</p>
              </form>

              <!-- Cas : pas de téléphone → ajouter le numéro -->
              <form v-else-if="profileNudge.type === 'phone'" @submit.prevent="doSavePhone" class="qo-nudge__form">
                <PhoneInput v-model="nudgeForm.phone" placeholder="07 00 00 00 00" />
                <p v-if="nudgeError" class="qo-nudge__err">{{ nudgeError }}</p>
                <button type="submit" class="btn btn-primary btn-sm" :disabled="nudgeSaving">
                  <span v-if="nudgeSaving" class="qo-geo-spin"></span>
                  <span v-else>Enregistrer →</span>
                </button>
                <p v-if="nudgeSuccess" class="qo-nudge__ok">✓ {{ nudgeSuccess }}</p>
              </form>
            </div>

            <div class="qo-confirmed__actions">
              <button class="btn btn-primary" @click="viewOrder">{{ $t('quickOrder.viewOrder') }}</button>

              <!--
                La facture part par email, or une grande partie de la clientèle
                n'en a pas et ne va pas en créer un pour l'occasion. Le
                téléchargement direct est donc le seul chemin qui la lui remet
                vraiment, ici, tant qu'elle a la commande sous les yeux.
              -->
              <button class="btn btn-outline btn-sm" :disabled="downloadingInvoice" @click="downloadInvoice">
                <span v-if="downloadingInvoice" class="qo-geo-spin"></span>
                <span v-else>{{ $t('quickOrder.downloadInvoice') }}</span>
              </button>

              <button v-if="!profileNudge" class="btn btn-outline btn-sm" @click="goToProfile">{{ $t('quickOrder.secureAccount') }}</button>
            </div>
            <p v-if="invoiceError" class="qo-nudge__err">{{ invoiceError }}</p>
          </div>

          <!-- ── Formulaire commande rapide ────────────────────────────── -->
          <template v-else>
            <button class="qo-close" @click="$emit('close')" aria-label="Fermer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            <div class="qo-header">
              <span class="eyebrow">{{ $t('quickOrder.title') }}</span>
              <h2 class="qo-title">{{ $t('quickOrder.subtitle') }} <em>{{ $t('quickOrder.subtitleEm') }}</em> {{ $t('quickOrder.subtitleSuffix') }}</h2>
            </div>

            <div class="qo-items-summary">
              <span v-for="item in cartItems" :key="item.id" class="qo-item-chip">
                {{ item.product?.name ?? 'Produit' }} ×{{ item.quantity }}
              </span>
            </div>

            <!--
              novalidate : la validation est faite en JavaScript. Le navigateur
              refusait de soumettre à cause d'un champ « commune » requis mais
              masqué, qu'il ne pouvait ni signaler ni focaliser — le clic sur
              « Commander » ne produisait alors strictement rien.
            -->
            <form id="qo-form" ref="formEl" novalidate @submit.prevent="submit" class="qo-form">
              <div class="qo-field" data-field="name">
                <div class="qo-field-head">
                  <label class="label">{{ $t('quickOrder.name') }} *</label>
                  <span v-if="prefilled.name" class="qo-prefilled-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Profil
                  </span>
                </div>
                <input
                  v-model="form.name"
                  type="text"
                  class="input"
                  :class="{ 'input--prefilled': prefilled.name, 'input--error': fieldErrors.name }"
                  :aria-invalid="!!fieldErrors.name"
                  :placeholder="$t('quickOrder.namePlaceholder')"
                />
                <p v-if="fieldErrors.name" class="qo-required">{{ $t('quickOrder.required') }}</p>
              </div>

              <div class="qo-field" data-field="phone">
                <div class="qo-field-head">
                  <label class="label">{{ $t('quickOrder.phone') }} *</label>
                  <span v-if="prefilled.phone" class="qo-prefilled-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Profil
                  </span>
                </div>
                <PhoneInput
                  v-model="form.phone"
                  placeholder="07 00 00 00 00"
                  :required="true"
                  :has-error="!!fieldErrors.phone"
                  :class="{ 'input--prefilled': prefilled.phone }"
                />
                <p v-if="fieldErrors.phone" class="qo-required">{{ $t('quickOrder.required') }}</p>
              </div>

              <div class="qo-field">
                <div class="qo-field-head">
                  <label class="label">
                    {{ $t('quickOrder.email') }} <span class="qo-optional">({{ $t('quickOrder.emailOptional') }})</span>
                  </label>
                  <span v-if="prefilled.email" class="qo-prefilled-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Profil
                  </span>
                </div>
                <input v-model="form.email" type="email" class="input" :class="{ 'input--prefilled': prefilled.email }" :placeholder="$t('quickOrder.emailPlaceholder')" />
              </div>

              <div class="qo-field" data-field="commune">
                <div class="qo-field-head">
                  <label class="label">{{ $t('quickOrder.commune') }} *</label>
                  <button
                    type="button"
                    class="qo-geo-btn"
                    :class="`qo-geo-btn--${qoGeoState}`"
                    :disabled="qoGeoState === 'loading'"
                    @click="doQoGeo"
                  >
                    <span v-if="qoGeoState === 'loading'" class="qo-geo-spin"></span>
                    <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                    </svg>
                    <span>{{ qoGeoLabel }}</span>
                  </button>
                </div>
                <!--
                  Destination affichée en premier, et non plus cachée au fond
                  de la liste des communes : personne ne cherche une adresse
                  « hors Abidjan » sous treize communes d'Abidjan. Abidjan
                  reste présélectionné, la majorité des clientes ne perd donc
                  aucun geste.
                -->
                <div class="qo-dest" role="radiogroup" aria-label="Destination de livraison">
                  <button
                    v-for="d in DESTINATIONS"
                    :key="d.value"
                    type="button"
                    class="qo-dest__btn"
                    :class="{ 'qo-dest__btn--active': destination === d.value }"
                    role="radio"
                    :aria-checked="destination === d.value"
                    @click="destination = d.value"
                  >
                    <span class="qo-dest__icon" v-html="d.icon"></span>
                    <span class="qo-dest__label">{{ d.label }}</span>
                  </button>
                </div>

                <!-- Combobox searchable — communes d'Abidjan uniquement -->
                <div v-if="destination === 'abidjan'" class="qo-combobox" v-click-outside="closeCommune">
                  <div
                    class="qo-combobox__trigger"
                    :class="{ 'qo-combobox__trigger--error': fieldErrors.commune }"
                    tabindex="0"
                    role="combobox"
                    :aria-expanded="communeOpen"
                    :aria-invalid="!!fieldErrors.commune"
                    @click="openCommune"
                    @keydown.enter.prevent="openCommune"
                    @keydown.space.prevent="openCommune"
                  >
                    <span v-if="communeDisplay" class="qo-combobox__value">{{ communeDisplay }}</span>
                    <span v-else class="qo-combobox__placeholder">{{ $t('quickOrder.communePlaceholder') }}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="qo-combobox__arrow" :class="{ 'qo-combobox__arrow--open': communeOpen }">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>

                  <div v-if="communeOpen" class="qo-combobox__dropdown">
                    <input
                      ref="communeSearchInput"
                      v-model="communeSearch"
                      type="text"
                      class="qo-combobox__search"
                      placeholder="Rechercher..."
                      @click.stop
                      @keydown.enter.prevent="onCommuneEnter"
                      @keydown.esc.prevent="closeCommune"
                    />
                    <ul class="qo-combobox__list">
                      <li
                        v-for="c in filteredCommunes"
                        :key="c"
                        class="qo-combobox__option"
                        :class="{ 'qo-combobox__option--active': form.commune === c }"
                        @click="selectCommune(c)"
                      >{{ c }}</li>
                      <li class="qo-combobox__option qo-combobox__option--other" @click="selectCommune('__autre__')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Saisir manuellement
                      </li>
                      <li v-if="filteredCommunes.length === 0 && communeSearch" class="qo-combobox__empty">
                        Aucun résultat
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Saisie manuelle si "Autre" -->
                <input
                  v-if="destination === 'abidjan' && form.commune === '__autre__'"
                  v-model="form.communeManuel"
                  type="text"
                  class="input qo-commune-manuel"
                  :class="{ 'input--error': fieldErrors.commune }"
                  :aria-invalid="!!fieldErrors.commune"
                  placeholder="Ex : Koumassi extension, Songon Agban..."
                />

                <p v-if="fieldErrors.commune" class="qo-required">{{ $t('quickOrder.required') }}</p>

                <p v-if="qoGeoMsg" class="qo-geo-msg" :class="`qo-geo-msg--${qoGeoState}`">{{ qoGeoMsg }}</p>
              </div>

              <!-- Ville obligatoire hors Abidjan -->
              <div v-if="showCityField" class="qo-field" data-field="city">
                <label class="label">Ville *</label>
                <!--
                  Liste fermée et non plus saisie libre : une ville mal
                  orthographiée ne se rattache à aucune zone de livraison, et
                  les frais deviennent alors « à renseigner par nos agents ».
                -->
                <select
                  v-model="form.city"
                  class="input"
                  :class="{ 'input--error': fieldErrors.city }"
                  :aria-invalid="!!fieldErrors.city"
                >
                  <option value="" disabled>Choisir votre ville…</option>
                  <option v-for="name in citySuggestions" :key="name" :value="name">{{ name }}</option>
                </select>
                <p v-if="fieldErrors.city" class="qo-required">{{ $t('quickOrder.required') }}</p>
                <p class="qo-city-hint">Toutes les villes de Côte d'Ivoire desservies, hors Abidjan.</p>
              </div>

              <!-- Bannière hors Abidjan -->
              <div v-if="showCityField" class="qo-outzone">
                <span class="qo-outzone__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <div>
                  <strong>Livraison hors Abidjan</strong>
                  <p>Commande à <b>régler d'avance</b> (Wave ou Orange Money) : nous n'expédions hors Abidjan que les commandes <b>déjà payées</b>. Le paiement à la livraison est réservé à Abidjan.</p>
                </div>
              </div>

              <div class="qo-field">
                <label class="label">
                  {{ $t('quickOrder.indication') }} <span class="qo-optional">({{ $t('quickOrder.indicationOptional') }})</span>
                </label>
                <textarea
                  v-model="form.indication"
                  class="input qo-indication"
                  rows="2"
                  :placeholder="$t('quickOrder.indicationPlaceholder')"
                />
              </div>

              <div class="qo-field" data-field="payment">
                <label class="label">{{ $t('quickOrder.payment') }} *</label>
                <div class="qo-payments" :class="{ 'qo-payments--error': fieldErrors.payment }">
                  <label v-for="pm in paymentMethods" :key="pm.value"
                    class="qo-payment" :class="{ 'qo-payment--active': form.payment === pm.value }">
                    <input type="radio" :value="pm.value" v-model="form.payment" />
                    <span class="qo-payment__icon" v-html="pm.icon"></span>
                    <span class="qo-payment__label">{{ pm.label }}</span>
                  </label>
                </div>
                <p v-if="fieldErrors.payment" class="qo-required">{{ $t('quickOrder.required') }}</p>
              </div>

              <div class="qo-field">
                <label class="label">{{ $t('quickOrder.note') }} <span class="qo-optional">({{ $t('quickOrder.noteOptional') }})</span></label>
                <input v-model="form.note" type="text" class="input" :placeholder="$t('quickOrder.notePlaceholder')" />
              </div>

              <p v-if="error" class="qo-error">{{ error }}</p>
            </form>

            <!--
              Sortie de secours vers le panier classique. Elle occupait une
              ligne entière du pied collant, en permanence, pour un usage rare :
              elle vit maintenant à la fin du formulaire, là où on la cherche.
            -->
            <RouterLink :to="{ name: 'checkout' }" class="qo-checkout-link" @click="$emit('close')">
              Voir mon panier →
            </RouterLink>
          </template>

        </div>
        <!-- fin .qo-body -->

        <!--
          Pied collant : montant à gauche, action à droite, sur une seule
          ligne. Le montant est une information, pas une commande — lui donner
          toute la largeur revenait à voler une ligne au formulaire, sur
          l'écran où il y en a le moins.
        -->
        <div v-if="!confirmed" class="qo-footer">
          <div class="qo-total">
            <span>Total</span>
            <strong>{{ fmtPrice(cartTotal) }}</strong>
          </div>
          <button
            type="submit"
            form="qo-form"
            class="btn btn-primary qo-submit"
            :disabled="submitting"
          >
            <span v-if="submitting" class="qo-spinner"></span>
            <span v-else>{{ $t('quickOrder.submit') }}</span>
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCurrencyStore } from '@/stores/currency'
import { useRouter } from 'vue-router'
import api from '@/api'
import { useCartStore } from '@/features/cart/cart.store'
import { isAbidjan, citiesCI } from '@/data/cities-ci'
import { reverseGeocodeCI, getCurrentPosition, geoErrorMessage } from '@/composables/useGeolocation.js'
import { useAuthStore } from '@/features/auth/auth.store'
import { useSettingsStore } from '@/stores/settings'
import PhoneInput from '@/components/ui/PhoneInput.vue'

const emit   = defineEmits(['close'])
const router = useRouter()

const { t } = useI18n()

const cartStore     = useCartStore()
const authStore     = useAuthStore()
const settingsStore = useSettingsStore()

const cartItems  = computed(() => cartStore.items)
const cartTotal  = computed(() => cartStore.total)
const waveNumber = computed(() => settingsStore.paymentMobileNumber.value)

// Déclaré tôt : de nombreux computeds/watchers dépendent de `form`
const prefilled = ref({ name: false, phone: false, email: false })
const form = ref({
  name: '',
  phone: '',
  email: '',
  commune: '',
  communeManuel: '',
  city: '',
  indication: '',
  payment: 'wave',
  note: '',
})

const adminWhatsappLink = computed(() => {
  const order = confirmedOrder.value
  if (!order) return null
  const adminNumber = settingsStore.whatsappNumber?.value
  if (!adminNumber) return null

  const phone = form.value.phone
  const methodMap = { wave: 'Wave', orange_money: 'Orange Money', delivery: 'À la livraison' }
  const method = methodMap[form.value.payment] ?? form.value.payment

  const msg = [
    `🌹 Nouvelle commande Rosa Beauty Facial Care`,
    `N°: ${order.number}`,
    `Client: ${form.value.name} (${phone})`,
    showCityField.value ? `Ville: ${form.value.city.trim()} (hors Abidjan)` : null,
    `Commune: ${effectiveCommune.value}`,
    form.value.indication?.trim() ? `📍 Indication: ${form.value.indication.trim()}` : null,
    `Paiement: ${method}`,
    `Total: ${fmtPrice(order.total)}`,
    isWavePayment.value ? `\n📸 Je vous envoie la capture du paiement Wave.` : null,
    form.value.note ? `📝 Note: ${form.value.note}` : null,
    ``,
    `Répondre au client sur ce numéro: ${phone}`,
  ].filter(l => l !== null).join('\n')

  const clean = adminNumber.replace(/\D/g, '')
  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`
})

// « Hors Abidjan » n'y figure plus : c'est devenu un choix de destination à
// part entière, au-dessus de la liste. Le reste du code continue d'utiliser
// cette valeur comme commune, la géolocalisation comprise.
const COMMUNES = [
  'Abobo', 'Adjamé', 'Anyama', 'Attécoubé', 'Bingerville',
  'Cocody', 'Koumassi', 'Marcory', 'Plateau', 'Port-Bouët',
  'Songon', 'Treichville', 'Yopougon',
]

// ── Combobox commune ──────────────────────────────────────────────────────────
const communeOpen        = ref(false)
const communeSearch      = ref('')
const communeSearchInput = ref(null)

const filteredCommunes = computed(() => {
  const q = communeSearch.value.trim().toLowerCase()
  if (!q) return COMMUNES
  return COMMUNES.filter(c => c.toLowerCase().includes(q))
})

const communeDisplay = computed(() => {
  if (!form.value.commune) return ''
  if (form.value.commune === '__autre__') return form.value.communeManuel || 'Saisie manuelle'
  return form.value.commune
})

const effectiveCommune = computed(() =>
  form.value.commune === '__autre__' ? form.value.communeManuel : form.value.commune
)

// ── Détection hors Abidjan (commande rapide) ─────────────────────────────────
const isAbidjanQuick = computed(() => {
  const c = form.value.commune
  if (!c) return true // rien choisi encore → on n'alarme pas
  if (c === 'Hors Abidjan') return false
  const val = (effectiveCommune.value || '').trim()
  if (/hors\s*abidjan/i.test(val)) return false
  return isAbidjan(val, val)
})

// Champ Ville + bannière : affichés dès qu'on est hors Abidjan
const showCityField = computed(() => !!form.value.commune && !isAbidjanQuick.value)

// Villes hors Abidjan proposées dans la liste, triées alphabétiquement
const citySuggestions = citiesCI
  .filter(c => c.name !== 'Abidjan')
  .map(c => c.name)
  .sort((a, b) => a.localeCompare(b, 'fr'))


async function openCommune() {
  communeOpen.value  = true
  communeSearch.value = ''
  await nextTick()
  communeSearchInput.value?.focus()
}
function closeCommune() { communeOpen.value = false }
function selectCommune(c) {
  form.value.commune = c
  if (c !== '__autre__') form.value.communeManuel = ''
  communeOpen.value = false
}

// Entrée : sélectionne le 1er résultat, sinon bascule en saisie manuelle pré-remplie
function onCommuneEnter() {
  if (filteredCommunes.value.length) {
    selectCommune(filteredCommunes.value[0])
  } else if (communeSearch.value.trim()) {
    form.value.communeManuel = communeSearch.value.trim()
    selectCommune('__autre__')
  }
}

// Directive v-click-outside (inline)
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => { if (!el.contains(e.target)) binding.value(e) }
    document.addEventListener('mousedown', el._clickOutside)
  },
  unmounted(el) { document.removeEventListener('mousedown', el._clickOutside) },
}

// ── Géolocalisation (commande rapide) ────────────────────────────────────────
// 'idle' | 'loading' | 'success' | 'error' | 'outside'
const qoGeoState = ref('idle')
const qoGeoMsg   = ref('')

const qoGeoLabel = computed(() => ({
  idle:    t('geo.btnIdle'),
  loading: t('geo.btnLoading'),
  success: t('geo.btnSuccess'),
  error:   t('geo.btnError'),
  outside: t('geo.btnOutsideCI'),
}[qoGeoState.value] ?? t('geo.btnIdle')))

function normQo(s) {
  return (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[-\s]/g, '').trim()
}

async function doQoGeo() {
  qoGeoState.value = 'loading'
  qoGeoMsg.value   = ''
  try {
    const pos    = await getCurrentPosition()
    const result = await reverseGeocodeCI(pos.coords.latitude, pos.coords.longitude)

    // Pré-remplit l'indication (rue + repères) si le champ est vide
    const fillIndication = (extra = []) => {
      const parts = [...extra, result.road].filter(Boolean)
      if (parts.length && !form.value.indication.trim()) {
        form.value.indication = parts.join(', ')
      }
    }

    // ── 1) Hors Côte d'Ivoire ────────────────────────────────────────────────
    if (!result.inCI) {
      form.value.commune = 'Hors Abidjan'           // → affiche le champ Ville
      if (result.cityName) form.value.city = result.cityName
      fillIndication([result.region])
      qoGeoState.value = 'outside'
      qoGeoMsg.value = result.cityName
        ? `Position hors Côte d'Ivoire : ${result.cityName}. Vérifiez et complétez votre adresse.`
        : `Position hors Côte d'Ivoire. Renseignez votre ville manuellement.`
      return
    }

    const cityName        = result.city?.name ?? ''
    const detectedCommune = result.commune ?? ''

    // Cette commune correspond-elle à une commune d'Abidjan de notre liste ?
    const communeMatch = detectedCommune
      ? (COMMUNES.find(c => normQo(c) === normQo(detectedCommune))
         ?? COMMUNES.find(c => normQo(c).includes(normQo(detectedCommune)) || normQo(detectedCommune).includes(normQo(c))))
      : null
    const abidjanCommune = communeMatch && communeMatch !== 'Hors Abidjan' ? communeMatch : null
    const isAbj = cityName.toLowerCase() === 'abidjan' || !!abidjanCommune

    // ── 2) Abidjan : remplir la commune ──────────────────────────────────────
    if (isAbj) {
      if (abidjanCommune) {
        form.value.commune = abidjanCommune
        fillIndication()
        qoGeoState.value = 'success'
        qoGeoMsg.value   = t('geo.communeFound', { commune: abidjanCommune })
        setTimeout(() => { qoGeoMsg.value = '' }, 6000)
      } else {
        // Abidjan détecté mais commune non identifiée → on laisse la main
        qoGeoState.value = 'outside'
        qoGeoMsg.value   = "Abidjan détecté, mais commune non identifiée. Sélectionnez-la ci-dessus."
      }
      return
    }

    // ── 3) Côte d'Ivoire, hors Abidjan : remplir ville + indication ──────────
    form.value.commune = 'Hors Abidjan'             // → affiche le champ Ville, force le prépaiement
    if (cityName) form.value.city = cityName
    fillIndication([detectedCommune])
    qoGeoState.value = 'success'
    qoGeoMsg.value = cityName
      ? `Ville détectée : ${cityName} (hors Abidjan). Vérifiez votre adresse ci-dessous.`
      : "Position hors Abidjan détectée. Renseignez votre ville ci-dessous."
    setTimeout(() => { qoGeoMsg.value = '' }, 8000)

  } catch (err) {
    qoGeoState.value = 'error'
    qoGeoMsg.value   = geoErrorMessage(err.code)
  }
}

const ICON_MOBILE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>'
const ICON_TRUCK  = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'

const ICON_CITY = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l5-4v18"/><path d="M19 21V11l-9-4"/><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/></svg>'

const DESTINATIONS = [
  { value: 'abidjan',  label: 'Abidjan',      icon: ICON_CITY },
  { value: 'interior', label: 'Hors Abidjan', icon: ICON_TRUCK },
]

/*
 * Destination et commune restent synchronisées dans les deux sens : le bouton
 * écrit la commune, et la géolocalisation écrit `form.commune` directement —
 * une position détectée à Bouaké doit donc allumer « Hors Abidjan » sans que
 * personne n'y touche.
 */
const destination = ref('abidjan')

watch(destination, (d) => {
  if (d === 'interior') {
    form.value.commune = 'Hors Abidjan'
    form.value.communeManuel = ''
    return
  }
  if (form.value.commune === 'Hors Abidjan') {
    form.value.commune = ''
    form.value.city = ''
  }
})

watch(() => form.value.commune, (c) => {
  if (c === 'Hors Abidjan') destination.value = 'interior'
  else if (c) destination.value = 'abidjan'
})

/**
 * Moyens de paiement selon la destination — miroir de PaymentAvailability,
 * que le serveur applique de son côté (QuickOrderController).
 *   Abidjan            → paiement à la livraison uniquement
 *   Intérieur de la CI → prépaiement Wave ou Orange Money
 * (la commande rapide est réservée à la Côte d'Ivoire : pas d'international)
 */
const paymentMethods = computed(() => {
  if (isAbidjanQuick.value) {
    return [{ value: 'delivery', label: t('quickOrder.payDelivery'), icon: ICON_TRUCK }]
  }

  return [
    { value: 'wave',         label: t('quickOrder.payWave'),        icon: ICON_MOBILE },
    { value: 'orange_money', label: t('quickOrder.payOrangeMoney'), icon: ICON_MOBILE },
  ]
})

// La destination change → un moyen devenu invalide ne doit pas rester coché.
watch(paymentMethods, (methods) => {
  if (!methods.some(m => m.value === form.value.payment)) {
    form.value.payment = methods[0]?.value ?? ''
  }
}, { immediate: true })

// Pré-remplir depuis le profil si l'utilisateur est connecté
onMounted(() => {
  const u = authStore.user
  if (!u) return
  if (u.name) { form.value.name = u.name; prefilled.value.name = true }
  if (u.phone) { form.value.phone = u.phone; prefilled.value.phone = true }
  if (u.email && !u.is_generated_email) { form.value.email = u.email; prefilled.value.email = true }
})

const submitting     = ref(false)
const error          = ref('')
const confirmed      = ref(false)
const confirmedOrder = ref(null)

// ── Facture téléchargeable ────────────────────────────────────────────────────
const downloadingInvoice = ref(false)
const invoiceError       = ref('')

/**
 * Récupère le PDF et le remet au visiteur.
 *
 * Même endpoint que le détail de commande côté client : la facture est
 * identique des deux côtés, et un second générateur finirait par diverger.
 * L'échec est dit à voix haute — la page de confirmation ne revient jamais,
 * et un téléchargement raté en silence perdrait la facture pour de bon.
 */
async function downloadInvoice() {
  const numero = confirmedOrder.value?.number
  if (!numero) return

  downloadingInvoice.value = true
  invoiceError.value = ''

  try {
    const response = await api.get(`/orders/${numero}/invoice`, { responseType: 'blob' })

    const url  = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href     = url
    link.download = `facture-${numero}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch {
    invoiceError.value = "La facture n'a pas pu être téléchargée. Réessayez, ou retrouvez-la dans le détail de votre commande."
  } finally {
    downloadingInvoice.value = false
  }
}

// ── Validation des champs requis ──────────────────────────────────────────────
//
// Faite ici plutôt que par l'attribut `required` du navigateur : la commune est
// un combobox, donc un `<div>`, que la validation native ne sait pas contrôler.
// Le contournement précédent — un `<input required>` en `display:none` — rendait
// le formulaire insoumettable *et* muet, puisqu'un champ masqué ne peut pas
// recevoir le focus ni afficher son message.

const formEl      = ref(null)
const fieldErrors = ref({})

/** Champs requis, dans l'ordre d'affichage : le premier en défaut prend le focus. */
function requiredFields() {
  return [
    { key: 'name',    ok: () => !!form.value.name.trim() },
    { key: 'phone',   ok: () => !!form.value.phone.trim() },
    { key: 'commune', ok: () => !!effectiveCommune.value.trim() },
    // La ville n'est demandée qu'en dehors d'Abidjan.
    { key: 'city',    ok: () => !showCityField.value || !!form.value.city.trim() },
    { key: 'payment', ok: () => !!form.value.payment },
  ]
}

/**
 * Amène le champ fautif sous les yeux, puis dans le focus.
 *
 * La modal défile : un champ signalé en rouge hors de l'écran ne vaut pas mieux
 * qu'un silence. Le combobox n'étant pas un champ natif, on ouvre sa liste dans
 * la foulée — c'est le geste que la cliente allait faire de toute façon.
 */
function focusField(key) {
  const root = formEl.value?.querySelector(`[data-field="${key}"]`)
  if (!root) return

  root.scrollIntoView({ block: 'center', behavior: 'smooth' })

  if (key === 'commune') {
    const manuel = root.querySelector('.qo-commune-manuel')
    if (manuel) { manuel.focus(); return }
    root.querySelector('.qo-combobox__trigger')?.focus()
    openCommune()
    return
  }

  root.querySelector('input, textarea, select')?.focus()
}

/** Renseigne `fieldErrors` et renvoie la clé du premier champ manquant. */
function validateRequired() {
  const manquants = requiredFields().filter(f => !f.ok())

  fieldErrors.value = Object.fromEntries(manquants.map(f => [f.key, true]))

  return manquants[0]?.key ?? null
}

// Un champ corrigé perd son signalement immédiatement : garder le rouge pendant
// que la cliente tape donnerait l'impression que sa saisie n'est pas prise.
watch(form, () => {
  if (!Object.keys(fieldErrors.value).length) return

  const encoreEnDefaut = requiredFields().filter(f => !f.ok()).map(f => f.key)
  fieldErrors.value = Object.fromEntries(encoreEnDefaut.map(k => [k, true]))

  if (!encoreEnDefaut.length && error.value) error.value = ''
}, { deep: true })

// ── Nudge complétion profil (post-commande) ───────────────────────────────
const nudgeForm    = ref({ email: '', password: '', phone: '' })
const nudgeSaving  = ref(false)
const nudgeError   = ref('')
const nudgeSuccess = ref('')
const nudgeDone    = ref(false)

const profileNudge = computed(() => {
  if (!confirmed.value || nudgeDone.value) return null
  const u = authStore.user
  if (!u) return null
  if (u.is_generated_email) {
    return {
      type:  'setup',
      title: 'Sécurisez votre compte',
      desc:  'Ajoutez votre email et un mot de passe pour retrouver vos commandes depuis n\'importe quel appareil.',
    }
  }
  if (!u.phone) {
    return {
      type:  'phone',
      title: 'Ajoutez votre numéro',
      desc:  'Enregistrez votre numéro pour un suivi de commande plus rapide.',
    }
  }
  return null
})

async function doSetup() {
  nudgeSaving.value = true
  nudgeError.value  = ''
  try {
    await authStore.setupAccount({
      email:                 nudgeForm.value.email,
      password:              nudgeForm.value.password,
      password_confirmation: nudgeForm.value.password,
    })
    nudgeSuccess.value = 'Compte sécurisé ! Vous pouvez maintenant vous connecter avec votre email.'
    nudgeDone.value = true
  } catch (e) {
    const errs = e.response?.data?.errors
    nudgeError.value = errs ? Object.values(errs).flat()[0] : (e.response?.data?.message ?? 'Une erreur est survenue.')
  } finally {
    nudgeSaving.value = false
  }
}

async function doSavePhone() {
  if (!nudgeForm.value.phone) return
  nudgeSaving.value = true
  nudgeError.value  = ''
  try {
    await authStore.updateInfo({ phone: nudgeForm.value.phone })
    nudgeSuccess.value = 'Numéro enregistré !'
    nudgeDone.value = true
  } catch (e) {
    nudgeError.value = e.response?.data?.message ?? 'Une erreur est survenue.'
  } finally {
    nudgeSaving.value = false
  }
}

const isWavePayment = computed(() =>
  confirmedOrder.value && (confirmedOrder.value?.payments?.[0]?.provider === 'wave' || form.value.payment === 'wave')
)

// Lien « Payer avec Wave » : lien marchand + montant en paramètre
const wavePayUrl = computed(() => {
  const base = (settingsStore.paymentWaveLink?.value || '').trim()
  if (!base || !isWavePayment.value || !confirmedOrder.value) return null
  const amount = Math.round(Number(confirmedOrder.value.total) || 0)
  if (!amount) return base
  const sep = base.includes('?')
    ? (base.endsWith('?') || base.endsWith('&') ? '' : '&')
    : '?'
  return `${base}${sep}amount=${amount}`
})

async function submit() {
  // Un `return` nu ici laissait la cliente devant un bouton sans effet.
  const premierManquant = validateRequired()
  if (premierManquant) {
    error.value = t('quickOrder.requiredSummary')
    await nextTick()
    focusField(premierManquant)
    return
  }

  submitting.value = true
  error.value = ''

  const items = cartItems.value.map(i => ({
    product_id: i.product_id,
    variant_id: i.variant_id ?? null,
    quantity:   i.quantity,
  }))

  if (!items.length) {
    error.value = t('quickOrder.emptyCart')
    submitting.value = false
    return
  }

  try {
    const { data } = await api.post('/quick-order', {
      name:           form.value.name,
      phone:          form.value.phone,
      email:          form.value.email?.trim() || null,
      commune:        effectiveCommune.value,
      city:           isAbidjanQuick.value ? 'Abidjan' : (form.value.city.trim() || null),
      landmark:       form.value.indication?.trim() || null,
      payment_method: form.value.payment,
      note:           form.value.note || null,
      items,
    })

    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token)
      await authStore.fetchUser()
    }

    cartStore.clear()

    if (data.payment_url) {
      window.location.href = data.payment_url
      return
    }

    confirmedOrder.value = data
    confirmed.value = true

  } catch (e) {
    error.value = e.response?.data?.message ?? t('quickOrder.errorOccurred')
  } finally {
    submitting.value = false
  }
}

function viewOrder() {
  emit('close')
  router.push({ name: 'order', params: { number: confirmedOrder.value?.number } })
}

function goToProfile() {
  emit('close')
  router.push({ name: 'profile' })
}

function fmtPrice(val) {
  return useCurrencyStore().format(val ?? 0)
}
</script>

<style scoped>
/* ── Overlay ── */
.qo-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

/* ── Card : flex column, overflow hidden ── */
.qo-card {
  background: #fff;
  border-radius: var(--radius-2xl, 20px);
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-shadow: 0 24px 64px rgba(0,0,0,.18);
}

/* ── Zone scrollable : tout sauf le footer ── */
.qo-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: var(--space-7) var(--space-6) var(--space-4);
}

/* ── Footer collé en bas : total + bouton ── */
.qo-footer {
  flex-shrink: 0;
  padding: var(--space-3) var(--space-6);
  border-top: 1px solid var(--cream-200);
  background: #fff;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  /* Ombre vers le haut pour signaler que ça scrolle */
  box-shadow: 0 -6px 16px rgba(0,0,0,.06);
}

/* ── Bouton fermer ── */
.qo-close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--cream-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
  transition: all var(--transition-fast);
  z-index: 2;
}
.qo-close:hover { background: var(--rose-100); color: var(--rose-500); }

/* ── Header ── */
.qo-header { margin-bottom: var(--space-4); }
.qo-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--gray-800);
  margin: var(--space-1) 0 var(--space-2);
}
.qo-title em { font-style: italic; color: var(--rose-500); }
.qo-subtitle { font-size: 0.875rem; color: var(--gray-400); }

/* ── Items résumé ── */
.qo-items-summary {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}
.qo-item-chip {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 10px;
  background: var(--rose-50);
  color: var(--rose-600);
  border-radius: var(--radius-full);
  border: 1px solid var(--rose-100);
}

/* ── Formulaire ── */
.qo-form { display: flex; flex-direction: column; gap: var(--space-4); }
.qo-field { display: flex; flex-direction: column; gap: var(--space-1); }
.qo-optional { font-size: 0.75rem; color: var(--gray-400); font-weight: 400; }
.qo-indication { resize: none; min-height: 52px; line-height: 1.5; }

.qo-city-hint {
  margin-top: 5px;
  font-size: 0.75rem;
  color: var(--gray-400);
  line-height: 1.4;
}

/* Bannière hors Abidjan (commande rapide) */
.qo-outzone {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-lg, 12px);
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border: 1.5px solid #fdba74;
}
.qo-outzone__icon {
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #fed7aa;
  color: #c2410c;
}
.qo-outzone strong {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: #9a3412;
  margin-bottom: 2px;
}
.qo-outzone p {
  margin: 0;
  font-size: 0.78125rem;
  line-height: 1.45;
  color: #b45309;
}
.qo-outzone b { color: #9a3412; font-weight: 700; }

/* ── Combobox commune ── */
.qo-combobox { position: relative; }

.qo-combobox__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: 10px 14px;
  border: 1.5px solid var(--cream-300);
  border-radius: var(--radius-md);
  background: #fff;
  cursor: pointer;
  font-size: 0.9375rem;
  transition: border-color var(--transition-fast);
  min-height: 44px;
}
.qo-combobox__trigger:hover { border-color: var(--gray-300); }

.qo-combobox__value { color: var(--gray-800); flex: 1; }
.qo-combobox__placeholder { color: var(--gray-400); flex: 1; font-size: 0.875rem; }

.qo-combobox__arrow {
  flex-shrink: 0;
  color: var(--gray-400);
  transition: transform 0.2s ease;
}
.qo-combobox__arrow--open { transform: rotate(180deg); }

.qo-combobox__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  background: #fff;
  border: 1.5px solid var(--cream-300);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0,0,0,.12);
  z-index: 50;
  overflow: hidden;
}

.qo-combobox__search {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border: none;
  border-bottom: 1px solid var(--cream-200);
  font-size: 0.875rem;
  outline: none;
  background: var(--cream-50);
}
.qo-combobox__search::placeholder { color: var(--gray-400); }

.qo-combobox__list {
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
  padding: var(--space-1) 0;
}

.qo-combobox__option {
  padding: 9px 14px;
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--gray-700);
  transition: background var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.qo-combobox__option:hover { background: var(--cream-50); }
.qo-combobox__option--active {
  background: var(--rose-50);
  color: var(--rose-600);
  font-weight: 500;
}
.qo-combobox__option--other {
  color: var(--gray-500);
  border-top: 1px solid var(--cream-100);
  margin-top: var(--space-1);
  font-style: italic;
}
.qo-combobox__option--other:hover { background: var(--cream-100); color: var(--gray-700); }

.qo-combobox__empty {
  padding: 10px 14px;
  font-size: 0.8125rem;
  color: var(--gray-400);
  text-align: center;
}

.qo-commune-manuel {
  margin-top: var(--space-2);
}

/* ── Géo dans QO ── */
.qo-field-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.qo-geo-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 3px 8px 3px 6px;
  border-radius: var(--radius-full, 999px);
  border: 1.5px solid var(--rose-200);
  background: var(--rose-50);
  color: var(--rose-600);
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1;
  white-space: nowrap;
}
.qo-geo-btn:hover:not(:disabled) {
  background: var(--rose-100);
  border-color: var(--rose-300);
}
.qo-geo-btn:disabled { opacity: 0.6; cursor: default; }
.qo-geo-btn--success { background: #dcfce7; border-color: #86efac; color: #15803d; }
.qo-geo-btn--outside { background: #fef9c3; border-color: #fde047; color: #854d0e; }
.qo-geo-btn--error   { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }

.qo-geo-spin {
  display: inline-block;
  width: 10px; height: 10px;
  border: 1.5px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: qogeo-spin 0.65s linear infinite;
}
@keyframes qogeo-spin { to { transform: rotate(360deg); } }

.qo-geo-msg {
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  margin-top: 2px;
}
.qo-geo-msg--success { background: #dcfce7; color: #15803d; }
.qo-geo-msg--outside { background: #fef9c3; color: #854d0e; }
.qo-geo-msg--error   { background: #fef2f2; color: #dc2626; }

/* ── Paiement ── */
.qo-payments {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}
.qo-payment {
  border: 2px solid var(--cream-300);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-2);
  cursor: pointer;
  text-align: center;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.qo-payment input { display: none; }
.qo-payment__icon { font-size: 1.5rem; }
.qo-payment__label { font-size: 0.7rem; font-weight: 500; color: var(--gray-600); }
.qo-payment--active { border-color: var(--rose-400); background: var(--rose-50); }
.qo-payment--active .qo-payment__label { color: var(--rose-600); }

/* ── Total (dans le footer) ── */
/*
 * Montant empilé sous son libellé : en colonne étroite, « Total » et le
 * chiffre côte à côte forçaient soit un retour à la ligne, soit une largeur
 * qui rognait le bouton. Le fond crème et le cadre disparaissent — dans un
 * pied déjà séparé par un filet et une ombre, ils ne délimitaient plus rien.
 */
.qo-total {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 0 0 auto;
  line-height: 1.15;
  color: var(--gray-500);
}
.qo-total > span {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ── Choix de destination ─────────────────────────────────────────────────── */
.qo-dest {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}
.qo-dest__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 12px 10px;
  border: 1.5px solid var(--cream-300);
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--gray-600);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  /* Cible tactile confortable : c'est le premier geste du formulaire. */
  min-height: 48px;
}
.qo-dest__btn:hover { border-color: var(--rose-300); color: var(--rose-600); }
.qo-dest__btn--active {
  border-color: var(--rose-500);
  background: var(--rose-50);
  color: var(--rose-600);
  font-weight: 600;
  box-shadow: 0 0 0 3px rgba(232, 51, 109, 0.12);
}
.qo-dest__icon { display: flex; flex: none; }
.qo-dest__label { white-space: nowrap; }

@media (max-width: 380px) {
  /* Deux libellés côte à côte ne tiennent plus : on empile plutôt que de
     rogner un texte qui porte toute la décision. */
  .qo-dest { grid-template-columns: 1fr; }
  .qo-dest__btn { justify-content: flex-start; }
}

.qo-total strong {
  font-family: var(--font-sans);
  font-size: 1.1875rem;
  font-weight: 800;
  color: var(--rose-600);
  white-space: nowrap;
}

/*
 * Le bouton prend toute la place restante et garde 52 px de haut : c'est lui
 * qui fixe la hauteur du pied, et la cible tactile ne doit pas payer le gain
 * de place. Plus de `btn-lg` : ses 18 px de padding vertical et ses 40 px
 * horizontaux sont dimensionnés pour une page, pas pour une barre d'action.
 */
.qo-submit {
  flex: 1 1 auto;
  min-height: 52px;
  padding: 12px 20px;
  justify-content: center;
  gap: var(--space-2);
}

.qo-checkout-link {
  display: block;
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-500);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color var(--transition-fast);
  /* Détachée du dernier champ : au bout d'un formulaire, un lien collé à la
     saisie se clique par erreur. */
  margin: var(--space-5) 0 var(--space-2);
  padding: var(--space-2);
}
.qo-checkout-link:hover { color: var(--gray-800); }

.qo-error {
  font-size: 0.875rem;
  color: #dc2626;
  background: #fef2f2;
  padding: var(--space-3);
  border-radius: var(--radius-md);
}

/* ── Champs requis non remplis ───────────────────────────────────────────────
   Bordure rouge doublée d'un halo : la bordure seule se perd sur les petits
   écrans, où le champ signalé occupe toute la largeur. */
.input--error,
.qo-combobox__trigger--error {
  border-color: #dc2626;
  background: #fef2f2;
}

.input--error:focus,
.qo-combobox__trigger--error:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.18);
}

.qo-payments--error {
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 2px #dc2626;
}

.qo-required {
  margin-top: 0.35rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* Le losange tient lieu d'icône : pas de SVG à charger, et le repère reste
   lisible pour qui distingue mal le rouge du texte voisin. */
.qo-required::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  background: #dc2626;
  transform: rotate(45deg);
  flex: none;
}

.qo-spinner {
  display: inline-block;
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: qs-spin 0.7s linear infinite;
}
@keyframes qs-spin { to { transform: rotate(360deg); } }

/* ── Confirmation ── */
.qo-confirmed {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) 0;
}
.qo-confirmed__checkmark { display: flex; justify-content: center; }
.qo-confirmed__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--gray-800);
}
.qo-confirmed__number { font-size: 0.9375rem; color: var(--gray-500); }

/* ── Wave Box ── */
.qo-wave-box {
  width: 100%;
  background: #eff6ff;
  border: 1.5px solid #bfdbfe;
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  text-align: center;
}
.qo-wave-box__label { font-size: 0.8125rem; color: #1d4ed8; font-weight: 600; margin-bottom: var(--space-2); }
.qo-wave-box__number { font-size: 1.5rem; font-weight: 700; color: #1e40af; letter-spacing: 0.05em; }
.qo-wave-box__total { font-size: 0.875rem; color: #1d4ed8; margin-top: var(--space-2); }
.qo-wave-box__ref { font-size: 0.8125rem; color: #3b82f6; }

/* Bouton « Payer avec Wave » */
.qo-wave-pay {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: var(--space-3);
  padding: 12px 18px;
  border-radius: var(--radius-full, 999px);
  background: #1dc3f0; /* bleu Wave */
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
  box-shadow: 0 4px 14px rgba(29, 195, 240, .35);
}
.qo-wave-pay:hover {
  background: #06b6e0;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(29, 195, 240, .45);
}
.qo-wave-pay:active { transform: translateY(0); }

/* ── WhatsApp ── */
.qo-wa-btn { width: 100%; justify-content: center; gap: var(--space-2); }

/* ── Actions confirmation ── */
.qo-confirmed__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
}

/* ── Pré-remplissage profil ── */
.qo-prefilled-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--gray-400);
  letter-spacing: 0.03em;
}
.input--prefilled {
  border-color: var(--gray-300) !important;
}

/* ── Nudge complétion profil ── */
.qo-nudge {
  width: 100%;
  background: linear-gradient(135deg, #fff9fb, #fff);
  border: 1.5px solid var(--rose-200);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  text-align: left;
}
.qo-nudge__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: var(--space-1);
}
.qo-nudge__desc {
  font-size: 0.8125rem;
  color: var(--gray-500);
  margin-bottom: var(--space-3);
  line-height: 1.5;
}
.qo-nudge__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.input--sm {
  padding: 8px 12px;
  font-size: 0.875rem;
}
.qo-nudge__err {
  font-size: 0.8125rem;
  color: #dc2626;
  background: #fef2f2;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
}
.qo-nudge__ok {
  font-size: 0.8125rem;
  color: #15803d;
  font-weight: 600;
}

/* ── Mobile ── */
@media (max-width: 480px) {
  .qo-overlay { padding: 0; align-items: flex-end; }
  .qo-card {
    max-width: 100%;
    max-height: 95vh;
    border-radius: var(--radius-2xl, 20px) var(--radius-2xl, 20px) 0 0;
  }
  /* Marges resserrées et bord latéral réduit : sur un écran de téléphone, le
     pied ne doit plus être une zone mais une barre. */
  .qo-footer {
    padding: var(--space-2) var(--space-4);
    padding-bottom: max(var(--space-2), env(safe-area-inset-bottom));
    gap: var(--space-3);
  }
  .qo-total strong { font-size: 1.0625rem; }
}
</style>

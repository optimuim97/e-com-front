<template>
  <main class="program-page">

    <!-- ── Hero ── -->
    <section class="program-hero">
      <div class="container program-hero__inner">
        <div class="program-hero__text">
          <span class="eyebrow">Votre espace exclusif</span>
          <h1 class="display-lg program-hero__title">
            Rosa <em>Beauty Club</em>
          </h1>
          <p class="program-hero__desc">
            Rejoignez notre programme beauté : accumulez des points, suivez votre routine et échangez avec nos conseillers beauté experts.
          </p>
          <div v-if="!authStore.user" class="program-hero__cta">
            <RouterLink :to="{ name: 'register' }" class="btn btn-primary btn-lg">Rejoindre gratuitement</RouterLink>
            <RouterLink :to="{ name: 'login' }"    class="btn btn-ghost btn-lg">Se connecter</RouterLink>
          </div>
          <div v-else-if="!isMember" class="program-hero__cta">
            <button @click="joinProgram" :disabled="joining" class="btn btn-primary btn-lg">
              <span v-if="joining">Inscription…</span>
              <span v-else>Rejoindre le club</span>
            </button>
          </div>
          <div v-else class="program-hero__badge">
            <span class="tier-badge" :class="`tier-badge--${membership.tier}`">
              {{ tierIcon(membership.tier) }} Membre {{ tierLabel(membership.tier) }}
            </span>
            <span class="points-display">{{ membership.points ?? 0 }} pts</span>
          </div>
        </div>
        <div class="program-hero__visual">
          <div class="program-hero__orb orb-1"></div>
          <div class="program-hero__orb orb-2"></div>
          <div class="program-hero__card-stack">
            <div class="loyalty-card loyalty-card--gold">
              <span class="loyalty-card__logo">🌹 Rosa Beauty</span>
              <span class="loyalty-card__tier">Club Or</span>
              <span class="loyalty-card__pts">2 500 pts</span>
            </div>
            <div class="loyalty-card loyalty-card--silver">
              <span class="loyalty-card__logo">🌹 Rosa Beauty</span>
              <span class="loyalty-card__tier">Club Argent</span>
              <span class="loyalty-card__pts">1 200 pts</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container program-content">

      <!-- ── Dashboard membre ── -->
      <section v-if="authStore.user && isMember" class="program-section">
        <h2 class="program-section__title">Mon espace membre</h2>
        <div class="member-dashboard">

          <!-- Points & niveau -->
          <div class="member-card member-card--points card">
            <div class="member-card__icon">🏆</div>
            <div>
              <p class="member-card__value">{{ membership.points ?? 0 }}</p>
              <p class="member-card__label">Points fidélité</p>
            </div>
            <div class="tier-progress">
              <p class="tier-progress__label">
                <span class="tier-badge tier-badge--sm" :class="`tier-badge--${membership.tier}`">
                  {{ tierLabel(membership.tier) }}
                </span>
                <span class="text-xs text-gray-400">→ {{ nextTierLabel }}</span>
              </p>
              <div class="tier-progress__bar">
                <div class="tier-progress__fill" :style="{ width: tierProgressPct + '%' }"></div>
              </div>
              <p class="text-xs text-gray-400 mt-1">{{ pointsToNextTier }} pts pour le niveau suivant</p>
            </div>
          </div>

          <!-- Commandes / Achats -->
          <div class="member-card card">
            <div class="member-card__icon">🛍️</div>
            <div>
              <p class="member-card__value">{{ membership.orders_count ?? 0 }}</p>
              <p class="member-card__label">Commandes passées</p>
            </div>
          </div>

          <!-- Routine tracker -->
          <div class="member-card card">
            <div class="member-card__icon">✨</div>
            <div>
              <p class="member-card__value">{{ trackerStreak }} j</p>
              <p class="member-card__label">Jours de routine</p>
            </div>
            <button @click="showTracker = true" class="btn btn-outline btn-sm mt-2">Voir mon suivi</button>
          </div>

          <!-- Consultations -->
          <div class="member-card card">
            <div class="member-card__icon">💬</div>
            <div>
              <p class="member-card__value">{{ myConsultations.length }}</p>
              <p class="member-card__label">Consultations</p>
            </div>
            <button @click="showConsultationForm = true" class="btn btn-primary btn-sm mt-2">Nouveau rendez-vous</button>
          </div>

        </div>
      </section>

      <!-- ── Suivi routine (modal) ── -->
      <Teleport to="body">
        <div v-if="showTracker" class="modal-overlay" @click.self="showTracker = false">
          <div class="modal-card card">
            <div class="modal-card__header">
              <h3>✨ Mon suivi de routine</h3>
              <button @click="showTracker = false" class="modal-card__close">✕</button>
            </div>
            <div class="tracker-body">
              <div class="tracker-streak">
                <span class="tracker-streak__num">{{ trackerStreak }}</span>
                <span class="tracker-streak__label">jours consécutifs</span>
              </div>
              <div class="tracker-week">
                <div
                  v-for="(day, i) in trackerWeek"
                  :key="i"
                  class="tracker-day"
                  :class="{ 'tracker-day--done': day.done, 'tracker-day--today': day.isToday }"
                >
                  <span class="tracker-day__label">{{ day.label }}</span>
                  <span class="tracker-day__icon">{{ day.done ? '✅' : '⬜' }}</span>
                </div>
              </div>
              <div class="tracker-actions">
                <button
                  v-if="!todayCheckedIn"
                  @click="doCheckin"
                  :disabled="checkingIn"
                  class="btn btn-primary w-full"
                >
                  {{ checkingIn ? 'Enregistrement…' : '✅ Valider ma routine du jour (+5 pts)' }}
                </button>
                <p v-else class="text-green-600 text-center font-medium">✓ Routine validée aujourd'hui !</p>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- ── Consultation form (modal) ── -->
      <Teleport to="body">
        <div v-if="showConsultationForm" class="modal-overlay" @click.self="showConsultationForm = false">
          <div class="modal-card card">
            <div class="modal-card__header">
              <h3>💬 Demande de consultation</h3>
              <button @click="showConsultationForm = false" class="modal-card__close">✕</button>
            </div>

            <form @submit.prevent="submitConsultation" class="consultation-form">
              <FormField :def="CONSULTATION_FIELDS.type" :error="consultErrors.type">
                <AppSelect v-model="consultForm.type" :options="CONSULTATION_TYPES" placeholder="Choisir un sujet…" />
              </FormField>

              <FormField :def="CONSULTATION_FIELDS.channel" :error="consultErrors.channel">
                <div class="channel-grid">
                  <label
                    v-for="ch in CONSULTATION_CHANNELS"
                    :key="ch.value"
                    class="channel-option"
                    :class="{ 'channel-option--active': consultForm.channel === ch.value }"
                  >
                    <input type="radio" :value="ch.value" v-model="consultForm.channel" />
                    <span>{{ ch.label }}</span>
                  </label>
                </div>
              </FormField>

              <FormField v-if="consultForm.channel === 'whatsapp'" :def="CONSULTATION_FIELDS.phone" :error="consultErrors.phone" optional>
                <PhoneInput v-model="consultForm.phone" placeholder="07 00 00 00" />
              </FormField>

              <FormField :def="CONSULTATION_FIELDS.preferred_at" :error="consultErrors.preferred_at" optional>
                <input v-model="consultForm.preferred_at" type="datetime-local" class="input" />
              </FormField>

              <FormField :def="CONSULTATION_FIELDS.message" :error="consultErrors.message" optional>
                <textarea v-model="consultForm.message" rows="3" class="input resize-none"
                  placeholder="Décrivez votre besoin, votre type de peau, vos produits actuels…"></textarea>
              </FormField>

              <p v-if="consultSuccess" class="text-green-600 text-sm">✓ Demande envoyée ! Notre conseillère vous contactera dans les 24h.</p>
              <p v-if="consultError"   class="text-red-500 text-sm">{{ consultError }}</p>

              <button type="submit" :disabled="consultSending" class="btn btn-primary w-full">
                {{ consultSending ? 'Envoi…' : 'Envoyer ma demande' }}
              </button>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- ── Niveaux du programme ── -->
      <section class="program-section">
        <h2 class="program-section__title">Les niveaux du Club</h2>
        <div class="tiers-grid">
          <div
            v-for="tier in programData.tiers"
            :key="tier.slug"
            class="tier-card card"
            :class="`tier-card--${tier.slug}`"
          >
            <div class="tier-card__header">
              <span class="tier-card__icon">{{ tier.icon }}</span>
              <h3 class="tier-card__name">{{ tier.name }}</h3>
              <p class="tier-card__range">{{ tier.points_min }} – {{ tier.points_max ?? '∞' }} pts</p>
            </div>
            <ul class="tier-card__benefits">
              <li v-for="benefit in tier.benefits" :key="benefit">
                <span class="benefit-check">✓</span> {{ benefit }}
              </li>
            </ul>
            <div v-if="authStore.user && membership.tier === tier.slug" class="tier-card__current">
              Votre niveau actuel
            </div>
          </div>
        </div>
      </section>

      <!-- ── Conseiller beauté ── -->
      <section class="program-section">
        <div class="advisor-section">
          <div class="advisor-section__text">
            <span class="eyebrow">Accompagnement personnalisé</span>
            <h2 class="program-section__title">Votre conseillère beauté</h2>
            <p class="advisor-section__desc">
              Nos expertes Rosa Beauty sont là pour vous guider dans le choix de vos soins, créer votre routine idéale et répondre à toutes vos questions — en WhatsApp, vidéo ou en boutique.
            </p>
            <ul class="advisor-section__features">
              <li>💬 Consultation WhatsApp sous 24h</li>
              <li>📹 Appel vidéo sur rendez-vous</li>
              <li>🌿 Bilan peau gratuit pour les membres</li>
              <li>🎁 Recommandations personnalisées</li>
            </ul>
            <button
              v-if="authStore.user && isMember"
              @click="showConsultationForm = true"
              class="btn btn-primary btn-lg mt-4"
            >
              Prendre rendez-vous
            </button>
            <RouterLink
              v-else-if="!authStore.user"
              :to="{ name: 'register' }"
              class="btn btn-primary btn-lg mt-4"
            >
              Rejoindre pour accéder
            </RouterLink>
            <button
              v-else
              @click="joinProgram"
              :disabled="joining"
              class="btn btn-primary btn-lg mt-4"
            >
              Rejoindre le club
            </button>
          </div>
          <div class="advisor-section__visual">
            <div class="advisor-card">
              <div class="advisor-card__avatar">🌹</div>
              <div>
                <p class="advisor-card__name">Équipe Rosa Beauty</p>
                <p class="advisor-card__role">Conseillers beauté certifiés</p>
                <p class="advisor-card__status">
                  <span class="status-dot"></span> Disponible maintenant
                </p>
              </div>
            </div>
            <div class="advisor-bubbles">
              <div class="advisor-bubble advisor-bubble--in">
                Bonjour ! Quel est votre type de peau ? 🌿
              </div>
              <div class="advisor-bubble advisor-bubble--out">
                Mixte, avec quelques rougeurs…
              </div>
              <div class="advisor-bubble advisor-bubble--in">
                Parfait ! Je vous recommande notre Eau de Rose Pure 🌹
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Comment gagner des points ── -->
      <section class="program-section">
        <h2 class="program-section__title">Comment gagner des points ?</h2>
        <div class="earn-grid">
          <div v-for="action in earnActions" :key="action.label" class="earn-card card">
            <span class="earn-card__icon">{{ action.icon }}</span>
            <div>
              <p class="earn-card__label">{{ action.label }}</p>
              <p class="earn-card__pts">+ {{ action.pts }} pts</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Mes consultations (membres connectés) ── -->
      <section v-if="authStore.user && isMember && myConsultations.length" class="program-section">
        <h2 class="program-section__title">Mes demandes de consultation</h2>
        <div class="consultations-list">
          <div v-for="c in myConsultations" :key="c.id" class="consultation-item card">
            <div class="consultation-item__info">
              <span class="consultation-item__type">{{ consultationTypeLabel(c.type) }}</span>
              <span class="consultation-item__channel">{{ consultationChannelLabel(c.channel) }}</span>
              <span v-if="c.preferred_at" class="consultation-item__date">
                {{ formatDate(c.preferred_at) }}
              </span>
            </div>
            <span class="consultation-status" :class="`consultation-status--${c.status}`">
              {{ consultationStatusLabel(c.status) }}
            </span>
          </div>
        </div>
      </section>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/features/auth/auth.store'
import FormField  from '@/shared/components/ui/FormField.vue'
import AppSelect  from '@/components/ui/AppSelect.vue'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import { programApi } from './program.api'
import {
  CONSULTATION_FIELDS,
  CONSULTATION_TYPES,
  CONSULTATION_CHANNELS,
  makeConsultationForm,
  mapConsultationErrors,
} from './program.fields'

const authStore = useAuthStore()

// ── Programme data (public) ────────────────────────────────────────────────
const programData = ref({
  tiers: [
    {
      slug: 'bronze', name: 'Club Bronze', icon: '🥉',
      points_min: 0, points_max: 499,
      benefits: ['5% de réduction sur vos achats', 'Accès aux offres membres', 'Newsletter beauté exclusive'],
    },
    {
      slug: 'silver', name: 'Club Argent', icon: '🥈',
      points_min: 500, points_max: 1999,
      benefits: ['10% de réduction', 'Consultation conseillère (1/mois)', 'Cadeau d\'anniversaire', 'Livraison prioritaire'],
    },
    {
      slug: 'gold', name: 'Club Or', icon: '🥇',
      points_min: 2000, points_max: null,
      benefits: ['15% de réduction', 'Consultations illimitées', 'Avant-premières produits', 'Cadeaux exclusifs', 'Livraison offerte'],
    },
  ],
})

const earnActions = [
  { icon: '🛍️', label: 'Chaque achat',             pts: '1 par 100 FCFA' },
  { icon: '✨', label: 'Routine quotidienne',       pts: '5' },
  { icon: '⭐', label: 'Laisser un avis produit',   pts: '20' },
  { icon: '🎂', label: 'Anniversaire',               pts: '100' },
  { icon: '📲', label: 'Parrainer un(e) amie',      pts: '150' },
  { icon: '💬', label: 'Première consultation',     pts: '50' },
]

// ── Membership ──────────────────────────────────────────────────────────────
const membership    = ref({})
const isMember      = ref(false)
const joining       = ref(false)

const TIER_THRESHOLDS = { bronze: 0, silver: 500, gold: 2000 }
const TIER_LABELS     = { bronze: 'Bronze', silver: 'Argent', gold: 'Or' }
const TIER_NEXT       = { bronze: 'silver', silver: 'gold', gold: null }

const tierLabel  = (t) => TIER_LABELS[t] ?? t
const tierIcon   = (t) => ({ bronze: '🥉', silver: '🥈', gold: '🥇' }[t] ?? '🌹')

const nextTierLabel = computed(() => {
  const next = TIER_NEXT[membership.value.tier]
  return next ? TIER_LABELS[next] : 'Niveau maximum !'
})

const tierProgressPct = computed(() => {
  const tier = membership.value.tier
  const pts  = membership.value.points ?? 0
  const min  = TIER_THRESHOLDS[tier] ?? 0
  const next = TIER_NEXT[tier]
  if (!next) return 100
  const max  = TIER_THRESHOLDS[next]
  return Math.min(100, Math.round(((pts - min) / (max - min)) * 100))
})

const pointsToNextTier = computed(() => {
  const next = TIER_NEXT[membership.value.tier]
  if (!next) return 0
  return Math.max(0, TIER_THRESHOLDS[next] - (membership.value.points ?? 0))
})

async function joinProgram() {
  joining.value = true
  try {
    const { data } = await programApi.join()
    membership.value = data.membership ?? data
    isMember.value   = true
  } catch (e) {
    console.error(e)
  } finally {
    joining.value = false
  }
}

// ── Tracker ─────────────────────────────────────────────────────────────────
const showTracker    = ref(false)
const trackerData    = ref(null)
const checkingIn     = ref(false)
const todayCheckedIn = ref(false)

const trackerStreak = computed(() => trackerData.value?.streak ?? 0)

const trackerWeek = computed(() => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const checkins = trackerData.value?.week ?? []
  const today = new Date().getDay() // 0=Sun,1=Mon…
  const todayIdx = today === 0 ? 6 : today - 1 // Mon=0…Sun=6
  return days.map((label, i) => ({
    label,
    done: checkins.includes(i),
    isToday: i === todayIdx,
  }))
})

async function doCheckin() {
  checkingIn.value = true
  try {
    await programApi.checkin({ date: new Date().toISOString().slice(0, 10) })
    todayCheckedIn.value = true
    if (trackerData.value) {
      trackerData.value.streak = (trackerData.value.streak ?? 0) + 1
    }
    membership.value.points = (membership.value.points ?? 0) + 5
  } catch (e) {
    console.error(e)
  } finally {
    checkingIn.value = false
  }
}

// ── Consultations ───────────────────────────────────────────────────────────
const showConsultationForm = ref(false)
const consultForm   = ref(makeConsultationForm())
const consultErrors = ref({})
const consultSending= ref(false)
const consultSuccess= ref(false)
const consultError  = ref('')
const myConsultations = ref([])

async function submitConsultation() {
  consultSending.value = true
  consultSuccess.value = false
  consultError.value   = ''
  consultErrors.value  = {}
  try {
    const { data } = await programApi.requestConsultation(consultForm.value)
    myConsultations.value.unshift(data.consultation ?? data)
    consultSuccess.value = true
    consultForm.value = makeConsultationForm()
    setTimeout(() => { showConsultationForm.value = false; consultSuccess.value = false }, 3000)
  } catch (e) {
    if (e.response?.status === 422) {
      consultErrors.value = mapConsultationErrors(e.response.data?.errors ?? {})
    }
    consultError.value = e.response?.data?.message ?? 'Une erreur est survenue.'
  } finally {
    consultSending.value = false
  }
}

const consultationTypeLabel   = (v) => CONSULTATION_TYPES.find(t => t.value === v)?.label ?? v
const consultationChannelLabel= (v) => CONSULTATION_CHANNELS.find(c => c.value === v)?.label ?? v
const consultationStatusLabel = (s) => ({
  pending:   '⏳ En attente',
  confirmed: '✅ Confirmée',
  done:      '✓ Terminée',
  cancelled: '✕ Annulée',
}[s] ?? s)

function formatDate(dt) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dt))
}

// ── Init ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  // Charger les données publiques du programme (niveaux, avantages admin-configurés)
  try {
    const { data } = await programApi.getProgram()
    if (data.tiers?.length) programData.value.tiers = data.tiers
  } catch { /* fallback sur les données statiques */ }

  if (!authStore.user) return

  // Charger membership + tracker + consultations en parallèle
  try {
    const [memRes, trackerRes, consultRes] = await Promise.allSettled([
      programApi.getMembership(),
      programApi.getTracker(),
      programApi.getMyConsultations(),
    ])

    if (memRes.status === 'fulfilled') {
      const d = memRes.value.data
      membership.value = d.membership ?? d
      isMember.value   = true
    }

    if (trackerRes.status === 'fulfilled') {
      trackerData.value    = trackerRes.value.data
      todayCheckedIn.value = trackerRes.value.data?.today_done ?? false
    }

    if (consultRes.status === 'fulfilled') {
      myConsultations.value = consultRes.value.data.data ?? consultRes.value.data
    }
  } catch { /* utilisateur non-membre */ }
})
</script>

<style scoped>
.program-page {
  min-height: 100vh;
  background: var(--color-bg);
}

/* ── Hero ── */
.program-hero {
  background: linear-gradient(135deg, #fdf2f8 0%, var(--cream-100) 50%, #fef9ec 100%);
  border-bottom: 1px solid var(--cream-200);
  padding: var(--space-16) 0 var(--space-12);
  overflow: hidden;
}
.program-hero__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
  align-items: center;
}
.program-hero__title { margin: var(--space-2) 0; color: var(--gray-800); }
.program-hero__title em { color: var(--color-primary); font-style: italic; }
.program-hero__desc { color: var(--gray-500); font-size: 1rem; line-height: 1.7; margin-bottom: var(--space-6); }
.program-hero__cta  { display: flex; gap: var(--space-3); flex-wrap: wrap; }

.program-hero__badge {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
.points-display {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--rose-600);
}

/* ── Visual / Card stack ── */
.program-hero__visual {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.program-hero__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.35;
}
.orb-1 { width: 220px; height: 220px; background: var(--rose-300); top: 10%; right: 5%; }
.orb-2 { width: 160px; height: 160px; background: #fbbf24; bottom: 5%; left: 10%; }

.program-hero__card-stack { position: relative; width: 240px; height: 220px; }
.loyalty-card {
  position: absolute;
  width: 220px;
  border-radius: 16px;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: #fff;
  font-family: var(--font-display);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.loyalty-card--gold {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  top: 0; left: 20px;
  transform: rotate(-3deg);
  z-index: 2;
}
.loyalty-card--silver {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  top: 60px; left: 0;
  transform: rotate(3deg);
  z-index: 1;
}
.loyalty-card__logo { font-size: 0.75rem; opacity: 0.85; }
.loyalty-card__tier { font-size: 1.125rem; font-weight: 600; }
.loyalty-card__pts  { font-size: 0.875rem; opacity: 0.8; margin-top: auto; }

/* ── Content layout ── */
.program-content { padding: var(--space-12) var(--space-6) var(--space-16); display: flex; flex-direction: column; gap: var(--space-12); }
.program-section__title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--gray-800);
  margin-bottom: var(--space-6);
}

/* ── Member dashboard ── */
.member-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-4);
}
.member-card {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.member-card__icon { font-size: 2rem; line-height: 1; }
.member-card__value {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
  line-height: 1;
}
.member-card__label { font-size: 0.8125rem; color: var(--gray-500); }

.tier-progress { margin-top: var(--space-2); }
.tier-progress__label { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); }
.tier-progress__bar {
  height: 6px;
  background: var(--cream-200);
  border-radius: 99px;
  overflow: hidden;
}
.tier-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--rose-400), var(--rose-600));
  border-radius: 99px;
  transition: width 0.6s ease;
}

/* ── Tier badge ── */
.tier-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 0.8125rem;
  font-weight: 600;
}
.tier-badge--bronze { background: #fef3c7; color: #92400e; }
.tier-badge--silver { background: #f3f4f6; color: #374151; }
.tier-badge--gold   { background: #fef9c3; color: #78350f; }
.tier-badge--sm     { font-size: 0.6875rem; padding: 2px 8px; }

/* ── Tiers grid ── */
.tiers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-5);
}
.tier-card { padding: 0; overflow: hidden; }
.tier-card__header {
  padding: var(--space-6);
  text-align: center;
}
.tier-card--bronze .tier-card__header { background: linear-gradient(135deg, #fef3c7, #fde68a); }
.tier-card--silver .tier-card__header { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }
.tier-card--gold   .tier-card__header { background: linear-gradient(135deg, #fef9c3, #fde047); }

.tier-card__icon  { font-size: 2.5rem; display: block; margin-bottom: var(--space-2); }
.tier-card__name  { font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; color: var(--gray-800); }
.tier-card__range { font-size: 0.75rem; color: var(--gray-500); margin-top: 4px; }
.tier-card__benefits {
  list-style: none;
  padding: var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.tier-card__benefits li { font-size: 0.875rem; color: var(--gray-700); display: flex; align-items: flex-start; gap: var(--space-2); }
.benefit-check { color: var(--rose-500); font-weight: 700; flex-shrink: 0; }
.tier-card__current {
  text-align: center;
  padding: var(--space-2) var(--space-4) var(--space-4);
  font-size: 0.75rem;
  color: var(--rose-600);
  font-weight: 600;
}

/* ── Advisor section ── */
.advisor-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-10);
  align-items: center;
}
.advisor-section__desc {
  color: var(--gray-500);
  line-height: 1.7;
  margin-bottom: var(--space-4);
}
.advisor-section__features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: 0.9375rem;
  color: var(--gray-700);
}

.advisor-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  background: #fff;
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-5);
  box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  margin-bottom: var(--space-4);
}
.advisor-card__avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--rose-100), var(--rose-200));
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}
.advisor-card__name { font-weight: 600; color: var(--gray-800); font-size: 0.9375rem; }
.advisor-card__role { font-size: 0.8125rem; color: var(--gray-500); }
.advisor-card__status { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #16a34a; margin-top: 4px; }
.status-dot { width: 8px; height: 8px; background: #16a34a; border-radius: 50%; animation: pulse 2s infinite; }

.advisor-bubbles { display: flex; flex-direction: column; gap: var(--space-2); }
.advisor-bubble {
  max-width: 80%;
  padding: var(--space-3) var(--space-4);
  border-radius: 18px;
  font-size: 0.875rem;
  line-height: 1.4;
}
.advisor-bubble--in {
  background: var(--cream-100);
  color: var(--gray-700);
  border-bottom-left-radius: 4px;
  align-self: flex-start;
}
.advisor-bubble--out {
  background: var(--rose-500);
  color: #fff;
  border-bottom-right-radius: 4px;
  align-self: flex-end;
}

/* ── Earn actions ── */
.earn-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-4);
}
.earn-card {
  padding: var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.earn-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.earn-card__icon { font-size: 2rem; flex-shrink: 0; }
.earn-card__label { font-size: 0.875rem; color: var(--gray-700); }
.earn-card__pts { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--rose-600); }

/* ── Consultations list ── */
.consultations-list { display: flex; flex-direction: column; gap: var(--space-3); }
.consultation-item {
  padding: var(--space-4) var(--space-5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}
.consultation-item__info { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
.consultation-item__type { font-weight: 500; color: var(--gray-800); font-size: 0.875rem; }
.consultation-item__channel { font-size: 0.8125rem; color: var(--gray-500); }
.consultation-item__date { font-size: 0.8125rem; color: var(--gray-400); }

.consultation-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  white-space: nowrap;
}
.consultation-status--pending   { background: #fef3c7; color: #92400e; }
.consultation-status--confirmed { background: #dcfce7; color: #166534; }
.consultation-status--done      { background: #f3f4f6; color: #374151; }
.consultation-status--cancelled { background: #fee2e2; color: #991b1b; }

/* ── Modals ── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-4);
}
.modal-card {
  width: 100%; max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
}
.modal-card__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--cream-200);
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 500;
  position: sticky; top: var(--navbar-height);
  background: #fff;
  z-index: 1;
}
.modal-card__close {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--gray-400);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}
.modal-card__close:hover { background: var(--cream-100); color: var(--gray-700); }

/* ── Consultation form ── */
.consultation-form {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.channel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}
.channel-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1.5px solid var(--cream-300);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}
.channel-option input { display: none; }
.channel-option:hover { border-color: var(--rose-300); }
.channel-option--active { border-color: var(--rose-500); background: var(--rose-50); font-weight: 500; }

/* ── Tracker ── */
.tracker-body { padding: var(--space-6); }
.tracker-streak {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  justify-content: center;
}
.tracker-streak__num {
  font-family: var(--font-display);
  font-size: 4rem;
  font-weight: 700;
  color: var(--rose-600);
  line-height: 1;
}
.tracker-streak__label { font-size: 1.125rem; color: var(--gray-500); }
.tracker-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}
.tracker-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.tracker-day__label { font-size: 0.625rem; color: var(--gray-400); text-transform: uppercase; }
.tracker-day__icon  { font-size: 1.25rem; }
.tracker-day--today .tracker-day__label { color: var(--rose-500); font-weight: 700; }
.tracker-actions { margin-top: var(--space-4); }

/* ── Animations ── */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .program-hero__inner { grid-template-columns: 1fr; }
  .program-hero__visual { display: none; }
  .advisor-section { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .tiers-grid { grid-template-columns: 1fr; }
  .channel-grid { grid-template-columns: 1fr; }
  .tracker-week { grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .tracker-day__label { font-size: 0.5rem; }
}
</style>

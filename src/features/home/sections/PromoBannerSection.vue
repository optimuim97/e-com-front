<template>
  <section class="promo-banner" :aria-label="campaign.name">
    <div class="container promo-banner__inner">
      <!-- Colonne message : tout ce que la cliente doit savoir de l'opération -->
      <div class="promo-banner__content">
        <span class="promo-banner__badge">{{ campaign.badge }}</span>

        <h2 class="promo-banner__title">{{ campaign.name }}</h2>

        <p v-if="headline" class="promo-banner__headline">
          <span class="promo-banner__headline-label">{{ headlineLabel }}</span>
          <strong class="promo-banner__headline-value">{{ headline }}</strong>
        </p>

        <p class="promo-banner__scope">{{ scopeLabel }}</p>

        <p v-if="campaign.description" class="promo-banner__desc">
          {{ campaign.description }}
        </p>

        <!-- Compte à rebours : seulement si l'opération a une fin annoncée.
             Une promotion sans date de fin n'a aucune urgence à afficher. -->
        <div v-if="time" class="promo-banner__countdown">
          <span class="promo-banner__countdown-label">{{ $t('promoBanner.endsIn') }}</span>
          <div class="promo-banner__countdown-time">
            <div class="promo-cell"><strong>{{ time.d }}</strong><small>{{ $t('flashSale.dayShort') }}</small></div>
            <span>:</span>
            <div class="promo-cell"><strong>{{ time.h }}</strong><small>{{ $t('flashSale.hourShort') }}</small></div>
            <span>:</span>
            <div class="promo-cell"><strong>{{ time.m }}</strong><small>{{ $t('flashSale.minShort') }}</small></div>
            <span>:</span>
            <div class="promo-cell"><strong>{{ time.s }}</strong><small>{{ $t('flashSale.secShort') }}</small></div>
          </div>
        </div>

        <RouterLink :to="shopLink" class="btn btn-primary btn-lg promo-banner__cta">
          {{ $t('promoBanner.cta') }}
        </RouterLink>

        <!-- Aperçu : trois articles concernés, pour prouver l'offre avant le clic -->
        <ul v-if="campaign.products?.length" class="promo-banner__preview">
          <li v-for="product in campaign.products" :key="product.id">
            <RouterLink :to="`/products/${product.slug}`" class="promo-preview">
              <img
                v-if="product.images?.[0]?.url"
                :src="product.images[0].url"
                :alt="product.name"
                class="promo-preview__img"
                loading="lazy"
              />
              <div v-else class="promo-preview__img promo-preview__img--empty"></div>
              <span class="promo-preview__name">{{ product.name }}</span>
              <span class="promo-preview__prices">
                <span class="promo-preview__price">{{ formatPrice(sellingPrice(product)) }}</span>
                <span v-if="referencePrice(product)" class="promo-preview__price-old">
                  {{ formatPrice(referencePrice(product)) }}
                </span>
              </span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Notre image, en dernière position : à droite sur grand écran, sous le
           message sur mobile — le texte reste ce que la cliente lit d'abord. -->
      <figure class="promo-banner__visual">
        <img
          src="/rosa-beauty-facial-care.jpg"
          :alt="$t('promoBanner.imageAlt')"
          class="promo-banner__image"
          loading="lazy"
          decoding="async"
        />
      </figure>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'
import { sellingPrice, referencePrice } from '@/utils/pricing'

const props = defineProps({
  /** Charge utile `promo_campaign` de GET /home/stats. */
  campaign: { type: Object, required: true },
})

const { t } = useI18n()
const settings = useSettingsStore()
const formatPrice = (value) => settings.formatPrice(value)

/**
 * Remise mise en avant.
 *
 * `max_percent` est calculé côté serveur à partir des prix réels : sur une
 * opération ciblée, chaque article peut porter sa propre remise et le taux
 * saisi sur l'opération ne serait pas celui pratiqué. Il vaut null quand la
 * remise est un montant fixe appliqué à tout le catalogue — on annonce alors
 * ce montant.
 */
const headline = computed(() => {
  if (props.campaign.max_percent) return `−${props.campaign.max_percent} %`
  if (props.campaign.discount_type === 'fixed') return `−${formatPrice(props.campaign.value)}`
  return null
})

/* « Jusqu'à » n'a de sens que si les remises diffèrent d'un article à l'autre.
   Sur une opération globale, le taux annoncé est celui que tout le monde aura. */
const headlineLabel = computed(() =>
  props.campaign.scope === 'product' ? t('promoBanner.upTo') : t('promoBanner.discountOf')
)

const scopeLabel = computed(() =>
  props.campaign.scope === 'product'
    ? t('promoBanner.selection', { count: props.campaign.products_count })
    : t('promoBanner.wholeCatalogue')
)

/* Une opération globale ne rattache aucun article : le filtre du catalogue ne
   remonterait rien, on renvoie donc vers la boutique entière. */
const shopLink = computed(() =>
  props.campaign.scope === 'product'
    ? { path: '/products', query: { promotion: props.campaign.id } }
    : { path: '/products' }
)

/* ── Compte à rebours ──────────────────────────────────────────────────── */
const endsAt = computed(() => {
  if (!props.campaign.ends_at) return null
  const date = new Date(props.campaign.ends_at)
  return Number.isNaN(date.getTime()) ? null : date
})

const time = ref(null)
let timer = null

function pad(value) {
  return String(Math.max(0, Math.floor(value))).padStart(2, '0')
}

function updateCountdown() {
  if (!endsAt.value) return

  const diff = endsAt.value - Date.now()
  if (diff <= 0) {
    // Opération terminée entre deux rafraîchissements du cache d'accueil :
    // on retire le décompte plutôt que d'afficher des zéros.
    time.value = null
    return
  }

  time.value = {
    d: pad(diff / 86400000),
    h: pad((diff % 86400000) / 3600000),
    m: pad((diff % 3600000) / 60000),
    s: pad((diff % 60000) / 1000),
  }
}

onMounted(() => {
  updateCountdown()
  if (endsAt.value) timer = setInterval(updateCountdown, 1000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.promo-banner {
  padding: var(--space-12) 0;
  position: relative;
  overflow: hidden;
  /* Rose poudré vers crème : la palette de la marque, pas le bleu criard des
     bannières promotionnelles génériques. */
  background: linear-gradient(135deg, var(--rose-50) 0%, var(--cream-50) 55%, var(--rose-100) 100%);
}

/* Confettis : quelques points rose et doré, dessinés en CSS pour ne pas
   ajouter une image de fond à charger. */
.promo-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image:
    radial-gradient(circle, var(--rose-300) 2px, transparent 2px),
    radial-gradient(circle, var(--gold-400) 2px, transparent 2px),
    radial-gradient(circle, var(--rose-200) 3px, transparent 3px);
  background-size: 120px 120px, 170px 170px, 210px 210px;
  background-position: 0 0, 60px 40px, 25px 95px;
}

.promo-banner__inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  align-items: center;
  gap: var(--space-10);
}

.promo-banner__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
}

.promo-banner__badge {
  background: var(--rose-500);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 12px rgba(232, 51, 109, 0.25);
}

.promo-banner__title {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 600;
  line-height: 1.1;
  color: var(--gray-800);
  margin: 0;
}

.promo-banner__headline {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
}
.promo-banner__headline-label {
  font-size: 0.9375rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gray-500);
}
.promo-banner__headline-value {
  /* Police sans fantaisie pour les chiffres : ils doivent se lire, pas se
     déchiffrer. */
  font-size: clamp(2.5rem, 7vw, 4.5rem);
  font-weight: 800;
  line-height: 1;
  color: var(--rose-600);
  font-variant-numeric: tabular-nums;
}

.promo-banner__scope {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--rose-600);
  margin: 0;
}

.promo-banner__desc {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--gray-600);
  max-width: 46ch;
  margin: 0;
}

/* Compte à rebours */
.promo-banner__countdown {
  background: white;
  border: 1px solid var(--rose-200);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-5);
  box-shadow: 0 6px 20px rgba(232, 51, 109, 0.08);
  text-align: center;
}
.promo-banner__countdown-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}
.promo-banner__countdown-time {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  color: var(--rose-600);
}
.promo-cell {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 32px;
}
.promo-cell strong {
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.promo-cell small {
  font-size: 0.625rem;
  color: var(--gray-400);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 2px;
}

.promo-banner__cta {
  margin-top: var(--space-2);
  text-decoration: none;
}

/* Aperçu des articles */
.promo-banner__preview {
  display: flex;
  gap: var(--space-3);
  list-style: none;
  padding: 0;
  margin: var(--space-4) 0 0;
  width: 100%;
}
.promo-banner__preview > li { flex: 1 1 0; min-width: 0; }

.promo-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-decoration: none;
  transition: transform var(--transition-normal);
}
.promo-preview:hover { transform: translateY(-3px); }

.promo-preview__img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: var(--radius-lg);
  background: white;
  border: 1px solid var(--cream-200);
}
.promo-preview__img--empty {
  background: linear-gradient(135deg, var(--rose-100), var(--cream-100));
}

.promo-preview__name {
  font-size: 0.75rem;
  color: var(--gray-600);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.promo-preview__prices {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}
.promo-preview__price {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--rose-600);
}
.promo-preview__price-old {
  font-size: 0.6875rem;
  color: var(--gray-400);
  text-decoration: line-through;
}

/* Notre image */
.promo-banner__visual {
  margin: 0;
  border-radius: var(--radius-2xl, 24px);
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(232, 51, 109, 0.18);
}
.promo-banner__image {
  display: block;
  width: 100%;
  height: 100%;
  max-height: 520px;
  object-fit: cover;
}

@media (max-width: 900px) {
  .promo-banner__inner {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
  .promo-banner__image { max-height: 340px; }
}

@media (max-width: 540px) {
  .promo-banner { padding: var(--space-10) 0; }
  .promo-banner__cta { width: 100%; text-align: center; }
  .promo-cell strong { font-size: 1.125rem; }
  .promo-preview__name { display: none; }
}
</style>

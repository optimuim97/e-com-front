<template>
  <section class="pink-oct" aria-labelledby="pink-oct-title">
    <div class="container pink-oct__inner">

      <!--
        Le ruban, en tracés REMPLIS.

        Une ligne épaissie (`stroke`) donne toujours un tube : largeur
        constante, bouts ronds, aucun pli. Ici chaque brin est un contour fermé,
        calculé en décalant une ligne médiane de part et d'autre — ce qui permet
        la bande qui s'affine en tournant, les queues taillées en biais et en
        miroir, et le pli au croisement.

        Les deux brins finissent au MÊME point (100,26), tangente horizontale de
        part et d'autre et même demi-largeur : leurs bords de bout coïncident,
        donc la boucle se referme sans décroché.
      -->
      <div class="pink-oct__emblem" aria-hidden="true">
        <svg viewBox="0 0 200 260" class="pink-oct__ribbon" role="presentation">
          <defs>
            <linearGradient id="pinkOctFront" x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0%"   stop-color="#ffffff" />
              <stop offset="45%"  stop-color="#ffe3ed" />
              <stop offset="100%" stop-color="#f7c2d8" />
            </linearGradient>
            <linearGradient id="pinkOctBack" x1="0.9" y1="0" x2="0.1" y2="1">
              <stop offset="0%"   stop-color="#f3b3cb" />
              <stop offset="100%" stop-color="#e293b2" />
            </linearGradient>
            <filter id="pinkOctFold" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="2.5" dy="4" stdDeviation="3.5"
                            flood-color="#570826" flood-opacity="0.45" />
            </filter>
          </defs>

          <path d="M 154.8,231.7 L 153.2,227.5 L 151.6,223.3 L 150.0,219.3 L 148.3,215.3 L 146.6,211.5 L 144.9,207.7 L 143.2,204.1 L 141.4,200.5 L 139.7,197.0 L 137.9,193.6 L 136.1,190.3 L 134.3,187.0 L 132.5,183.8 L 130.7,180.7 L 128.9,177.7 L 127.1,174.7 L 125.3,171.8 L 123.5,169.0 L 121.7,166.2 L 120.0,163.4 L 118.2,160.7 L 116.5,158.1 L 114.7,155.5 L 113.0,152.9 L 111.3,150.4 L 109.6,147.9 L 106.0,143.2 L 103.0,139.4 L 100.0,135.6 L 97.1,132.0 L 94.3,128.4 L 91.5,124.9 L 88.9,121.5 L 86.4,118.2 L 84.0,114.9 L 81.8,111.7 L 79.7,108.5 L 77.7,105.4 L 76.0,102.4 L 74.4,99.5 L 72.9,96.6 L 71.7,93.8 L 70.7,91.0 L 69.8,88.3 L 69.2,85.7 L 68.7,83.1 L 68.5,80.5 L 68.4,78.0 L 68.5,75.4 L 68.9,72.8 L 69.5,70.1 L 70.3,67.4 L 71.2,64.0 L 71.8,61.7 L 72.5,59.5 L 73.3,57.3 L 74.1,55.3 L 75.0,53.4 L 75.9,51.6 L 76.9,49.8 L 77.9,48.2 L 79.0,46.7 L 80.1,45.2 L 81.2,43.9 L 82.4,42.6 L 83.6,41.5 L 84.8,40.4 L 86.0,39.4 L 87.3,38.5 L 88.6,37.7 L 89.9,37.0 L 91.2,36.4 L 92.6,35.9 L 94.0,35.4 L 95.5,35.1 L 96.9,34.8 L 98.5,34.6 L 100.0,34.5 L 100.0,17.5 L 97.4,17.5 L 94.9,17.7 L 92.3,18.0 L 89.8,18.5 L 87.4,19.2 L 84.9,20.0 L 82.6,20.9 L 80.2,22.0 L 78.0,23.2 L 75.8,24.6 L 73.7,26.0 L 71.6,27.7 L 69.6,29.4 L 67.7,31.2 L 65.9,33.2 L 64.2,35.3 L 62.5,37.5 L 60.9,39.8 L 59.4,42.2 L 58.0,44.7 L 56.7,47.3 L 55.5,49.9 L 54.3,52.7 L 53.3,55.6 L 52.3,58.6 L 51.7,60.6 L 50.3,64.8 L 49.3,68.9 L 48.6,73.1 L 48.2,77.3 L 48.1,81.4 L 48.4,85.5 L 49.0,89.5 L 49.8,93.5 L 50.9,97.4 L 52.2,101.3 L 53.7,105.1 L 55.4,108.8 L 57.3,112.6 L 59.3,116.3 L 61.5,119.9 L 63.8,123.6 L 66.1,127.2 L 68.6,130.9 L 71.2,134.6 L 73.9,138.2 L 76.6,141.9 L 79.4,145.7 L 82.3,149.4 L 85.1,153.2 L 88.0,157.1 L 90.4,160.1 L 91.9,162.7 L 93.5,165.3 L 95.1,167.9 L 96.7,170.6 L 98.3,173.2 L 99.9,175.9 L 101.5,178.6 L 103.1,181.4 L 104.7,184.1 L 106.3,187.0 L 107.8,189.8 L 109.4,192.7 L 111.0,195.7 L 112.5,198.7 L 114.0,201.7 L 115.5,204.8 L 117.0,208.0 L 118.5,211.3 L 119.9,214.6 L 121.3,218.0 L 122.7,221.5 L 124.1,225.1 L 125.4,228.7 L 126.7,232.5 L 128.0,236.3 L 133.0,251.7 Z" fill="url(#pinkOctBack)" />
          <path d="M 67.0,251.7 L 72.0,236.3 L 73.3,232.5 L 74.6,228.7 L 75.9,225.1 L 77.3,221.5 L 78.7,218.0 L 80.1,214.6 L 81.5,211.3 L 83.0,208.0 L 84.5,204.8 L 86.0,201.7 L 87.5,198.7 L 89.0,195.7 L 90.6,192.7 L 92.2,189.8 L 93.7,187.0 L 95.3,184.1 L 96.9,181.4 L 98.5,178.6 L 100.1,175.9 L 101.7,173.2 L 103.3,170.6 L 104.9,167.9 L 106.5,165.3 L 108.1,162.7 L 109.6,160.1 L 112.0,157.1 L 114.9,153.2 L 117.7,149.4 L 120.6,145.7 L 123.4,141.9 L 126.1,138.2 L 128.8,134.6 L 131.4,130.9 L 133.9,127.2 L 136.2,123.6 L 138.5,119.9 L 140.7,116.3 L 142.7,112.6 L 144.6,108.8 L 146.3,105.1 L 147.8,101.3 L 149.1,97.4 L 150.2,93.5 L 151.0,89.5 L 151.6,85.5 L 151.9,81.4 L 151.8,77.3 L 151.4,73.1 L 150.7,68.9 L 149.7,64.8 L 148.3,60.6 L 147.7,58.6 L 146.7,55.6 L 145.7,52.7 L 144.5,49.9 L 143.3,47.3 L 142.0,44.7 L 140.6,42.2 L 139.1,39.8 L 137.5,37.5 L 135.8,35.3 L 134.1,33.2 L 132.3,31.2 L 130.4,29.4 L 128.4,27.7 L 126.3,26.0 L 124.2,24.6 L 122.0,23.2 L 119.8,22.0 L 117.4,20.9 L 115.1,20.0 L 112.6,19.2 L 110.2,18.5 L 107.7,18.0 L 105.1,17.7 L 102.6,17.5 L 100.0,17.5 L 100.0,34.5 L 101.5,34.6 L 103.1,34.8 L 104.5,35.1 L 106.0,35.4 L 107.4,35.9 L 108.8,36.4 L 110.1,37.0 L 111.4,37.7 L 112.7,38.5 L 114.0,39.4 L 115.2,40.4 L 116.4,41.5 L 117.6,42.6 L 118.8,43.9 L 119.9,45.2 L 121.0,46.7 L 122.1,48.2 L 123.1,49.8 L 124.1,51.6 L 125.0,53.4 L 125.9,55.3 L 126.7,57.3 L 127.5,59.5 L 128.2,61.7 L 128.8,64.0 L 129.7,67.4 L 130.5,70.1 L 131.1,72.8 L 131.5,75.4 L 131.6,78.0 L 131.5,80.5 L 131.3,83.1 L 130.8,85.7 L 130.2,88.3 L 129.3,91.0 L 128.3,93.8 L 127.1,96.6 L 125.6,99.5 L 124.0,102.4 L 122.3,105.4 L 120.3,108.5 L 118.2,111.7 L 116.0,114.9 L 113.6,118.2 L 111.1,121.5 L 108.5,124.9 L 105.7,128.4 L 102.9,132.0 L 100.0,135.6 L 97.0,139.4 L 94.0,143.2 L 90.4,147.9 L 88.7,150.4 L 87.0,152.9 L 85.3,155.5 L 83.5,158.1 L 81.8,160.7 L 80.0,163.4 L 78.3,166.2 L 76.5,169.0 L 74.7,171.8 L 72.9,174.7 L 71.1,177.7 L 69.3,180.7 L 67.5,183.8 L 65.7,187.0 L 63.9,190.3 L 62.1,193.6 L 60.3,197.0 L 58.6,200.5 L 56.8,204.1 L 55.1,207.7 L 53.4,211.5 L 51.7,215.3 L 50.0,219.3 L 48.4,223.3 L 46.8,227.5 L 45.2,231.7 Z" fill="url(#pinkOctFront)" filter="url(#pinkOctFold)" />
        </svg>
      </div>

      <!-- Bloc message -->
      <div class="pink-oct__content">
        <img
          src="/logos/rosa-logo-blanc-260.png"
          :alt="shopName"
          class="pink-oct__logo"
          loading="lazy"
          decoding="async"
        />

        <h2 id="pink-oct-title" class="pink-oct__title">
          <span class="pink-oct__title-main">{{ $t('pinkOctober.title') }}</span>
          <!--
            `span` et non `em` : une règle globale colore tous les `em` en
            var(--rose-500) et impose l'italique du serif. Le mot ne serait ni
            de la bonne teinte ni de la bonne écriture.
          -->
          <span class="pink-oct__title-script">{{ $t('pinkOctober.titleEm') }}</span>
        </h2>

        <p class="pink-oct__tagline">{{ $t('pinkOctober.tagline') }}</p>

        <span class="pink-oct__rule" aria-hidden="true"></span>

        <p class="pink-oct__message">{{ $t('pinkOctober.message') }}</p>

        <svg class="pink-oct__heart" viewBox="0 0 24 22" aria-hidden="true">
          <path
            d="M12 20.5C12 20.5 1.8 14.3 1.8 7.8 1.8 4.6 4.3 2.2 7.4 2.2c2 0 3.7 1 4.6 2.6.9-1.6 2.6-2.6 4.6-2.6 3.1 0 5.6 2.4 5.6 5.6 0 6.5-10.2 12.7-10.2 12.7z"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"
          />
        </svg>

        <!-- N'apparaît que si la boutique a quelque chose de réel à montrer :
             son article, l'association qu'elle soutient. Sans lien, pas de
             bouton — un bouton qui ne mène nulle part coûte la confiance. -->
        <a
          v-if="ctaLink"
          :href="ctaLink"
          class="pink-oct__cta"
          target="_blank"
          rel="noopener"
        >{{ ctaLabel || $t('pinkOctober.cta') }}</a>
      </div>

    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

defineProps({
  /** Destination du bouton. Sans elle, aucun bouton n'est affiché. */
  ctaLink:  { type: String, default: '' },
  /** Libellé du bouton. Par défaut celui des traductions. */
  ctaLabel: { type: String, default: '' },
})

const settings = useSettingsStore()

/* Le nom vient des réglages, jamais d'une chaîne figée : le socle sert
   plusieurs boutiques, et « Rosa Beauty » écrit en dur repartirait chez la
   suivante. */
const shopName = computed(() => settings.shopName)
</script>

<style scoped>
/* ══ Fond ══
   Le rose revient, et les pétales de la maison vivent dessous.

   Le voile n'est pas opaque : à 86 % le tapis de pétales reste lisible comme
   texture, et c'est lui qui donne au bloc sa matière. L'image est déjà
   légèrement floutée à la fabrication — un fond ne doit pas rivaliser avec le
   texte, et le flou divise son poids par deux.

   Texte en blanc, donc : sur un rose franc, aucune autre teinte ne tient. Un
   titre rose sur fond rose était l'erreur de la version précédente. */
.pink-oct {
  position: relative;
  overflow: hidden;
  background-image:
    linear-gradient(
      100deg,
      rgba(201, 24, 90, 0.90) 0%,
      rgba(232, 51, 109, 0.86) 55%,
      rgba(249, 81, 138, 0.80) 100%
    ),
    url('/image_site/octobre-rose-fond.webp');
  background-size: cover, cover;
  background-position: center, center;
  background-repeat: no-repeat, no-repeat;
  background-color: var(--rose-500);
  color: #fff;
}

.pink-oct__inner {
  position: relative;
  display: grid;
  grid-template-columns: clamp(150px, 26%, 290px) minmax(0, 1fr);
  align-items: center;
  gap: clamp(var(--space-6), 5vw, var(--space-16));
  padding-top: var(--space-12);
  padding-bottom: var(--space-12);
}

/* ══ Ruban ══ */
.pink-oct__emblem { display: flex; justify-content: center; }

.pink-oct__ribbon {
  width: 100%;
  max-width: 230px;
  height: auto;
  filter: drop-shadow(0 20px 34px rgba(87, 8, 38, 0.28));
}

/* ══ Message ══ */
.pink-oct__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.pink-oct__logo {
  width: clamp(92px, 11vw, 132px);
  height: auto;
  margin-bottom: var(--space-4);
}

.pink-oct__title {
  margin: 0;
  line-height: 0.92;
}
.pink-oct__title-main {
  display: block;
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6.4vw, 4.75rem);
  font-weight: 600;
  letter-spacing: -0.015em;
  color: #fff;
}
/* « Rose » en script, remonté sous le mot précédent : c'est la signature du
   visuel, et le mot qui relie la campagne au nom de la boutique. */
.pink-oct__title-script {
  display: block;
  margin-top: -0.18em;
  font-family: var(--font-script);
  font-size: clamp(2.75rem, 7vw, 5.25rem);
  font-weight: 600;
  line-height: 1.1;
  color: #ffdfeb;
}

.pink-oct__tagline {
  margin: var(--space-5) 0 0;
  font-size: clamp(0.8125rem, 1.4vw, 1rem);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.88);
}

.pink-oct__rule {
  display: block;
  width: min(280px, 60%);
  height: 1px;
  margin: var(--space-5) 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55) 50%, transparent);
}

.pink-oct__message {
  max-width: 46ch;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(0.9375rem, 1.6vw, 1.1875rem);
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.93);
}

.pink-oct__heart {
  width: 22px;
  height: auto;
  margin-top: var(--space-4);
  color: #fff;
}

.pink-oct__cta {
  margin-top: var(--space-5);
  padding: 11px 26px;
  border-radius: var(--radius-full, 999px);
  background: #fff;
  color: var(--rose-600);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.pink-oct__cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(87, 8, 38, 0.28);
}

/* ══ Mobile ══
   Le ruban passe au-dessus et rétrécit : une colonne de 270 px deviendrait
   une image pleine largeur qui repousse le texte sous la ligne de flottaison. */
@media (max-width: 860px) {
  .pink-oct__inner {
    grid-template-columns: 1fr;
    gap: var(--space-5);
    padding-top: var(--space-10);
    padding-bottom: var(--space-10);
  }
  .pink-oct__emblem { order: -1; }
  .pink-oct__ribbon { max-width: 110px; }
  .pink-oct__tagline { letter-spacing: 0.16em; }
}
</style>

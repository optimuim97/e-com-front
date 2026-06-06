<template>
  <div class="about-page">

    <!-- ── Hero ── -->
    <section class="ap-hero">
      <div class="container ap-hero__inner">
        <div class="ap-hero__text">
          <span class="eyebrow">Notre histoire</span>
          <h1 class="display-lg ap-hero__title">
            Révéler la beauté naturelle<br>
            <em>de chaque femme</em>
          </h1>
          <p class="ap-hero__desc">
            Rosabeauty Facial Care est née d'une histoire personnelle, d'une passion pour la beauté
            et d'une volonté d'aider les femmes à prendre soin de leur peau avec douceur et confiance.
            La <strong>première marque ivoirienne dédiée à la rose</strong>, pour révéler l'éclat naturel de votre peau.
          </p>
          <div class="ap-hero__founder">
            <div class="ap-hero__founder-avatar">M</div>
            <div>
              <p class="ap-hero__founder-name">Maïmouna Diabagate</p>
              <p class="ap-hero__founder-role">Fondatrice, Rosa Beauty</p>
            </div>
          </div>
          <RouterLink to="/products" class="btn btn-primary">
            Découvrir nos soins
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </RouterLink>
        </div>
        <div class="ap-hero__img-wrap">
          <img src="/image_site/DSC_7629.jpeg" alt="Rosa Beauty — Fondatrice" class="ap-hero__img" />
          <div class="ap-hero__img-deco"></div>
        </div>
      </div>
    </section>

    <!-- ── Mot de la fondatrice + vidéo ── -->
    <section class="ap-founder">
      <div class="container ap-founder__inner">
        <div class="ap-founder__video-wrap">
          <RosaVideoPlayer :src="videoSrc" poster="/image_site/FLS_8142.jpeg" />
          <div class="ap-founder__video-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Mot de la fondatrice
          </div>
        </div>
        <div class="ap-founder__quote-col">
          <span class="eyebrow">La vision</span>
          <blockquote class="ap-founder__blockquote">
            « Votre corps est votre meilleur accessoire, prenez-en soin. »
          </blockquote>
          <p class="ap-founder__text">
            Comme beaucoup de femmes, j'ai moi-même été confrontée à des problèmes de peau qui affectaient
            ma confiance en moi. Au cours de ma quête pour retrouver une peau saine et lumineuse, j'ai découvert
            les bienfaits exceptionnels de la rose. Séduite par ses propriétés apaisantes, hydratantes et éclatantes,
            elle est rapidement devenue un élément essentiel de ma routine beauté.
          </p>
          <p class="ap-founder__text">
            Les résultats ont éveillé en moi une véritable passion et l'envie de partager ce trésor naturel
            avec d'autres femmes. C'est ainsi qu'est née Rosabeauty Facial Care.
          </p>
          <div class="ap-founder__sig">
            <span class="ap-founder__sig-name">Maïmouna Diabagate</span>
            <span class="ap-founder__sig-title">Fondatrice &amp; Directrice</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Stats ── -->
    <section class="ap-stats">
      <div class="container ap-stats__grid">
        <div v-for="s in stats" :key="s.label" class="ap-stat">
          <div class="ap-stat__value">{{ s.value }}</div>
          <div class="ap-stat__label">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <!-- ── Ingrédient phare : Rose de Damas ── -->
    <section class="ap-rose">
      <div class="container ap-rose__inner">
        <div class="ap-rose__text">
          <span class="eyebrow">L'ingrédient phare</span>
          <h2 class="display-md">La <em>Rose de Damas</em></h2>
          <p class="ap-rose__desc">
            Au cœur de Rosa Beauty, il y a la rose de Damas — un ingrédient précieux reconnu depuis
            des siècles pour ses vertus exceptionnelles sur la peau. Nous en faisons le fil conducteur
            de toute notre gamme.
          </p>
          <div class="ap-rose__benefits">
            <div class="ap-rose__benefit">
              <div class="ap-rose__benefit-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg></div>
              <div>
                <strong>Hydratante</strong>
                <p>Restaure le film hydrolipidique et retient l'eau dans les couches profondes.</p>
              </div>
            </div>
            <div class="ap-rose__benefit">
              <div class="ap-rose__benefit-icon"><FlowerMark /></div>
              <div>
                <strong>Apaisante</strong>
                <p>Calme les irritations, réduit les rougeurs et renforce la tolérance cutanée.</p>
              </div>
            </div>
            <div class="ap-rose__benefit">
              <div class="ap-rose__benefit-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.8L19.5 9l-4.5 3.4L16.5 18 12 14.7 7.5 18l1.5-5.6L4.5 9l5.6-.2z"/></svg></div>
              <div>
                <strong>Illuminatrice</strong>
                <p>Unifie le teint, révèle l'éclat naturel et donne une peau lumineuse au quotidien.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="ap-rose__img-wrap">
          <img src="/image_site/FLS_8032.jpeg" alt="Rose de Damas — Rosa Beauty" class="ap-rose__img" />
          <div class="ap-rose__img-badge">Rose de Damas</div>
        </div>
      </div>
    </section>

    <!-- ── Notre mission ── -->
    <section class="ap-mission">
      <div class="container ap-mission__inner">
        <div class="ap-mission__img-col">
          <div class="ap-mission__img-stack">
            <img src="/image_site/FLS_8111.jpeg" alt="Produits Rosa Beauty" class="ap-mission__img ap-mission__img--back" />
            <img src="/image_site/FLS_8130.jpeg" alt="Ingrédients naturels" class="ap-mission__img ap-mission__img--front" />
          </div>
        </div>
        <div class="ap-mission__text">
          <span class="eyebrow">Notre mission</span>
          <h2 class="display-md">
            Un <em>rituel de soins</em><br>pensé pour vous
          </h2>
          <p>
            Chez Rosabeauty Facial Care, notre mission n'est pas de transformer la couleur de votre peau,
            mais de l'aider à être <strong>saine, lumineuse, équilibrée et rayonnante</strong>. Nous croyons que chaque
            femme mérite de se sentir belle dans sa peau et de prendre soin d'elle avec des produits adaptés à ses besoins.
          </p>
          <p>
            Au fil des années, Rosabeauty Facial Care a grandi grâce à la confiance de milliers de clientes.
            Chaque produit est pensé avec amour, exigence et respect de la peau, afin d'offrir une expérience
            de soin unique — pensée pour les peaux africaines, leur éclat et leurs besoins spécifiques.
          </p>
          <ul class="ap-mission__list">
            <li v-for="item in missionPoints" :key="item">
              <span class="ap-check">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ── Notre procédé ── -->
    <section class="ap-process">
      <div class="container">
        <div class="ap-process__header">
          <span class="eyebrow">Notre procédé</span>
          <h2 class="display-md">De la nature à votre peau</h2>
          <p class="ap-process__desc">
            Chaque étape de la fabrication est pensée pour préserver les bienfaits des ingrédients naturels.
          </p>
        </div>

        <div class="ap-process__steps">
          <div v-for="(step, i) in processSteps" :key="i" class="ap-step">
            <div class="ap-step__num">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="ap-step__img-wrap">
              <img :src="step.image" :alt="step.title" class="ap-step__img" />
            </div>
            <h3 class="ap-step__title">{{ step.title }}</h3>
            <p class="ap-step__desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Valeurs ── -->
    <section class="ap-values">
      <div class="container">
        <span class="eyebrow" style="text-align:center; display:block;">Nos engagements</span>
        <h2 class="display-md" style="text-align:center; margin-bottom: var(--space-12);">
          Ce qui nous définit
        </h2>
        <div class="ap-values__grid">
          <div v-for="val in values" :key="val.title" class="ap-value-card card">
            <div class="ap-value-card__icon" v-html="val.icon"></div>
            <h3 class="ap-value-card__title">{{ val.title }}</h3>
            <p class="ap-value-card__desc">{{ val.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Galerie immersive ── -->
    <section class="ap-gallery">
      <div class="ap-gallery__strip">
        <img src="/image_site/FLS_8130.jpeg" alt="" />
        <img src="/image_site/FLS_8142.jpeg" alt="" />
        <img src="/image_site/DSC_7542.jpeg" alt="" />
        <img src="/image_site/DSC_7553.jpeg" alt="" />
        <img src="/image_site/DSC_7629.jpeg" alt="" />
      </div>
    </section>

    <!-- ── CTA ── -->
    <section class="ap-cta">
      <div class="container ap-cta__inner">
        <div class="ap-cta__quote-mark">"</div>
        <h2 class="display-md ap-cta__headline">
          Votre corps est<br><em>votre meilleur accessoire</em>
        </h2>
        <p>
          Prenez-en soin. Plus qu'une marque de cosmétiques, Rosabeauty Facial Care est une invitation
          à prendre soin de soi, à s'aimer davantage et à révéler sa beauté naturelle.
        </p>
        <div class="ap-cta__btns">
          <RouterLink to="/products" class="btn btn-primary">Voir nos produits</RouterLink>
          <RouterLink to="/contact"  class="btn btn-outline">Nous contacter</RouterLink>
        </div>
        <p class="ap-cta__attr">— Maïmouna Diabagate, fondatrice de Rosa Beauty</p>
      </div>
    </section>

  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import RosaVideoPlayer from '@/components/ui/RosaVideoPlayer.vue'

// Chemin runtime — pas résolu par Vite à la compilation
// Mets rosa-beauty.mp4 dans commerce-front/public/ avant de tester
// V6.mp4 = version web convertie depuis V6.mov (node scripts/convert-video.cjs)
const videoSrc = '/rosa-beauty.mp4'

const stats = [
  { value: '100%', label: 'Formules naturelles' },
  { value: '5+',   label: 'Gammes de soins' },
  { value: '0',    label: 'Parabens & sulfates' },
  { value: '2 000+', label: 'Clientes satisfaites' },
]

const missionPoints = [
  'Formules 95%+ d\'ingrédients naturels',
  'Sans parabens, sulfates, ni colorants artificiels',
  'Testées dermatologiquement',
  'Adaptées aux peaux africaines',
  'Produites de façon éthique et responsable',
]

const processSteps = [
  {
    image: '/image_site/FLS_8111.jpeg',
    title: 'Sélection des ingrédients',
    desc:  'Nous sourçons des ingrédients naturels de haute qualité — huiles précieuses, extraits botaniques et actifs concentrés soigneusement choisis.',
  },
  {
    image: '/image_site/FLS_8130.jpeg',
    title: 'Formulation experte',
    desc:  'Nos formules sont développées en collaboration avec des experts en cosmétique pour garantir efficacité et tolérance cutanée.',
  },
  {
    image: '/image_site/FLS_8032.jpeg',
    title: 'Contrôle qualité',
    desc:  'Chaque lot est testé rigoureusement avant distribution pour garantir une qualité constante et une sécurité optimale.',
  },
  {
    image: '/image_site/FLS_8142.jpeg',
    title: 'Livraison chez vous',
    desc:  'Vos produits arrivent dans un emballage soigné, directement à votre porte, partout en Côte d\'Ivoire.',
  },
]

const SVG = (p) => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`
const values = [
  {
    icon:  SVG('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>'),
    title: 'Naturalité',
    desc:  'Des formules pensées pour préserver les bienfaits des actifs naturels, sans compromis sur l\'efficacité.',
  },
  {
    icon:  SVG('<path d="M12 3l1.9 5.8L19.5 9l-4.5 3.4L16.5 18 12 14.7 7.5 18l1.5-5.6L4.5 9l5.6-.2z"/>'),
    title: 'Efficacité prouvée',
    desc:  'Chaque produit est formulé pour apporter des résultats visibles, adaptés à toutes les types de peaux.',
  },
  {
    icon:  SVG('<path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>'),
    title: 'Accessibilité',
    desc:  'Une beauté de qualité ne devrait pas être réservée à quelques-unes. Rosa Beauty est pour toutes.',
  },
  {
    icon:  SVG('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>'),
    title: 'Éthique',
    desc:  'Nous nous engageons pour une production responsable, respectueuse des personnes et de l\'environnement.',
  },
]
</script>

<style scoped>
/* ── Hero ── */
.ap-hero {
  padding: var(--space-20) 0 var(--space-16);
  background: linear-gradient(150deg, var(--cream-50) 0%, var(--rose-50) 100%);
}
.ap-hero__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
  align-items: center;
}
.ap-hero__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.ap-hero__title { line-height: 1.1; }
.ap-hero__title em { font-style: italic; color: var(--color-primary); }
.ap-hero__desc {
  font-size: 1.0625rem;
  color: var(--gray-500);
  line-height: 1.75;
  max-width: 480px;
}
.ap-hero__img-wrap {
  position: relative;
}
.ap-hero__img {
  width: 100%;
  height: 480px;
  object-fit: cover;
  border-radius: var(--radius-2xl, 24px);
  display: block;
  position: relative;
  z-index: 1;
}
.ap-hero__img-deco {
  position: absolute;
  inset: 16px -16px -16px 16px;
  border-radius: var(--radius-2xl, 24px);
  background: var(--rose-200);
  z-index: 0;
}

/* ── Stats ── */
.ap-stats {
  padding: var(--space-10) 0;
  background: #fff;
  border-top: 1px solid var(--cream-200);
  border-bottom: 1px solid var(--cream-200);
}
.ap-stats__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  text-align: center;
}
.ap-stat__value {
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: 600;
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: var(--space-2);
}
.ap-stat__label {
  font-size: 0.8125rem;
  color: var(--gray-500);
  font-weight: 500;
}

/* ── Mission ── */
.ap-mission {
  padding: var(--space-20) 0;
  background: var(--color-bg);
}
.ap-mission__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
  align-items: center;
}
.ap-mission__img-stack {
  position: relative;
  height: 440px;
}
.ap-mission__img {
  position: absolute;
  border-radius: var(--radius-xl);
  object-fit: cover;
}
.ap-mission__img--back {
  width: 75%;
  height: 80%;
  top: 0;
  left: 0;
}
.ap-mission__img--front {
  width: 60%;
  height: 65%;
  bottom: 0;
  right: 0;
  border: 4px solid #fff;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}
.ap-mission__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.ap-mission__text h2 em { font-style: italic; color: var(--color-primary); }
.ap-mission__text p {
  color: var(--gray-500);
  line-height: 1.75;
  font-size: 0.9375rem;
}
.ap-mission__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-2);
}
.ap-mission__list li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
}
.ap-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--rose-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--rose-600);
  flex-shrink: 0;
}

/* ── Process ── */
.ap-process {
  padding: var(--space-20) 0;
  background: var(--cream-50);
}
.ap-process__header {
  text-align: center;
  margin-bottom: var(--space-12);
}
.ap-process__desc {
  color: var(--gray-400);
  font-size: 0.9375rem;
  max-width: 520px;
  margin: var(--space-4) auto 0;
  line-height: 1.7;
}
.ap-process__steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
}
.ap-step {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.ap-step__num {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--rose-400);
}
.ap-step__img-wrap {
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 4/3;
}
.ap-step__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.ap-step:hover .ap-step__img { transform: scale(1.04); }
.ap-step__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-top: var(--space-2);
}
.ap-step__desc {
  font-size: 0.875rem;
  color: var(--gray-500);
  line-height: 1.65;
}

/* ── Valeurs ── */
.ap-values {
  padding: var(--space-20) 0;
  background: #fff;
}
.ap-values__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-5);
}
.ap-value-card {
  padding: var(--space-8) var(--space-6);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  transition: transform var(--transition-normal);
}
.ap-value-card:hover { transform: translateY(-4px); }
.ap-value-card__icon { font-size: 2rem; }
.ap-value-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
}
.ap-value-card__desc {
  font-size: 0.875rem;
  color: var(--gray-500);
  line-height: 1.65;
}

/* ── Galerie strip ── */
.ap-gallery {
  overflow: hidden;
  height: 260px;
}
.ap-gallery__strip {
  display: flex;
  height: 100%;
  gap: 4px;
}
.ap-gallery__strip img {
  flex: 1;
  height: 100%;
  object-fit: cover;
  transition: flex 0.5s ease;
}
.ap-gallery__strip img:hover { flex: 2; }

/* ── CTA ── */
.ap-cta {
  padding: var(--space-20) 0;
  background: linear-gradient(135deg, var(--rose-50) 0%, var(--cream-100) 100%);
}
.ap-cta__inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
}
.ap-cta__inner p {
  font-size: 1.0625rem;
  color: var(--gray-500);
  max-width: 480px;
}
.ap-cta__btns {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  justify-content: center;
}

/* ── Hero founder badge ── */
.ap-hero__founder {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
}
.ap-hero__founder-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--rose-400), var(--rose-600));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  flex-shrink: 0;
}
.ap-hero__founder-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--gray-800);
}
.ap-hero__founder-role {
  font-size: 0.8125rem;
  color: var(--gray-400);
}

/* ── Section fondatrice + vidéo ── */
.ap-founder {
  padding: var(--space-20) 0;
  background: var(--gray-900);
}
.ap-founder__inner {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: var(--space-16);
  align-items: center;
}
.ap-founder__video-wrap {
  position: relative;
}
.ap-founder__video-label {
  position: absolute;
  top: -14px;
  left: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--rose-500);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 16px rgba(232, 51, 109, 0.35);
  z-index: 2;
}
.ap-founder__quote-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.ap-founder__blockquote {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 2.2vw, 1.75rem);
  font-weight: 400;
  font-style: italic;
  color: #fff;
  line-height: 1.45;
  border-left: 3px solid var(--rose-500);
  padding-left: var(--space-5);
}
.ap-founder__text {
  font-size: 0.9375rem;
  color: var(--gray-300);
  line-height: 1.75;
}
.ap-founder__sig {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: var(--space-3);
  border-top: 1px solid rgba(255,255,255,0.08);
}
.ap-founder__sig-name {
  font-weight: 600;
  color: var(--rose-300);
  font-size: 0.9375rem;
}
.ap-founder__sig-title {
  font-size: 0.8125rem;
  color: var(--gray-500);
}

/* ── Rose de Damas ── */
.ap-rose {
  padding: var(--space-20) 0;
  background: linear-gradient(150deg, var(--rose-50) 0%, var(--cream-100) 100%);
}
.ap-rose__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
  align-items: center;
}
.ap-rose__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.ap-rose__text h2 em { font-style: italic; color: var(--color-primary); }
.ap-rose__desc {
  font-size: 0.9375rem;
  color: var(--gray-500);
  line-height: 1.75;
}
.ap-rose__benefits {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-2);
}
.ap-rose__benefit {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}
.ap-rose__benefit-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ap-rose__benefit strong {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 2px;
}
.ap-rose__benefit p {
  font-size: 0.875rem;
  color: var(--gray-500);
  line-height: 1.6;
  margin: 0;
}
.ap-rose__img-wrap {
  position: relative;
}
.ap-rose__img {
  width: 100%;
  height: 480px;
  object-fit: cover;
  border-radius: var(--radius-xl);
  display: block;
}
.ap-rose__img-badge {
  position: absolute;
  bottom: 24px;
  left: 24px;
  background: rgba(232, 51, 109, 0.9);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  backdrop-filter: blur(8px);
}

/* ── CTA enrichi ── */
.ap-cta__quote-mark {
  font-family: var(--font-display);
  font-size: 6rem;
  line-height: 0.6;
  color: var(--rose-200);
  user-select: none;
}
.ap-cta__headline em { font-style: italic; color: var(--color-primary); }
.ap-cta__attr {
  font-size: 0.8125rem;
  color: var(--gray-400);
  font-style: italic;
  margin-top: calc(-1 * var(--space-3));
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .ap-hero__inner       { grid-template-columns: 1fr; }
  .ap-hero__img-deco    { display: none; }
  .ap-hero__img         { height: 320px; }
  .ap-founder__inner    { grid-template-columns: 1fr; }
  .ap-rose__inner       { grid-template-columns: 1fr; }
  .ap-rose__img         { height: 320px; }
  .ap-mission__inner    { grid-template-columns: 1fr; }
  .ap-mission__img-stack { height: 300px; }
  .ap-process__steps    { grid-template-columns: repeat(2, 1fr); }
  .ap-values__grid      { grid-template-columns: repeat(2, 1fr); }
  .ap-stats__grid       { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .ap-process__steps { grid-template-columns: 1fr; }
  .ap-values__grid   { grid-template-columns: 1fr 1fr; }
  .ap-gallery        { height: 160px; }
}
</style>

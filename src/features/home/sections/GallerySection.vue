<template>
  <section class="gallery-section">
    <div class="container">
      <SectionHeader eyebrow="Univers Rosa Beauty Facial Care">
        Dans les coulisses de la beauté
      </SectionHeader>

      <div class="gallery-grid">
        <!-- Grande image gauche -->
        <div class="gallery-item gallery-item--large" @click="openLightbox(0)">
          <img src="/image_site/FLS_8032.jpeg" alt="Produits Rosa Beauty Facial Care — Collection" loading="lazy" />
          <div class="gallery-overlay">
            <span class="gallery-zoom">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
              </svg>
            </span>
          </div>
        </div>

        <!-- Colonne droite -->
        <div class="gallery-col">
          <div class="gallery-item" @click="openLightbox(1)">
            <img src="/image_site/FLS_8111.jpeg" alt="Matières premières naturelles" loading="lazy" />
            <div class="gallery-overlay">
              <span class="gallery-zoom">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
                </svg>
              </span>
            </div>
          </div>
          <div class="gallery-item" @click="openLightbox(2)">
            <img src="/image_site/FLS_8130.jpeg" alt="Formulation Rosa Beauty Facial Care" loading="lazy" />
            <div class="gallery-overlay">
              <span class="gallery-zoom">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Rangée basse -->
      <div class="gallery-row">
        <div class="gallery-item gallery-item--wide" @click="openLightbox(3)">
          <img src="/image_site/FLS_8142.jpeg" alt="Atelier Rosa Beauty Facial Care" loading="lazy" />
          <div class="gallery-overlay">
            <span class="gallery-zoom">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
              </svg>
            </span>
          </div>
        </div>
        <div class="gallery-item gallery-item--wide" @click="openLightbox(4)">
          <img src="/image_site/DSC_7542.jpeg" alt="Ingrédients naturels Rosa Beauty Facial Care" loading="lazy" />
          <div class="gallery-overlay">
            <span class="gallery-zoom">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
              </svg>
            </span>
          </div>
        </div>
        <div class="gallery-item gallery-item--wide" @click="openLightbox(5)">
          <img src="/image_site/DSC_7553.jpeg" alt="Soins Rosa Beauty Facial Care" loading="lazy" />
          <div class="gallery-overlay">
            <span class="gallery-zoom">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lb">
        <div v-if="lightboxIndex !== null" class="lightbox" @click.self="lightboxIndex = null">
          <button class="lightbox__close" @click="lightboxIndex = null">×</button>
          <button class="lightbox__prev" @click="prevImg" v-if="lightboxIndex > 0">‹</button>
          <button class="lightbox__next" @click="nextImg" v-if="lightboxIndex < images.length - 1">›</button>
          <img :src="images[lightboxIndex]" class="lightbox__img" />
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'

const images = [
  '/image_site/FLS_8032.jpeg',
  '/image_site/FLS_8111.jpeg',
  '/image_site/FLS_8130.jpeg',
  '/image_site/FLS_8142.jpeg',
  '/image_site/DSC_7542.jpeg',
  '/image_site/DSC_7553.jpeg',
  '/image_site/DSC_7629.jpeg',
]

const lightboxIndex = ref(null)

function openLightbox(idx) { lightboxIndex.value = idx }
function prevImg() { if (lightboxIndex.value > 0) lightboxIndex.value-- }
function nextImg() { if (lightboxIndex.value < images.length - 1) lightboxIndex.value++ }
</script>

<style scoped>
.gallery-section {
  padding: var(--space-16) 0;
  background: var(--color-bg);
}

/* ── Grid principale ── */
.gallery-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.gallery-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.gallery-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

/* ── Item ── */
.gallery-item {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  background: var(--cream-100);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.gallery-item:hover img { transform: scale(1.04); }

.gallery-item--large { min-height: 340px; }
.gallery-col .gallery-item { height: 160px; }
.gallery-row .gallery-item { height: 200px; }

/* ── Overlay ── */
.gallery-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
}
.gallery-item:hover .gallery-overlay { background: rgba(0,0,0,0.28); }

.gallery-zoom {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.7);
  transition: all var(--transition-fast);
  color: var(--gray-700);
}
.gallery-item:hover .gallery-zoom {
  opacity: 1;
  transform: scale(1);
}

/* ── Lightbox ── */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0,0,0,0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.lightbox__img {
  max-width: 90vw;
  max-height: 88vh;
  object-fit: contain;
  border-radius: var(--radius-lg);
}

.lightbox__close {
  position: absolute;
  top: 20px;
  right: 24px;
  font-size: 2rem;
  color: rgba(255,255,255,0.7);
  line-height: 1;
  transition: color var(--transition-fast);
}
.lightbox__close:hover { color: #fff; }

.lightbox__prev,
.lightbox__next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 3rem;
  color: rgba(255,255,255,0.6);
  padding: 16px;
  transition: color var(--transition-fast);
}
.lightbox__prev:hover,
.lightbox__next:hover { color: #fff; }
.lightbox__prev { left: 16px; }
.lightbox__next { right: 16px; }

/* Lightbox transition */
.lb-enter-active,
.lb-leave-active { transition: opacity 0.2s ease; }
.lb-enter-from,
.lb-leave-to { opacity: 0; }

@media (max-width: 1024px) {
  .gallery-grid { grid-template-columns: 1fr; }
  .gallery-col  { flex-direction: row; }
  .gallery-col .gallery-item { flex: 1; height: 180px; }
}
@media (max-width: 640px) {
  .gallery-row  { grid-template-columns: 1fr 1fr; }
  .gallery-col  { flex-direction: column; }
  .gallery-col .gallery-item { height: 160px; }
}
</style>

<template>
  <main class="auth-page">
    <!-- Background décoratif -->
    <div class="auth-bg" aria-hidden="true">
      <div class="auth-bg__blob auth-bg__blob--1"></div>
      <div class="auth-bg__blob auth-bg__blob--2"></div>
      <div class="auth-bg__petal auth-bg__petal--1">🌸</div>
      <div class="auth-bg__petal auth-bg__petal--2">🌹</div>
    </div>

    <div class="auth-inner">
      <header class="auth-header">
        <RouterLink to="/" class="auth-logo" aria-label="Rosa Beauty - Accueil">
          <svg viewBox="0 0 40 40" fill="none" width="44" height="44">
            <circle cx="20" cy="20" r="19" fill="#fff0f5" stroke="#e8336d" stroke-width="1.5"/>
            <path d="M20 10 C20 10 14 14 14 20 C14 26 20 30 20 30 C20 30 26 26 26 20 C26 14 20 10 20 10Z"
                  fill="#e8336d" opacity="0.9"/>
            <circle cx="20" cy="20" r="3" fill="#fff" opacity="0.9"/>
          </svg>
          <div class="auth-logo__text">
            <span class="auth-logo__name">Rosa Beauty</span>
            <span class="auth-logo__sub">Facial Care</span>
          </div>
        </RouterLink>

        <span class="eyebrow">{{ eyebrow }}</span>
        <h1 class="display-lg auth-title" v-html="title"></h1>
        <p class="auth-desc">{{ desc }}</p>
      </header>

      <div class="card auth-card">
        <slot />

        <p class="auth-footer">
          {{ footerText }}
          <RouterLink :to="footerLink">{{ footerLinkText }}</RouterLink>
        </p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  eyebrow:      { type: String, required: true },
  title:        { type: String, required: true },  // HTML autorisé pour les <em>
  desc:         { type: String, required: true },
  footerText:   { type: String, required: true },
  footerLink:   { type: String, required: true },
  footerLinkText: { type: String, required: true },
});
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-4);
  background: linear-gradient(160deg, var(--cream-50) 0%, var(--rose-50) 60%, var(--cream-100) 100%);
  position: relative;
  overflow: hidden;
}

.auth-bg { position: absolute; inset: 0; pointer-events: none; }
.auth-bg__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}
.auth-bg__blob--1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, var(--rose-200), transparent 70%);
  top: -100px; right: -80px;
  animation: floatY 8s ease-in-out infinite;
}
.auth-bg__blob--2 {
  width: 320px; height: 320px;
  background: radial-gradient(circle, var(--gold-200), transparent 70%);
  bottom: -60px; left: -60px;
  animation: floatY 10s ease-in-out infinite reverse;
}
.auth-bg__petal {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.18;
  animation: floatY 6s ease-in-out infinite;
}
.auth-bg__petal--1 { top: 15%; left: 8%; }
.auth-bg__petal--2 { bottom: 12%; right: 12%; font-size: 2rem; animation-delay: 2s; }

.auth-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.auth-logo__text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  text-align: left;
}
.auth-logo__name {
  font-family: var(--font-display);
  font-size: 1.375rem;
  font-weight: 500;
  color: var(--gray-800);
}
.auth-logo__sub {
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.auth-title { color: var(--gray-800); }
:deep(.auth-title em) { font-style: italic; color: var(--color-primary); }

.auth-desc {
  color: var(--gray-500);
  font-size: 0.9375rem;
  max-width: 380px;
  text-align: center;
}

.auth-card {
  padding: var(--space-8);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-md);
  border-color: var(--cream-200);
}

.auth-footer {
  text-align: center;
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-top: var(--space-6);
}
.auth-footer a {
  color: var(--rose-500);
  font-weight: 600;
  transition: color var(--transition-fast);
}
.auth-footer a:hover { color: var(--rose-700); }
</style>

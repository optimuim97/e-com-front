<template>
  <!--
    Purement décoratif : hors du flux, insensible au clic, et invisible pour
    les lecteurs d'écran. Rien de ce qui compte ne passe par ici.
  -->
  <canvas ref="canvas" class="confetti" aria-hidden="true"></canvas>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  /** Nombre de confettis. Assez pour la fête, pas au point de ramer. */
  count:    { type: Number, default: 90 },
  /** Durée en millisecondes, après quoi le canevas se retire. */
  duration: { type: Number, default: 2600 },
})

const canvas = ref(null)

let frame = null
let stopAt = 0

/** Les couleurs de la maison, plus un doré pour la fête. */
const COLORS = ['#e8336d', '#f06292', '#f8bbd0', '#f6c667', '#ffffff']

function start() {
  const el = canvas.value
  if (!el) return

  const ctx = el.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  const resize = () => {
    el.width  = window.innerWidth * dpr
    el.height = window.innerHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()

  const width  = () => el.width / dpr
  const height = () => el.height / dpr

  // Deux gerbes, parties des coins bas : plus vivant qu'une pluie uniforme.
  const pieces = Array.from({ length: props.count }, (_, i) => {
    const fromLeft = i % 2 === 0
    const angle    = (fromLeft ? -60 : -120) + (Math.random() * 40 - 20)
    const speed    = 11 + Math.random() * 9

    return {
      x: fromLeft ? width() * 0.15 : width() * 0.85,
      y: height() * 0.75,
      vx: Math.cos((angle * Math.PI) / 180) * speed,
      vy: Math.sin((angle * Math.PI) / 180) * speed,
      size: 5 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
    }
  })

  stopAt = performance.now() + props.duration

  const draw = (now) => {
    ctx.clearRect(0, 0, width(), height())

    // Fondu sur le dernier tiers : les confettis s'effacent au lieu de
    // disparaître d'un coup.
    const left = Math.max(0, stopAt - now)
    ctx.globalAlpha = Math.min(1, left / (props.duration / 3))

    for (const p of pieces) {
      p.vy += 0.32              // gravité
      p.vx *= 0.99              // frottement de l'air
      p.x  += p.vx
      p.y  += p.vy
      p.rotation += p.spin

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      ctx.restore()
    }

    frame = left > 0 ? requestAnimationFrame(draw) : null

    if (!frame) ctx.clearRect(0, 0, width(), height())
  }

  frame = requestAnimationFrame(draw)
  window.addEventListener('resize', resize)
  cleanupResize = () => window.removeEventListener('resize', resize)
}

let cleanupResize = () => {}

onMounted(() => {
  // Mouvement réduit demandé par le système : on n'anime pas. Une animation
  // imposée peut gêner, voire rendre malade.
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  start()
})

onUnmounted(() => {
  if (frame) cancelAnimationFrame(frame)
  cleanupResize()
})
</script>

<style scoped>
.confetti {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  /* Au-dessus de la modale de commande rapide (1100), sous la fenêtre de
     doublon (1300) : la fête ne masque jamais une question. */
  z-index: 1200;
  pointer-events: none;
}
</style>

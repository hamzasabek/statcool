// A small burst of dots in the four logo colours (pink, lime, cyan, yellow): when a game is
// finished (its last milestone, see useChime in sound.js) and when a quiz is answered perfectly.
// Plain DOM + Web Animations, no React; it removes itself. Nothing with reduced motion.

const COLORS = ['--logo-pink', '--logo-lime', '--logo-cyan', '--logo-yellow']
const COUNT = 36

export function celebrate() {
  if (typeof window === 'undefined' || !document.body.animate) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const cs = getComputedStyle(document.documentElement)
  const colors = COLORS.map((c) => cs.getPropertyValue(c).trim())
  const layer = document.createElement('div')
  layer.className = 'burst'
  layer.setAttribute('aria-hidden', 'true')
  // From the middle of the screen, a little above the centre.
  layer.style.left = `${window.innerWidth / 2}px`
  layer.style.top = `${window.innerHeight * 0.42}px`
  document.body.appendChild(layer)
  let left = COUNT
  for (let i = 0; i < COUNT; i++) {
    const dot = document.createElement('span')
    const size = 6 + Math.random() * 8
    dot.style.width = dot.style.height = `${size}px`
    dot.style.background = colors[i % colors.length]
    layer.appendChild(dot)
    const a = (i / COUNT) * 2 * Math.PI + Math.random() * 0.4
    const v = 110 + Math.random() * 150 // how far it flies (px)
    const dx = Math.cos(a) * v
    const dy = Math.sin(a) * v * 0.8 - 60 // a little upwards first
    const fall = 140 + Math.random() * 80 // then gravity
    dot
      .animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
          { transform: `translate(calc(-50% + ${dx * 0.75}px), calc(-50% + ${dy * 0.75}px)) scale(1)`, opacity: 1, offset: 0.45 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + fall}px)) scale(0.8)`, opacity: 0 },
        ],
        { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)', fill: 'forwards' },
      )
      .finished.then(() => {
        if (--left === 0) layer.remove()
      })
  }
}

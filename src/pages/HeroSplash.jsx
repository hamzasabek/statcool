import { useEffect, useRef } from 'react'

// Home hero: a splash of yellow dots whose outline changes slowly, all the time. Under the cursor
// the dots grow, more the closer they are (a soft lens). Any dot can be dragged somewhere else: it
// stays there and keeps drifting with the splash. Positions are updated in a requestAnimationFrame
// loop straight on the SVG (no React render per frame). Reduced motion: the outline stays still.

const VIEW = 480
const C = VIEW / 2
const R = 158 // mean radius of the splash
const N = 120
const DOT = 6.5 // dot radius at rest
const GROW = 1.4 // extra size right under the cursor (× DOT)
const LENS = 48 // reach of the lens (SD of a Gaussian, in viewBox units)
const HIT = 13 // grab radius
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

// The edge of the splash at angle th, time t (s): three slow waves around a circle.
const edge = (th, t) =>
  R *
  (1 +
    0.1 * Math.sin(3 * th + 0.21 * t) +
    0.07 * Math.sin(5 * th - 0.13 * t + 1.3) +
    0.05 * Math.sin(2 * th + 0.17 * t + 2.1))

// Each dot: an angle th and a fraction f of the edge distance (sunflower spiral = even spacing).
const startDots = () =>
  Array.from({ length: N }, (_, i) => {
    const f = Math.sqrt((i + 0.5) / N) * 0.96
    return { th: i * GOLDEN, f, ph: (i * 2.399) % (2 * Math.PI), delay: f * 0.6, x: C, y: C, r: 0 }
  })

const easeOutBack = (k) => 1 + 2.2 * (k - 1) ** 3 + 1.2 * (k - 1) ** 2

export default function HeroSplash({ caption, aria }) {
  const svgRef = useRef(null)
  const dots = useRef(null)
  if (!dots.current) dots.current = startDots()
  const cursor = useRef(null) // {x, y} in viewBox units, or null
  const drag = useRef(null) // {i, x, y}
  const clock = useRef(0) // time of the outline, in seconds

  useEffect(() => {
    const svg = svgRef.current
    const groups = [...svg.querySelectorAll('.hero-dotg')]
    const circles = groups.map((g) => g.querySelector('.hero-dot'))
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let last = performance.now()
    let start = last
    let visible = true

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!reduce) clock.current += dt
      const t = clock.current
      const since = reduce ? 99 : (now - start) / 1000
      const cur = cursor.current
      dots.current.forEach((d, i) => {
        const k = Math.min(1, Math.max(0, (since - d.delay) / 0.9))
        const grow = easeOutBack(k)
        if (drag.current?.i === i) {
          d.x = drag.current.x
          d.y = drag.current.y
        } else {
          const e = edge(d.th, t) * d.f
          const wob = reduce ? 0 : 2.2
          d.x = C + grow * (e * Math.cos(d.th) + wob * Math.sin(0.7 * t + d.ph))
          d.y = C + grow * (e * Math.sin(d.th) + wob * Math.cos(0.6 * t + 1.3 * d.ph))
        }
        let target = DOT
        if (cur) target *= 1 + GROW * Math.exp(-((d.x - cur.x) ** 2 + (d.y - cur.y) ** 2) / (2 * LENS * LENS))
        if (drag.current?.i === i) target = DOT * (1 + GROW) * 1.1
        d.r += (target - d.r) * 0.22
        groups[i].setAttribute('transform', `translate(${d.x.toFixed(2)} ${d.y.toFixed(2)})`)
        circles[i].setAttribute('r', (d.r * Math.min(1, k * 1.4)).toFixed(2))
      })
      raf = visible ? requestAnimationFrame(frame) : 0
    }
    // Only animate while the hero is on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    })
    io.observe(svg)
    // Phones: a touch that starts on a dot drags it instead of scrolling the page (touch-action
    // does not work on SVG shapes); a touch anywhere else still scrolls.
    const noScroll = (e) => {
      if (e.target instanceof Element && e.target.classList.contains('hero-hit')) e.preventDefault()
    }
    svg.addEventListener('touchstart', noScroll, { passive: false })
    start = performance.now()
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      svg.removeEventListener('touchstart', noScroll)
    }
  }, [])

  const toView = (e) => {
    const p = svgRef.current.createSVGPoint()
    p.x = e.clientX
    p.y = e.clientY
    const q = p.matrixTransform(svgRef.current.getScreenCTM().inverse())
    return { x: Math.min(VIEW - DOT, Math.max(DOT, q.x)), y: Math.min(VIEW - DOT, Math.max(DOT, q.y)) }
  }
  const onDown = (i) => (e) => {
    e.preventDefault()
    svgRef.current.setPointerCapture(e.pointerId)
    const p = toView(e)
    cursor.current = p
    drag.current = { i, ...p }
    svgRef.current.classList.add('is-dragging')
  }
  const onMove = (e) => {
    const p = toView(e)
    cursor.current = p
    if (drag.current) Object.assign(drag.current, p)
  }
  const onUp = (e) => {
    const g = drag.current
    if (g) {
      // The dot stays where it was dropped: store it as an angle and a share of the edge.
      const d = dots.current[g.i]
      d.th = Math.atan2(g.y - C, g.x - C)
      d.f = Math.hypot(g.x - C, g.y - C) / edge(d.th, clock.current)
      drag.current = null
      svgRef.current.classList.remove('is-dragging')
    }
    if (e.pointerType !== 'mouse') cursor.current = null
  }

  return (
    <figure className="hero-figure">
      <svg
        ref={svgRef}
        className="hero-splash"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        role="img"
        aria-label={aria}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={() => {
          if (!drag.current) cursor.current = null
        }}
      >
        {dots.current.map((_, i) => (
          <g key={i} className="hero-dotg" transform={`translate(${C} ${C})`} onPointerDown={onDown(i)}>
            <circle className="hero-hit" r={HIT} />
            <circle className="hero-dot" r={0} />
          </g>
        ))}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

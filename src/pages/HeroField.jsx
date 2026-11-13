import { useEffect, useRef } from 'react'

// Home hero background: a crowd of yellow dots of different sizes, drawn on a canvas behind the
// hero. They are pulled gently towards the empty figure slot on the right (below the buttons on
// phones), never overlap, and the pointer (or a finger) pushes through them, opening a hole that
// closes again behind it. Our own small simulation (Verlet steps + collisions on a grid), inspired by
// the home page of Seeing Theory (Brown University). Reduced motion: one settled, still picture.

const GAP = 3.5 // space kept between two dots
const PUSH = 70 // reach of the pointer (px)
const PULL = 0.0011 // pull towards the slot centre
const DAMP = 0.86 // velocity kept at each step

function makeDots(slotW) {
  // As many dots as fill a disc of about 0.47 × the slot width.
  const radius = slotW * 0.47
  const n = Math.min(340, Math.round(((radius / 10.5) ** 2) * 0.86))
  return Array.from({ length: n }, () => {
    const r = 2.5 + Math.random() ** 1.6 * 9.5 // many small dots, a few big ones
    return { r, a: 0.55 + Math.random() * 0.4, x: 0, y: 0, px: 0, py: 0 }
  })
}

export default function HeroField({ caption, aria }) {
  const slotRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const slot = slotRef.current
    const hero = slot.closest('.home-hero')
    const ctx = canvas.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0
    let H = 0
    let anchor = { x: 0, y: 0 }
    let dots = []
    let pointer = null
    let colors = null
    let raf = 0
    let visible = true

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement)
      colors = {
        fill: cs.getPropertyValue('--added').trim() || '#ffde42',
        stroke: cs.getPropertyValue('--dot-stroke').trim() || '#c9a400',
        light: document.documentElement.dataset.theme !== 'dark',
      }
    }

    const layout = () => {
      const box = canvas.getBoundingClientRect()
      const s = slot.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      W = box.width
      H = box.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      anchor = { x: s.left + s.width / 2 - box.left, y: s.top + s.height / 2 - box.top }
      if (!dots.length) {
        dots = makeDots(s.width)
        // Start scattered over the whole hero: they gather into the crowd.
        for (const d of dots) {
          d.x = d.px = Math.random() * W
          d.y = d.py = Math.random() * H
        }
      }
    }

    const step = () => {
      for (const d of dots) {
        const vx = (d.x - d.px) * DAMP
        const vy = (d.y - d.py) * DAMP
        d.px = d.x
        d.py = d.y
        d.x += vx + (anchor.x - d.x) * PULL
        d.y += vy + (anchor.y - d.y) * PULL
      }
      // The pointer pushes dots out of a circle around it.
      if (pointer) {
        for (const d of dots) {
          const dx = d.x - pointer.x
          const dy = d.y - pointer.y
          const reach = PUSH + d.r
          const l2 = dx * dx + dy * dy
          if (l2 < reach * reach && l2 > 0.01) {
            const l = Math.sqrt(l2)
            const k = ((reach - l) / l) * 0.3
            d.x += dx * k
            d.y += dy * k
          }
        }
      }
      // No overlaps: push apart any two dots that are too close (grid of cells, two passes).
      const cell = 2 * 12 + GAP
      for (let pass = 0; pass < 2; pass++) {
        const grid = new Map()
        dots.forEach((d, i) => {
          const key = `${Math.floor(d.x / cell)},${Math.floor(d.y / cell)}`
          if (!grid.has(key)) grid.set(key, [])
          grid.get(key).push(i)
        })
        dots.forEach((a, i) => {
          const cx = Math.floor(a.x / cell)
          const cy = Math.floor(a.y / cell)
          for (let gx = cx - 1; gx <= cx + 1; gx++) {
            for (let gy = cy - 1; gy <= cy + 1; gy++) {
              const list = grid.get(`${gx},${gy}`)
              if (!list) continue
              for (const j of list) {
                if (j <= i) continue
                const b = dots[j]
                const dx = a.x - b.x
                const dy = a.y - b.y
                const min = a.r + b.r + GAP
                const l2 = dx * dx + dy * dy
                if (l2 < min * min && l2 > 0.0001) {
                  const l = Math.sqrt(l2)
                  const k = ((l - min) / l) * 0.5
                  a.x -= dx * k
                  a.y -= dy * k
                  b.x += dx * k
                  b.y += dy * k
                }
              }
            }
          }
        })
      }
      for (const d of dots) {
        d.x = Math.min(W - d.r, Math.max(d.r, d.x))
        d.y = Math.min(H - d.r, Math.max(d.r, d.y))
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = colors.fill
      ctx.strokeStyle = colors.stroke
      ctx.lineWidth = 1
      for (const d of dots) {
        ctx.globalAlpha = colors.light ? Math.min(1, d.a + 0.15) : 0.35 + d.a * 0.7 // dark: less see-through, so the yellow stays yellow
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI)
        ctx.fill()
        if (colors.light) ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    let frames = 0
    const frame = () => {
      if (frames++ % 30 === 0) readColors()
      step()
      draw()
      raf = visible ? requestAnimationFrame(frame) : 0
    }

    readColors()
    layout()
    if (reduce) {
      for (let i = 0; i < 600; i++) step()
      draw()
    } else {
      raf = requestAnimationFrame(frame)
    }

    // Pointer anywhere over the hero (the canvas itself lets clicks through to the buttons).
    const toLocal = (e) => {
      const box = canvas.getBoundingClientRect()
      return { x: e.clientX - box.left, y: e.clientY - box.top }
    }
    const onMove = (e) => {
      pointer = toLocal(e)
    }
    const onLeave = () => {
      pointer = null
    }
    const onUp = (e) => {
      if (e.pointerType !== 'mouse') pointer = null
    }
    if (!reduce) {
      hero.addEventListener('pointermove', onMove)
      hero.addEventListener('pointerdown', onMove)
      hero.addEventListener('pointerup', onUp)
      hero.addEventListener('pointercancel', onLeave)
      hero.addEventListener('pointerleave', onLeave)
    }

    const ro = new ResizeObserver(() => {
      layout()
      if (reduce) draw()
    })
    ro.observe(hero)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf && !reduce) raf = requestAnimationFrame(frame)
    })
    io.observe(canvas)
    const mo = new MutationObserver(() => {
      readColors()
      if (reduce) draw()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerdown', onMove)
      hero.removeEventListener('pointerup', onUp)
      hero.removeEventListener('pointercancel', onLeave)
      hero.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="hero-field" role="img" aria-label={aria} />
      <figure className="hero-figure hero-slot">
        <div ref={slotRef} className="hero-slot-box" />
        <figcaption>{caption}</figcaption>
      </figure>
    </>
  )
}

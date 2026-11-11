import { useLayoutEffect, useRef, useState } from 'react'
import { useText } from '../../i18n.jsx'
import { TARGET_R, cloud, fmtPx } from './sd.js'
import { AIM } from './text.js'

// Every tap drawn around one big target: where it landed compared with the centre, zoomed in.
//   series     : [{ key: 'a' | 'b', taps: [{ dx, dy }], faint }]
//   showSpread : drawn over the dots: each cloud's mean point (+) and its 1-SD ellipse (SD left–right × SD up–down)
//   lastKey    : ring the last tap of that series
// Taps further out than the drawn area sit on its edge.

const MIN_R = TARGET_R * 1.6 // the view always shows a bit more than the target
const MAX_R = TARGET_R * 5 // and never zooms out further (a wild tap sits on the edge)

export default function Bullseye({ series, showSpread = false, lastKey }) {
  const tx = useText(AIM)
  const wrapRef = useRef(null)
  const [{ width, height }, setSize] = useState({ width: 320, height: 320 })

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const all = series.flatMap((s) => s.taps)
  const far = Math.max(0, ...all.map((t) => Math.hypot(t.dx, t.dy)))
  const D = Math.min(MAX_R, Math.max(MIN_R, far * 1.12)) // error (px) at the edge of the view
  const cx = width / 2
  const cy = height / 2
  const R = Math.max(40, Math.min(width, height) / 2 - 10) // drawn radius of the view
  const k = R / D
  const place = (t) => {
    const d = Math.hypot(t.dx, t.dy)
    const f = d > D ? D / d : 1 // beyond the edge: on the edge
    return [cx + t.dx * f * k, cy + t.dy * f * k]
  }
  const dotR = Math.max(3.5, Math.min(6, R / 26))
  const n = all.length

  return (
    <div ref={wrapRef} className="chart-fill aim-bull" data-tour="chart">
      <svg className="chart" width={width} height={height} role="img" aria-label={n ? tx.bullAria(n) : tx.bullEmpty}>
        <circle className="aim-bull-view" cx={cx} cy={cy} r={R} />
        <line className="aim-bull-axis" x1={cx - R} x2={cx + R} y1={cy} y2={cy} />
        <line className="aim-bull-axis" x1={cx} x2={cx} y1={cy - R} y2={cy + R} />
        <circle className="aim-bull-ring" cx={cx} cy={cy} r={TARGET_R * k} />
        <circle className="aim-bull-ring" cx={cx} cy={cy} r={TARGET_R * 0.62 * k} />
        <circle className="aim-bull-ring is-in" cx={cx} cy={cy} r={TARGET_R * 0.24 * k} />
        <text className="aim-bull-label" x={cx + TARGET_R * k * 0.72} y={cy - TARGET_R * k * 0.72 - 4}>
          {tx.bullTarget}
        </text>
        <text className="aim-bull-scale" x={cx} y={cy + R - 8} textAnchor="middle">
          {tx.bullScale(fmtPx(D, 0))}
        </text>

        {!n && (
          <text className="ck-empty" x={cx} y={cy - R / 2} textAnchor="middle">
            {tx.bullEmpty}
          </text>
        )}

        {series.map((s) =>
          s.taps.map((t, i) => {
            const [x, y] = place(t)
            const last = s.key === lastKey && i === s.taps.length - 1
            return (
              <circle
                key={`${s.key}-${i}`}
                className={`ck-dot is-${s.key}${s.faint ? ' is-faint' : ''}${last ? ' is-last' : ''}`}
                cx={x}
                cy={y}
                r={dotR}
              />
            )
          }),
        )}
        {showSpread &&
          series.map((s) => {
            const c = cloud(s.taps)
            if (!(c.sx > 0 && c.sy > 0)) return null
            const [mx, my] = place({ dx: c.mx, dy: c.my })
            return (
              <g key={`spread-${s.key}`} className={`aim-spread is-${s.key}`}>
                <ellipse cx={mx} cy={my} rx={Math.min(c.sx * k, R)} ry={Math.min(c.sy * k, R)} />
                <path d={`M${mx - 8},${my}h16M${mx},${my - 8}v16`} className="aim-mean-halo" />
                <path d={`M${mx - 8},${my}h16M${mx},${my - 8}v16`} className="aim-mean-cross" />
              </g>
            )
          })}

      </svg>
    </div>
  )
}

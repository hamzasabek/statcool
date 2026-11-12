import { useTweened } from '../../hooks/useTweened.js'
import { mean, spread } from './spreadPlay.js'

// Topic 02's marks on the shared dot chart (PlayChart's Overlay): the ±1 SD band around the mean,
// the mean line with its balance point, and, on demand, each dot's deviation from the mean as a
// stick. The sticks get one thin row each, in the empty space above the stacks, sorted by value
// (on the dots' own rows they would overlap). Labels on the rows above: the band, then the mean.
//   fmt, showDev, labels: { band(a, b), mean(m) } come in through PlayChart's overlayProps

export default function SpreadMarks({ xOf, top, base, plotL, plotR, placed, cy, r, values, dragging, ROW, M, fmt, showDev, labels }) {
  const st = spread(values)
  const ok = st.n > 0
  const sd = st.n > 1 ? st.sd : 0
  const [m, s] = useTweened([ok ? st.mean : 0, sd], { duration: 260, immediate: dragging || !ok })
  if (!ok) return null
  const clampX = (x) => Math.min(plotR, Math.max(plotL, x))
  const labelX = (x) => Math.min(plotR - 50, Math.max(plotL + 50, x))
  const x0 = clampX(xOf(m - s))
  const x1 = clampX(xOf(m + s))
  const mx = xOf(mean(values)) // the sticks point at the exact mean (they redraw with the dots)
  return (
    <g pointerEvents="none">
      {st.n > 1 && (
        <>
          <rect className="sd-band" x={x0} width={Math.max(0, x1 - x0)} y={top} height={base - top} rx="6" />
          <line className="sd-edge" x1={x0} x2={x0} y1={top} y2={base} />
          <line className="sd-edge" x1={x1} x2={x1} y1={top} y2={base} />
          <text className="sd-label" x={labelX((x0 + x1) / 2)} y={M.top + 11} textAnchor="middle">
            {labels.band(fmt(st.mean - st.sd), fmt(st.mean + st.sd), fmt(st.sd))}
          </text>
        </>
      )}
      {showDev && <Sticks placed={placed} xOf={xOf} mx={mx} m={st.mean} top={top} floor={Math.min(...placed.map((p) => cy(p.level))) - r - 6} />}
      <line className="ds-mark-line is-mean" x1={xOf(m)} x2={xOf(m)} y1={top - 2} y2={base} />
      <path className="ds-fulcrum" d={`M${xOf(m)},${base + 1}l-7,10h14z`} />
      <text className="ds-mark-label is-mean" x={labelX(xOf(m))} y={M.top + 11 + ROW} textAnchor="middle">
        {labels.mean(fmt(st.mean))}
      </text>
    </g>
  )
}

// One stick per dot, from the dot's value to the mean, each on its own row (sorted by value).
function Sticks({ placed, xOf, mx, m, top, floor }) {
  const rows = [...placed].sort((a, b) => a.v - b.v || a.id - b.id)
  const room = Math.max(0, floor - top - 4)
  const gap = Math.max(2.5, Math.min(9, room / Math.max(1, rows.length)))
  return rows.map((p, k) => {
    const x = xOf(p.v)
    const y = top + 4 + (k + 0.5) * gap
    const left = p.v < m
    return (
      <g key={p.id} className={`sd-dev-row${left ? ' is-left' : ''}`}>
        {Math.abs(x - mx) >= 1 && <line className="sd-dev" x1={x} x2={mx} y1={y} y2={y} />}
        <circle className="sd-dev-end" cx={x} cy={y} r={2.2} />
      </g>
    )
  })
}

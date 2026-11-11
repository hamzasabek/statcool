// A small drawing of a distribution, used on the home page and the topics timeline.
// shape: 'normal' | 'meanMedian' (bell with mean and median lines) | 'skewed' | 'exponential' | 'binomial'

const GW = 112 // glyph size
const GH = 52
const PAD = 4

// A curve y = f(x) for x in [0, 1] (f ≤ 1), as an SVG area and line in the glyph box.
function curvePaths(f) {
  const pts = []
  for (let i = 0; i <= 60; i++) {
    const u = i / 60
    pts.push([PAD + u * (GW - 2 * PAD), GH - PAD - f(u) * (GH - 2 * PAD - 2)])
  }
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
  const area = `${line}L${GW - PAD},${GH - PAD}L${PAD},${GH - PAD}Z`
  return { line, area }
}

const bell = (u) => Math.exp(-0.5 * ((u - 0.5) / 0.15) ** 2)
const skewed = (u) => {
  if (u <= 0.02) return 0
  const x = u * 4
  return Math.exp(-((Math.log(x) - Math.log(0.9)) ** 2) / (2 * 0.45 ** 2)) // log-normal shape, peak 1
}
const expo = (u) => Math.exp(-u * 4.2)

export default function TopicGlyph({ shape }) {
  const xOf = (u) => PAD + u * (GW - 2 * PAD)
  let body
  if (shape === 'binomial') {
    const n = 10
    const w = (GW - 2 * PAD) / (n + 1)
    let c = 1
    const bars = []
    for (let k = 0; k <= n; k++) {
      if (k) c = (c * (n - k + 1)) / k
      const h = (c / 252) * (GH - 2 * PAD - 2) // C(10,5) = 252 is the tallest
      bars.push(<rect key={k} className="tl-glyph-bar" x={PAD + k * w + 1} y={GH - PAD - h} width={w - 2} height={h} rx="1.5" />)
    }
    body = bars
  } else {
    const f = shape === 'skewed' ? skewed : shape === 'exponential' ? expo : bell
    const { line, area } = curvePaths(f)
    body = (
      <>
        <path className="tl-glyph-area" d={area} />
        <path className="tl-glyph-line" d={line} />
        {shape === 'meanMedian' && (
          <>
            <line className="tl-glyph-mean" x1={xOf(0.5)} x2={xOf(0.5)} y1={PAD} y2={GH - PAD} />
            <line className="tl-glyph-median" x1={xOf(0.44)} x2={xOf(0.44)} y1={PAD + 4} y2={GH - PAD} />
          </>
        )}
      </>
    )
  }
  return (
    <svg className="tl-glyph" width={GW} height={GH} viewBox={`0 0 ${GW} ${GH}`} aria-hidden="true">
      <line className="tl-glyph-axis" x1={PAD} x2={GW - PAD} y1={GH - PAD + 0.5} y2={GH - PAD + 0.5} />
      {body}
    </svg>
  )
}

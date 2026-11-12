import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import { useChime } from '../../sound.js'
import NormalPlot from './NormalPlot.jsx'
import { SCENARIOS, area, clamp, domainOf, fmtArea, fmtV, fmtZ, pdf, randn, snapTo } from './normal.js'
import { NPLAY } from './normalPlayText.js'

// Topic 03's playground: shape a bell and measure areas under it.
//   - the bell: mean (μ) and SD (σ) sliders; the y scale is fixed, so a wider bell gets flatter
//   - the area: between two bounds, below one, or above one; bounds dragged on the chart (or ← →),
//     presets μ ± 1, 2, 3 σ; the share of the area in big
//   - a sample: draw 10 or 100 people from the bell, drawn as a histogram on the same scale; the
//     share of them in the shaded range next to the curve's
//   - scenarios from the site's games (IQ, inner clock, tapping, memory errors) and the standard bell
//   - six challenges

const TOUR_TARGETS = [null, 'chart', 'scenarios', 'bell', 'area', 'sample', 'challenges', 'feedback']
const TOUR_PLACE = { scenarios: 'bottom', bell: 'left', area: 'left', sample: 'bottom' }
const MODES = ['between', 'below', 'above']
const MAX_SAMPLE = 2000
const near = (a, b, eps) => Math.abs(a - b) <= eps

const CHALLENGES = [
  { key: 'iq130', check: (s) => s.sc.key === 'iq' && s.mu === 100 && s.sigma === 15 && s.mode === 'above' && near(s.a, 130, 1) },
  { key: 'p95', check: (s) => s.mode === 'between' && near(s.p, 0.95, 0.005) },
  { key: 'peak', check: (s) => s.sigma <= s.sc.sigma0 / 2 + 1e-9 },
  { key: 'half', check: (s) => s.mode === 'below' && near(s.p, 0.5, 0.002) },
  { key: 'rare', check: (s) => s.p > 0 && s.p < 0.01 },
  { key: 'sample', check: (s) => s.n >= 100 && s.p >= 0.2 && near(s.share, s.p, 0.03) }, // a range worth comparing
]

const startOf = (sc) => ({ mu: sc.mu0, sigma: sc.sigma0, a: sc.mu0 - sc.sigma0, b: sc.mu0 + sc.sigma0 })

export default function NormalPlay() {
  const tx = useText(NPLAY)
  const tc = useText(COMMON)
  const [scKey, setScKey] = useState('iq')
  const sc = SCENARIOS.find((s) => s.key === scKey)
  const [st, setSt] = useState(() => startOf(SCENARIOS[0]))
  const [mode, setMode] = useState('between')
  const [sample, setSample] = useState([])
  const [event, setEvent] = useState({ type: 'load' })
  const [done, setDone] = useState([])
  useChime(done.length) // a challenge is done
  const [flash, setFlash] = useState(null)
  const guide = useGuide('pg-normal', TOUR_TARGETS, tx.tour, { place: TOUR_PLACE, doneLabel: tx.tourDone })

  const { mu, sigma, a, b } = st
  const domain = domainOf(sc)
  const yMax = pdf(0, 0, sc.sigma0 / 2) * 1.04 // the tallest bell the slider allows just fits
  const from = mode === 'below' ? -Infinity : a
  const to = mode === 'above' ? Infinity : b
  const p = area(from, to, mu, sigma)
  const inRange = sample.filter((v) => v >= from && v <= to).length
  const share = sample.length ? inRange / sample.length : NaN
  const f = (v) => fmtV(v, sc)
  const sstep = sc.sigmaStep ?? sc.step
  const fS = (v) => fmtV(v, { ...sc, digits: Math.max(sc.digits, Math.abs(v - Math.round(v)) > 1e-9 ? 1 : 0) }) // 7.5
  const z = (v) => fmtZ((v - mu) / sigma)

  // Tick the challenges that the current state makes true.
  const state = { sc, mu, sigma, mode, a, b, p, n: sample.length, share }
  useEffect(() => {
    const newly = CHALLENGES.filter((c) => !done.includes(c.key) && c.check(state)).map((c) => c.key)
    if (newly.length) {
      setDone((d) => [...d, ...newly])
      setFlash(newly[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scKey, mu, sigma, mode, a, b, sample.length])

  function load(key) {
    const s = SCENARIOS.find((x) => x.key === key)
    setScKey(key)
    setSt(startOf(s))
    setMode('between')
    setSample([])
    setEvent({ type: 'load' })
    setFlash(null)
  }
  function setBell(k, v) {
    setSt((x) => ({ ...x, [k]: v }))
    if (sample.length) setSample([]) // a sample of the old bell no longer fits
    setEvent({ type: k, cleared: sample.length > 0 })
    setFlash(null)
  }
  function onDrag(key, v) {
    setSt((x) => {
      if (key === 'a') return { ...x, a: mode === 'between' ? Math.min(v, x.b) : v }
      if (key === 'b') return { ...x, b: mode === 'between' ? Math.max(v, x.a) : v }
      return x
    })
    setEvent({ type: 'drag' })
    setFlash(null)
  }
  function preset(k) {
    const r = (v) => clamp(snapTo(v, sc.step), domain[0], domain[1])
    setMode('between')
    setSt((x) => ({ ...x, a: r(x.mu - k * x.sigma), b: r(x.mu + k * x.sigma) }))
    setEvent({ type: 'preset', k })
    setFlash(null)
  }
  function draw(n) {
    setSample((s) => [...s, ...Array.from({ length: n }, () => mu + sigma * randn())].slice(-MAX_SAMPLE))
    setEvent({ type: 'sample' })
    setFlash(null)
  }

  // ---- feedback ----
  let main
  if (mode === 'between') main = tx.between(f(a), f(b), fmtArea(p), z(a), z(b))
  else if (mode === 'below') main = tx.below(f(b), fmtArea(p), z(b))
  else main = tx.above(f(a), fmtArea(p), z(a))
  let what = null
  if (event.type === 'load') what = tx.intro[scKey]
  else if (event.type === 'mu') what = tx.muMoved(f(mu))
  else if (event.type === 'sigma') what = tx.sigmaMoved(fS(sigma), fmtZ(sc.sigma0 / sigma))
  else if (event.type === 'preset') what = tx.rule(event.k, fmtArea(area(-event.k, event.k, 0, 1)))
  else if (event.type === 'sample') what = tx.sampleText(sample.length, inRange, fmtArea(share), fmtArea(p))
  if (what && event.cleared) what += ` ${tx.sampleCleared}`

  return (
    <Stage
      title={tx.title}
      className="pg-stage sp-stage np-stage"
      onGuide={guide.start}
      say={
        <p>
          <strong>{tx.sayStrong}</strong> {tx.say}
        </p>
      }
      bar={
        <>
          <div className="pg-scenarios" role="group" aria-label={tx.scenarioGroup} data-tour="scenarios">
            <span className="pg-scenarios-label">{tx.scenarioGroup}</span>
            {SCENARIOS.map((s) => (
              <button key={s.key} type="button" className={`pg-chip${s.key === scKey ? ' is-on' : ''}`} aria-pressed={s.key === scKey} onClick={() => load(s.key)}>
                {tx.scenarios[s.key]}
              </button>
            ))}
          </div>
          <div className="tools" data-tour="sample">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => draw(10)}>
              {tx.draw10}
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => draw(100)}>
              {tx.draw100}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled={!sample.length} onClick={() => setSample([])}>
              {tx.clearSample}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => load(scKey)}>
              {tx.reset}
            </button>
          </div>
        </>
      }
      foot={
        <>
          <div className="nd-feedback" data-tour="feedback" aria-live="polite">
            {flash && (
              <p className="pg-flash">
                {tx.challengeDone(tx.challenges[flash])} {done.length === CHALLENGES.length ? tx.allDone : ''}
              </p>
            )}
            <p className="nd-hint">{main}</p>
            {what && <p className="nd-fact">{what}</p>}
          </div>
          <div className="actions">
            <Link to="/topics/normal-distribution" className="btn btn-ghost">
              {tc.toGames}
            </Link>
          </div>
        </>
      }
    >
      <div className="pg-main">
        {guide.view}
        <NormalPlot
          sc={sc}
          domain={domain}
          mu={mu}
          sigma={sigma}
          yMax={yMax}
          shade={[from, to]}
          handles={mode === 'between' ? [{ key: 'a', v: a }, { key: 'b', v: b }] : mode === 'below' ? [{ key: 'b', v: b }] : [{ key: 'a', v: a }]}
          onDrag={onDrag}
          sample={sample.length ? sample : null}
          zAxis
          labels={{ z: 'z', aria: tx.chartAria(f(mu), fS(sigma), fmtArea(p)) }}
        />
        <aside className="pg-side">
          <section className="pg-card" data-tour="bell">
            <h2>{tx.bellTitle}</h2>
            <label className="np-slider">
              <span>
                {tx.mean} <strong>{f(mu)}</strong>
              </span>
              <input
                type="range"
                min={sc.mu0 - 2 * sc.sigma0}
                max={sc.mu0 + 2 * sc.sigma0}
                step={sc.step}
                value={mu}
                onChange={(e) => setBell('mu', snapTo(Number(e.target.value), sc.step))}
                aria-label={tx.mean}
              />
            </label>
            <label className="np-slider">
              <span>
                {tx.sd} <strong>{fS(sigma)}</strong>
              </span>
              <input
                type="range"
                min={sc.sigma0 / 2}
                max={sc.sigma0 * 2}
                step={sstep}
                value={sigma}
                onChange={(e) => setBell('sigma', Math.max(sstep, snapTo(Number(e.target.value), sstep)))}
                aria-label={tx.sd}
              />
            </label>
          </section>
          <section className="pg-card" data-tour="area">
            <h2>
              {tx.areaTitle} <span className="np-area">{fmtArea(p)}</span>
            </h2>
            <div className="segmented np-modes" role="group" aria-label={tx.modeLabel}>
              {MODES.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={mode === k ? 'is-active' : ''}
                  aria-pressed={mode === k}
                  onClick={() => {
                    setMode(k)
                    setEvent({ type: 'mode' })
                    setFlash(null)
                  }}
                >
                  {tx.modes[k]}
                </button>
              ))}
            </div>
            <div className="np-presets">
              {[1, 2, 3].map((k) => (
                <button key={k} type="button" className="btn btn-ghost btn-sm" onClick={() => preset(k)}>
                  μ ± {k}σ
                </button>
              ))}
            </div>
            {sample.length > 0 && <p className="pg-n">{tx.sampleLine(sample.length, fmtArea(share))}</p>}
          </section>
          <section className="pg-card" data-tour="challenges">
            <h2>
              {tx.challengesTitle} <span className="pg-count">{`${done.length} / ${CHALLENGES.length}`}</span>
            </h2>
            <ul className="pg-challenges">
              {CHALLENGES.map((c) => (
                <li key={c.key} className={done.includes(c.key) ? 'is-done' : ''}>
                  <span className="pg-check" aria-hidden="true">
                    {done.includes(c.key) ? '✓' : ''}
                  </span>
                  {tx.challenges[c.key]}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </Stage>
  )
}

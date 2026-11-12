import { useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import Tex, { texNum } from '../../components/Tex.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { num, useLang, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import NormalPlot from './NormalPlot.jsx'
import { Phi, SCENARIOS, domainOf, fmtArea, fmtV, pdf, snapTo } from './normal.js'
import { NCALC } from './normalCalcText.js'

// Topic 03's "Live calculation": drag a point x on a bell and watch three calculations redo
// themselves, with the real formulas (KaTeX) and the numbers in them:
//   z-score : z = (x − μ) / σ
//   height  : f(x) = 1 / (σ√(2π)) · e^(−z²/2), a height (a density), not a probability
//   area    : P(X ≤ x) = Φ(z), the share of the area to the left of x (and 1 − Φ(z) to the right)
// A second view, "Standardise", shows the same point on the standard bell N(0, 1): same area.

const TOUR_TARGETS = [null, 'chart', 'sliders', 'z', 'height', 'area', 'feedback', 'views']
const CARDS = ['z', 'height', 'area']
const START_X = { iq: 130, clock: 2.5, tap: 40, memory: 20, standard: 1 }

export default function NormalCalc() {
  const tx = useText(NCALC)
  const tc = useText(COMMON)
  const { lang } = useLang()
  const [scKey, setScKey] = useState('iq')
  const sc = SCENARIOS.find((s) => s.key === scKey)
  const [mu, setMu] = useState(sc.mu0)
  const [sigma, setSigma] = useState(sc.sigma0)
  const [x, setX] = useState(START_X.iq)
  const [view, setView] = useState('calc')
  const [tab, setTab] = useState('z')
  const [event, setEvent] = useState({ type: 'load' })
  const guide = useGuide('calc-normal', TOUR_TARGETS, tx.tour, { doneLabel: tx.tourDone })

  const domain = domainOf(sc)
  const sstep = sc.sigmaStep ?? sc.step
  const yMax = pdf(0, 0, sigma) * 1.12 // here the bell always fills the chart (the playground shows height changes)
  const z = (x - mu) / sigma
  const below = Phi(z)
  const height = pdf(x, mu, sigma)
  const k = 1 / (sigma * Math.sqrt(2 * Math.PI))
  const e = Math.exp(-0.5 * z * z)

  // Numbers inside formulas: the scenario's decimals, 3 significant digits for small ones.
  const dig = (v) => Math.max(sc.digits, Math.abs(v - Math.round(v)) > 1e-9 ? 1 : 0)
  const t = (v, d = dig(v)) => texNum(`${v < 0 ? '-' : ''}${num(Math.abs(v), d)}`)
  const tp = (v) => (v < 0 ? `(${t(v)})` : t(v)) // a negative number after a minus sign gets brackets
  const sig = (v) => {
    if (v === 0) return '0'
    const s = Number(v.toPrecision(3))
    const d = Math.max(0, 2 - Math.floor(Math.log10(Math.abs(s))))
    return texNum(num(s, Math.min(8, d)))
  }
  const zAbs = Number(Math.abs(z).toFixed(2))
  const zDig = Number.isInteger(zAbs) ? 0 : Number.isInteger(Math.round(zAbs * 100) / 10) ? 1 : 2
  const zz = texNum(`${z < 0 && zAbs > 0 ? '-' : ''}${num(zAbs, zDig)}`) // 2, 1.5, 1.33
  const f = (v) => fmtV(v, { ...sc, digits: dig(v) })
  const pctOf = (p) => fmtArea(p)

  function load(key) {
    const s = SCENARIOS.find((q) => q.key === key)
    setScKey(key)
    setMu(s.mu0)
    setSigma(s.sigma0)
    setX(START_X[key])
    setEvent({ type: 'load' })
  }

  let what
  if (event.type === 'load') what = tx.intro[scKey]
  else if (event.type === 'bell') what = tx.bellChanged(f(x), texToText(zz, lang))
  else what = tx.xMoved(f(x), Math.abs(z) < 0.005 ? null : texToText(zz.replace('-', ''), lang), z < 0, pctOf(below), pctOf(1 - below))

  return (
    <Stage
      title={tx.title}
      className="cl-stage nc-stage"
      onGuide={guide.start}
      say={
        <p>
          <strong>{tx.sayStrong}</strong> {tx.say}
        </p>
      }
      bar={
        <>
          <div className="segmented cl-views" role="group" aria-label={tx.viewsLabel} data-tour="views">
            {['calc', 'std'].map((v) => (
              <button key={v} type="button" className={view === v ? 'is-active' : ''} aria-pressed={view === v} onClick={() => setView(v)}>
                {tx.views[v]}
              </button>
            ))}
          </div>
          <div className="pg-scenarios" role="group" aria-label={tx.scenarioGroup}>
            {SCENARIOS.map((s) => (
              <button key={s.key} type="button" className={`pg-chip${s.key === scKey ? ' is-on' : ''}`} aria-pressed={s.key === scKey} onClick={() => load(s.key)}>
                {tx.scenarios[s.key]}
              </button>
            ))}
          </div>
          <div className={`segmented cl-tabs${view === 'calc' ? '' : ' is-hidden'}`} role="tablist" aria-label={tx.tabsLabel}>
            {CARDS.map((c) => (
              <button key={c} type="button" role="tab" aria-selected={tab === c} className={tab === c ? 'is-active' : ''} onClick={() => setTab(c)}>
                {tx.cards[c]}
              </button>
            ))}
          </div>
        </>
      }
      foot={
        <>
          <div className="nd-feedback cl-what" data-tour="feedback" aria-live="polite">
            <p className="nd-hint">{view === 'std' ? tx.stdText(f(x), texToText(zz, lang), pctOf(below)) : what}</p>
          </div>
          <div className="actions">
            <Link to="/topics/normal-distribution" className="btn btn-ghost">
              {tc.toGames}
            </Link>
          </div>
        </>
      }
    >
      {guide.view}
      <div className={`cl-main${view === 'std' ? ' is-why' : ''}`}>
        <div className="nc-sliders" data-tour="sliders">
          <label className="np-slider">
            <span>
              μ <strong>{f(mu)}</strong>
            </span>
            <input
              type="range"
              min={sc.mu0 - 2 * sc.sigma0}
              max={sc.mu0 + 2 * sc.sigma0}
              step={sc.step}
              value={mu}
              onChange={(ev) => {
                setMu(snapTo(Number(ev.target.value), sc.step))
                setEvent({ type: 'bell' })
              }}
              aria-label={tx.meanLabel}
            />
          </label>
          <label className="np-slider">
            <span>
              σ <strong>{f(sigma)}</strong>
            </span>
            <input
              type="range"
              min={sc.sigma0 / 2}
              max={sc.sigma0 * 2}
              step={sstep}
              value={sigma}
              onChange={(ev) => {
                setSigma(Math.max(sstep, snapTo(Number(ev.target.value), sstep)))
                setEvent({ type: 'bell' })
              }}
              aria-label={tx.sdLabel}
            />
          </label>
          <span className="nc-x">
            x <strong>{f(x)}</strong>
          </span>
        </div>
        <div className="cl-chart">
          <NormalPlot
            sc={sc}
            domain={domain}
            mu={mu}
            sigma={sigma}
            yMax={yMax}
            shade={[-Infinity, x]}
            marker={x}
            onDrag={(key, v) => {
              setX(v)
              setEvent({ type: 'x' })
            }}
            zAxis
            labels={{ z: 'z', aria: tx.chartAria(f(x), pctOf(below)) }}
          />
        </div>

        {view === 'std' && (
          <div className="nc-std">
            <p className="nc-std-title">
              <Tex math={String.raw`z = \frac{x - \mu}{\sigma} = \frac{${t(x)} - ${tp(mu)}}{${t(sigma)}} = ${zz}`} /> <span>{tx.stdCaption}</span>
            </p>
            <div className="nc-std-chart">
              <NormalPlot
                sc={SCENARIOS.find((s) => s.key === 'standard')}
                domain={[-4, 4]}
                mu={0}
                sigma={1}
                yMax={pdf(0, 0, 1) * 1.1}
                shade={[-Infinity, Math.max(-4, Math.min(4, z))]}
                marker={Math.max(-4, Math.min(4, z))}
                small
                labels={{ aria: tx.stdAria(texToText(zz, lang), pctOf(below)) }}
              />
            </div>
          </div>
        )}

        <div className={`cl-cards${view === 'calc' ? '' : ' is-hidden'}`}>
          <section className={`cl-card is-mean${tab === 'z' ? ' is-tab' : ''}`} data-tour="z">
            <h2>{tx.zTitle}</h2>
            <Tex math={String.raw`z = \frac{x - \mu}{\sigma}`} block className="cl-tex" />
            <div className="cl-calc">
              <Tex math={String.raw`z = \frac{${t(x)} - ${tp(mu)}}{${t(sigma)}} = \frac{${t(x - mu)}}{${t(sigma)}} ${Math.abs(z * 100 - Math.round(z * 100)) < 1e-6 ? '=' : '\\approx'} \htmlClass{tex-mean}{${zz}}`} />
            </div>
            <p className="cl-note">{tx.zNote(texToText(zz.replace('-', ''), lang), z < 0)}</p>
          </section>
          <section className={`cl-card is-median${tab === 'height' ? ' is-tab' : ''}`} data-tour="height">
            <h2>{tx.heightTitle}</h2>
            <Tex math={String.raw`f(x) = \frac{1}{\sigma\sqrt{2\pi}}\, e^{-z^2/2}`} block className="cl-tex" />
            <div className="cl-calc">
              <Tex math={String.raw`f(${t(x)}) = \frac{1}{${t(sigma)} \times 2{${lang === 'fr' ? ',' : '.'}}507} \times e^{-${z < 0 ? `(${zz})` : zz}^2/2} \approx ${sig(k)} \times ${sig(e)} \approx \htmlClass{tex-median}{${sig(height)}}`} />
            </div>
            <p className="cl-note">{tx.heightNote}</p>
          </section>
          <section className={`cl-card is-mode${tab === 'area' ? ' is-tab' : ''}`} data-tour="area">
            <h2>{tx.areaTitle}</h2>
            <Tex math={String.raw`P(X \le x) = \Phi(z)`} block className="cl-tex" />
            <div className="cl-calc">
              <Tex math={String.raw`P(X \le ${t(x)}) = \Phi(${zz}) \approx \htmlClass{tex-mode}{${texNum(num(below, 3))}}`} />
            </div>
            <p className="cl-note">{tx.areaNote(pctOf(below), pctOf(1 - below), f(x))}</p>
          </section>
        </div>
      </div>
    </Stage>
  )
}

// A LaTeX number back to plain text ("1{,}5" → "1,5", "-" → "−").
function texToText(s) {
  return s.replace('{,}', ',').replace('-', '−')
}

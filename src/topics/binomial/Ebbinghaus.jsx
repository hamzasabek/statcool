import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import { sfx, useChime } from '../../sound.js'
import BinomChart from './BinomChart.jsx'
import {
  CLASS,
  GAP_MS,
  N,
  P_MAX,
  P_MIN,
  P_STEP,
  atLeast,
  atMost,
  centralRange,
  fmtNum,
  fmtP,
  fmtShare,
  newTrial,
  simulateClass,
} from './binom.js'
import { BIN } from './text.js'

// Topic 05 "The binomial distribution", played with the Ebbinghaus illusion.
//   1. Which is bigger?: 20 forced choices between two figures whose middle circles are always
//      the same size (one ringed by small circles, one by big ones). Then the reveal.
//   2. Luck or illusion?: your count of "small neighbours" picks vs 100 coin-flippers
//      (Binomial(20, ½)); the tail as extreme as you is shaded; its chance = a binomial test.
//   3. How strong?: slider for p; 100 people with that p, expected line, the chance line dashed.

const VIEW = 300 // figure viewBox size

// Guided tour of each screen: what each bubble points at (null = middle of the screen); the texts
// are in text.js (tour), in the same order. Step 1 has two: the game, then the reveal.
const TOUR_TARGETS = {
  pick: [null, 'figures', 'progress', 'steps', 'next'],
  reveal: ['figures', 'next'],
  luck: ['chart', 'legend', 'feedback'],
  strong: ['slider', 'chart', 'feedback'],
}
const TOUR_PLACE = { next: 'top' }

// One Ebbinghaus figure: a middle circle of radius rc, ringed by small or big circles.
function Figure({ rc, small, rot, dy, faded = false }) {
  const c = VIEW / 2
  const cy = c + dy
  const count = small ? 8 : 6
  const r = small ? rc * 0.42 : rc * 1.6
  const dist = rc + r + (small ? 7 : 10)
  return (
    <svg className="eb-fig" viewBox={`0 0 ${VIEW} ${VIEW}`} aria-hidden="true">
      <g className={`eb-ring${faded ? ' is-faded' : ''}`}>
        {Array.from({ length: count }, (_, i) => {
          const a = ((rot + (i * 360) / count) * Math.PI) / 180
          return <circle key={i} cx={c + dist * Math.cos(a)} cy={cy + dist * Math.sin(a)} r={r} />
        })}
      </g>
      <circle className={`eb-center${faded ? ' is-reveal' : ''}`} cx={c} cy={cy} r={rc} />
    </svg>
  )
}

export default function Ebbinghaus() {
  const tx = useText(BIN)
  const tc = useText(COMMON)
  const [step, setStep] = useState(0)
  const [trial, setTrial] = useState(newTrial)
  const [picks, setPicks] = useState([]) // true = picked the "small neighbours" figure
  const [phase, setPhase] = useState('pick') // pick | gap | over
  const [coins, setCoins] = useState([]) // 100 coin-flippers: Binomial(N, ½)
  const [p, setP] = useState(0.8)
  const [shown, setShown] = useState(0) // dots revealed so far (drop animation)
  const timer = useRef(null)
  const samples = useRef({}) // simulated people for each p of the slider

  const k = picks.filter(Boolean).length
  useChime(picks.length, N) // all 20 answered (no right / wrong: no feedback on purpose)
  useEffect(() => () => clearTimeout(timer.current), [])

  // ---------- 1. Which is bigger? ----------
  function pick(side) {
    if (step !== 0 || phase !== 'pick') return
    const small = (side === 0) === trial.smallLeft
    const next = [...picks, small]
    setPicks(next)
    sfx.tick()
    if (next.length >= N) {
      setPhase('over')
      return
    }
    setPhase('gap')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setTrial(newTrial())
      setPhase('pick')
    }, GAP_MS)
  }

  const pickRef = useRef(pick)
  pickRef.current = pick
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (e.target instanceof HTMLElement && e.target.closest('input')) return
      e.preventDefault()
      pickRef.current(e.key === 'ArrowLeft' ? 0 : 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function goLuck() {
    if (!coins.length) setCoins(simulateClass(N, 0.5))
    setStep(1)
  }

  function goStrong() {
    const est = Math.min(P_MAX, Math.max(P_MIN, Math.round(k / N / P_STEP) * P_STEP))
    setP(Number(est.toFixed(2)))
    setStep(2)
  }

  function playAgain() {
    clearTimeout(timer.current)
    setPicks([])
    setTrial(newTrial())
    setPhase('pick')
    setCoins([])
    samples.current = {}
    setStep(0)
  }

  // The simulated people shown in steps 2 and 3, and their drop animation.
  const people = useMemo(() => {
    if (step === 1) return coins
    if (step === 2) {
      const key = p.toFixed(2)
      if (!samples.current[key]) samples.current[key] = simulateClass(N, p)
      return samples.current[key]
    }
    return []
  }, [step, p, coins])

  useEffect(() => {
    if (!people.length) return undefined
    setShown(0)
    const id = setInterval(() => {
      setShown((s) => {
        if (s >= people.length) {
          clearInterval(id)
          return s
        }
        return s + 5
      })
    }, 22)
    return () => clearInterval(id)
  }, [people])

  const you = picks.length >= N ? [{ id: 0, k, kind: 'you' }] : []
  const crowd = people.slice(0, shown).map((score, i) => ({ id: i, k: score, kind: 'class' }))
  const allTopics = (
    <Link to="/topics" className="btn btn-ghost">
      {tc.allTopics}
    </Link>
  )
  const youKey = <span className="legend-item bn-key-you">{tx.youKey}</span>

  // One tour per screen; each opens by itself the first time.
  const tourId = [phase === 'over' ? 'reveal' : 'pick', 'luck', 'strong'][step]
  const guide = useGuide(`eb-${tourId}`, TOUR_TARGETS[tourId], tx.tour[tourId], {
    place: TOUR_PLACE,
    doneLabel: tourId === 'pick' ? tx.tourPlay : undefined,
  })

  if (step === 0) {
    const over = phase === 'over'
    const locked = picks.length < N
    return (
      <Stage
        title={tx.title}
        className="mm-stage bn-stage"
        steps={tx.steps}
        onGuide={guide.start}
        current={0}
        say={
          <p>
            {over ? (
              <strong>{tx.revealStrong}</strong>
            ) : (
              <>
                <strong>{tx.sayStrong}</strong> {tx.say}
              </>
            )}
          </p>
        }
        foot={
          <>
            <p className={`ck-flash${over ? ' is-good-flash' : ''}`} aria-live="polite">
              {over ? tx.reveal(k, N) : picks.length ? tx.progress(picks.length, N) : tx.pickHint}
            </p>
            <div className="actions">
              {allTopics}
              <button
                type="button"
                className={`btn btn-primary ck-next${over ? ' nd-glow' : ''}`}
                data-tour="next"
                disabled={locked}
                onClick={goLuck}
              >
                {locked ? tx.lockedLuck(N - picks.length) : tx.nextLuck}
              </button>
            </div>
          </>
        }
      >
        <div className="eb-game">
          {guide.view}
          <div className="eb-figures" data-tour="figures">
            {[0, 1].map((side) => {
              const small = (side === 0) === trial.smallLeft
              return (
                <button
                  key={side}
                  type="button"
                  className={`eb-choice${over ? ' is-over' : ''}`}
                  disabled={phase !== 'pick'}
                  aria-label={tx.figureLabel(side)}
                  onClick={() => pick(side)}
                >
                  {phase !== 'gap' && (
                    <Figure
                      rc={trial.rc}
                      small={small}
                      rot={trial.rot[side]}
                      dy={over ? 0 : trial.dy[side]}
                      faded={over}
                    />
                  )}
                </button>
              )
            })}
          </div>
          <ol className="bn-progress eb-progress" data-tour="progress" aria-hidden="true">
            {Array.from({ length: N }, (_, i) => (
              <li key={i} className={i < picks.length ? 'is-done' : ''} />
            ))}
          </ol>
        </div>
      </Stage>
    )
  }

  // ---------- 2. Luck or illusion? ----------
  if (step === 1) {
    let tail = null
    let hint = tx.luckMid
    if (k > N / 2) {
      const chance = atLeast(k, N, 0.5)
      tail = { from: k, to: N }
      hint = tx.luckHigh(k, fmtShare(chance), Math.round(1 / chance)) + (chance < 0.05 ? tx.rare : tx.notRare)
    } else if (k < N / 2) {
      const chance = atMost(k, N, 0.5)
      tail = { from: 0, to: k }
      hint = tx.luckLow(k, fmtShare(chance)) + (chance < 0.05 ? tx.resisted : tx.notRare)
    }
    return (
      <Stage
        title={tx.title}
        className="mm-stage bn-stage"
        steps={tx.steps}
        onGuide={guide.start}
        current={1}
        say={
          <p>
            <strong>{tx.luckStrong(k, N)}</strong> {tx.luckSay(CLASS)}
          </p>
        }
        bar={
          <div className="legend" data-tour="legend">
            {youKey}
            <span className="legend-item bn-key-class">{tx.coinKey(CLASS)}</span>
            <span className="legend-item bn-key-curve">{tx.expectedKey}</span>
            {tail && <span className="legend-item bn-key-tail">{tx.tailKey}</span>}
          </div>
        }
        foot={
          <>
            <div data-tour="feedback" className="nd-feedback" aria-live="polite">
              <p className="nd-hint">{hint}</p>
              <p className="nd-fact">{tx.luckFact(N)}</p>
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" onClick={goStrong}>
                {tx.nextStrong}
              </button>
            </div>
          </>
        }
      >
        <div className="mm-main">
          {guide.view}
          <BinomChart n={N} points={[...you, ...crowd]} curve={{ p: 0.5, size: CLASS }} tail={tail} />
        </div>
      </Stage>
    )
  }

  // ---------- 3. How strong? ----------
  const [lo, hi] = centralRange(N, p)
  const np = N * p
  let shape = tx.shapeHalf
  if (p >= 0.85) shape = tx.shapeHigh
  else if (p > 0.5) shape = tx.shapeMid
  else if (p <= 0.15) shape = tx.shapeVeryLow
  else if (p < 0.5) shape = tx.shapeLow
  return (
    <Stage
      title={tx.title}
      className="mm-stage bn-stage"
      steps={tx.steps}
      onGuide={guide.start}
      current={2}
      say={
        <p>
          <strong>{tx.strongStrong(k, N, fmtP(k / N))}</strong> {tx.strongSay}
        </p>
      }
      bar={
        <>
          <label className="eb-slider" data-tour="slider">
            <span>
              {tx.pLabel}: <output>{fmtP(p)}</output>
            </span>
            <input
              type="range"
              min={P_MIN}
              max={P_MAX}
              step={P_STEP}
              value={p}
              onChange={(e) => setP(Number(Number(e.target.value).toFixed(2)))}
            />
          </label>
          <div className="legend" data-tour="legend">
            {youKey}
            <span className="legend-item bn-key-class">{tx.peopleKey(CLASS, fmtP(p))}</span>
            <span className="legend-item bn-key-curve">{tx.expectedKey}</span>
            <span className="legend-item bn-key-ref">{tx.chanceKey}</span>
          </div>
        </>
      }
      foot={
        <>
          <div data-tour="feedback" className="nd-feedback is-good" aria-live="polite">
            <p className="nd-hint">
              {tx.strongHint(fmtP(p), fmtNum(np, Number.isInteger(np) ? 0 : 1), lo, hi)}
              {shape}
            </p>
            <p className="nd-fact">{tx.strongFact}</p>
          </div>
          <div className="actions">
            {allTopics}
            <button type="button" className="btn btn-primary" onClick={playAgain}>
              {tc.playAgain}
            </button>
          </div>
        </>
      }
    >
      <div className="mm-main">
        {guide.view}
        <BinomChart
          n={N}
          points={[...you, ...crowd]}
          curve={{ p, size: CLASS }}
          refCurve={p !== 0.5 ? { p: 0.5, size: CLASS } : null}
        />
      </div>
    </Stage>
  )
}

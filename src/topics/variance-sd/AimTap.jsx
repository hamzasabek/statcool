import { useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { num, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import Arena from './Arena.jsx'
import Bullseye from './Bullseye.jsx'
import SquaresChart from './SquaresChart.jsx'
import { KEYS, MIN_TRIALS, ROUNDS, TRIALS, cloud, fmtPx, fmtPx2, fmtSigned, mean, sd, variance, withinOneSd } from './sd.js'
import { AIM } from './text.js'

// Topic 02 "Variance and standard deviation", played as "Aim and tap".
//   1. Careful: 15 taps on targets that wait; each tap's error from the centre is a dot
//   2. Fast: 15 taps on targets that vanish after 0.65 s (speed–accuracy trade-off)
//   3. Spread: both clouds on one target; same centre (mean), different spread
//   4. The SD: the left–right errors → deviations → squares → variance → SD (side of the average square)

const TOUR_IDS = ['careful', 'fast', 'spread', 'sd']
const TOUR_TARGETS = {
  careful: [null, 'arena', 'chart', 'legend', 'tools', 'steps', 'next'],
  fast: ['arena', 'chart'],
  spread: ['chart', 'chart', 'feedback'],
  sd: ['chart', 'view', 'round', 'feedback'],
}
const TOUR_PLACE = { next: 'top', arena: 'right' }
const VIEWS = ['dev', 'sq', 'sd']
const empty = () => ({ careful: [], fast: [] })

export default function AimTap() {
  const tx = useText(AIM)
  const tc = useText(COMMON)
  const [step, setStep] = useState(0)
  const [taps, setTaps] = useState(empty) // { careful: [{ dx, dy }], fast: [...] }
  const [slow, setSlow] = useState(0) // fast-round targets missed (too late)
  const [flash, setFlash] = useState(null) // { d } after a tap, { slow: true } after a miss
  const [view, setView] = useState('dev')
  const [sdRound, setSdRound] = useState('fast')

  const tourId = TOUR_IDS[step]
  const guide = useGuide(`aim-${tourId}`, TOUR_TARGETS[tourId], tx.tour[tourId], {
    place: TOUR_PLACE,
    doneLabel: step === 0 ? tx.tourPlay : undefined,
  })

  const allTopics = (
    <Link to="/topics" className="btn btn-ghost">
      {tc.allTopics}
    </Link>
  )

  function playAgain() {
    setTaps(empty())
    setSlow(0)
    setFlash(null)
    setView('dev')
    setSdRound('fast')
    setStep(0)
  }

  // ---------- 1–2. Careful and fast rounds ----------
  if (step <= 1) {
    const round = ROUNDS[step]
    const list = taps[round]
    const n = list.length
    const full = n >= TRIALS
    const locked = n < MIN_TRIALS
    const fast = round === 'fast'

    function onHit(t) {
      setTaps((all) => (all[round].length >= TRIALS ? all : { ...all, [round]: [...all[round], t] }))
      setFlash({ d: Math.hypot(t.dx, t.dy) })
    }
    function onSlow() {
      setSlow((k) => k + 1)
      setFlash({ slow: true })
    }
    function undo() {
      setTaps((all) => ({ ...all, [round]: all[round].slice(0, -1) }))
      setFlash(null)
    }
    function goNext() {
      setFlash(null)
      setStep(step + 1)
    }

    let hint = n ? tx.hintLeft(TRIALS - n, MIN_TRIALS - n) : tx.hintStart
    if (flash?.slow) hint = tx.tooSlow
    else if (flash && !full) hint = tx.lastTap(fmtPx(flash.d), TRIALS - n)
    if (full) hint = tx.hintFull(TRIALS)

    const series = fast
      ? [
          { key: KEYS.careful, taps: taps.careful, faint: true },
          { key: KEYS.fast, taps: list },
        ]
      : [{ key: KEYS.careful, taps: list }]

    return (
      <Stage
        title={tx.title}
        className="aim-stage"
        steps={tx.steps}
        current={step}
        onGuide={guide.start}
        say={
          <p>
            <strong>{fast ? tx.sayFastStrong : tx.sayCarefulStrong}</strong> {fast ? tx.sayFast : tx.sayCareful}
          </p>
        }
        bar={
          <>
            <div className="legend" data-tour="legend">
              <span className={`legend-item ck-key is-${KEYS[round]}`}>{tx.count(n, TRIALS)}</span>
              {fast && taps.careful.length > 0 && <span className="legend-item ck-key is-a is-faint">{tx.keyCareful}</span>}
              {fast && slow > 0 && <span className="aim-slow">{tx.slowCount(slow)}</span>}
            </div>
            <div className="tools" data-tour="tools">
              <button type="button" className="btn btn-ghost btn-sm" disabled={!n} onClick={undo}>
                {tc.undo}
              </button>
            </div>
          </>
        }
        foot={
          <>
            <p className={`ck-flash${flash?.slow ? ' is-warn' : ''}`} aria-live="polite">
              {hint}
            </p>
            <div className="actions">
              {allTopics}
              <button
                type="button"
                className={`btn ${full ? 'btn-primary nd-glow' : 'btn-primary ck-next'}`}
                data-tour="next"
                disabled={locked}
                title={locked ? tx.unlocks(MIN_TRIALS) : undefined}
                onClick={goNext}
              >
                {locked ? tx.lockedNext(MIN_TRIALS - n) : fast ? tx.nextSpread : tx.nextFast}
              </button>
            </div>
          </>
        }
      >
        <div className="aim-main">
          {guide.view}
          <Arena key={round} mode={round} done={full} onHit={onHit} onSlow={onSlow} />
          <Bullseye series={series} lastKey={KEYS[round]} />
        </div>
      </Stage>
    )
  }

  const a = cloud(taps.careful)
  const b = cloud(taps.fast)

  // ---------- 3. Spread ----------
  if (step === 2) {
    const ratio = b.spread / a.spread
    const wider = ratio >= 1.2
    const centred = [a, b].every((c) => Math.abs(c.mx) <= Math.max(3, 0.5 * c.sx))
    return (
      <Stage
        title={tx.title}
        className="aim-stage"
        steps={tx.steps}
        current={2}
        onGuide={guide.start}
        say={
          <p>
            <strong>{wider ? tx.spreadWider(num(ratio, 1)) : tx.spreadSame}</strong> {tx.spreadSay}
          </p>
        }
        bar={
          <div className="legend" data-tour="legend">
            <span className="legend-item ck-key is-a">{tx.keyCareful}</span>
            <span className="legend-item ck-key is-b">{tx.keyFast}</span>
            <span className="legend-item aim-key-mean">{tx.keyMean}</span>
            <span className="legend-item aim-key-ellipse">{tx.keyEllipse}</span>
          </div>
        }
        foot={
          <>
            <div className="nd-feedback" data-tour="feedback" aria-live="polite">
              <p className="nd-hint">{(centred ? tx.centres : tx.centresOff)(`${fmtSigned(a.mx)} px`, `${fmtSigned(b.mx)} px`)}</p>
              <p className="nd-fact">{tx.spreadFact}</p>
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
                {tx.nextSd}
              </button>
            </div>
          </>
        }
      >
        <div className="aim-main is-single">
          {guide.view}
          <Bullseye
            series={[
              { key: KEYS.careful, taps: taps.careful },
              { key: KEYS.fast, taps: taps.fast },
            ]}
            showSpread
          />
        </div>
      </Stage>
    )
  }

  // ---------- 4. The SD ----------
  const values = taps[sdRound].map((t) => t.dx)
  const other = taps[sdRound === 'fast' ? 'careful' : 'fast'].map((t) => t.dx)
  const m = mean(values)
  const devs = values.map((v) => v - m)
  const left = devs.filter((d) => d < 0).reduce((s, d) => s + d, 0)
  const right = devs.filter((d) => d > 0).reduce((s, d) => s + d, 0)
  const sumSq = devs.reduce((s, d) => s + d * d, 0)
  const v = variance(values)
  const s = sd(values)
  const n = values.length
  const within = Math.round(withinOneSd(values) * n)
  const sA = sd(taps.careful.map((t) => t.dx))
  const sB = sd(taps.fast.map((t) => t.dx))

  let strong = tx.devStrong
  let fact = tx.devFact(`${fmtSigned(left)} px`, `${fmtSigned(right)} px`)
  let extra = null
  if (view === 'sq') {
    strong = tx.sqStrong
    fact = tx.sqFact(fmtPx2(sumSq), n - 1, fmtPx2(v))
    extra = tx.n1Note
  } else if (view === 'sd') {
    strong = tx.sdStrong(fmtPx(s))
    fact = tx.sdFact(fmtPx2(v), fmtPx(s), within, n)
    extra = tx.compare(fmtPx(sA), fmtPx(sB), num(sB / sA, 1))
  }

  return (
    <Stage
      title={tx.title}
      className="aim-stage"
      steps={tx.steps}
      current={3}
      onGuide={guide.start}
      say={<p>{tx.sdSay}</p>}
      bar={
        <>
          <div className="segmented" role="group" aria-label={tx.viewGroup} data-tour="view">
            {VIEWS.map((k) => (
              <button key={k} type="button" className={view === k ? 'is-active' : ''} aria-pressed={view === k} onClick={() => setView(k)}>
                {tx.views[k]}
              </button>
            ))}
          </div>
          <div className="segmented" role="group" aria-label={tx.roundGroup} data-tour="round">
            {ROUNDS.map((k) => (
              <button key={k} type="button" className={sdRound === k ? 'is-active' : ''} aria-pressed={sdRound === k} onClick={() => setSdRound(k)}>
                {tx.rounds[k]}
              </button>
            ))}
          </div>
        </>
      }
      foot={
        <>
          <div className="nd-feedback is-good" data-tour="feedback" aria-live="polite">
            <p className="nd-hint">{strong}</p>
            <p className="nd-fact">{fact}</p>
            {extra && <p className="nd-fact">{extra}</p>}
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
      <div className="aim-main is-single">
        {guide.view}
        <SquaresChart values={values} other={other} view={view} colour={KEYS[sdRound]} />
      </div>
    </Stage>
  )
}

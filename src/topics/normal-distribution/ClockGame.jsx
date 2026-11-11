import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { num, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import ClockChart from './ClockChart.jsx'
import { MIN_TRIALS, TARGETS, TOO_FAST, TRIALS, fmtPct, fmtS, stats, withinOneSd } from './clock.js'
import { CLOCK } from './text.js'

// Game: "Your inner clock". Stop a hidden clock at 2 s, then at 5 s. Every press drops a
// dot, so the student draws their own normal distribution while playing.

const COOLDOWN = 450 // ms after a stop before the next start counts (no double taps)

const emptyResults = () => TARGETS.map(() => [])
const KEYS = ['a', 'b'] // colour of each target's dots and curve (see .ck-dot.is-a / is-b)
const COMPARE_DOMAIN = [0, 2 * Math.max(...TARGETS)]

// Guided tour of each screen: what each bubble points at (null = middle of the screen).
// The texts are in text.js (tour), in the same order.
const TOUR_TARGETS = {
  first: [null, 'pad', 'chart', 'legend', 'chart', 'tools', 'steps', 'next'],
  second: ['chart'],
  compare: ['chart', 'view', 'feedback'],
}
const TOUR_PLACE = { pad: 'right', next: 'top' } // preferred side of the bubble

export default function ClockGame() {
  const tx = useText(CLOCK)
  const tc = useText(COMMON)
  const STEPS = tx.steps(TARGETS)
  const [results, setResults] = useState(emptyResults)
  const [exp, setExp] = useState(0)
  const [phase, setPhase] = useState('play') // 'play' | 'compare'
  const [relative, setRelative] = useState(false)
  const [running, setRunning] = useState(false)
  const [flash, setFlash] = useState(null) // { text, warn }
  const [demo, setDemo] = useState(false)
  const startRef = useRef(null)
  const coolRef = useRef(0)
  const padRef = useRef(null)
  const demoTimer = useRef(null)
  const downWhenFull = useRef(false) // the pointer went down on the big button after the game was full

  const target = TARGETS[exp]
  const values = results[exp]
  const n = values.length
  const full = n >= TRIALS
  const canPress = phase === 'play' && !full && !demo
  const isLast = exp === TARGETS.length - 1

  // One tour per screen (2 s game, 5 s game, compare); each opens by itself the first time.
  const tourId = phase === 'compare' ? 'compare' : exp === 0 ? 'first' : 'second'
  const guide = useGuide(`clock-${tourId}`, TOUR_TARGETS[tourId], tx.tour(TARGETS[0], TARGETS[1])[tourId], {
    place: TOUR_PLACE,
    doneLabel: phase === 'play' ? tx.tourPlay : undefined,
    onStart: () => {
      stopClock() // a clock left running behind the guide would give a wrong time
      setFlash(null)
    },
  })

  function stopClock() {
    startRef.current = null
    setRunning(false)
  }

  // `t` is the event timestamp (same clock as performance.now()).
  function press(t) {
    if (!canPress || t < coolRef.current) return
    if (startRef.current === null) {
      startRef.current = t
      setRunning(true)
      setFlash(null)
      return
    }
    const v = (t - startRef.current) / 1000
    stopClock()
    coolRef.current = t + COOLDOWN
    if (v < TOO_FAST) {
      setFlash({ text: tx.tooFast, warn: true })
      return
    }
    setResults((rs) => rs.map((r, i) => (i === exp ? [...r, v] : r)))
    const diff = v - target
    const off = Math.abs(diff) < 0.005 ? tx.spotOn : tx.off(fmtS(Math.abs(diff)), diff < 0)
    setFlash({ text: `${fmtS(v)} · ${off}`, warn: false })
  }

  // Space works anywhere on the page (except on other buttons, which keep their own Space).
  const pressRef = useRef(press)
  pressRef.current = press
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  useEffect(() => {
    function onKey(e) {
      if (e.code !== 'Space' || e.repeat || phaseRef.current !== 'play') return
      // A clicked button (Feel, Undo, …) keeps the focus; Space would click it again on key-up.
      // Take the focus away so Space always times the clock.
      const el = e.target
      if (el instanceof HTMLElement && el !== padRef.current && el.closest('button, a')) el.blur()
      e.preventDefault()
      pressRef.current(e.timeStamp)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => () => clearTimeout(demoTimer.current), [])

  // Shows what the target feels like: a ring that fills in exactly `target` seconds.
  function feel() {
    stopClock()
    setFlash(null)
    setDemo(true)
    clearTimeout(demoTimer.current)
    demoTimer.current = setTimeout(() => setDemo(false), target * 1000 + 80)
  }

  function undo() {
    stopClock()
    setFlash(null)
    setResults((rs) => rs.map((r, i) => (i === exp ? r.slice(0, -1) : r)))
  }

  function next() {
    stopClock()
    setFlash(null)
    if (isLast) {
      setPhase('compare')
    } else setExp(exp + 1) // straight on to the next game
  }

  function playAgain() {
    stopClock()
    setResults(emptyResults())
    setExp(0)
    setPhase('play')
    setRelative(false)
    setFlash(null)
  }

  const series = TARGETS.map((t, i) => ({ key: KEYS[i], label: `${t} s`, target: t, values: results[i] }))
  const ownDomain = (i) => [0, 2 * TARGETS[i]] // a game shows only its own presses
  const current = phase === 'compare' ? TARGETS.length : exp

  // ---------- Compare ----------
  if (phase === 'compare') {
    const [a, b] = results.map(stats)
    const ratio = b.sd / a.sd
    const cvA = a.sd / a.mean
    const cvB = b.sd / b.mean
    const cvClose = Math.max(cvA, cvB) / Math.min(cvA, cvB) <= 1.5
    const wider = ratio >= 1.15
    return (
      <Stage
        title={tx.title}
        className="ck-stage"
        steps={STEPS}
        current={current}
        onGuide={guide.start}
        say={
          <p>
            <strong>{tx.compareSay(wider)}</strong> {tx.compareSay2}
          </p>
        }
        bar={
          <>
            <div className="segmented ck-view" role="group" aria-label={tx.axisGroup} data-tour="view">
              <button type="button" className={relative ? '' : 'is-active'} aria-pressed={!relative} onClick={() => setRelative(false)}>
                {tx.seconds}
              </button>
              <button type="button" className={relative ? 'is-active' : ''} aria-pressed={relative} onClick={() => setRelative(true)}>
                {tx.perTarget}
              </button>
            </div>
            <div className="legend">
              {series.map((s) => (
                <span key={s.key} className={`legend-item ck-key is-${s.key}`}>
                  {tx.seriesKey(s.label)}
                </span>
              ))}
            </div>
          </>
        }
        foot={
          <>
            <div className="nd-feedback is-good" aria-live="polite" data-tour="feedback">
              <p className="nd-hint">
                {wider ? tx.wider(num(ratio, 1)) : tx.notWider(num(ratio, 1))}
              </p>
              <p className="nd-fact">
                {tx.fact(
                  { mean: fmtS(a.mean), sd: fmtS(a.sd) },
                  { mean: fmtS(b.mean), sd: fmtS(b.sd) },
                  fmtPct(cvA),
                  fmtPct(cvB),
                  cvClose,
                )}
              </p>
              <p className="nd-fact">{tx.within(fmtPct(withinOneSd(results[0])), fmtPct(withinOneSd(results[1])))}</p>
            </div>
            <div className="actions">
              <Link to="/topics" className="btn btn-ghost">
                {tc.allTopics}
              </Link>
              <button type="button" className="btn btn-primary" onClick={playAgain}>
                {tc.playAgain}
              </button>
            </div>
          </>
        }
      >
        <ClockChart series={series} domain={relative ? [0, 2] : COMPARE_DOMAIN} relative={relative} />
        {guide.view}
      </Stage>
    )
  }

  // ---------- Play ----------
  const st = stats(values)
  const nextLabel = tx.nextLabel(isLast, TARGETS[exp + 1])
  const locked = n < MIN_TRIALS
  // When the game is full, the big button itself leads to the next step.
  let padLabel = n ? tx.padNext : tx.padStart
  if (running) padLabel = tx.padStop(target)
  if (demo) padLabel = tx.padDemo(target)
  if (full) padLabel = tx.padGo(isLast, TARGETS[exp + 1])
  let hint = tx.hintIdle
  if (running) hint = tx.hintRunning
  else if (full) hint = tx.hintFull(TRIALS)
  else if (n) hint = tx.hintLeft(TRIALS - n, MIN_TRIALS - n)
  if (flash) hint = `${flash.text}${full ? ` ${tx.hintFull(TRIALS)}` : ''}`

  return (
    <Stage
      title={tx.title}
      className="ck-stage"
      steps={STEPS}
      current={current}
      onGuide={guide.start}
      say={
        <p>
          <strong>{tx.say(target)}</strong> {exp === 0 ? tx.sayFirst : tx.sayNext}
        </p>
      }
      bar={
        <>
          <div className="legend" data-tour="legend">
            <span className={`legend-item ck-key is-${KEYS[exp]}`}>
              {tx.count(n, TRIALS)}
            </span>
            {n >= 3 && <span className={`legend-item ck-line is-${KEYS[exp]}`}>{tx.bellKey}</span>}
            {n >= 2 && (
              <span className="ck-stats">
                {tx.stats(fmtS(st.mean), fmtS(st.sd))}
              </span>
            )}
          </div>
          <div className="tools" data-tour="tools">
            <button type="button" className="btn btn-ghost btn-sm" disabled={demo || running} onClick={feel}>
              {tx.feel(target)}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled={!n} onClick={undo}>
              {tc.undo}
            </button>
          </div>
        </>
      }
      foot={
        <>
          <p className={`ck-flash${flash?.warn ? ' is-warn' : ''}`} aria-live="polite">
            {hint}
          </p>
          <div className="actions">
            <Link to="/topics" className="btn btn-ghost">
              {tc.allTopics}
            </Link>
            <button
              type="button"
              className={`btn btn-primary ck-next${full ? ' nd-glow' : ''}`}
              data-tour="next"
              disabled={locked}
              title={locked ? tx.unlocks(MIN_TRIALS) : undefined}
              onClick={next}
            >
              {locked ? tx.locked(nextLabel.replace(' →', ''), MIN_TRIALS - n) : nextLabel}
            </button>
          </div>
        </>
      }
    >
      <div className="ck-main">
        <div className="ck-pad">
          <button
            ref={padRef}
            type="button"
            data-tour="pad"
            className={`ck-button${running ? ' is-running' : ''}${demo ? ' is-demo' : ''}${full ? ' is-next' : ''}`}
            disabled={demo}
            onClick={(e) => {
              // Only a fresh tap (or Enter) moves on: the tap that made the last press must not.
              if (!full) return
              const keyboard = e.detail === 0
              if (keyboard ? e.timeStamp >= coolRef.current : downWhenFull.current) next()
            }}
            onPointerDown={(e) => {
              downWhenFull.current = full
              if (e.button !== 0 || full) return
              e.preventDefault()
              press(e.timeStamp)
            }}
            aria-label={full ? padLabel : `${padLabel}. ${tx.spaceToo}`}
          >
            {demo && (
              <>
                <svg className="ck-ring" viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="50" r="47" pathLength="1" style={{ animationDuration: `${target}s` }} />
                </svg>
                <span className="ck-progress" style={{ animationDuration: `${target}s` }} aria-hidden="true" />
              </>
            )}
            <span className="ck-button-label">{padLabel}</span>
            {!full && !demo && <small>{tx.tapOrSpace}</small>}
          </button>
        </div>
        <ClockChart key={exp} series={[series[exp]]} domain={ownDomain(exp)} highlightLast />
        {guide.view}
      </div>
    </Stage>
  )
}

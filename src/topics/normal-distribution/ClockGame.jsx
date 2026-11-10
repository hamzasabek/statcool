import { useEffect, useRef, useState } from 'react'
import { Stage } from '../../components/Stage.jsx'
import ClockChart from './ClockChart.jsx'
import { MIN_TRIALS, TARGETS, TOO_FAST, TRIALS, fmtPct, fmtS, stats } from './clock.js'

// Game: "Your inner clock". Stop a hidden clock at 2 s, then at 5 s. Every press drops a
// dot, so the student draws their own normal distribution while playing.

const STEPS = [...TARGETS.map((t) => `${t} seconds`), 'Compare']
const COOLDOWN = 450 // ms after a stop before the next start counts (no double taps)
const CHOICES = [
  { id: 'less', label: 'Less spread' },
  { id: 'same', label: 'The same' },
  { id: 'more', label: 'More spread' },
]

const emptyResults = () => TARGETS.map(() => [])
const KEYS = ['a', 'b'] // colour of each target's dots and curve (see .ck-dot.is-a / is-b)
const COMPARE_DOMAIN = [0, 2 * Math.max(...TARGETS)]

export default function ClockGame({ onExit, onComplete }) {
  const [results, setResults] = useState(emptyResults)
  const [exp, setExp] = useState(0)
  const [phase, setPhase] = useState('play') // 'play' | 'predict' | 'compare'
  const [prediction, setPrediction] = useState(null)
  const [relative, setRelative] = useState(false)
  const [running, setRunning] = useState(false)
  const [flash, setFlash] = useState(null) // { text, warn }
  const [demo, setDemo] = useState(false)
  const startRef = useRef(null)
  const coolRef = useRef(0)
  const padRef = useRef(null)
  const demoTimer = useRef(null)

  const target = TARGETS[exp]
  const values = results[exp]
  const n = values.length
  const full = n >= TRIALS
  const canPress = phase === 'play' && !full && !demo
  const isLast = exp === TARGETS.length - 1

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
      setFlash({ text: 'Too fast, not counted. Start again.', warn: true })
      return
    }
    setResults((rs) => rs.map((r, i) => (i === exp ? [...r, v] : r)))
    const diff = v - target
    const off = Math.abs(diff) < 0.005 ? 'spot on!' : `${fmtS(Math.abs(diff))} ${diff < 0 ? 'early' : 'late'}`
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
      onComplete?.()
    } else setPhase('predict')
  }

  function choose(id) {
    setPrediction(id)
    setExp(exp + 1)
    setPhase('play')
  }

  function playAgain() {
    stopClock()
    setResults(emptyResults())
    setExp(0)
    setPhase('play')
    setPrediction(null)
    setRelative(false)
    setFlash(null)
  }

  const series = TARGETS.map((t, i) => ({ key: KEYS[i], label: `${t} s`, target: t, values: results[i] }))
  const ownDomain = (i) => [0, 2 * TARGETS[i]] // a game shows only its own presses
  const current = phase === 'compare' ? TARGETS.length : exp + (phase === 'predict' ? 1 : 0)

  // ---------- Compare ----------
  if (phase === 'compare') {
    const [a, b] = results.map(stats)
    const ratio = b.sd / a.sd
    const cvA = a.sd / a.mean
    const cvB = b.sd / b.mean
    const cvClose = Math.max(cvA, cvB) / Math.min(cvA, cvB) <= 1.5
    const wider = ratio >= 1.15
    const verdict =
      prediction === 'more'
        ? 'You predicted more spread. Right!'
        : `You predicted ${prediction === 'less' ? 'less spread' : 'the same spread'}. For most people the spread grows with the time.`
    return (
      <Stage
        title="Your inner clock"
        steps={STEPS}
        current={current}
        say={
          <p>
            <strong>Two bells: {wider ? 'the 5-second one is wider.' : 'here they are about as wide.'}</strong>{' '}
            Both games in one graph. Switch to “÷ target” to put them on the same scale.
          </p>
        }
        bar={
          <>
            <div className="segmented ck-view" role="group" aria-label="Axis">
              <button type="button" className={relative ? '' : 'is-active'} aria-pressed={!relative} onClick={() => setRelative(false)}>
                Seconds
              </button>
              <button type="button" className={relative ? 'is-active' : ''} aria-pressed={relative} onClick={() => setRelative(true)}>
                ÷ target
              </button>
            </div>
            <div className="legend">
              {series.map((s) => (
                <span key={s.key} className={`legend-item ck-key is-${s.key}`}>
                  {s.label} presses + bell
                </span>
              ))}
            </div>
          </>
        }
        foot={
          <>
            <div className="nd-feedback is-good" aria-live="polite">
              <p className="nd-hint">
                {wider
                  ? `The 5 s spread is ${ratio.toFixed(1)}× wider, but the shape is still a bell.`
                  : `This time your 5 s spread was only ${ratio.toFixed(1)}× the 2 s spread.`}
              </p>
              <p className="nd-fact">
                2 s: mean {fmtS(a.mean)}, SD {fmtS(a.sd)} · 5 s: mean {fmtS(b.mean)}, SD {fmtS(b.sd)}. Relative to the
                time, the spread is {fmtPct(cvA)} vs {fmtPct(cvB)}
                {cvClose ? ': about the same. Timing errors grow in proportion to the time (Weber’s law).' : '.'}
              </p>
              <p className="nd-fact">{verdict}</p>
            </div>
            <div className="actions">
              <button type="button" className="btn btn-ghost" onClick={onExit}>
                All examples
              </button>
              <button type="button" className="btn btn-primary" onClick={playAgain}>
                Play again
              </button>
            </div>
          </>
        }
      >
        <ClockChart series={series} domain={relative ? [0, 2] : COMPARE_DOMAIN} relative={relative} />
      </Stage>
    )
  }

  // ---------- Predict (between the two experiments) ----------
  if (phase === 'predict') {
    const nextT = TARGETS[exp + 1]
    return (
      <Stage
        title="Your inner clock"
        steps={STEPS}
        current={current}
        say={
          <p>
            <strong>Next: {nextT} seconds.</strong> Compared with {target} s, will your presses have…
          </p>
        }
        foot={
          <>
            <div className="ck-choices" role="group" aria-label="Your prediction">
              {CHOICES.map((c) => (
                <button key={c.id} type="button" className="btn" onClick={() => choose(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="actions">
              <button type="button" className="btn btn-ghost" onClick={onExit}>
                All examples
              </button>
            </div>
          </>
        }
      >
        <ClockChart series={[series[exp]]} domain={ownDomain(exp)} />
      </Stage>
    )
  }

  // ---------- Play ----------
  const st = stats(values)
  let padLabel = n ? 'Next' : 'Start'
  if (running) padLabel = `Stop at ${target} s`
  if (demo) padLabel = `This is ${target} s`
  if (full) padLabel = 'Done!'
  const hint = flash?.text ?? (full ? 'All presses done!' : running ? 'Press when you feel it.' : n ? `${TRIALS - n} presses left.` : 'Tap the button or press Space.')

  return (
    <Stage
      title="Your inner clock"
      steps={STEPS}
      current={current}
      say={
        <p>
          <strong>
            Press to start, then press again when you think {target} seconds have passed.
          </strong>{' '}
          {exp === 0 ? 'Don’t count, just feel it.' : 'A new game, with its own chart.'}
        </p>
      }
      bar={
        <>
          <div className="legend">
            <span className={`legend-item ck-key is-${KEYS[exp]}`}>
              {n} / {TRIALS} presses
            </span>
            {n >= 3 && <span className={`legend-item ck-line is-${KEYS[exp]}`}>Bell with your mean and SD</span>}
            {n >= 2 && (
              <span className="ck-stats">
                mean {fmtS(st.mean)} · SD {fmtS(st.sd)}
              </span>
            )}
          </div>
          <div className="tools">
            <button type="button" className="btn btn-ghost btn-sm" disabled={demo || running} onClick={feel}>
              Feel {target} s
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled={!n} onClick={undo}>
              Undo
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
            <button type="button" className="btn btn-ghost" onClick={onExit}>
              All examples
            </button>
            <button
              type="button"
              className={`btn btn-primary${full ? ' nd-glow' : ''}`}
              disabled={n < MIN_TRIALS}
              onClick={next}
            >
              {isLast ? 'Compare →' : `Next: ${TARGETS[exp + 1]} seconds →`}
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
            className={`ck-button${running ? ' is-running' : ''}${demo ? ' is-demo' : ''}`}
            disabled={full || demo}
            onPointerDown={(e) => {
              if (e.button !== 0) return
              e.preventDefault()
              press(e.timeStamp)
            }}
            aria-label={`${padLabel}. Space also works.`}
          >
            {demo && (
              <svg className="ck-ring" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="47" pathLength="1" style={{ animationDuration: `${target}s` }} />
              </svg>
            )}
            <span className="ck-button-label">{padLabel}</span>
            {!full && !demo && <small>tap or Space</small>}
          </button>
        </div>
        <ClockChart key={exp} series={[series[exp]]} domain={ownDomain(exp)} highlightLast />
      </div>
    </Stage>
  )
}

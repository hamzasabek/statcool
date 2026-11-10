import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import RTChart from './RTChart.jsx'
import { CEIL, FLOOR, MIN_TRIALS, TRIALS, fmtMs, logFit, mean, median, randomWait, skewness } from './rt.js'

// Topic 03 "Right-skewed distributions", played as a reaction-time game.
//   1. Tap: 25 reactions, each one a dot; a log-normal curve grows with them
//   2. The tail: peak (mode) < median < mean, the floor at 100 ms, the two halves of the data
//   3. Log view: on a log scale the tail folds in and the taps make a bell again

const STEPS = ['Tap', 'The tail', 'Log view']
const NEXT_DELAY = 600 // ms after the last tap before the big button can move on (no double taps)

export default function ReactionTime() {
  const [step, setStep] = useState(0)
  const [taps, setTaps] = useState([]) // { id, v }: reaction time in ms
  const [phase, setPhase] = useState('ready') // ready | wait | go | result | early | bad
  const [msg, setMsg] = useState(null)
  const [log, setLog] = useState(false)
  const goAt = useRef(0)
  const lastTap = useRef(0)
  const timer = useRef(null)
  const padRef = useRef(null)
  const nextId = useRef(0)

  const n = taps.length
  const full = n >= TRIALS
  const vals = taps.map((t) => t.v)
  const fit = logFit(vals)

  useEffect(() => () => clearTimeout(timer.current), [])

  function turnYellow() {
    flushSync(() => setPhase('go'))
    goAt.current = performance.now() // the yellow circle is on screen from (about) now
  }

  // `ts` = event timestamp (same clock as performance.now()).
  function tap(ts) {
    if (step !== 0) return
    if (full) {
      if (ts - lastTap.current > NEXT_DELAY) setStep(1)
      return
    }
    if (phase === 'wait') {
      clearTimeout(timer.current)
      setPhase('early')
      setMsg('Too soon! Wait until the circle turns yellow.')
      return
    }
    if (phase === 'go') {
      const rt = ts - goAt.current
      lastTap.current = ts
      if (rt < FLOOR) {
        setPhase('bad')
        setMsg(`${fmtMs(rt)}: faster than any human. That was a guess, not counted.`)
      } else if (rt > CEIL) {
        setPhase('bad')
        setMsg('Over 3 seconds: were you away? Not counted.')
      } else {
        setTaps((ts0) => [...ts0, { id: nextId.current++, v: rt }])
        setPhase('result')
        setMsg(null)
      }
      return
    }
    // ready / result / early / bad → start the next wait
    setPhase('wait')
    setMsg(null)
    clearTimeout(timer.current)
    timer.current = setTimeout(turnYellow, randomWait())
  }

  // Space works anywhere on the page.
  const tapRef = useRef(tap)
  tapRef.current = tap
  const stepRef = useRef(step)
  stepRef.current = step
  useEffect(() => {
    function onKey(e) {
      if (e.code !== 'Space' || e.repeat || stepRef.current !== 0) return
      const el = e.target
      if (el instanceof HTMLElement && el !== padRef.current && el.closest('button, a')) el.blur()
      e.preventDefault()
      tapRef.current(e.timeStamp)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function undo() {
    clearTimeout(timer.current)
    setTaps((ts) => ts.slice(0, -1))
    setPhase('ready')
    setMsg(null)
  }

  function playAgain() {
    clearTimeout(timer.current)
    setTaps([])
    setPhase('ready')
    setMsg(null)
    setLog(false)
    setStep(0)
  }

  const allTopics = (
    <Link to="/" className="btn btn-ghost">
      All topics
    </Link>
  )
  const curveKey = <span className="legend-item ck-line is-a">Curve</span>

  // ---------- 1. Tap ----------
  if (step === 0) {
    const locked = n < MIN_TRIALS
    const last = taps.at(-1)
    let big = 'Tap to start'
    let small = 'then wait for yellow'
    if (phase === 'wait') [big, small] = ['Wait…', 'tap when it turns yellow']
    if (phase === 'go') [big, small] = ['TAP!', '']
    if (phase === 'result' && last) [big, small] = [fmtMs(last.v), 'tap for the next one']
    if (phase === 'early') [big, small] = ['Too soon!', 'tap to try again']
    if (phase === 'bad') [big, small] = ['Not counted', 'tap to try again']
    if (full) [big, small] = ['The tail →', `all ${TRIALS} taps done`]

    let hint = 'Tap the circle (or press Space), then tap again the moment it turns yellow.'
    if (msg) hint = msg
    else if (full) hint = `All ${TRIALS} taps done! Look at the shape: where is the long side?`
    else if (n) hint = `${TRIALS - n} taps left${locked ? ` (${MIN_TRIALS - n} more to unlock the next step)` : ''}.`

    return (
      <Stage
        title="Reaction time"
        className="rt-stage"
        steps={STEPS}
        current={0}
        say={
          <p>
            <strong>Tap the moment the circle turns yellow.</strong> As fast as you can, 25 times.
          </p>
        }
        bar={
          <>
            <div className="legend">
              <span className="legend-item added">
                {n} / {TRIALS} taps
              </span>
              {fit && curveKey}
            </div>
            <div className="tools">
              <button type="button" className="btn btn-ghost btn-sm" disabled={!n || phase === 'wait' || phase === 'go'} onClick={undo}>
                Undo
              </button>
            </div>
          </>
        }
        foot={
          <>
            <p className={`ck-flash${phase === 'early' || phase === 'bad' ? ' is-warn' : ''}`} aria-live="polite">
              {hint}
            </p>
            <div className="actions">
              {allTopics}
              <button
                type="button"
                className={`btn btn-primary ck-next${full ? ' nd-glow' : ''}`}
                disabled={locked}
                title={locked ? `Unlocks after ${MIN_TRIALS} taps` : undefined}
                onClick={() => {
                  clearTimeout(timer.current)
                  setStep(1)
                }}
              >
                {locked ? `Next: the tail · ${MIN_TRIALS - n} more` : 'Next: the tail →'}
              </button>
            </div>
          </>
        }
      >
        <div className="rt-main">
          <div className="rt-pad-wrap">
            <button
              ref={padRef}
              type="button"
              className={`rt-pad is-${full ? 'next' : phase}`}
              onPointerDown={(e) => {
                if (e.button !== 0) return
                e.preventDefault()
                tap(e.timeStamp)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.repeat) {
                  e.preventDefault()
                  tap(e.timeStamp)
                }
              }}
              aria-label={`${big}. ${small}. Space also works.`}
            >
              <span className="rt-pad-big">{big}</span>
              {small && <small>{small}</small>}
            </button>
          </div>
          <RTChart points={taps} fit={fit} highlightLast />
        </div>
      </Stage>
    )
  }

  const md = median(vals)
  const mn = mean(vals)

  // ---------- 2. The tail ----------
  if (step === 1) {
    const skewed = skewness(vals) >= 0.3
    const ordered = fit && fit.mode < md && md < mn
    const minV = Math.min(...vals)
    const maxV = Math.max(...vals)
    return (
      <Stage
        title="Reaction time"
        className="rt-stage"
        steps={STEPS}
        current={1}
        say={
          <p>
            <strong>
              {skewed
                ? 'Your taps pile up on the fast side and trail off to the right.'
                : 'Your taps are almost a bell this time: very few slow ones.'}
            </strong>{' '}
            {skewed ? 'That is a right-skewed distribution.' : 'Most people get a longer tail to the right.'}
          </p>
        }
        bar={
          <div className="legend">
            {curveKey}
            <span className="legend-item rt-key is-mode">Peak (mode)</span>
            <span className="legend-item median">Median</span>
            <span className="legend-item mean">Mean ▲</span>
          </div>
        }
        foot={
          <>
            <div className="nd-feedback" aria-live="polite">
              <p className="nd-hint">
                {ordered
                  ? `Peak ${fmtMs(fit.mode)} → median ${fmtMs(md)} → mean ${fmtMs(mn)}: the long tail pulls the mean to the right.`
                  : `Median ${fmtMs(md)}, mean ${fmtMs(mn)}. In a right-skewed distribution the order is peak → median → mean.`}
              </p>
              <p className="nd-fact">
                Why? There is a floor: nobody reacts faster than about 0.1 s. But you can always be slower: a blink, a
                wandering thought. Half your taps fit in {fmtMs(md - minV)} left of the median; the other half stretch
                over {fmtMs(maxV - md)} to the right.
              </p>
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                Next: log view →
              </button>
            </div>
          </>
        }
      >
        <div className="rt-main is-full">
          <RTChart points={taps} fit={fit} markers={['mode', 'median', 'mean']} floor halves />
        </div>
      </Stage>
    )
  }

  // ---------- 3. Log view ----------
  return (
    <Stage
      title="Reaction time"
      className="rt-stage"
      steps={STEPS}
      current={2}
      say={
        <p>
          <strong>
            {log ? 'On a log scale the tail folds in: your taps make a bell again.' : 'Switch to “Log scale” and watch the tail fold in.'}
          </strong>
        </p>
      }
      bar={
        <>
          <div className="segmented rt-view" role="group" aria-label="Axis">
            <button type="button" className={log ? '' : 'is-active'} aria-pressed={!log} onClick={() => setLog(false)}>
              Milliseconds
            </button>
            <button type="button" className={log ? 'is-active' : ''} aria-pressed={log} onClick={() => setLog(true)}>
              Log scale
            </button>
          </div>
          <div className="legend">
            {curveKey}
            <span className="legend-item median">Median</span>
            {!log && <span className="legend-item mean">Mean</span>}
          </div>
        </>
      }
      foot={
        <>
          <div className={`nd-feedback${log ? ' is-good' : ''}`} aria-live="polite">
            <p className="nd-hint">
              {log
                ? `Every doubling gets the same space: 200 → 400 ms is as wide as 400 → 800 ms. The top of the bell is close to your median, ${fmtMs(md)}.`
                : 'In milliseconds: a peak on the fast side and a long tail to the right.'}
            </p>
            <p className="nd-fact">
              {log
                ? 'Many right-skewed measures (reaction times, incomes, city sizes) are a bell on a log scale. That is why researchers often take the log of reaction times before they analyse them.'
                : 'On the log scale each step doubles the time. Try it.'}
            </p>
          </div>
          <div className="actions">
            {allTopics}
            <button type="button" className="btn btn-primary" onClick={playAgain}>
              Play again
            </button>
          </div>
        </>
      }
    >
      <div className="rt-main is-full">
        <RTChart points={taps} fit={fit} scale={log ? 'log' : 'linear'} markers={log ? ['median'] : ['median', 'mean']} />
      </div>
    </Stage>
  )
}

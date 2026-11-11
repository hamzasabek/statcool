import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import RTChart from './RTChart.jsx'
import { CEIL, FLOOR, MAX_MISSES, MIN_TRIALS, TRIALS, fmtMs, logFit, mean, median, randomWait, skewness } from './rt.js'
import { RT } from './text.js'

// Topic 03 "Right-skewed distributions", played as a reaction-time game.
//   1. Tap: one tap starts a run of trials (wait → yellow → tap → next wait…); 25 good reactions,
//      each one a dot; errors are removed automatically; a log-normal curve grows with the dots
//   2. The tail: peak (mode) < median < mean, the floor at 100 ms, the two halves of the data
//   3. Log view: on a log scale the tail folds in and the taps make a bell again

const NEXT_DELAY = 600 // ms after the last tap before the big button can move on (no double taps)
const LATE_GRACE = 400 // ms after a miss: a tap now is a late reaction, not a "too soon"
const NO_ERRORS = { tooSoon: 0, guess: 0, missed: 0 }

// Guided tour of each step: what each bubble points at (null = middle of the screen); the texts
// are in text.js (tour), in the same order.
const TOUR_IDS = ['tap', 'tail', 'log']
const TOUR_TARGETS = {
  tap: [null, 'pad', 'chart', 'legend', 'tools', 'steps', 'next'],
  tail: ['chart', 'legend', 'chart'],
  log: ['view', 'chart'],
}
const TOUR_PLACE = { pad: 'right', next: 'top' }

export default function ReactionTime() {
  const tx = useText(RT)
  const tc = useText(COMMON)
  const [step, setStep] = useState(0)
  const [taps, setTaps] = useState([]) // { id, v }: reaction time in ms
  const [phase, setPhase] = useState('ready') // ready | wait | go | paused | done
  const [msg, setMsg] = useState(null) // { k: 'tooSoon' | 'guess' | 'missed' | 'autoPaused', ms } (text built at render)
  const [errors, setErrors] = useState(NO_ERRORS) // removed trials, by kind
  const [log, setLog] = useState(false)
  const goAt = useRef(0)
  const lastTap = useRef(0)
  const missedAt = useRef(-1e9)
  const missStreak = useRef(0)
  const timer = useRef(null)
  const padRef = useRef(null)
  const nextId = useRef(0)

  const n = taps.length
  const full = n >= TRIALS
  const vals = taps.map((t) => t.v)
  const fit = logFit(vals)

  useEffect(() => () => clearTimeout(timer.current), [])

  const countError = (k) => setErrors((e) => ({ ...e, [k]: e[k] + 1 }))

  // A new trial: random wait, then yellow. Runs by itself until the game is done or paused.
  function nextTrial() {
    clearTimeout(timer.current)
    setPhase('wait')
    timer.current = setTimeout(turnYellow, randomWait())
  }

  function turnYellow() {
    flushSync(() => setPhase('go'))
    goAt.current = performance.now() // the yellow circle is on screen from (about) now
    timer.current = setTimeout(miss, CEIL)
  }

  function miss() {
    missedAt.current = performance.now()
    countError('missed')
    missStreak.current += 1
    if (missStreak.current >= MAX_MISSES) {
      // Nobody is tapping: stop instead of running on.
      missStreak.current = 0
      setPhase('paused')
      setMsg({ k: 'autoPaused' })
      return
    }
    setMsg({ k: 'missed' })
    nextTrial()
  }

  function pause() {
    clearTimeout(timer.current)
    missStreak.current = 0
    setPhase('paused')
    setMsg(null)
  }

  // `ts` = event timestamp (same clock as performance.now()).
  function tap(ts) {
    if (step !== 0) return
    if (phase === 'done') {
      if (ts - lastTap.current > NEXT_DELAY) setStep(1)
      return
    }
    if (phase === 'ready' || phase === 'paused') {
      setMsg(null) // the one tap that starts (or resumes) the run
      nextTrial()
      return
    }
    if (phase === 'wait') {
      if (ts - missedAt.current < LATE_GRACE) return // a late reaction to the trial that just timed out
      countError('tooSoon')
      setMsg({ k: 'tooSoon' })
      nextTrial() // the wait starts again
      return
    }
    if (phase === 'go') {
      clearTimeout(timer.current)
      const rt = ts - goAt.current
      lastTap.current = ts
      missStreak.current = 0
      if (rt < FLOOR) {
        countError('guess')
        setMsg({ k: 'guess', ms: rt })
        nextTrial()
        return
      }
      setTaps((ts0) => [...ts0, { id: nextId.current++, v: rt }])
      setMsg(null)
      if (n + 1 >= TRIALS) {
        setPhase('done')
        return
      }
      nextTrial()
    }
  }

  // Leaving the tab pauses the run (timers would keep going while nobody is looking).
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  useEffect(() => {
    function onVisibility() {
      if (document.hidden && (phaseRef.current === 'wait' || phaseRef.current === 'go')) {
        clearTimeout(timer.current)
        setPhase('paused')
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

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

  function goTail() {
    if (phase !== 'done') pause()
    setStep(1)
  }

  function playAgain() {
    clearTimeout(timer.current)
    setTaps([])
    setErrors(NO_ERRORS)
    missStreak.current = 0
    setPhase('ready')
    setMsg(null)
    setLog(false)
    setStep(0)
  }

  const allTopics = (
    <Link to="/" className="btn btn-ghost">
      {tc.allTopics}
    </Link>
  )
  const curveKey = <span className="legend-item ck-line is-a">{tx.curve}</span>
  const msgText = msg ? (msg.k === 'guess' ? tx.guess(fmtMs(msg.ms)) : tx[msg.k]) : null
  const removed = errors.tooSoon + errors.guess + errors.missed

  // One tour per step; each opens by itself the first time. Opening it pauses a running game.
  const tourId = TOUR_IDS[step]
  const guide = useGuide(`rt-${tourId}`, TOUR_TARGETS[tourId], tx.tour[tourId], {
    place: TOUR_PLACE,
    doneLabel: step === 0 ? tx.tourPlay : undefined,
    onStart: () => {
      if (phase === 'wait' || phase === 'go') pause()
    },
  })

  // ---------- 1. Tap ----------
  if (step === 0) {
    const locked = n < MIN_TRIALS
    const last = taps.at(-1)
    const error = phase === 'wait' && msg && msg.k !== 'autoPaused' // the last trial was removed
    let [big, small] = tx.pad.ready
    if (phase === 'wait') {
      // While waiting: the last result (or what went wrong), and a reminder to wait.
      big = error ? tx.errBig[msg.k] : last ? fmtMs(last.v) : tx.pad.wait[0]
      small = tx.pad.wait[1]
    }
    if (phase === 'go') [big, small] = tx.pad.go
    if (phase === 'paused') [big, small] = tx.pad.paused
    if (phase === 'done') [big, small] = [tx.padNext, tx.padDone(TRIALS)]

    let hint = tx.hintStart
    if (msgText) hint = msgText
    else if (phase === 'done') hint = tx.hintFull(TRIALS)
    else if (phase === 'paused') hint = tx.hintPaused
    else if (n) hint = tx.hintLeft(TRIALS - n, MIN_TRIALS - n)
    const padClass = phase === 'done' ? 'next' : error ? 'wait is-error' : phase

    return (
      <Stage
        title={tx.title}
        className="rt-stage"
        steps={tx.steps}
        onGuide={guide.start}
        current={0}
        say={
          <p>
            <strong>{tx.sayStrong}</strong> {tx.say(TRIALS)}
          </p>
        }
        bar={
          <>
            <div className="legend" data-tour="legend">
              <span className="legend-item added">{tx.count(n, TRIALS)}</span>
              {fit && curveKey}
              {removed > 0 && <span className="rt-removed">{tx.removed(removed)}</span>}
            </div>
            <div className="tools" data-tour="tools">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={phase !== 'wait' && phase !== 'go'}
                onClick={pause}
              >
                {tx.pause}
              </button>
            </div>
          </>
        }
        foot={
          <>
            <p className={`ck-flash${msg ? ' is-warn' : ''}`} aria-live="polite">
              {hint}
            </p>
            <div className="actions">
              {allTopics}
              <button
                type="button"
                className={`btn btn-primary ck-next${full ? ' nd-glow' : ''}`}
                data-tour="next"
                disabled={locked}
                title={locked ? tx.unlocks(MIN_TRIALS) : undefined}
                onClick={goTail}
              >
                {locked ? tx.lockedTail(MIN_TRIALS - n) : tx.nextTail}
              </button>
            </div>
          </>
        }
      >
        <div className="rt-main">
          {guide.view}
          <div className="rt-pad-wrap">
            <button
              ref={padRef}
              type="button"
              className={`rt-pad is-${padClass}`}
              data-tour="pad"
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
              aria-label={`${big}. ${small ? `${small}. ` : ''}${tx.spaceToo}`}
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
        title={tx.title}
        className="rt-stage"
        steps={tx.steps}
        onGuide={guide.start}
        current={1}
        say={
          <p>
            <strong>{skewed ? tx.skewedStrong : tx.notSkewedStrong}</strong> {skewed ? tx.skewed : tx.notSkewed}
          </p>
        }
        bar={
          <div className="legend" data-tour="legend">
            {curveKey}
            <span className="legend-item rt-key is-mode">{tx.keyMode}</span>
            <span className="legend-item median">{tx.keyMedian}</span>
            <span className="legend-item mean">{tx.keyMean}</span>
          </div>
        }
        foot={
          <>
            <div data-tour="feedback" className="nd-feedback" aria-live="polite">
              <p className="nd-hint">
                {ordered ? tx.ordered(fmtMs(fit.mode), fmtMs(md), fmtMs(mn)) : tx.unordered(fmtMs(md), fmtMs(mn))}
              </p>
              <p className="nd-fact">
                {tx.why(fmtMs(md - minV), fmtMs(maxV - md))}{' '}
                {removed > 0 && tx.removedFact(errors.tooSoon, errors.guess, errors.missed)}
              </p>
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                {tx.nextLog}
              </button>
            </div>
          </>
        }
      >
        <div className="rt-main is-full">
          {guide.view}
          <RTChart points={taps} fit={fit} markers={['mode', 'median', 'mean']} floor halves />
        </div>
      </Stage>
    )
  }

  // ---------- 3. Log view ----------
  return (
    <Stage
      title={tx.title}
      className="rt-stage"
      steps={tx.steps}
      onGuide={guide.start}
      current={2}
      say={
        <p>
          <strong>{log ? tx.logStrong : tx.msStrong}</strong>
        </p>
      }
      bar={
        <>
          <div className="segmented rt-view" role="group" aria-label={tx.axisGroup} data-tour="view">
            <button type="button" className={log ? '' : 'is-active'} aria-pressed={!log} onClick={() => setLog(false)}>
              {tx.ms}
            </button>
            <button type="button" className={log ? 'is-active' : ''} aria-pressed={log} onClick={() => setLog(true)}>
              {tx.logScale}
            </button>
          </div>
          <div className="legend" data-tour="legend">
            {curveKey}
            <span className="legend-item median">{tx.keyMedian}</span>
            {!log && <span className="legend-item mean">{tx.mean}</span>}
          </div>
        </>
      }
      foot={
        <>
          <div data-tour="feedback" className={`nd-feedback${log ? ' is-good' : ''}`} aria-live="polite">
            <p className="nd-hint">
              {log ? tx.logHint(fmtMs(md)) : tx.msHint}
            </p>
            <p className="nd-fact">{log ? tx.logFact : tx.msFact}</p>
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
      <div className="rt-main is-full">
        {guide.view}
        <RTChart points={taps} fit={fit} scale={log ? 'log' : 'linear'} markers={log ? ['median'] : ['median', 'mean']} />
      </div>
    </Stage>
  )
}

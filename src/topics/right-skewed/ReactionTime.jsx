import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import RTChart from './RTChart.jsx'
import { CEIL, FLOOR, MIN_TRIALS, TRIALS, fmtMs, logFit, mean, median, randomWait, skewness } from './rt.js'
import { RT } from './text.js'

// Topic 03 "Right-skewed distributions", played as a reaction-time game.
//   1. Tap: 25 reactions, each one a dot; a log-normal curve grows with them
//   2. The tail: peak (mode) < median < mean, the floor at 100 ms, the two halves of the data
//   3. Log view: on a log scale the tail folds in and the taps make a bell again

const NEXT_DELAY = 600 // ms after the last tap before the big button can move on (no double taps)

export default function ReactionTime() {
  const tx = useText(RT)
  const tc = useText(COMMON)
  const [step, setStep] = useState(0)
  const [taps, setTaps] = useState([]) // { id, v }: reaction time in ms
  const [phase, setPhase] = useState('ready') // ready | wait | go | result | early | bad
  const [msg, setMsg] = useState(null) // { k: 'tooSoon' | 'guess' | 'away', ms } (text built at render)
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
      setMsg({ k: 'tooSoon' })
      return
    }
    if (phase === 'go') {
      const rt = ts - goAt.current
      lastTap.current = ts
      if (rt < FLOOR) {
        setPhase('bad')
        setMsg({ k: 'guess', ms: rt })
      } else if (rt > CEIL) {
        setPhase('bad')
        setMsg({ k: 'away' })
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
      {tc.allTopics}
    </Link>
  )
  const curveKey = <span className="legend-item ck-line is-a">{tx.curve}</span>
  const msgText = msg ? (msg.k === 'guess' ? tx.guess(fmtMs(msg.ms)) : tx[msg.k]) : null

  // ---------- 1. Tap ----------
  if (step === 0) {
    const locked = n < MIN_TRIALS
    const last = taps.at(-1)
    let [big, small] = tx.pad.ready
    if (phase === 'result' && last) [big, small] = [fmtMs(last.v), tx.pad.result]
    else if (phase !== 'ready' && phase !== 'result') [big, small] = tx.pad[phase]
    if (full) [big, small] = [tx.padNext, tx.padDone(TRIALS)]

    let hint = tx.hintStart
    if (msgText) hint = msgText
    else if (full) hint = tx.hintFull(TRIALS)
    else if (n) hint = tx.hintLeft(TRIALS - n, MIN_TRIALS - n)

    return (
      <Stage
        title={tx.title}
        className="rt-stage"
        steps={tx.steps}
        current={0}
        say={
          <p>
            <strong>{tx.sayStrong}</strong> {tx.say(TRIALS)}
          </p>
        }
        bar={
          <>
            <div className="legend">
              <span className="legend-item added">{tx.count(n, TRIALS)}</span>
              {fit && curveKey}
            </div>
            <div className="tools">
              <button type="button" className="btn btn-ghost btn-sm" disabled={!n || phase === 'wait' || phase === 'go'} onClick={undo}>
                {tc.undo}
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
                title={locked ? tx.unlocks(MIN_TRIALS) : undefined}
                onClick={() => {
                  clearTimeout(timer.current)
                  setStep(1)
                }}
              >
                {locked ? tx.lockedTail(MIN_TRIALS - n) : tx.nextTail}
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
        current={1}
        say={
          <p>
            <strong>{skewed ? tx.skewedStrong : tx.notSkewedStrong}</strong> {skewed ? tx.skewed : tx.notSkewed}
          </p>
        }
        bar={
          <div className="legend">
            {curveKey}
            <span className="legend-item rt-key is-mode">{tx.keyMode}</span>
            <span className="legend-item median">{tx.keyMedian}</span>
            <span className="legend-item mean">{tx.keyMean}</span>
          </div>
        }
        foot={
          <>
            <div className="nd-feedback" aria-live="polite">
              <p className="nd-hint">
                {ordered ? tx.ordered(fmtMs(fit.mode), fmtMs(md), fmtMs(mn)) : tx.unordered(fmtMs(md), fmtMs(mn))}
              </p>
              <p className="nd-fact">{tx.why(fmtMs(md - minV), fmtMs(maxV - md))}</p>
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
      current={2}
      say={
        <p>
          <strong>{log ? tx.logStrong : tx.msStrong}</strong>
        </p>
      }
      bar={
        <>
          <div className="segmented rt-view" role="group" aria-label={tx.axisGroup}>
            <button type="button" className={log ? '' : 'is-active'} aria-pressed={!log} onClick={() => setLog(false)}>
              {tx.ms}
            </button>
            <button type="button" className={log ? 'is-active' : ''} aria-pressed={log} onClick={() => setLog(true)}>
              {tx.logScale}
            </button>
          </div>
          <div className="legend">
            {curveKey}
            <span className="legend-item median">{tx.keyMedian}</span>
            {!log && <span className="legend-item mean">{tx.mean}</span>}
          </div>
        </>
      }
      foot={
        <>
          <div className={`nd-feedback${log ? ' is-good' : ''}`} aria-live="polite">
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
        <RTChart points={taps} fit={fit} scale={log ? 'log' : 'linear'} markers={log ? ['median'] : ['median', 'mean']} />
      </div>
    </Stage>
  )
}

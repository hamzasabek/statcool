import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { num, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import ExpChart from './ExpChart.jsx'
import {
  BET_QUIET,
  BET_WINDOW,
  CATCH_WINDOW,
  GAPS,
  MIN_GAPS,
  QUIET_MAX,
  SIMULATED,
  chanceWithin,
  expFit,
  fmtS,
  fmtShare,
  mean,
  median,
  randomGap,
  simulate,
} from './exp.js'
import { EXP } from './text.js'

// Topic 04 "The exponential distribution": listen to a neuron.
//   1. Tap the spikes: one tap starts listening; the neuron fires at random (about 1 per second,
//      flash + click); the student taps on each flash. Each wait between two spikes is a dot.
//   2. The curve: exponential fit, peak at 0 → median → mean, halving lines (½ ¼ ⅛).
//   3. Is it due?: after 1.5 s of silence, is a spike more likely? Bet, then bars from a simulation
//      and a slider: the chance never changes (memoryless; the gambler's fallacy).

const NEXT_DELAY = 400 // ms after the catch window of the last spike before the big button moves on

// The neuron drawing: dendrites (left), cell body, axon (right). A pulse runs down the axon on
// each spike (the group is re-mounted with a new key, which restarts the CSS animation).
function NeuronArt({ spike }) {
  return (
    <svg className="nr-art" viewBox="0 0 160 90" aria-hidden="true">
      <g className="nr-dendrites">
        <path d="M52 45 L28 22 L14 14 M28 22 L22 6" />
        <path d="M50 40 L20 40 L6 34 M20 40 L8 50" />
        <path d="M52 52 L30 70 L16 82 M30 70 L34 86" />
      </g>
      <path className="nr-axon" d="M74 45 H140 M140 45 L152 34 M140 45 L154 45 M140 45 L152 56" />
      <g key={spike} className={spike ? 'nr-fire' : ''}>
        <circle className="nr-soma" cx="60" cy="45" r="15" />
        {spike > 0 && <circle className="nr-pulse" cx="76" cy="45" r="4.5" />}
      </g>
    </svg>
  )
}

export default function Neuron() {
  const tx = useText(EXP)
  const tc = useText(COMMON)
  const [step, setStep] = useState(0)
  const [gaps, setGaps] = useState([]) // { id, v }: wait in seconds
  const [phase, setPhase] = useState('ready') // ready | run | paused | done
  const [spike, setSpike] = useState(0) // spike counter (also the key of the flash)
  const [caught, setCaught] = useState(0)
  const [falseAlarms, setFalseAlarms] = useState(0)
  const [sound, setSound] = useState(true)
  const [bet, setBet] = useState(null) // 'more' | 'same' | 'less'
  const [quiet, setQuiet] = useState(BET_QUIET)

  const timer = useRef(null)
  const pending = useRef(0) // the wait (s) until the spike that is scheduled
  const hadSpike = useRef(false) // a spike already happened in this run (so the next one ends a wait)
  const spikes = useRef([]) // { t, caught } for catching taps
  const count = useRef(0) // waits collected (also read inside timers)
  const doneAt = useRef(0) // when the last spike ended the game
  const audio = useRef(null)
  const soundRef = useRef(sound)
  soundRef.current = sound
  const padRef = useRef(null)

  const n = gaps.length
  const vals = gaps.map((g) => g.v)
  const fit = expFit(vals)

  useEffect(
    () => () => {
      clearTimeout(timer.current)
      audio.current?.close?.()
    },
    [],
  )

  // ---------- Sound: a short click (noise burst) per spike ----------
  function ensureAudio() {
    if (!audio.current) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (AC) audio.current = new AC()
    }
    audio.current?.resume?.()
  }
  function click() {
    const ctx = audio.current
    if (!ctx || !soundRef.current) return
    const len = Math.floor(ctx.sampleRate * 0.025)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len / 7))
    const src = ctx.createBufferSource()
    src.buffer = buf
    const gain = ctx.createGain()
    gain.gain.value = 0.4
    src.connect(gain).connect(ctx.destination)
    src.start()
  }

  // ---------- The neuron ----------
  function schedule() {
    clearTimeout(timer.current)
    pending.current = randomGap()
    timer.current = setTimeout(fire, pending.current * 1000)
  }

  function fire() {
    spikes.current.push({ t: performance.now(), caught: false })
    setSpike((s) => s + 1)
    click()
    if (hadSpike.current) {
      const v = pending.current
      const id = count.current++
      setGaps((gs) => [...gs, { id, v }])
      if (count.current >= GAPS) {
        doneAt.current = performance.now()
        setPhase('done')
        return
      }
    }
    hadSpike.current = true
    schedule()
  }

  function start() {
    ensureAudio()
    hadSpike.current = false // a new run: the time since the pause is not a wait between two spikes
    setPhase('run')
    schedule()
  }

  function pause() {
    clearTimeout(timer.current)
    setPhase('paused')
  }

  function tap(ts) {
    if (step !== 0) return
    if (phase === 'ready' || phase === 'paused') {
      start()
      return
    }
    // The last spike ends the game: a tap on it still catches it; only a later tap moves on.
    if (phase === 'done' && ts - doneAt.current > CATCH_WINDOW + NEXT_DELAY) {
      setStep(1)
      return
    }
    // Catch the most recent spike that is not caught yet and was less than CATCH_WINDOW ago.
    const hit = [...spikes.current].reverse().find((s) => !s.caught && ts >= s.t && ts - s.t <= CATCH_WINDOW)
    if (hit) {
      hit.caught = true
      setCaught((c) => c + 1)
    } else if (phase !== 'done') setFalseAlarms((f) => f + 1)
  }

  // Space works anywhere on the page; leaving the tab pauses the neuron.
  const tapRef = useRef(tap)
  tapRef.current = tap
  const stepRef = useRef(step)
  stepRef.current = step
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  useEffect(() => {
    function onKey(e) {
      if (e.code !== 'Space' || e.repeat || stepRef.current !== 0) return
      const el = e.target
      if (el instanceof HTMLElement && el !== padRef.current && el.closest('button, a, input')) el.blur()
      e.preventDefault()
      tapRef.current(e.timeStamp)
    }
    function onVisibility() {
      if (document.hidden && phaseRef.current === 'run') {
        clearTimeout(timer.current)
        setPhase('paused')
      }
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  function goCurve() {
    if (phase === 'run') pause()
    setStep(1)
  }

  function playAgain() {
    clearTimeout(timer.current)
    setGaps([])
    count.current = 0
    spikes.current = []
    hadSpike.current = false
    setSpike(0)
    setCaught(0)
    setFalseAlarms(0)
    setPhase('ready')
    setBet(null)
    setQuiet(BET_QUIET)
    setStep(0)
  }

  // The "is it due?" answer: many more waits of the same neuron (made once, when needed).
  const sim = useMemo(() => (step === 2 ? simulate() : null), [step])

  const allTopics = (
    <Link to="/" className="btn btn-ghost">
      {tc.allTopics}
    </Link>
  )
  const curveKey = <span className="legend-item ck-line is-a">{tx.curve}</span>

  // ---------- 1. Tap the spikes ----------
  if (step === 0) {
    const locked = n < MIN_GAPS
    let [big, small] = tx.pad[phase === 'done' ? 'run' : phase]
    if (phase === 'done') [big, small] = [tx.padNext, tx.padDone(GAPS)]
    let hint = tx.hintStart
    if (phase === 'done') hint = tx.hintFull(GAPS)
    else if (phase === 'paused') hint = tx.hintPaused
    else if (phase === 'run') hint = n ? tx.hintLeft(GAPS - n, MIN_GAPS - n) : tx.hintRun
    const padState = phase === 'done' ? 'next' : phase === 'run' ? 'run' : phase

    return (
      <Stage
        title={tx.title}
        className="rt-stage nr-stage"
        steps={tx.steps}
        current={0}
        say={
          <p>
            <strong>{tx.sayStrong}</strong> {tx.say}
          </p>
        }
        bar={
          <>
            <div className="legend">
              <span className="legend-item added">{tx.count(n, GAPS)}</span>
              {fit && curveKey}
              {spike > 0 && <span className="nr-score">{tx.score(caught, spike)}</span>}
              {falseAlarms > 0 && <span className="rt-removed">{tx.falseAlarms(falseAlarms)}</span>}
            </div>
            <div className="tools">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                aria-pressed={sound}
                onClick={() => setSound((s) => !s)}
              >
                {sound ? tx.soundOn : tx.soundOff}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={phase !== 'run'} onClick={pause}>
                {tx.pause}
              </button>
            </div>
          </>
        }
        foot={
          <>
            <p className="ck-flash" aria-live="polite">
              {hint}
            </p>
            <div className="actions">
              {allTopics}
              <button
                type="button"
                className={`btn btn-primary ck-next${phase === 'done' ? ' nd-glow' : ''}`}
                disabled={locked}
                title={locked ? tx.unlocks(MIN_GAPS) : undefined}
                onClick={goCurve}
              >
                {locked ? tx.lockedCurve(MIN_GAPS - n) : tx.nextCurve}
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
              className={`rt-pad nr-pad is-${padState}`}
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
              aria-label={big ? `${big}. ${small}` : tx.neuronLabel}
            >
              {spike > 0 && phase !== 'done' && <span key={spike} className="nr-ring" aria-hidden="true" />}
              {phase !== 'done' && <NeuronArt spike={spike} />}
              <span className="nr-pad-text">
                {big && <span className="rt-pad-big">{big}</span>}
                {small && <small>{small}</small>}
              </span>
            </button>
          </div>
          <ExpChart points={gaps} fit={fit} highlightLast />
        </div>
      </Stage>
    )
  }

  const md = median(vals)
  const mn = mean(vals)

  // ---------- 2. The curve ----------
  if (step === 1) {
    return (
      <Stage
        title={tx.title}
        className="rt-stage nr-stage"
        steps={tx.steps}
        current={1}
        say={
          <p>
            <strong>{tx.curveStrong}</strong> {tx.curveSay}
          </p>
        }
        bar={
          <div className="legend">
            {curveKey}
            <span className="legend-item rt-key is-mode">{tx.keyMode}</span>
            <span className="legend-item median">{tx.keyMedian}</span>
            <span className="legend-item mean">{tx.keyMean}</span>
            <span className="legend-item exp-key">{tx.keyHalving}</span>
          </div>
        }
        foot={
          <>
            <div className="nd-feedback" aria-live="polite">
              <p className="nd-hint">{tx.curveHint(fmtS(md), fmtS(mn), num(1 / mn, 1))}</p>
              <p className="nd-fact">{tx.curveFact(fmtS(md), fmtS(2 * md), fmtS(3 * md))}</p>
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                {tx.nextDue}
              </button>
            </div>
          </>
        }
      >
        <div className="rt-main is-full">
          <ExpChart points={gaps} fit={fit} markers={['mode', 'median', 'mean']} halving />
        </div>
      </Stage>
    )
  }

  // ---------- 3. Is it due? ----------
  const w = fmtS(BET_WINDOW, 1)
  const after = sim ? chanceWithin(sim, 0, BET_WINDOW) : NaN
  const afterQuiet = sim ? chanceWithin(sim, quiet, BET_WINDOW) : NaN
  const rows = [
    { label: tx.rowAfterSpike(w), p: after, cls: 'is-ref' },
    { label: tx.rowAfterQuiet(fmtS(quiet, 1), w), p: afterQuiet, cls: 'is-quiet' },
  ]
  return (
    <Stage
      title={tx.title}
      className="rt-stage nr-stage"
      steps={tx.steps}
      current={2}
      say={
        <p>
          <strong>{tx.question(fmtS(BET_QUIET, 1), w)}</strong> {!bet && tx.questionSay}
        </p>
      }
      foot={
        <>
          <div className={`nd-feedback${bet ? ' is-good' : ''}`} aria-live="polite">
            {bet && (
              <>
                <p className="nd-hint">{tx.answer[bet]}</p>
                <p className="nd-fact">{tx.memoryless(SIMULATED.toLocaleString(document.documentElement.lang))}</p>
              </>
            )}
          </div>
          <div className="actions">
            {allTopics}
            {bet && (
              <button type="button" className="btn btn-primary" onClick={playAgain}>
                {tc.playAgain}
              </button>
            )}
          </div>
        </>
      }
    >
      <div className="nr-bet">
        <div className="nr-choices" role="group" aria-label={tx.question(fmtS(BET_QUIET, 1), w)}>
          {['more', 'same', 'less'].map((k) => (
            <button
              key={k}
              type="button"
              className={`btn nr-choice${bet === k ? ' is-picked' : ''}${bet && k === 'same' ? ' is-right' : ''}`}
              aria-pressed={bet === k}
              onClick={() => {
                setBet(k)
                setQuiet(BET_QUIET)
              }}
            >
              {tx.choices[k]}
            </button>
          ))}
        </div>

        {bet && (
          <div className="nr-answer">
            {rows.map((row) => (
              <div key={row.cls} className={`nr-row ${row.cls}`}>
                <span className="nr-row-label">{row.label}</span>
                <span className="nr-bar">
                  <span className="nr-bar-fill" style={{ width: `${(row.p || 0) * 100}%` }} />
                </span>
                <span className="nr-row-value">{Number.isFinite(row.p) ? fmtShare(row.p) : '–'}</span>
              </div>
            ))}
            <label className="nr-slider">
              <span>
                {tx.quietFor} <output>{fmtS(quiet, 1)}</output>
              </span>
              <input
                type="range"
                min={0}
                max={QUIET_MAX}
                step={0.1}
                value={quiet}
                onChange={(e) => setQuiet(Number(e.target.value))}
              />
            </label>
          </div>
        )}
      </div>
    </Stage>
  )
}

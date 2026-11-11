import { useEffect, useRef, useState } from 'react'
import { useText } from '../../i18n.jsx'
import { TIMES, fmtDeg, randomTilts, tiltError } from './sd.js'
import { MEM } from './text.js'

// One round of the memory task. Each trial: a cross (get ready) → `load` tilted lines flash for
// 1 s → 1 s of nothing → one circle comes back and the student turns its line to the tilt they
// remember (drag around it, or ← → keys) and confirms (button or Enter) → the true tilt is shown
// for a moment → next trial, by itself. onAnswer({ error }) gets the error in degrees.
// The parent remounts it (key) for each round; `done` = the round is full.

const SPOTS = {
  1: [[0, 0]],
  4: [
    [-23, -23],
    [23, -23],
    [-23, 23],
    [23, 23],
  ],
}
const R = 13 // radius of an item's circle (viewBox units, the box is 100 × 100)
const HALF = 9.5 // half the length of a line

// A line through (x, y) with tilt t (degrees, anticlockwise from horizontal; the screen's y goes down).
function Bar({ x, y, t, className }) {
  const a = (t * Math.PI) / 180
  const dx = Math.cos(a) * HALF
  const dy = -Math.sin(a) * HALF
  return <line className={className} x1={x - dx} y1={y - dy} x2={x + dx} y2={y + dy} />
}

export default function MemoryTask({ load, done, onAnswer }) {
  const tx = useText(MEM)
  const svgRef = useRef(null)
  const [phase, setPhase] = useState('idle') // idle | fix | sample | delay | probe | feedback
  const [trial, setTrial] = useState(null) // { tilts, probe, start }
  const [answer, setAnswer] = useState(0) // the student's tilt during the probe
  const [last, setLast] = useState(null) // { error } shown in the feedback phase
  const [dragging, setDragging] = useState(false)
  const timer = useRef(null)
  const doneRef = useRef(done)
  doneRef.current = done

  const clear = () => clearTimeout(timer.current)
  useEffect(() => clear, [])

  function after(ms, fn) {
    clear()
    timer.current = setTimeout(fn, ms)
  }

  function startTrial() {
    const tilts = randomTilts(load)
    const t = { tilts, probe: Math.floor(Math.random() * load), id: Date.now() }
    setTrial(t)
    setAnswer(Math.random() * 180) // the dial starts at a random tilt: no default to lean on
    setLast(null)
    setPhase('fix')
    after(TIMES.fix, () => {
      setPhase('sample')
      after(TIMES.sample, () => {
        setPhase('delay')
        after(TIMES.delay, () => setPhase('probe'))
      })
    })
  }

  function confirm() {
    if (phase !== 'probe') return
    const error = tiltError(answer, trial.tilts[trial.probe])
    setLast({ error })
    setPhase('feedback')
    onAnswer({ error })
    after(TIMES.feedback, () => {
      if (doneRef.current) setPhase('idle')
      else startTrial()
    })
  }

  useEffect(() => {
    if (done && phase !== 'feedback') {
      clear()
      setPhase('idle')
    }
  }, [done, phase])

  // Keyboard: ← → turn the line (Shift = bigger steps), Enter confirms.
  const keyRef = useRef(null)
  keyRef.current = (e) => {
    if (phase !== 'probe') return
    if (e.target instanceof HTMLElement && e.target.closest('button, a, input')) {
      if (e.key === 'Enter') return
    }
    const step = e.shiftKey ? 10 : 2
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setAnswer((a) => (a + step) % 180)
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setAnswer((a) => (a - step + 180) % 180)
    else if (e.key === 'Enter') confirm()
    else return
    e.preventDefault()
  }
  useEffect(() => {
    const onKey = (e) => keyRef.current(e)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Dragging anywhere turns the probed line towards the pointer.
  function tiltAt(e) {
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(svg.getScreenCTM().inverse())
    const [cx, cy] = SPOTS[load][trial.probe]
    if (Math.hypot(p.x - cx, p.y - cy) < 2) return
    const deg = (Math.atan2(-(p.y - cy), p.x - cx) * 180) / Math.PI
    setAnswer(((deg % 180) + 180) % 180)
  }
  function onPointerDown(e) {
    if (phase !== 'probe') return
    e.preventDefault()
    svgRef.current.setPointerCapture(e.pointerId)
    setDragging(true)
    tiltAt(e)
  }
  const onPointerMove = (e) => dragging && phase === 'probe' && tiltAt(e)
  const onPointerUp = () => setDragging(false)

  const spots = SPOTS[load]
  const probeSpot = trial ? spots[trial.probe] : null
  let caption = ''
  if (phase === 'fix') caption = tx.capReady
  else if (phase === 'sample') caption = load > 1 ? tx.capRememberAll(load) : tx.capRemember
  else if (phase === 'delay') caption = tx.capHold
  else if (phase === 'probe') caption = load > 1 ? tx.capTurnThis : tx.capTurn
  else if (phase === 'feedback' && last) caption = Math.abs(last.error) < 1 ? tx.capExact : tx.capOff(fmtDeg(Math.abs(last.error)))

  return (
    <div className={`mem-task is-${phase}`} data-tour="task">
      <svg
        ref={svgRef}
        className={`mem-svg${phase === 'probe' ? ' is-probe' : ''}`}
        viewBox="-50 -50 100 100"
        role="img"
        aria-label={caption || tx.taskLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <rect className="mem-bg" x="-50" y="-50" width="100" height="100" rx="8" />
        {phase === 'fix' && <path className="mem-fix" d="M-3,0h6M0,-3v6" />}
        {phase === 'sample' &&
          spots.map(([x, y], i) => (
            <g key={i}>
              <circle className="mem-item" cx={x} cy={y} r={R} />
              <Bar x={x} y={y} t={trial.tilts[i]} className="mem-bar" />
            </g>
          ))}
        {(phase === 'probe' || phase === 'feedback') && (
          <>
            {spots.map(([x, y], i) => (
              <circle key={i} className={`mem-item${i === trial.probe ? ' is-probe' : ' is-empty'}`} cx={x} cy={y} r={R} />
            ))}
            {phase === 'feedback' && <Bar x={probeSpot[0]} y={probeSpot[1]} t={trial.tilts[trial.probe]} className="mem-bar is-truth" />}
            <Bar x={probeSpot[0]} y={probeSpot[1]} t={answer} className="mem-bar is-answer" />
          </>
        )}
      </svg>

      <div className="mem-under">
        {phase === 'idle' ? (
          done ? (
            <p className="mem-caption">{tx.roundDone}</p>
          ) : (
            <button type="button" className="btn btn-primary btn-lg mem-start" onClick={startTrial}>
              {tx.start}
            </button>
          )
        ) : phase === 'probe' ? (
          <>
            <p className="mem-caption">
              <strong>{caption}</strong> <span className="mem-how">{tx.howTurn}</span>
            </p>
            <button type="button" className="btn btn-primary mem-confirm" onClick={confirm} data-tour="confirm">
              {tx.confirm}
            </button>
          </>
        ) : (
          <p className={`mem-caption${phase === 'feedback' ? ' is-feedback' : ''}`} aria-live="polite">
            {caption}
            {phase === 'feedback' && <span className="mem-truth-key">{tx.truthKey}</span>}
          </p>
        )}
      </div>
    </div>
  )
}

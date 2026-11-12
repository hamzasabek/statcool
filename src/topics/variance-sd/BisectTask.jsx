import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useText } from '../../i18n.jsx'
import { GAP, bisectError, randomLine } from './bisect.js'
import { BIS } from './bisectText.js'

// The line-bisection task. Each trial: a horizontal line (new length, left end and height each
// time); the student presses on it where they think its middle is, can slide before letting go, and
// the release is the answer. Keyboard: ← → bring a mark and move it (Shift = bigger steps), Enter
// answers. No feedback: a short blank, then the next line. onAnswer({ error }) gets the error in %
// of the line's length (− = left). `done` = the round is full.

export default function BisectTask({ done, onAnswer }) {
  const tx = useText(BIS)
  const wrapRef = useRef(null)
  const [{ w, h }, setSize] = useState({ w: 600, h: 260 })
  const [phase, setPhase] = useState('idle') // idle | line | gap
  const [line, setLine] = useState(null)
  const [mark, setMark] = useState(null) // share of the width, while pressing or with the keyboard
  const pressing = useRef(false)
  const timer = useRef(null)
  const doneRef = useRef(done)
  doneRef.current = done

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ w: el.clientWidth, h: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (done && phase === 'line') {
      setPhase('idle')
      setLine(null)
    }
  }, [done, phase])

  function next() {
    setLine(randomLine())
    setMark(null)
    setPhase('line')
  }
  function answer(x) {
    if (phase !== 'line') return
    onAnswer({ error: bisectError(x, line) })
    setMark(null)
    setLine(null)
    setPhase('gap')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => (doneRef.current ? setPhase('idle') : next()), GAP)
  }

  const clampX = (x) => Math.min(line.x2, Math.max(line.x1, x))
  const shareAt = (e) => {
    const box = wrapRef.current.getBoundingClientRect()
    return clampX((e.clientX - box.left) / box.width)
  }
  function onPointerDown(e) {
    if (phase !== 'line') return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    pressing.current = true
    setMark(shareAt(e))
  }
  function onPointerMove(e) {
    if (pressing.current && phase === 'line') setMark(shareAt(e))
  }
  function onPointerUp(e) {
    if (!pressing.current) return
    pressing.current = false
    if (phase === 'line') answer(shareAt(e))
  }

  // Keyboard: the first ← or → puts a mark at a random place on the line (not the middle).
  const keyRef = useRef(null)
  keyRef.current = (e) => {
    if (phase !== 'line') return
    if (e.target instanceof HTMLElement && e.target.closest('button, a, input')) return
    const step = (e.shiftKey ? 0.02 : 0.002) * (e.key === 'ArrowLeft' ? -1 : 1)
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      setMark((m) => (m == null ? line.x1 + (0.15 + Math.random() * 0.7) * (line.x2 - line.x1) : clampX(m + step)))
    } else if (e.key === 'Enter' && mark != null) answer(mark)
    else return
    e.preventDefault()
  }
  useEffect(() => {
    const onKey = (e) => keyRef.current(e)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="bis-task" data-tour="task">
      <div
        ref={wrapRef}
        className={`bis-pad${phase === 'line' ? ' is-live' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pressing.current = false
          setMark(null)
        }}
      >
        <svg width={w} height={h} role="img" aria-label={phase === 'line' ? tx.lineAria : tx.taskLabel}>
          {line && <line className="bis-line" x1={line.x1 * w} x2={line.x2 * w} y1={line.y * h} y2={line.y * h} />}
          {line && mark != null && <line className="bis-mark" x1={mark * w} x2={mark * w} y1={line.y * h - 16} y2={line.y * h + 16} />}
        </svg>
        {phase === 'idle' && (
          <div className="bis-over">
            {done ? (
              <p className="mem-caption">{tx.roundDone}</p>
            ) : (
              <button type="button" className="btn btn-primary btn-lg" onClick={next}>
                {tx.start}
              </button>
            )}
          </div>
        )}
      </div>
      <p className="bis-caption" aria-live="polite">
        {phase === 'line' ? (
          <>
            <strong>{tx.capTap}</strong> <span className="mem-how">{tx.howTap}</span>
          </>
        ) : phase === 'gap' ? (
          tx.capNext
        ) : (
          ''
        )}
      </p>
    </div>
  )
}

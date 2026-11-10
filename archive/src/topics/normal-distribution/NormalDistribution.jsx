import { useEffect, useReducer, useState } from 'react'
import DrawChart from '../../components/distribution/DrawChart.jsx'
import { Stage } from '../../components/Stage.jsx'
import ClockGame from './ClockGame.jsx'
import { EXAMPLES, exampleById, fmtValue } from './examples.js'
import { MIN_DOTS, normalFeedback } from './feedback.js'

// ---------- Dots + undo history (one undo step per gesture) ----------
const INITIAL = { dots: [], nextId: 0, history: [] }

function reducer(s, a) {
  switch (a.type) {
    case 'reset':
      return INITIAL
    case 'gestureStart':
      return { ...s, history: [...s.history, s.dots].slice(-200) }
    case 'gestureEnd':
      return a.changed ? s : { ...s, history: s.history.slice(0, -1) }
    case 'add': {
      const added = Array.from({ length: a.count }, (_, i) => ({ id: s.nextId + i, col: a.col }))
      return { ...s, dots: [...s.dots, ...added], nextId: s.nextId + a.count }
    }
    case 'move':
      return { ...s, dots: s.dots.map((d) => (d.id === a.id ? { ...d, col: a.col } : d)) }
    case 'remove':
      return { ...s, dots: s.dots.filter((d) => d.id !== a.id) }
    case 'undo':
      return s.history.length ? { ...s, dots: s.history.at(-1), history: s.history.slice(0, -1) } : s
    case 'clear':
      return s.dots.length ? { ...s, dots: [], history: [...s.history, s.dots] } : s
    default:
      return s
  }
}

const noop = () => {}

function Bell({ width = 72, height = 30 }) {
  const pts = []
  for (let i = 0; i <= 40; i++) {
    const u = i / 40
    pts.push(`${2 + u * (width - 4)},${height - 2 - Math.exp(-0.5 * ((u - 0.5) / 0.16) ** 2) * (height - 6)}`)
  }
  return (
    <svg className="nd-bell" width={width} height={height} aria-hidden="true">
      <polyline points={pts.join(' ')} />
      <line x1={1} x2={width - 1} y1={height - 1.5} y2={height - 1.5} />
    </svg>
  )
}

function Clock({ size = 30 }) {
  return (
    <svg className="nd-clock" width={size} height={size} viewBox="0 0 30 30" aria-hidden="true">
      <circle cx="15" cy="16" r="11.5" />
      <path d="M15 9.5V16l4 2.5M12 2.5h6" />
    </svg>
  )
}

const STEPS = ['Examples', 'Draw', 'Compare']
const CHECK_LABELS = ['One peak', 'Symmetric', 'Centered', 'Spread', 'Bell shape']

export default function NormalDistribution() {
  const [exId, setExId] = useState(null)
  const [{ dots, history }, dispatch] = useReducer(reducer, INITIAL)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState({}) // exId → true when drawn well
  const [game, setGame] = useState(false) // the "inner clock" game is open
  const [gameDone, setGameDone] = useState(false)

  const ex = exampleById(exId)
  const fb = ex ? normalFeedback(dots, ex) : null
  const step = !ex ? 0 : revealed ? 2 : 1

  // Still counts if the student fixes the drawing after comparing.
  const goodAfterReveal = revealed && !!fb?.good
  useEffect(() => {
    if (goodAfterReveal) setDone((d) => (d[exId] ? d : { ...d, [exId]: true }))
  }, [goodAfterReveal, exId])

  function pick(id) {
    setExId(id)
    dispatch({ type: 'reset' })
    setRevealed(false)
  }

  function compare() {
    setRevealed(true)
    if (fb.good) setDone((d) => ({ ...d, [ex.id]: true }))
  }

  const nextEx = ex ? EXAMPLES.find((e) => e.id !== ex.id && !done[e.id]) : null

  const checks = fb?.checks ?? CHECK_LABELS.map((label) => ({ label }))

  if (game) return <ClockGame onExit={() => setGame(false)} onComplete={() => setGameDone(true)} />

  if (!ex) {
    return (
      <Stage
        title="The normal distribution"
        steps={STEPS}
        current={0}
        say={<p>Most people near the middle, fewer towards the extremes. Play the game, or pick an example to draw.</p>}
      >
        <div className="nd-picker">
          <button type="button" className="nd-card nd-game" onClick={() => setGame(true)}>
            <Clock />
            <span className="nd-game-text">
              <span className="nd-card-title">
                Game: your inner clock
                {gameDone && <span className="nd-done" aria-label="played"> ✓</span>}
              </span>
              <span className="nd-card-what">
                Stop a hidden clock at 2 s, then at 5 s. Every press drops a dot: watch your own bell grow.
              </span>
            </span>
            <span className="nd-game-play">Play ▶</span>
          </button>
          <ul className="nd-examples">
            {EXAMPLES.map((e) => (
              <li key={e.id}>
                <button type="button" className="nd-card" onClick={() => pick(e.id)}>
                  <Bell />
                  <span className="nd-card-title">
                    {e.title}
                    {done[e.id] && <span className="nd-done" aria-label="drawn"> ✓</span>}
                  </span>
                  <span className="nd-card-what">{e.what}</span>
                  <span className="nd-card-stat">
                    mean {fmtValue(e, e.mu)} · SD {fmtValue(e, e.sigma)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Stage>
    )
  }

  return (
    <Stage
      title="The normal distribution"
      steps={STEPS}
      current={step}
      say={
        <p>
          <strong>{ex.task}</strong> Each dot is {ex.dot}.
        </p>
      }
      bar={
        <>
          <div className="legend">
            <span className="legend-item added">{dots.length} dots</span>
            <span className="legend-item fit">Your curve</span>
            {revealed && <span className="legend-item real">Real</span>}
          </div>
          <div className="tools">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={!history.length}
              onClick={() => dispatch({ type: 'undo' })}
            >
              Undo
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={!dots.length}
              onClick={() => dispatch({ type: 'clear' })}
            >
              Clear
            </button>
          </div>
        </>
      }
      foot={
        <>
          <div className={`nd-feedback${fb.good ? ' is-good' : ''}`} aria-live="polite">
            <ul className="nd-checks" aria-label="Checklist">
              {checks.map((c) => (
                <li key={c.label} className={c.ok === undefined ? '' : c.ok ? 'is-ok' : 'is-off'}>
                  {c.label}
                </li>
              ))}
            </ul>
            <p className="nd-hint">{fb.hint}</p>
            {revealed && (
              <p className="nd-fact">
                Real data: mean {fmtValue(ex, ex.mu)}, SD {fmtValue(ex, ex.sigma)}. About 2 in 3{' '}
                {ex.who} fall between {fmtValue(ex, ex.mu - ex.sigma)} and {fmtValue(ex, ex.mu + ex.sigma)}.
              </p>
            )}
          </div>
          <div className="actions">
            <button type="button" className="btn btn-ghost" onClick={() => setExId(null)}>
              All examples
            </button>
            {revealed && (
              <button type="button" className="btn" onClick={() => pick(ex.id)}>
                Draw again
              </button>
            )}
            {!revealed ? (
              <button
                type="button"
                className={`btn btn-primary${fb.good ? ' nd-glow' : ''}`}
                disabled={dots.length < MIN_DOTS}
                onClick={compare}
              >
                Compare with real data
              </button>
            ) : (
              nextEx && (
                <button type="button" className="btn btn-primary" onClick={() => pick(nextEx.id)}>
                  Next: {nextEx.title} →
                </button>
              )
            )}
          </div>
        </>
      }
    >
      <DrawChart
        kind={ex}
        dots={dots}
        mode="draw"
        model={null}
        revealed={revealed}
        onGestureStart={() => dispatch({ type: 'gestureStart' })}
        onGestureEnd={(changed) => dispatch({ type: 'gestureEnd', changed })}
        onAdd={(col, count) => dispatch({ type: 'add', col, count })}
        onMove={(id, col) => dispatch({ type: 'move', id, col })}
        onRemove={(id) => dispatch({ type: 'remove', id })}
        onModel={noop}
      />
    </Stage>
  )
}

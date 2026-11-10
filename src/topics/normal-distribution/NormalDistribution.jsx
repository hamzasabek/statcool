import { useEffect, useReducer, useState } from 'react'
import { Link } from 'react-router'
import DrawChart from '../../components/distribution/DrawChart.jsx'
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

const STEPS = ['Examples', 'Draw', 'Compare']
const CHECK_LABELS = ['One peak', 'Symmetric', 'Centered', 'Spread', 'Bell shape']

export default function NormalDistribution() {
  const [exId, setExId] = useState(null)
  const [{ dots, history }, dispatch] = useReducer(reducer, INITIAL)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState({}) // exId → true when drawn well

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

  return (
    <article className="topic nd">
      <Link to="/topics" className="back-link">
        ← All topics
      </Link>
      <h1>The normal distribution</h1>
      <p className="lead">Most people near the middle, fewer and fewer towards the extremes.</p>

      <ol className="dd-steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? 'is-current' : i < step ? 'is-done' : ''}>
            <span className="dd-step-num">{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      {!ex && (
        <>
          <p className="nd-say">These are normally distributed. Pick one to draw.</p>
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
        </>
      )}

      {ex && (
        <section>
          <p className="nd-say">
            <strong>{ex.task}</strong> Each dot is {ex.dot}.
          </p>

          <div className="panel chart-panel">
            <div className="chart-toolbar">
              <div className="legend">
                <span className="legend-item added">{dots.length} dots</span>
                <span className="legend-item fit">Your curve</span>
                {revealed && <span className="legend-item real">Real</span>}
              </div>
              <div className="dd-tools">
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={!history.length}
                  onClick={() => dispatch({ type: 'undo' })}
                >
                  Undo
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={!dots.length}
                  onClick={() => dispatch({ type: 'clear' })}
                >
                  Clear
                </button>
              </div>
            </div>
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
          </div>

          <div className={`nd-feedback${fb.good ? ' is-good' : ''}`} aria-live="polite">
            <ul className="nd-checks" aria-label="Checklist">
              {(fb.checks ?? CHECK_LABELS.map((label) => ({ label }))).map((c) => (
                <li key={c.label} className={c.ok === undefined ? '' : c.ok ? 'is-ok' : 'is-off'}>
                  {c.ok ? '✓ ' : ''}
                  {c.label}
                </li>
              ))}
            </ul>
            <p className="nd-hint">{fb.hint}</p>
          </div>

          {revealed && (
            <p className="nd-fact">
              Real data: mean {fmtValue(ex, ex.mu)}, SD {fmtValue(ex, ex.sigma)}. About
              2 in 3 {ex.who} fall between {fmtValue(ex, ex.mu - ex.sigma)} and{' '}
              {fmtValue(ex, ex.mu + ex.sigma)}.
            </p>
          )}

          <div className="dd-actions">
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
            {revealed && (
              <button type="button" className="btn" onClick={() => pick(ex.id)}>
                Draw again
              </button>
            )}
            <button type="button" className="btn" onClick={() => setExId(null)}>
              All examples
            </button>
          </div>
        </section>
      )}
    </article>
  )
}

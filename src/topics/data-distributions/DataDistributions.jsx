import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import * as d3 from 'd3'
import DrawChart from './DrawChart.jsx'
import { KINDS, SHAPES, SHAPE_ORDER, kindById } from './kinds.js'
import { MIN_DOTS, classify } from './classify.js'

// A small picture of a distribution shape.
function ShapeIcon({ shape, width = 64, height = 30 }) {
  const path = useMemo(() => {
    const pdf = SHAPES[shape].pdf
    const us = d3.range(0, 1.0001, 0.01)
    const fs = us.map(pdf)
    const max = d3.max(fs) || 1
    return d3
      .area()
      .x((_, i) => 2 + us[i] * (width - 4))
      .y0(height - 2)
      .y1((f) => height - 2 - (f / max) * (height - 6))
      .curve(d3.curveMonotoneX)(fs)
  }, [shape, width, height])
  return (
    <svg className="dd-shape-icon" width={width} height={height} aria-hidden="true">
      <path d={path} />
      <line x1={1} x2={width - 1} y1={height - 1.5} y2={height - 1.5} />
    </svg>
  )
}

const STEPS = ['Choose the data', 'Draw it', 'Compare']

function Steps({ current }) {
  return (
    <ol className="dd-steps">
      {STEPS.map((s, i) => (
        <li key={s} className={i === current ? 'is-current' : i < current ? 'is-done' : ''}>
          <span className="dd-step-num">{i + 1}</span>
          {s}
        </li>
      ))}
    </ol>
  )
}

function KindPicker({ results, onPick }) {
  return (
    <ul className="dd-kinds">
      {KINDS.map((k) => {
        const r = results[k.id]
        return (
          <li key={k.id}>
            <button type="button" className="dd-kind" onClick={() => onPick(k.id)}>
              <span className="dd-field">{k.field}</span>
              <span className="dd-kind-title">{k.title}</span>
              <span className="dd-kind-teaser">{k.teaser}</span>
              {r && (
                <span className={`dd-badge ${r.match ? 'is-match' : 'is-miss'}`}>
                  {r.match ? '✓ Shape found' : 'Tried. Try again?'}
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function Result({ kind, guess }) {
  const real = kind.shape
  const match = guess?.shape === real
  return (
    <div className="panel dd-result">
      <div className="dd-compare">
        <div className="dd-compare-col">
          <p className="dd-compare-head">Your drawing looks</p>
          {guess.shape === 'spike' ? (
            <p className="dd-compare-shape">Like a single spike</p>
          ) : (
            <p className="dd-compare-shape">
              <ShapeIcon shape={guess.shape} />
              {SHAPES[guess.shape].label}
            </p>
          )}
          <p className="dd-compare-text">{guess.reason}</p>
        </div>
        <div className="dd-compare-col is-real">
          <p className="dd-compare-head">The real data are usually</p>
          <p className="dd-compare-shape">
            <ShapeIcon shape={real} />
            {SHAPES[real].label}
          </p>
          <p className="dd-compare-text">The green curve on the chart shows this shape, scaled to the number of dots you drew.</p>
        </div>
      </div>

      <p className={`dd-verdict ${match ? 'is-match' : 'is-miss'}`}>
        {match
          ? 'Same shape. Well done!'
          : 'Not quite the same shape. Read why below, then try again.'}
      </p>

      <h3>Why does this data look like this?</h3>
      {kind.why.map((t) => (
        <p key={t}>{t}</p>
      ))}

      <h3>All the shapes</h3>
      <ul className="dd-gallery">
        {SHAPE_ORDER.map((s) => (
          <li
            key={s}
            className={`${s === real ? 'is-real' : ''}${s === guess.shape ? ' is-guess' : ''}`}
          >
            <ShapeIcon shape={s} width={80} height={36} />
            <span>{SHAPES[s].label}</span>
            {(s === real || s === guess.shape) && (
              <span className="dd-gallery-tags">
                {s === guess.shape && <span className="dd-tag is-guess">you</span>}
                {s === real && <span className="dd-tag is-real">real</span>}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function DataDistributions() {
  const [kindId, setKindId] = useState(null)
  const [drawing, setDrawing] = useState([]) // column index of every dot, in the order drawn
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState({}) // kindId → { match }

  const kind = kindById(kindId)
  const guess = kind ? classify(drawing, kind.cols) : null

  function pick(id) {
    setKindId(id)
    setDrawing([])
    setRevealed(false)
    window.scrollTo?.({ top: 0 })
  }

  function reveal() {
    setRevealed(true)
    setResults((r) => ({ ...r, [kind.id]: { match: guess.shape === kind.shape } }))
  }

  function retry() {
    setDrawing([])
    setRevealed(false)
  }

  // The next data kind the student has not found yet (or simply the next one in the list).
  const nextKind = (() => {
    if (!kind) return null
    const i = KINDS.indexOf(kind)
    const after = [...KINDS.slice(i + 1), ...KINDS.slice(0, i)]
    return after.find((k) => !results[k.id]?.match) ?? null
  })()

  const found = KINDS.filter((k) => results[k.id]?.match).length

  return (
    <article className="topic">
      <Link to="/topics" className="back-link">
        ← All topics
      </Link>
      <h1>Data distributions</h1>
      <p className="lead">
        A distribution shows which values a measurement takes and how often. Different kinds of data
        have different shapes. Pick a kind of data from psychology or neuroscience, draw what you
        think it looks like, one dot at a time, and then compare your drawing with the real thing.
      </p>

      <Steps current={!kind ? 0 : revealed ? 2 : 1} />

      {!kind && (
        <>
          <p className="dd-progress">
            Shapes found: <strong>{found}</strong> of {KINDS.length}
          </p>
          <KindPicker results={results} onPick={pick} />
        </>
      )}

      {kind && (
        <section className="dd-task">
          <div className="dd-task-head">
            <span className="dd-field">{kind.field}</span>
            <h2>{kind.title}</h2>
            <p>{kind.task}</p>
            <p className="dd-task-how">
              <strong>Click</strong> on the chart to drop a dot. Each dot is {kind.dot}. Place at
              least {MIN_DOTS} dots, ideally 30 or more, so the shape becomes clear.
            </p>
          </div>

          <div className="panel chart-panel">
            <div className="chart-toolbar">
              <p className="dd-live" aria-live="polite">
                <strong>{drawing.length}</strong> dot{drawing.length === 1 ? '' : 's'}
                {!revealed && (
                  <>
                    {' · '}
                    {guess ? (
                      <>
                        so far it looks{' '}
                        <strong>
                          {guess.shape === 'spike' ? 'like a single spike' : SHAPES[guess.shape].label.toLowerCase()}
                        </strong>
                      </>
                    ) : (
                      `${MIN_DOTS - drawing.length} more to go`
                    )}
                  </>
                )}
              </p>
              {!revealed && (
                <div className="dd-tools">
                  <button
                    type="button"
                    className="btn btn-sm"
                    disabled={!drawing.length}
                    onClick={() => setDrawing((d) => d.slice(0, -1))}
                  >
                    Undo
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    disabled={!drawing.length}
                    onClick={() => setDrawing([])}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            <DrawChart
              kind={kind}
              dots={drawing}
              revealed={revealed}
              onAdd={(c) => setDrawing((d) => [...d, c])}
            />
            {revealed && (
              <div className="legend dd-legend">
                <span className="legend-item added">Your drawing</span>
                <span className="legend-item real">Real distribution</span>
              </div>
            )}
          </div>

          {!revealed && (
            <div className="dd-actions">
              <button type="button" className="btn btn-primary" disabled={!guess} onClick={reveal}>
                I&apos;m done, show me the real shape
              </button>
              <button type="button" className="btn" onClick={() => setKindId(null)}>
                Choose other data
              </button>
            </div>
          )}

          {revealed && guess && (
            <>
              <Result kind={kind} guess={guess} />
              <div className="dd-actions">
                {nextKind && (
                  <button type="button" className="btn btn-primary" onClick={() => pick(nextKind.id)}>
                    Next: {nextKind.title} →
                  </button>
                )}
                <button type="button" className="btn" onClick={retry}>
                  Draw this one again
                </button>
                <button type="button" className="btn" onClick={() => setKindId(null)}>
                  All data types
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </article>
  )
}

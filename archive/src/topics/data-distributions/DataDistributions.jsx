import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import * as d3 from 'd3'
import DrawChart from '../../components/distribution/DrawChart.jsx'
import { Stage } from '../../components/Stage.jsx'
import { KINDS, SHAPES, kindById } from './kinds.js'
import { MIN_DOTS, classify } from './classify.js'
import {
  MIN_FIT_DOTS,
  addHill,
  colWidthOf,
  fitModel,
  rankIds,
  remap,
  removeHill,
  setShare,
} from '../../components/distribution/model.js'

// ---------- Drawing state: dots, the reshapeable model, and undo history ----------
// One undo step per gesture (a brush stroke, a dot drag, a handle drag, a slider drag).
const INITIAL = { dots: [], nextId: 0, model: null, ranks: null, history: [] }

function reducer(s, a) {
  const pushHistory = () => [...s.history, { dots: s.dots, model: s.model }].slice(-200)
  switch (a.type) {
    case 'reset':
      return INITIAL
    case 'gestureStart':
      // Ranks are frozen for the whole gesture, so dots keep their order while the curve changes.
      return { ...s, history: pushHistory(), ranks: rankIds(s.dots) }
    case 'gestureEnd':
      return { ...s, ranks: null, history: a.changed ? s.history : s.history.slice(0, -1) }
    case 'add': {
      const added = Array.from({ length: a.count }, (_, i) => ({ id: s.nextId + i, col: a.col }))
      return { ...s, dots: [...s.dots, ...added], nextId: s.nextId + a.count }
    }
    case 'move':
      return { ...s, dots: s.dots.map((d) => (d.id === a.id ? { ...d, col: a.col } : d)) }
    case 'remove':
      return { ...s, dots: s.dots.filter((d) => d.id !== a.id) }
    case 'setModel': {
      if (!a.remap) return { ...s, model: a.model }
      const ranks = s.ranks ?? rankIds(s.dots)
      return { ...s, model: a.model, dots: remap(s.dots, ranks, a.model, a.kind) }
    }
    case 'undo': {
      const last = s.history.at(-1)
      return last ? { ...s, dots: last.dots, model: last.model, history: s.history.slice(0, -1) } : s
    }
    case 'clear':
      return s.dots.length ? { ...s, dots: [], model: null, history: pushHistory() } : s
    default:
      return s
  }
}

// ---------- Small pieces ----------
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

const STEPS = ['Choose', 'Draw', 'Compare']

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
                  {r.match ? '✓ Shape found' : 'Try again?'}
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

const PencilIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M11.5 2.5l2 2L6 12l-3 1 1-3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
)
const CurveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M1 13C4 13 5 3 8 3s4 10 7 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <rect x="6.3" y="1.3" width="3.4" height="3.4" transform="rotate(45 8 3)" fill="currentColor" />
  </svg>
)

// Compact result, shown next to the chart after "Compare".
function Result({ kind, guess }) {
  const [page, setPage] = useState(0)
  if (!guess) {
    return (
      <aside className="dd-result">
        <p className="dd-compare-text">Add at least {MIN_DOTS} dots to compare.</p>
      </aside>
    )
  }
  const real = kind.shape
  const match = guess.shape === real
  return (
    <aside className="dd-result" aria-live="polite">
      <p className={`dd-verdict ${match ? 'is-match' : 'is-miss'}`}>
        {match ? 'Same shape. Well done!' : 'Not the same shape yet.'}
      </p>
      <div className="dd-compare">
        <div className="dd-compare-row is-guess">
          <span className="dd-compare-head">You drew</span>
          <span className="dd-compare-shape">
            {guess.shape === 'spike' ? (
              'A single spike'
            ) : (
              <>
                <ShapeIcon shape={guess.shape} width={44} height={22} />
                {SHAPES[guess.shape].label}
              </>
            )}
          </span>
        </div>
        <div className="dd-compare-row is-real">
          <span className="dd-compare-head">Real data</span>
          <span className="dd-compare-shape">
            <ShapeIcon shape={real} width={44} height={22} />
            {SHAPES[real].label}
          </span>
        </div>
      </div>
      <p className="dd-compare-text">
        {match ? guess.reason : 'Reshape your curve or move your dots towards the real curve.'}
      </p>
      <div className="dd-why">
        <h3>Why?</h3>
        <p>{kind.why[page]}</p>
        <div className="dd-pager">
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            aria-label="Previous reason"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹
          </button>
          <span>
            {page + 1} / {kind.why.length}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            aria-label="Next reason"
            disabled={page === kind.why.length - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </button>
        </div>
      </div>
    </aside>
  )
}

// ---------- Page ----------
export default function DataDistributions() {
  const [kindId, setKindId] = useState(null)
  const [{ dots, model, history }, dispatch] = useReducer(reducer, INITIAL)
  const [mode, setMode] = useState('draw') // 'draw' | 'shape'
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState({}) // kindId → { match }
  const sliderActive = useRef(false)

  const kind = kindById(kindId)
  const cols = useMemo(() => dots.map((d) => d.col), [dots])
  const guess = kind ? classify(cols, kind.cols) : null
  const canShape = dots.length >= MIN_FIT_DOTS

  const fitNow = () =>
    fitModel(
      dots.map((d) => kind.domain[0] + (d.col + 0.5) * colWidthOf(kind)),
      kind,
    )

  // Reshape mode needs a model; it goes back to drawing if undo leaves too few dots.
  useEffect(() => {
    if (!kind || mode !== 'shape') return
    if (!canShape) setMode('draw')
    else if (!model) dispatch({ type: 'setModel', model: fitNow(), remap: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, mode, model, canShape])

  // After the reveal, the student can keep adjusting until the shapes match.
  const matchNow = revealed && !!kind && !!guess && guess.shape === kind.shape
  useEffect(() => {
    if (matchNow) setResults((r) => (r[kind.id]?.match ? r : { ...r, [kind.id]: { match: true } }))
  }, [matchNow, kind])

  function pick(id) {
    setKindId(id)
    dispatch({ type: 'reset' })
    setMode('draw')
    setRevealed(false)
  }

  function backToPicker() {
    setKindId(null)
    dispatch({ type: 'reset' })
    setMode('draw')
    setRevealed(false)
  }

  function switchMode(next) {
    if (next === mode) return
    if (next === 'shape') dispatch({ type: 'setModel', model: fitNow(), remap: false })
    else dispatch({ type: 'setModel', model: null, remap: false })
    setMode(next)
  }

  function reveal() {
    setRevealed(true)
    setResults((r) => ({ ...r, [kind.id]: { match: r[kind.id]?.match || guess.shape === kind.shape } }))
  }

  function retry() {
    dispatch({ type: 'reset' })
    setMode('draw')
    setRevealed(false)
  }

  // A one-step model change (button, keyboard) = one undo step.
  function changeModel(next) {
    dispatch({ type: 'gestureStart' })
    dispatch({ type: 'setModel', model: next, remap: true, kind })
    dispatch({ type: 'gestureEnd', changed: true })
  }

  function onShareChange(value) {
    const next = setShare(model, value)
    if (sliderActive.current) dispatch({ type: 'setModel', model: next, remap: true, kind })
    else changeModel(next)
  }

  const nextKind = (() => {
    if (!kind) return null
    const i = KINDS.indexOf(kind)
    const after = [...KINDS.slice(i + 1), ...KINDS.slice(0, i)]
    return after.find((k) => !results[k.id]?.match) ?? null
  })()
  const found = KINDS.filter((k) => results[k.id]?.match).length

  if (!kind) {
    return (
      <Stage
        title="Shapes of distributions"
        steps={STEPS}
        current={0}
        say={
          <p>
            Not everything is a bell. Pick some data, draw it, then compare.{' '}
            <span className="muted">
              Found {found} of {KINDS.length}
            </span>
          </p>
        }
      >
        <KindPicker results={results} onPick={pick} />
      </Stage>
    )
  }

  const liveShape = guess
    ? guess.shape === 'spike'
      ? 'like a single spike'
      : SHAPES[guess.shape].label.toLowerCase()
    : null

  const chart = (
    <DrawChart
      kind={kind}
      dots={dots}
      mode={mode}
      model={model}
      revealed={revealed}
      onGestureStart={() => dispatch({ type: 'gestureStart' })}
      onGestureEnd={(changed) => dispatch({ type: 'gestureEnd', changed })}
      onAdd={(col, count) => dispatch({ type: 'add', col, count })}
      onMove={(id, col) => dispatch({ type: 'move', id, col })}
      onRemove={(id) => dispatch({ type: 'remove', id })}
      onModel={(m) => dispatch({ type: 'setModel', model: m, remap: true, kind })}
    />
  )

  const how =
    mode === 'draw'
      ? `Click or drag to draw, drag a dot to move it, drop it below the axis to remove it. Each dot is ${kind.dot}.`
      : 'Drag ◆ to move a hill or make it taller, drag ● to stretch a side. Your dots follow.'

  return (
    <Stage
      title="Shapes of distributions"
      steps={STEPS}
      current={revealed ? 2 : 1}
      flowOnNarrow={revealed}
      say={
        <p>
          <strong>{kind.task}</strong> <span className="muted">{how}</span>
        </p>
      }
      bar={
        <>
          <div className="segmented dd-mode" role="group" aria-label="Interaction mode">
            <button
              type="button"
              className={mode === 'draw' ? 'is-active' : ''}
              aria-pressed={mode === 'draw'}
              onClick={() => switchMode('draw')}
            >
              <PencilIcon /> Draw
            </button>
            <button
              type="button"
              className={mode === 'shape' ? 'is-active' : ''}
              aria-pressed={mode === 'shape'}
              disabled={!canShape}
              title={canShape ? undefined : `Place at least ${MIN_FIT_DOTS} dots first`}
              onClick={() => switchMode('shape')}
            >
              <CurveIcon /> Reshape
            </button>
          </div>
          {mode === 'shape' && model && (
            <div className="dd-shape-tools">
              {model.length === 1 ? (
                <button type="button" className="btn btn-sm" onClick={() => changeModel(addHill(model, kind))}>
                  + Second hill
                </button>
              ) : (
                <>
                  <button type="button" className="btn btn-sm" onClick={() => changeModel(removeHill(model))}>
                    − Second hill
                  </button>
                  <label className="dd-share">
                    <span>Left hill</span>
                    <input
                      type="range"
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      value={model[0].w}
                      onPointerDown={() => {
                        sliderActive.current = true
                        dispatch({ type: 'gestureStart' })
                      }}
                      onPointerUp={() => {
                        sliderActive.current = false
                        dispatch({ type: 'gestureEnd', changed: true })
                      }}
                      onChange={(e) => onShareChange(Number(e.target.value))}
                    />
                    <output>{Math.round(model[0].w * 100)}%</output>
                  </label>
                </>
              )}
            </div>
          )}
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
              onClick={() => {
                dispatch({ type: 'clear' })
                setMode('draw')
              }}
            >
              Clear
            </button>
          </div>
        </>
      }
      foot={
        <>
          <div className="dd-status">
            <p className="dd-live" aria-live="polite">
              <strong>{dots.length}</strong> dot{dots.length === 1 ? '' : 's'}
              {' · '}
              {liveShape ? (
                <>
                  looks <strong>{liveShape}</strong>
                </>
              ) : (
                `${MIN_DOTS - dots.length} more to go`
              )}
            </p>
            <div className="legend">
              <span className="legend-item added">Your dots</span>
              <span className="legend-item fit">Your curve</span>
              {revealed && <span className="legend-item real">Real</span>}
            </div>
          </div>
          <div className="actions">
            <button type="button" className="btn btn-ghost" onClick={backToPicker}>
              All data
            </button>
            {revealed && (
              <button type="button" className="btn" onClick={retry}>
                Start again
              </button>
            )}
            {!revealed ? (
              <button type="button" className="btn btn-primary" disabled={!guess} onClick={reveal}>
                Compare with real data
              </button>
            ) : (
              nextKind && (
                <button type="button" className="btn btn-primary" onClick={() => pick(nextKind.id)}>
                  Next: {nextKind.title} →
                </button>
              )
            )}
          </div>
        </>
      }
    >
      {revealed ? (
        <div className="dd-split">
          <div className="dd-split-chart">{chart}</div>
          <Result key={kind.id} kind={kind} guess={guess} />
        </div>
      ) : (
        chart
      )}
    </Stage>
  )
}

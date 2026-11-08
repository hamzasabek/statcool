import { useMemo, useReducer, useState } from 'react'
import { Link } from 'react-router'
import Histogram from './Histogram.jsx'
import Tex from '../../components/Tex.jsx'
import { MAX_N, MAX_VALUE, MIN_VALUE, generate, makeDraws } from './data.js'
import { describe, fmt } from './stats.js'

const DEFAULTS = {
  shape: 'bell',
  n: 200,
  center: 60,
  spread: 12,
  skew: 0,
  separation: 36,
  balance: 0.5,
  binWidth: 2,
}

const SHAPES = [
  { id: 'bell', label: 'Bell' },
  { id: 'uniform', label: 'Flat' },
  { id: 'bimodal', label: 'Two peaks' },
]

// ---------- Student edits (added / removed students) with undo history ----------
const EMPTY_EDITS = { added: [], removed: [] }
const INITIAL = { edits: EMPTY_EDITS, history: [] }

function editsReducer(state, action) {
  const { edits, history } = state
  const commit = (next) => ({ edits: next, history: [...history, edits].slice(-200) })
  switch (action.type) {
    case 'add':
      return commit({ ...edits, added: [...edits.added, action.value] })
    case 'deleteAdded':
      return commit({ ...edits, added: edits.added.filter((_, i) => i !== action.index) })
    case 'deleteValue': {
      // Prefer removing one of the user's own students with that score.
      const i = edits.added.lastIndexOf(action.value)
      if (i >= 0) return commit({ ...edits, added: edits.added.filter((_, j) => j !== i) })
      return commit({ ...edits, removed: [...edits.removed, action.value] })
    }
    case 'dragStart':
      return commit(edits) // snapshot, so one drag = one undo step
    case 'dragMove':
      return {
        ...state,
        edits: { ...edits, added: edits.added.map((v, i) => (i === action.index ? action.value : v)) },
      }
    case 'dragEnd':
      // A click on a dot without moving it shouldn't leave an empty undo step.
      return action.moved ? state : { ...state, history: history.slice(0, -1) }
    case 'undo':
      return history.length ? { edits: history.at(-1), history: history.slice(0, -1) } : state
    case 'clear':
      return edits.added.length || edits.removed.length ? commit(EMPTY_EDITS) : state
    case 'reset':
      return INITIAL
    default:
      return state
  }
}

// Remove one generated student per value in `removed` (values that no longer exist are ignored).
function applyRemovals(base, removed) {
  if (!removed.length) return base
  const left = new Map()
  for (const v of removed) left.set(v, (left.get(v) ?? 0) + 1)
  return base.filter((v) => {
    const c = left.get(v)
    if (!c) return true
    left.set(v, c - 1)
    return false
  })
}

// ---------- UI helpers ----------
function Slider({ label, value, min, max, step = 1, onChange, display, hint }) {
  return (
    <label className="control">
      <span className="control-head">
        <span>{label}</span>
        <output>{display ?? value}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <span className="control-hint">{hint}</span>}
    </label>
  )
}

const texNum = (v) => v.toLocaleString('en-US').replace(/,/g, '{,}')
const texFix = (v, d) => (Number.isFinite(v) ? v.toFixed(d) : '?')

function meanTex(s) {
  return {
    general: String.raw`\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i`,
    live: s.n ? String.raw`\bar{x} = \frac{${texNum(s.sum)}}{${s.n}} = ${texFix(s.mean, 2)}` : null,
  }
}

function medianTex(s) {
  if (s.middle.length === 1) {
    const [m] = s.middle
    return {
      general: String.raw`\tilde{x} = x_{\left(\frac{n+1}{2}\right)}`,
      live: String.raw`\tilde{x} = x_{(${m.pos})} = ${m.value}`,
    }
  }
  if (s.middle.length === 2) {
    const [a, b] = s.middle
    return {
      general: String.raw`\tilde{x} = \frac{x_{(n/2)} + x_{(n/2+1)}}{2}`,
      live: String.raw`\tilde{x} = \frac{x_{(${a.pos})} + x_{(${b.pos})}}{2} = \frac{${a.value} + ${b.value}}{2} = ${texFix(s.median, 1)}`,
    }
  }
  return { general: String.raw`\tilde{x} = \text{middle of the sorted data}`, live: null }
}

function modeTex(s) {
  const general = String.raw`\text{Mo} = \underset{v}{\operatorname{arg\,max}}\; f(v)`
  if (!s.n) return { general, live: null }
  if (!s.modes.length) return { general, live: String.raw`f(v) = 1 \text{ for every } v` }
  const shown = s.modes.slice(0, 3).map((m) => `f(${m})`)
  if (s.modes.length > 3) shown.push(String.raw`\dots`)
  return { general, live: `${shown.join(' = ')} = ${s.modeCount}` }
}

function insight(stats, params) {
  if (!stats.n) return ['There are no students left. Add some by clicking the chart.']
  const lines = []
  const diff = stats.mean - stats.median
  const tol = Math.max(0.5, 0.04 * stats.sd)

  if (Math.abs(diff) <= tol) {
    lines.push(
      'The mean and median are almost equal. That happens when the data are roughly symmetric: the values above the center balance the values below it.',
    )
  } else if (diff > 0) {
    lines.push(
      `The mean is ${fmt(diff)} points above the median. A long tail of high scores (or a high outlier) pulls the mean up, while the median barely moves. This shape is called right-skewed.`,
    )
  } else {
    lines.push(
      `The mean is ${fmt(-diff)} points below the median. A long tail of low scores (or a low outlier) pulls the mean down, while the median barely moves. This shape is called left-skewed.`,
    )
  }

  if (params.shape === 'bimodal' && params.separation >= 4 * params.spread) {
    lines.push(
      'With two clear peaks, the mean and median can land in the valley between them, where few students actually scored. Neither one describes a "typical" student well here.',
    )
  }
  if (stats.modes.length > 1) {
    lines.push(
      `There is a tie for the most frequent score (${stats.modes.join(', ')}), so the data have ${stats.modes.length} modes. With small samples the mode jumps around a lot. Try a bigger class.`,
    )
  } else if (stats.modes.length === 0) {
    lines.push('Every score appears only once, so there is no mode.')
  }
  return lines
}

function StatCard({ kind, title, value, tex, children }) {
  return (
    <div className={`stat-card ${kind}`}>
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
      <Tex className="formula" math={tex.general} display />
      {tex.live && <Tex className="formula formula-live" math={tex.live} display />}
      <p className="stat-explain">{children}</p>
    </div>
  )
}

// ---------- Page ----------
export default function MeanMedianMode() {
  const [params, setParams] = useState(DEFAULTS)
  const [seed, setSeed] = useState(42)
  const [{ edits, history }, dispatch] = useReducer(editsReducer, INITIAL)
  const [deleteMode, setDeleteMode] = useState(false)

  const set = (key) => (value) => setParams((p) => ({ ...p, [key]: value }))

  const draws = useMemo(() => makeDraws(seed), [seed])
  const base = useMemo(() => generate(draws, params), [draws, params])
  const values = useMemo(
    () => applyRemovals(base, edits.removed).concat(edits.added),
    [base, edits],
  )
  const stats = useMemo(() => describe(values), [values])
  const notes = insight(stats, params)
  const removedCount = base.length + edits.added.length - values.length

  const addPoint = (value) => dispatch({ type: 'add', value })

  return (
    <article className="topic">
      <Link to="/topics" className="back-link">
        ← All topics
      </Link>
      <h1>Mean, median &amp; mode</h1>
      <p className="lead">
        Imagine the exam scores (0–100) of a group of students. Change the shape of the scores, add or
        remove students, and watch how the three measures of the center react in real time.{' '}
        <strong>Click the chart</strong> to add a student, <strong>drag</strong> your students to move
        them, and switch on <strong>delete mode</strong> to remove students.
      </p>

      <div className="mmm-layout">
        <div className="mmm-main">
          <div className={`panel chart-panel${deleteMode ? ' is-deleting' : ''}`}>
            <div className="chart-toolbar">
              <div className="legend">
                <span className="legend-item mean">Mean</span>
                <span className="legend-item median">Median</span>
                <span className="legend-item mode">Mode</span>
                <span className="legend-item added">Your students (drag me)</span>
              </div>
              <button
                type="button"
                className={`btn btn-sm${deleteMode ? ' btn-danger' : ''}`}
                aria-pressed={deleteMode}
                onClick={() => setDeleteMode((d) => !d)}
              >
                {deleteMode ? 'Delete mode: on' : 'Delete mode'}
              </button>
            </div>
            <Histogram
              values={values}
              addedPoints={edits.added}
              binWidth={params.binWidth}
              stats={stats}
              deleteMode={deleteMode}
              onAddPoint={addPoint}
              onDeleteValue={(value) => dispatch({ type: 'deleteValue', value })}
              onDeleteAdded={(index) => dispatch({ type: 'deleteAdded', index })}
              onDragStart={() => dispatch({ type: 'dragStart' })}
              onDragMove={(index, value) => dispatch({ type: 'dragMove', index, value })}
              onDragEnd={(moved) => dispatch({ type: 'dragEnd', moved })}
            />
            <p className="axis-title">
              {deleteMode
                ? 'Delete mode: click a bar to remove one student, or click one of your dots'
                : 'Exam score · bar height = number of students'}
            </p>
          </div>

          <div className="stat-cards">
            <StatCard kind="mean" title="Mean" value={fmt(stats.mean)} tex={meanTex(stats)}>
              Add up every score and divide by the number of students.
            </StatCard>
            <StatCard kind="median" title="Median" value={fmt(stats.median)} tex={medianTex(stats)}>
              Sort the scores and take the middle one. <Tex math="x_{(k)}" /> is the k-th smallest
              score{stats.n % 2 === 0 && stats.n > 0 ? '. With an even n, average the two middle ones.' : '.'}
            </StatCard>
            <StatCard
              kind="mode"
              title="Mode"
              value={stats.modes.length ? stats.modes.join(', ') : 'none'}
              tex={modeTex(stats)}
            >
              The most frequent score. <Tex math="f(v)" /> is how many students scored{' '}
              <Tex math="v" />.
            </StatCard>
          </div>

          <div className="panel insight">
            <h3>What&apos;s happening?</h3>
            {notes.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </div>

        <aside className="panel controls" aria-label="Dataset controls">
          <h2>Dataset</h2>

          <div className="control">
            <span className="control-head">Shape</span>
            <div className="segmented" role="group" aria-label="Distribution shape">
              {SHAPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={params.shape === s.id ? 'is-active' : ''}
                  aria-pressed={params.shape === s.id}
                  onClick={() => set('shape')(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <Slider
            label="Number of students"
            value={params.n}
            min={5}
            max={MAX_N}
            step={5}
            onChange={set('n')}
          />
          <Slider label="Center" value={params.center} min={10} max={90} onChange={set('center')} />
          <Slider
            label="Spread"
            value={params.spread}
            min={1}
            max={30}
            onChange={set('spread')}
            hint={params.shape === 'bimodal' ? 'Spread of each peak' : 'How far scores scatter'}
          />

          {params.shape === 'bell' && (
            <Slider
              label="Skewness"
              value={params.skew}
              min={-8}
              max={8}
              step={0.5}
              onChange={set('skew')}
              display={
                params.skew === 0 ? 'symmetric' : params.skew > 0 ? `right +${params.skew}` : `left ${params.skew}`
              }
              hint="Stretch a tail to the left or right"
            />
          )}

          {params.shape === 'bimodal' && (
            <>
              <Slider
                label="Distance between peaks"
                value={params.separation}
                min={0}
                max={70}
                onChange={set('separation')}
              />
              <Slider
                label="Students in left peak"
                value={params.balance}
                min={0.1}
                max={0.9}
                step={0.05}
                onChange={set('balance')}
                display={`${Math.round(params.balance * 100)}%`}
              />
            </>
          )}

          <div className="control">
            <span className="control-head">Bar width</span>
            <div className="segmented" role="group" aria-label="Bar width">
              {[1, 2, 5, 10].map((w) => (
                <button
                  key={w}
                  type="button"
                  className={params.binWidth === w ? 'is-active' : ''}
                  aria-pressed={params.binWidth === w}
                  onClick={() => set('binWidth')(w)}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <h2>Your changes</h2>
          <p className="control-hint">
            You added <strong>{edits.added.length}</strong> and removed <strong>{removedCount}</strong>{' '}
            student{removedCount === 1 ? '' : 's'}.
          </p>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => addPoint(MAX_VALUE)}>
              + Outlier {MAX_VALUE}
            </button>
            <button type="button" className="btn" onClick={() => addPoint(MIN_VALUE)}>
              + Outlier {MIN_VALUE}
            </button>
          </div>
          <div className="btn-row">
            <button
              type="button"
              className="btn"
              disabled={!history.length}
              onClick={() => dispatch({ type: 'undo' })}
            >
              Undo
            </button>
            <button
              type="button"
              className="btn"
              disabled={!edits.added.length && !edits.removed.length}
              onClick={() => dispatch({ type: 'clear' })}
            >
              Clear changes
            </button>
          </div>

          <h2>Start over</h2>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => setSeed((s) => s + 1)}>
              New random class
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setParams(DEFAULTS)
                setSeed(42)
                setDeleteMode(false)
                dispatch({ type: 'reset' })
              }}
            >
              Reset all
            </button>
          </div>
        </aside>
      </div>
    </article>
  )
}

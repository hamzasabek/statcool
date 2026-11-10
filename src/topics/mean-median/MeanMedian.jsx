import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import Illusion, { newTrial } from './Illusion.jsx'
import MMChart from './MMChart.jsx'
import { MIN_TRIALS, PLAY_DOMAIN, PULL_DOMAIN, TRIALS, fmtPct, fmtPts, mean, median, sd } from './mm.js'

// Topic 02 "Mean and median", played with the Müller-Lyer illusion.
//   1. Match the lines: 15 tries, each one a dot (% too long)
//   2. Mean & median: what each one is (balance point ▲ / middle dot), and why they agree here
//   3. Pull a dot: drag one try far out; the mean follows, the median hardly moves

const STEPS = ['Match the lines', 'Mean & median', 'Pull a dot']
const MOVED = 15 // % points a dot must be dragged before step 3 explains what happened

export default function MeanMedian() {
  const [step, setStep] = useState(0)
  const [tries, setTries] = useState([]) // { id, v }: v = % too long
  const [pulled, setPulled] = useState([])
  const [stim, setStim] = useState(newTrial) // { u0, u1, ratio }
  const [flash, setFlash] = useState(null)

  const n = tries.length
  const full = n >= TRIALS
  const vals = tries.map((t) => t.v)
  const m = mean(vals)
  const md = median(vals)

  function submit() {
    if (step !== 0 || full) return
    const v = (stim.ratio - 1) * 100
    setTries((ts) => [...ts, { id: ts.length, v }])
    const off = Math.abs(v) < 1 ? 'spot on!' : `${Math.abs(v).toFixed(0)}% too ${v > 0 ? 'long' : 'short'}`
    setFlash(`Try ${n + 1}: ${off}`)
    setStim(newTrial())
  }

  // Enter = "Looks equal" (unless a button or link has the focus: Enter clicks that instead).
  const submitRef = useRef(submit)
  submitRef.current = submit
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Enter' || e.repeat) return
      if (e.target instanceof HTMLElement && e.target.closest('button, a')) return
      e.preventDefault()
      submitRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function undo() {
    setTries((ts) => ts.slice(0, -1))
    setFlash(null)
  }

  function goPull() {
    setPulled(tries.map((t) => ({ ...t })))
    setStep(2)
  }

  function playAgain() {
    setTries([])
    setPulled([])
    setStim(newTrial())
    setFlash(null)
    setStep(0)
  }

  const allTopics = (
    <Link to="/" className="btn btn-ghost">
      All topics
    </Link>
  )

  // ---------- 1. Match the lines ----------
  if (step === 0) {
    const locked = n < MIN_TRIALS
    let hint = 'Make the plain line look as long as the one with fins.'
    if (full) hint = `All ${TRIALS} tries done!`
    else if (flash) hint = `${flash} · ${TRIALS - n} left`
    return (
      <Stage
        title="The Müller-Lyer illusion"
        className="mm-stage"
        steps={STEPS}
        current={0}
        say={
          <p>
            <strong>Stretch the plain line until it looks as long as the one with fins.</strong> Trust your eyes,
            don’t measure.
          </p>
        }
        bar={
          <>
            <div className="legend">
              <span className="legend-item added">
                {n} / {TRIALS} tries
              </span>
              {n >= 2 && (
                <>
                  <span className="legend-item mean">Mean</span>
                  <span className="legend-item median">Median</span>
                </>
              )}
            </div>
            <div className="tools">
              <button type="button" className="btn btn-ghost btn-sm" disabled={!n} onClick={undo}>
                Undo
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
              {full ? (
                <button type="button" className="btn btn-primary nd-glow" onClick={() => setStep(1)}>
                  Next: mean & median →
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn ck-next"
                    disabled={locked}
                    title={locked ? `Unlocks after ${MIN_TRIALS} tries` : undefined}
                    onClick={() => setStep(1)}
                  >
                    {locked ? `Next · ${MIN_TRIALS - n} more` : 'Next →'}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={submit}>
                    Looks equal ✓
                  </button>
                </>
              )}
            </div>
          </>
        }
      >
        <div className="mm-main">
          <Illusion
            trial={stim}
            ratio={stim.ratio}
            onRatio={(ratio) => setStim((s) => ({ ...s, ratio }))}
            disabled={full}
            showHint={n < 2}
          />
          <MMChart points={tries} domain={PLAY_DOMAIN} highlightLast />
        </div>
      </Stage>
    )
  }

  // ---------- 2. Mean & median ----------
  if (step === 1) {
    const close = Math.abs(m - md) <= Math.max(2, 0.3 * (sd(vals) || 0))
    const k = (n + 1) / 2
    const middle = n % 2 ? `number ${k}` : `halfway between ${k - 0.5} and ${k + 0.5}`
    let headline = `On average your plain line was ${Math.abs(m).toFixed(1)}% too long: the fins fooled you.`
    if (m < -3) headline = `On average your plain line was ${Math.abs(m).toFixed(1)}% too short.`
    else if (m <= 3) headline = 'On average you were almost spot on: you beat the illusion!'
    return (
      <Stage
        title="The Müller-Lyer illusion"
        className="mm-stage"
        steps={STEPS}
        current={1}
        say={
          <p>
            <strong>{headline}</strong> Two ways to find the centre of your dots.
          </p>
        }
        bar={
          <div className="legend">
            <span className="legend-item added">{n} tries, numbered in order</span>
            <span className="legend-item mean">Mean = balance point ▲</span>
            <span className="legend-item median">Median = middle dot</span>
          </div>
        }
        foot={
          <>
            <div className="nd-feedback" aria-live="polite">
              <p className="nd-hint">
                {close
                  ? `Mean ${fmtPct(m)} and median ${fmtPct(md)} almost agree: your dots make a bell, and a bell has one clear middle.`
                  : `Mean ${fmtPct(m)} and median ${fmtPct(md)} are ${fmtPts(m - md)} apart: a few tries pull your dots to one side.`}
              </p>
              <p className="nd-fact">
                Mean: add up all {n} tries and divide by {n}; the dots balance there. Median: line the tries up in
                order and take the middle one ({middle}).
              </p>
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" onClick={goPull}>
                Next: pull a dot →
              </button>
            </div>
          </>
        }
      >
        <div className="mm-main">
          <MMChart points={tries} domain={PLAY_DOMAIN} ranks />
        </div>
      </Stage>
    )
  }

  // ---------- 3. Pull a dot ----------
  const pv = pulled.map((p) => p.v)
  const m1 = mean(pv)
  const md1 = median(pv)
  const maxMove = Math.max(0, ...pulled.map((p, i) => Math.abs(p.v - tries[i].v)))
  const moved = maxMove >= MOVED
  return (
    <Stage
      title="The Müller-Lyer illusion"
      className="mm-stage"
      steps={STEPS}
      current={2}
      say={
        <p>
          <strong>Drag one dot far to the right, as if one try went really wrong.</strong> Which line follows it?
        </p>
      }
      bar={
        <>
          <div className="legend">
            <span className="legend-item mean">Mean</span>
            <span className="legend-item median">Median</span>
            <span className="legend-item mm-ghost-key">Before</span>
          </div>
          <div className="tools">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={!maxMove}
              onClick={() => setPulled(tries.map((t) => ({ ...t })))}
            >
              Reset dots
            </button>
          </div>
        </>
      }
      foot={
        <>
          <div className={`nd-feedback${moved ? ' is-good' : ''}`} aria-live="polite">
            <p className="nd-hint">
              {moved
                ? `The mean moved ${fmtPts(m1 - m)}, ${Math.abs(md1 - md) < 0.05 ? 'the median did not move at all' : `the median only ${fmtPts(md1 - md)}`}.`
                : 'Grab any dot and pull it right (or focus it and use the arrow keys).'}
            </p>
            <p className="nd-fact">
              {moved
                ? 'One wild try drags the mean along. The median only cares which dot is in the middle, so it barely moves. That’s why researchers often report the median when a few trials go wrong.'
                : `Now: mean ${fmtPct(m1)}, median ${fmtPct(md1)}.`}
            </p>
          </div>
          <div className="actions">
            {allTopics}
            <button type="button" className="btn btn-primary" onClick={playAgain}>
              Play again
            </button>
          </div>
        </>
      }
    >
      <div className="mm-main">
        <MMChart
          points={pulled}
          domain={PULL_DOMAIN}
          draggable
          ghost={moved ? { mean: m, median: md } : null}
          onDrag={(id, v) => setPulled((ps) => ps.map((p) => (p.id === id ? { ...p, v } : p)))}
        />
      </div>
    </Stage>
  )
}

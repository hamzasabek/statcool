import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { num, pct, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import { sfx, useChime } from '../../sound.js'
import Illusion, { newTrial } from './Illusion.jsx'
import MMChart from './MMChart.jsx'
import { MIN_TRIALS, PLAY_DOMAIN, PULL_DOMAIN, TRIALS, fmtPct, mean, median, sd } from './mm.js'
import { MM } from './text.js'

// Topic 02 "Mean and median", played with the Müller-Lyer illusion.
//   1. Match the lines: 15 tries, each one a dot (% too long)
//   2. Mean & median: what each one is (balance point ▲ / middle dot), and why they agree here
//   3. Pull a dot: drag one try far out; the mean follows, the median hardly moves

const MOVED = 15 // % points a dot must be dragged before step 3 explains what happened

// The mean of the previous round, kept while the site is open: "play again: did your mean move?"
// (a sample's mean changes from one sample to the next; it estimates a value you never see, μ).
let lastMean = null

// Guided tour of each step: what each bubble points at (null = middle of the screen); the texts
// are in text.js (tour), in the same order.
const TOUR_IDS = ['match', 'meanMedian', 'pull']
const TOUR_TARGETS = {
  match: [null, 'figure', 'equal', 'chart', 'legend', 'tools', 'steps', 'next'],
  meanMedian: ['chart', 'chart', 'feedback', 'next'],
  pull: ['chart', 'legend', 'tools'],
}
const TOUR_PLACE = { equal: 'top', next: 'top' }

export default function MeanMedian() {
  const tx = useText(MM)
  const tc = useText(COMMON)
  const [step, setStep] = useState(0)
  const [tries, setTries] = useState([]) // { id, v }: v = % too long
  const [pulled, setPulled] = useState([])
  const [stim, setStim] = useState(newTrial) // { u0, u1, ratio }
  const [flash, setFlash] = useState(null) // { k, v }: the last try (text built at render, so it follows the language)

  const n = tries.length
  const full = n >= TRIALS
  const vals = tries.map((t) => t.v)
  const m = mean(vals)
  const md = median(vals)
  const spread = sd(vals)
  // The normal curve with your mean and SD (like topic 03). Step 3 keeps this one, from before the pull.
  const bell = n >= 3 && spread > 0 ? { mean: m, sd: spread, n } : null
  useChime(n, MIN_TRIALS, TRIALS)

  // One tour per step; each opens by itself the first time.
  const tourId = TOUR_IDS[step]
  const guide = useGuide(`mm-${tourId}`, TOUR_TARGETS[tourId], tx.tour[tourId], {
    place: TOUR_PLACE,
    doneLabel: step === 0 ? tx.tourPlay : undefined,
  })

  function submit() {
    if (step !== 0 || full) return
    const v = (stim.ratio - 1) * 100
    setTries((ts) => [...ts, { id: ts.length, v }])
    setFlash({ k: n + 1, v })
    setStim(newTrial())
    sfx.tick()
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
    if (tries.length) lastMean = m
    setTries([])
    setPulled([])
    setStim(newTrial())
    setFlash(null)
    setStep(0)
  }

  const allTopics = (
    <Link to="/topics" className="btn btn-ghost">
      {tc.allTopics}
    </Link>
  )

  // ---------- 1. Match the lines ----------
  if (step === 0) {
    const locked = n < MIN_TRIALS
    let hint = tx.hintStart
    if (full) hint = tx.hintFull(TRIALS)
    else if (flash) {
      const off = Math.abs(flash.v) < 1 ? tx.spotOn : tx.off(pct(num(Math.abs(flash.v))), flash.v > 0)
      hint = tx.hintFlash(tx.tryN(flash.k, off), TRIALS - n)
    }
    return (
      <Stage
        title={tx.title}
        className="mm-stage"
        steps={tx.steps}
        onGuide={guide.start}
        current={0}
        say={
          <p>
            <strong>{tx.say1Strong}</strong> {tx.say1}
          </p>
        }
        bar={
          <>
            <div className="legend" data-tour="legend">
              <span className="legend-item added">{tx.count(n, TRIALS)}</span>
              {n >= 2 && (
                <>
                  <span className="legend-item mean">{tx.mean}</span>
                  <span className="legend-item median">{tx.median}</span>
                </>
              )}
              {bell && <span className="legend-item ck-line is-a">{tx.bell}</span>}
            </div>
            <div className="tools" data-tour="tools">
              <button type="button" className="btn btn-ghost btn-sm" disabled={!n} onClick={undo}>
                {tc.undo}
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
                <button type="button" className="btn btn-primary nd-glow" data-tour="next" onClick={() => setStep(1)}>
                  {tx.nextMM}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn ck-next"
                    data-tour="next"
                    disabled={locked}
                    title={locked ? tx.unlocks(MIN_TRIALS) : undefined}
                    onClick={() => setStep(1)}
                  >
                    {locked ? tx.lockedNext(MIN_TRIALS - n) : tx.next}
                  </button>
                  <button type="button" className="btn btn-primary" data-tour="equal" onClick={submit}>
                    {tx.looksEqual}
                  </button>
                </>
              )}
            </div>
          </>
        }
      >
        <div className="mm-main">
          {guide.view}
          <Illusion
            trial={stim}
            ratio={stim.ratio}
            onRatio={(ratio) => setStim((s) => ({ ...s, ratio }))}
            disabled={full}
            showHint={n < 2}
          />
          <MMChart points={tries} domain={PLAY_DOMAIN} bell={bell} highlightLast />
        </div>
      </Stage>
    )
  }

  // ---------- 2. Mean & median ----------
  if (step === 1) {
    const close = Math.abs(m - md) <= Math.max(2, 0.3 * (spread || 0))
    const k = (n + 1) / 2
    const middle = n % 2 ? tx.middleOdd(k) : tx.middleEven(k - 0.5, k + 0.5)
    const abs = pct(num(Math.abs(m), 1))
    let headline = tx.headlineLong(abs)
    if (m < -3) headline = tx.headlineShort(abs)
    else if (m <= 3) headline = tx.headlineSpot
    return (
      <Stage
        title={tx.title}
        className="mm-stage"
        steps={tx.steps}
        onGuide={guide.start}
        current={1}
        say={
          <p>
            <strong>{headline}</strong> {tx.say2}
          </p>
        }
        bar={
          <div className="legend" data-tour="legend">
            <span className="legend-item added">{tx.key2Tries(n)}</span>
            <span className="legend-item mean">{tx.key2Mean}</span>
            <span className="legend-item median">{tx.key2Median}</span>
            <span className="legend-item ck-line is-a">{tx.key2Bell}</span>
          </div>
        }
        foot={
          <>
            <div data-tour="feedback" className="nd-feedback" aria-live="polite">
              <p className="nd-hint">
                {tx.bellTop}{' '}
                {close ? tx.agree(fmtPct(m), fmtPct(md)) : tx.apart(tx.points(Math.abs(m - md)), fmtPct(m), fmtPct(md))}
              </p>
              <p className="nd-fact">{tx.fact2(n, middle)}</p>
              {lastMean !== null && <p className="nd-fact mm-again">{tx.again(fmtPct(lastMean), fmtPct(m))}</p>}
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" data-tour="next" onClick={goPull}>
                {tx.nextPull}
              </button>
            </div>
          </>
        }
      >
        <div className="mm-main">
          {guide.view}
          <MMChart points={tries} domain={PLAY_DOMAIN} bell={bell} ranks />
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
  const mdShift = Math.abs(md1 - md)
  return (
    <Stage
      title={tx.title}
      className="mm-stage"
      steps={tx.steps}
      onGuide={guide.start}
      current={2}
      say={
        <p>
          <strong>{tx.say3Strong}</strong> {tx.say3}
        </p>
      }
      bar={
        <>
          <div className="legend" data-tour="legend">
            <span className="legend-item mean">{tx.mean}</span>
            <span className="legend-item median">{tx.median}</span>
            <span className="legend-item ck-line is-a">{tx.yourBell}</span>
            <span className="legend-item mm-ghost-key">{tx.before}</span>
          </div>
          <div className="tools" data-tour="tools">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={!maxMove}
              onClick={() => setPulled(tries.map((t) => ({ ...t })))}
            >
              {tx.resetDots}
            </button>
          </div>
        </>
      }
      foot={
        <>
          <div data-tour="feedback" className={`nd-feedback${moved ? ' is-good' : ''}`} aria-live="polite">
            <p className="nd-hint">
              {moved ? tx.moved(tx.points(Math.abs(m1 - m)), mdShift < 0.05 ? null : tx.points(mdShift)) : tx.grab}
            </p>
            <p className="nd-fact">{moved ? tx.robust : tx.stays(fmtPct(m1), fmtPct(md1))}</p>
            <p className="nd-fact">{tx.playAgainAsk}</p>
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
      <div className="mm-main">
        {guide.view}
        <MMChart
          points={pulled}
          domain={PULL_DOMAIN}
          draggable
          ghost={moved ? { mean: m, median: md } : null}
          bell={bell}
          onDrag={(id, v) => setPulled((ps) => ps.map((p) => (p.id === id ? { ...p, v } : p)))}
        />
      </div>
    </Stage>
  )
}

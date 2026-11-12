import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import { useChime } from '../../sound.js'
import DigitTask from './DigitTask.jsx'
import SpanChart from './SpanChart.jsx'
import { FIRST_LENGTH, MIN_LENGTH, MIN_RUNS, RUNS, fmtSpan, isWhole, mean, median, modes, simulatedClass } from './span.js'
import { SPAN } from './spanText.js'

// Topic 01, game 2: "The magical number 7" (digit span, Miller 1956).
//   1. Remember: 6 runs; each gives one span (a whole number) → a dot in its column
//   2. Three centres: mode (most common), median (middle), mean (balance point) of your spans
//   3. The class: 100 simulated adults; the three centres agree near 7

const TOUR_IDS = ['play', 'centres', 'class']
const TOUR_TARGETS = {
  play: [null, 'task', 'chart', 'legend', 'steps', 'next'],
  centres: ['chart', 'chart', 'feedback'],
  class: ['chart', 'feedback'],
}
const TOUR_PLACE = { next: 'top', task: 'right' }

// The mean span of the previous round, kept while the site is open (a sample's mean varies).
let lastMean = null

export default function DigitSpan() {
  const tx = useText(SPAN)
  const tc = useText(COMMON)
  const [step, setStep] = useState(0)
  const [spans, setSpans] = useState([])
  const crowd = useMemo(() => simulatedClass(), [])

  const tourId = TOUR_IDS[step]
  const guide = useGuide(`span-${tourId}`, TOUR_TARGETS[tourId], tx.tour[tourId], {
    place: TOUR_PLACE,
    doneLabel: step === 0 ? tx.tourPlay : undefined,
  })

  const n = spans.length
  useChime(n, MIN_RUNS, RUNS)
  const allTopics = (
    <Link to="/topics" className="btn btn-ghost">
      {tc.allTopics}
    </Link>
  )
  const playAgain = () => {
    if (spans.length) lastMean = mean(spans)
    setSpans([])
    setStep(0)
  }
  const fmt = (v) => fmtSpan(v, isWhole(v) ? 0 : 1)

  // ---------- 1. Remember ----------
  if (step === 0) {
    const full = n >= RUNS
    const locked = n < MIN_RUNS
    const start = n ? Math.max(MIN_LENGTH, spans[n - 1] - 1) : FIRST_LENGTH
    let hint = n ? tx.hintLeft(RUNS - n, MIN_RUNS - n) : tx.hintStart
    if (full) hint = tx.hintFull(RUNS)
    return (
      <Stage
        title={tx.title}
        className="ds-stage"
        steps={tx.steps}
        current={0}
        onGuide={guide.start}
        say={
          <p>
            <strong>{tx.sayStrong}</strong> {tx.say}
          </p>
        }
        bar={
          <div className="legend" data-tour="legend">
            <span className="legend-item ck-key is-a">{tx.count(n, RUNS)}</span>
          </div>
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
                className={`btn btn-primary ${full ? 'nd-glow' : 'ck-next'}`}
                data-tour="next"
                disabled={locked}
                title={locked ? tx.unlocks(MIN_RUNS) : undefined}
                onClick={() => setStep(1)}
              >
                {locked ? tx.lockedNext(MIN_RUNS - n) : tx.nextCentres}
              </button>
            </div>
          </>
        }
      >
        <div className="ds-main">
          {guide.view}
          <DigitTask start={start} run={n + 1} done={full} onRunEnd={(s) => setSpans((all) => (all.length >= RUNS ? all : [...all, s]))} />
          <SpanChart you={spans} />
        </div>
      </Stage>
    )
  }

  // ---------- 2. Three centres ----------
  if (step === 1) {
    const mo = modes(spans)
    const md = median(spans)
    const mn = mean(spans)
    return (
      <Stage
        title={tx.title}
        className="ds-stage"
        steps={tx.steps}
        current={1}
        onGuide={guide.start}
        say={
          <p>
            <strong>{mo.length === 1 ? tx.modeOne(fmt(mo[0])) : tx.modeTie(mo.map(fmt).join(tx.and))}</strong> {tx.say2}
          </p>
        }
        bar={
          <div className="legend" data-tour="legend">
            <span className="legend-item ck-key is-a">{tx.keySpans(n)}</span>
            <span className="legend-item ds-key-mode">{tx.keyMode}</span>
            <span className="legend-item median">{tx.keyMedian}</span>
            <span className="legend-item mean">{tx.keyMean}</span>
          </div>
        }
        foot={
          <>
            <div className="nd-feedback" data-tour="feedback" aria-live="polite">
              <p className="nd-hint">
                {isWhole(md) ? tx.medianWhole(fmt(md)) : tx.medianHalf(fmt(md))} {isWhole(mn) ? tx.meanWhole(fmt(mn)) : tx.meanOdd(fmtSpan(mn, 1))}
              </p>
              <p className="nd-fact">{tx.summary}</p>
              {lastMean !== null && <p className="nd-fact">{tx.again(fmtSpan(lastMean, 1), fmtSpan(mn, 1))}</p>}
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                {tx.nextClass}
              </button>
            </div>
          </>
        }
      >
        <div className="ds-main is-single">
          {guide.view}
          <SpanChart you={spans} marks="you" />
        </div>
      </Stage>
    )
  }

  // ---------- 3. The class ----------
  const yourModes = modes(spans)
  return (
    <Stage
      title={tx.title}
      className="ds-stage"
      steps={tx.steps}
      current={2}
      onGuide={guide.start}
      say={
        <p>
          <strong>{tx.classStrong(fmt(modes(crowd)[0]), fmt(median(crowd)), fmtSpan(mean(crowd), 1))}</strong> {tx.classSay}
        </p>
      }
      bar={
        <div className="legend" data-tour="legend">
          <span className="legend-item ds-key-bar">{tx.keyClass}</span>
          <span className="legend-item ck-key is-a">{tx.keyYou}</span>
          <span className="legend-item ds-key-mode">{tx.keyMode}</span>
          <span className="legend-item median">{tx.keyMedian}</span>
          <span className="legend-item mean">{tx.keyMean}</span>
        </div>
      }
      foot={
        <>
          <div className="nd-feedback is-good" data-tour="feedback" aria-live="polite">
            <p className="nd-hint">{tx.classFact(yourModes.map(fmt).join(tx.and))}</p>
            <p className="nd-fact">{tx.twoSpreads}</p>
            <p className="nd-fact">{tx.classNote}</p>
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
      <div className="ds-main is-single">
        {guide.view}
        <SpanChart you={spans} crowd={crowd} marks="crowd" />
      </div>
    </Stage>
  )
}

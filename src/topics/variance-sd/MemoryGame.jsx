import { useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { num, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import { sfx, useChime } from '../../sound.js'
import ErrorChart from './ErrorChart.jsx'
import MemoryTask from './MemoryTask.jsx'
import SquaresChart from './SquaresChart.jsx'
import { KEYS, LOAD, MIN_TRIALS, ROUNDS, TRIALS, fmtDeg, fmtDeg2, fmtSignedDeg, mean, sd, variance, withinOneSd } from './sd.js'
import { MEM } from './text.js'

// Topic 02 "Variance and standard deviation", played as "How precise is your memory?".
//   1. 1 line: 12 trials of remembering one tilt; each error (degrees) is a dot
//   2. 4 lines: 12 trials with 4 tilts to hold in mind; a second row of dots
//   3. Spread: both rows with their mean and ±1 SD: same centre (≈ 0), wider spread
//   4. The SD: deviations → squares → variance → SD (side of the average square)

const TOUR_IDS = ['one', 'four', 'spread', 'sd']
const TOUR_TARGETS = {
  one: [null, 'task', 'chart', 'legend', 'tools', 'steps', 'next'],
  four: ['task', 'chart'],
  spread: ['chart', 'chart', 'feedback'],
  sd: ['chart', 'view', 'round', 'feedback'],
}
const TOUR_PLACE = { next: 'top', task: 'right' }
const VIEWS = ['dev', 'sq', 'sd']
const empty = () => ({ one: [], four: [] })

export default function MemoryGame() {
  const tx = useText(MEM)
  const tc = useText(COMMON)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState(empty) // { one: [degrees], four: [degrees] }
  const [view, setView] = useState('dev')
  const [sdRound, setSdRound] = useState('four')
  useChime(errors.one.length, MIN_TRIALS, TRIALS)
  useChime(errors.four.length, MIN_TRIALS, TRIALS)

  const tourId = TOUR_IDS[step]
  const guide = useGuide(`mem-${tourId}`, TOUR_TARGETS[tourId], tx.tour[tourId], {
    place: TOUR_PLACE,
    doneLabel: step === 0 ? tx.tourPlay : undefined,
  })

  const allTopics = (
    <Link to="/topics" className="btn btn-ghost">
      {tc.allTopics}
    </Link>
  )
  const rows = (faintFirst) => [
    { key: KEYS.one, label: tx.keyOne, values: errors.one, faint: faintFirst },
    ...(step >= 1 ? [{ key: KEYS.four, label: tx.keyFour, values: errors.four }] : []),
  ]

  function playAgain() {
    setErrors(empty())
    setView('dev')
    setSdRound('four')
    setStep(0)
  }

  // ---------- 1–2. The two rounds ----------
  if (step <= 1) {
    const round = ROUNDS[step]
    const list = errors[round]
    const n = list.length
    const full = n >= TRIALS
    const locked = n < MIN_TRIALS
    const four = round === 'four'

    const onAnswer = ({ error }) => {
      sfx.tick()
      setErrors((all) => (all[round].length >= TRIALS ? all : { ...all, [round]: [...all[round], error] }))
    }
    const undo = () => setErrors((all) => ({ ...all, [round]: all[round].slice(0, -1) }))

    let hint = n ? tx.hintLeft(TRIALS - n, MIN_TRIALS - n) : tx.hintStart
    if (full) hint = tx.hintFull(TRIALS)

    return (
      <Stage
        title={tx.title}
        className="mem-stage"
        steps={tx.steps}
        current={step}
        onGuide={guide.start}
        say={
          <p>
            <strong>{four ? tx.sayFourStrong : tx.sayOneStrong}</strong> {four ? tx.sayFour : tx.sayOne}
          </p>
        }
        bar={
          <>
            <div className="legend" data-tour="legend">
              <span className={`legend-item ck-key is-${KEYS[round]}`}>{tx.count(n, TRIALS)}</span>
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
              <button
                type="button"
                className={`btn btn-primary ${full ? 'nd-glow' : 'ck-next'}`}
                data-tour="next"
                disabled={locked}
                title={locked ? tx.unlocks(MIN_TRIALS) : undefined}
                onClick={() => setStep(step + 1)}
              >
                {locked ? tx.lockedNext(MIN_TRIALS - n) : four ? tx.nextSpread : tx.nextFour}
              </button>
            </div>
          </>
        }
      >
        <div className="mem-main">
          {guide.view}
          <MemoryTask key={round} load={LOAD[round]} done={full} onAnswer={onAnswer} />
          <ErrorChart series={rows(four)} lastKey={KEYS[round]} />
        </div>
      </Stage>
    )
  }

  // ---------- 3. Spread ----------
  if (step === 2) {
    const [m1, m4] = [mean(errors.one), mean(errors.four)]
    const [s1, s4] = [sd(errors.one), sd(errors.four)]
    const ratio = s4 / s1
    const wider = ratio >= 1.2
    const centred = [
      [m1, s1],
      [m4, s4],
    ].every(([m, s]) => Math.abs(m) <= Math.max(4, 0.4 * s))
    return (
      <Stage
        title={tx.title}
        className="mem-stage"
        steps={tx.steps}
        current={2}
        onGuide={guide.start}
        say={
          <p>
            <strong>{wider ? tx.spreadWider(num(ratio, 1)) : tx.spreadSame}</strong> {tx.spreadSay}
          </p>
        }
        bar={
          <div className="legend" data-tour="legend">
            <span className="legend-item ck-key is-a">{tx.keyOne}</span>
            <span className="legend-item ck-key is-b">{tx.keyFour}</span>
            <span className="legend-item mean">{tx.keyMean}</span>
            <span className="legend-item mem-key-sd">{tx.keySd}</span>
          </div>
        }
        foot={
          <>
            <div className="nd-feedback" data-tour="feedback" aria-live="polite">
              <p className="nd-hint">{(centred ? tx.centres : tx.centresOff)(fmtSignedDeg(m1, 1), fmtSignedDeg(m4, 1))}</p>
              <p className="nd-fact">{tx.spreadFact}</p>
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
                {tx.nextSd}
              </button>
            </div>
          </>
        }
      >
        <div className="mem-main is-single">
          {guide.view}
          <ErrorChart series={rows(false)} showStats />
        </div>
      </Stage>
    )
  }

  // ---------- 4. The SD ----------
  const values = errors[sdRound]
  const other = errors[sdRound === 'four' ? 'one' : 'four']
  const m = mean(values)
  const devs = values.map((v) => v - m)
  const left = devs.filter((d) => d < 0).reduce((a, d) => a + d, 0)
  const right = devs.filter((d) => d > 0).reduce((a, d) => a + d, 0)
  const sumSq = devs.reduce((a, d) => a + d * d, 0)
  const v = variance(values)
  const s = sd(values)
  const n = values.length
  const within = Math.round(withinOneSd(values) * n)
  const [s1, s4] = [sd(errors.one), sd(errors.four)]

  let strong = tx.devStrong
  let fact = tx.devFact(fmtSignedDeg(left, 1), fmtSignedDeg(right, 1))
  let extra = null
  if (view === 'sq') {
    strong = tx.sqStrong
    fact = tx.sqFact(fmtDeg2(sumSq), n - 1, fmtDeg2(v))
    extra = tx.n1Note
  } else if (view === 'sd') {
    strong = tx.sdStrong(fmtDeg(s, 1))
    fact = tx.sdFact(fmtDeg2(v), fmtDeg(s, 1), within, n)
    extra = tx.compare(fmtDeg(s1, 1), fmtDeg(s4, 1), num(s4 / s1, 1))
  }

  return (
    <Stage
      title={tx.title}
      className="mem-stage"
      steps={tx.steps}
      current={3}
      onGuide={guide.start}
      say={<p>{tx.sdSay}</p>}
      bar={
        <>
          <div className="segmented" role="group" aria-label={tx.viewGroup} data-tour="view">
            {VIEWS.map((k) => (
              <button key={k} type="button" className={view === k ? 'is-active' : ''} aria-pressed={view === k} onClick={() => setView(k)}>
                {tx.views[k]}
              </button>
            ))}
          </div>
          <div className="segmented" role="group" aria-label={tx.roundGroup} data-tour="round">
            {ROUNDS.map((k) => (
              <button key={k} type="button" className={sdRound === k ? 'is-active' : ''} aria-pressed={sdRound === k} onClick={() => setSdRound(k)}>
                {tx.rounds[k]}
              </button>
            ))}
          </div>
        </>
      }
      foot={
        <>
          <div className="nd-feedback is-good" data-tour="feedback" aria-live="polite">
            <p className="nd-hint">{strong}</p>
            <p className="nd-fact">{fact}</p>
            {extra && <p className="nd-fact">{extra}</p>}
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
      <div className="mem-main is-single">
        {guide.view}
        <SquaresChart values={values} other={other} view={view} colour={KEYS[sdRound]} />
      </div>
    </Stage>
  )
}

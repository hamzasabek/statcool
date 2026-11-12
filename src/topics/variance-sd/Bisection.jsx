import { useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import { sfx, useChime } from '../../sound.js'
import BiasMap from './BiasMap.jsx'
import BisectTask from './BisectTask.jsx'
import ErrorChart from './ErrorChart.jsx'
import { BIAS_SMALL, BIN, DOMAIN, MIN_TRIALS, SD_SMALL, TRIALS, fmtPct, fmtSignedPct, summary } from './bisect.js'
import { BIS } from './bisectText.js'

// Topic 02, game 2: "Find the middle" (line bisection). Two numbers describe a set of answers:
// where they land on average (the mean error = the bias) and how much they scatter (the SD = the
// precision). They are different things, so a report needs both.
//   1. Tap: 16 lines, tap each one's middle; no feedback
//   2. Your aim: the errors as dots, the mean (bias) and ±1 SD (scatter); is the lean more than chance?
//   3. Bias vs precision: you among a simulated class on a bias × SD map

const TOUR_IDS = ['tap', 'aim', 'map']
const TOUR_TARGETS = {
  tap: [null, 'task', 'legend', 'tools', 'steps', 'next'],
  aim: ['chart', 'chart', 'feedback'],
  map: ['chart', 'chart', 'feedback'],
}
const TOUR_PLACE = { next: 'top', task: 'bottom' }
const SCALE = {
  domain: DOMAIN,
  bin: BIN,
  ticks: [-12, -8, -4, 0, 4, 8, 12],
  tick: (t) => (t === 0 ? '0' : `${t > 0 ? '+' : '−'}${Math.abs(t)}`),
  val: (v) => fmtPct(v),
  signed: (v) => fmtSignedPct(v),
}

// What the student's two numbers say. The lean counts only if it is beyond 2 standard errors.
export function verdict({ n, bias, sd }) {
  const chance = (2 * sd) / Math.sqrt(n)
  const clear = Math.abs(bias) > chance
  const side = clear ? (bias < 0 ? 'left' : 'right') : 'none'
  const biased = clear && Math.abs(bias) >= BIAS_SMALL
  const precise = sd < SD_SMALL
  let corner = `${biased ? 'biased' : 'centred'}-${precise ? 'precise' : 'scattered'}`
  if (!biased && Math.abs(bias) >= BIAS_SMALL) corner = 'unclear' // outside the box, but could be chance
  return { chance, side, corner }
}

export default function Bisection() {
  const tx = useText(BIS)
  const tc = useText(COMMON)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState([])
  const [round, setRound] = useState(0) // remounts the task on "Play again"
  useChime(errors.length, MIN_TRIALS, TRIALS)

  const tourId = TOUR_IDS[step]
  const guide = useGuide(`bis-${tourId}`, TOUR_TARGETS[tourId], tx.tour[tourId], {
    place: TOUR_PLACE,
    doneLabel: step === 0 ? tx.tourPlay : undefined,
  })

  const allTopics = (
    <Link to="/topics" className="btn btn-ghost">
      {tc.allTopics}
    </Link>
  )
  const common = { title: tx.title, className: 'mem-stage bis-stage', steps: tx.steps, current: step, onGuide: guide.start }

  // ---------- 1. Tap ----------
  if (step === 0) {
    const n = errors.length
    const full = n >= TRIALS
    const locked = n < MIN_TRIALS
    const onAnswer = ({ error }) => {
      sfx.tick()
      setErrors((all) => (all.length >= TRIALS ? all : [...all, error]))
    }
    let hint = n ? tx.hintLeft(TRIALS - n, MIN_TRIALS - n) : tx.hintStart
    if (full) hint = tx.hintFull(TRIALS)
    return (
      <Stage
        {...common}
        say={
          <p>
            <strong>{tx.sayStrong}</strong> {tx.say}
          </p>
        }
        bar={
          <>
            <div className="legend" data-tour="legend">
              <span className="legend-item ck-key is-a">{tx.count(n, TRIALS)}</span>
            </div>
            <div className="tools" data-tour="tools">
              <button type="button" className="btn btn-ghost btn-sm" disabled={!n} onClick={() => setErrors((all) => all.slice(0, -1))}>
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
                onClick={() => setStep(1)}
              >
                {locked ? tx.lockedNext(MIN_TRIALS - n) : tx.nextAim}
              </button>
            </div>
          </>
        }
      >
        <div className="mem-main is-single">
          {guide.view}
          <BisectTask key={round} done={full} onAnswer={onAnswer} />
        </div>
      </Stage>
    )
  }

  const you = summary(errors)
  const v = verdict(you)

  // ---------- 2. Your aim ----------
  if (step === 1) {
    const lean = v.side === 'left' ? tx.leanLeft : v.side === 'right' ? tx.leanRight : tx.noLean
    return (
      <Stage
        {...common}
        say={
          <p>
            <strong>{tx.aimStrong(fmtSignedPct(you.bias), fmtPct(you.sd))}</strong> {tx.aimSay}
          </p>
        }
        bar={
          <div className="legend" data-tour="legend">
            <span className="legend-item ck-key is-a">{tx.keyYou}</span>
            <span className="legend-item mean">{tx.keyMean}</span>
            <span className="legend-item mem-key-sd">{tx.keySd}</span>
          </div>
        }
        foot={
          <>
            <div className="nd-feedback" data-tour="feedback" aria-live="polite">
              <p className="nd-hint">{lean(v.side === 'none' ? fmtSignedPct(you.bias) : fmtPct(Math.abs(you.bias)), fmtPct(v.chance))}</p>
              <p className="nd-fact">{tx.aimFact}</p>
              <p className="nd-fact">{tx.chanceNote}</p>
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                {tx.nextMap}
              </button>
            </div>
          </>
        }
      >
        <div className="mem-main is-single">
          {guide.view}
          <ErrorChart
            series={[{ key: 'a', label: tx.keyYou, values: errors }]}
            showStats
            scale={SCALE}
            labels={{ aria: tx.chartAria, empty: tx.chartEmpty, zero: tx.zero }}
          />
        </div>
      </Stage>
    )
  }

  // ---------- 3. Bias vs precision ----------
  return (
    <Stage
      {...common}
      say={<p>{tx.mapSay}</p>}
      foot={
        <>
          <div className="nd-feedback is-good" data-tour="feedback" aria-live="polite">
            <p className="nd-hint">{tx.corner[v.corner]}</p>
            <p className="nd-fact">{tx.mapFact}</p>
            <p className="nd-fact">
              {tx.clinicFact} {tx.simNote}
            </p>
          </div>
          <div className="actions">
            {allTopics}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setErrors([])
                setRound((r) => r + 1)
                setStep(0)
              }}
            >
              {tc.playAgain}
            </button>
          </div>
        </>
      }
    >
      <div className="mem-main is-single">
        {guide.view}
        <BiasMap you={you} />
      </div>
    </Stage>
  )
}

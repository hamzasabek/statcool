import { useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { num, pct, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import { sfx, useChime } from '../../sound.js'
import DotsTask from './DotsTask.jsx'
import ErrorChart from './ErrorChart.jsx'
import { ERR_DOMAIN, MIN_TRIALS, RATIO_DOMAIN, TRIALS, bySize, fmtDots, fmtRatio, fmtSignedDots } from './dots.js'
import { DOTS } from './dotsText.js'

// Topic 02, game 3: "How many dots?" (numerosity estimation). The SD of the guesses grows with the
// number of dots, so an SD only means something next to its mean: the CV = SD ÷ mean stays about
// the same for small and large clouds.
//   1. Guess: 18 clouds (6 small, 6 medium, 6 large, mixed); errors drop into one row per size
//   2. Spread grows: each row's mean error and ±1 SD, in dots
//   3. Relative spread: the guesses ÷ the true number, and the CV of each size

const TOUR_IDS = ['guess', 'grow', 'rel']
const TOUR_TARGETS = {
  guess: [null, 'task', 'chart', 'legend', 'tools', 'steps', 'next'],
  grow: ['chart', 'chart', 'feedback'],
  rel: ['chart', 'view', 'feedback'],
}
const TOUR_PLACE = { next: 'top', task: 'right' }
const ERR_SCALE = {
  domain: ERR_DOMAIN,
  bin: 2,
  ticks: [-60, -40, -20, 0, 20, 40, 60],
  tick: (t) => (t === 0 ? '0' : `${t > 0 ? '+' : '−'}${Math.abs(t)}`),
  val: (v) => fmtDots(v, v < 10 ? 1 : 0),
  signed: (v) => fmtSignedDots(v, Math.abs(v) < 10 ? 1 : 0),
}
const RATIO_SCALE = {
  domain: RATIO_DOMAIN,
  bin: 0.05,
  zero: 1,
  ticks: [0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6],
  tick: (t) => (t === 1 ? '1' : num(t, 1)),
  val: (v) => fmtRatio(v),
  signed: (v) => `×${fmtRatio(v)}`,
}

export default function Dots() {
  const tx = useText(DOTS)
  const tc = useText(COMMON)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([]) // [{ size, truth, guess }]
  const [view, setView] = useState('ratio')
  const [round, setRound] = useState(0)
  useChime(answers.length, MIN_TRIALS, TRIALS)

  const tourId = TOUR_IDS[step]
  const guide = useGuide(`dots-${tourId}`, TOUR_TARGETS[tourId], tx.tour[tourId], {
    place: TOUR_PLACE,
    doneLabel: step === 0 ? tx.tourPlay : undefined,
  })

  const sizes = bySize(answers)
  const rows = (key, extra = {}) => sizes.map((s) => ({ key: s.key, label: tx.lane(s.about), values: s[key], ...extra }))
  const errLabels = { aria: tx.chartAria, empty: tx.chartEmpty, zero: tx.zeroErr }
  const allTopics = (
    <Link to="/topics" className="btn btn-ghost">
      {tc.allTopics}
    </Link>
  )
  const common = { title: tx.title, className: 'mem-stage dots-stage', steps: tx.steps, current: step, onGuide: guide.start }

  // ---------- 1. Guess ----------
  if (step === 0) {
    const n = answers.length
    const full = n >= TRIALS
    const locked = n < MIN_TRIALS
    const onAnswer = (a) => {
      sfx.tick()
      setAnswers((all) => (all.length >= TRIALS ? all : [...all, a]))
    }
    let hint = n ? tx.hintLeft(TRIALS - n, MIN_TRIALS - n) : tx.hintStart
    if (full) hint = tx.hintFull(TRIALS)
    const lastSize = answers.length ? sizes.find((s) => s.id === answers[answers.length - 1].size).key : null
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
              <button type="button" className="btn btn-ghost btn-sm" disabled={!n} onClick={() => setAnswers((all) => all.slice(0, -1))}>
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
                {locked ? tx.lockedNext(MIN_TRIALS - n) : tx.nextSpread}
              </button>
            </div>
          </>
        }
      >
        <div className="mem-main">
          {guide.view}
          <DotsTask key={round} count={n} done={full} onAnswer={onAnswer} />
          <ErrorChart series={rows('errors')} lastKey={lastSize} scale={ERR_SCALE} labels={errLabels} />
        </div>
      </Stage>
    )
  }

  const [a, b, c] = sizes
  const playAgain = () => {
    setAnswers([])
    setView('ratio')
    setRound((r) => r + 1)
    setStep(0)
  }

  // ---------- 2. Spread grows ----------
  if (step === 1) {
    const ratio = c.errSd / a.errSd
    const grew = ratio >= 3
    return (
      <Stage
        {...common}
        say={
          <p>
            <strong>{tx.growStrong(ERR_SCALE.val(a.errSd), ERR_SCALE.val(b.errSd), ERR_SCALE.val(c.errSd))}</strong> {tx.growSay}
          </p>
        }
        bar={
          <div className="legend" data-tour="legend">
            <span className="legend-item ck-key is-a">{tx.lane(a.about)}</span>
            <span className="legend-item ck-key is-b">{tx.lane(b.about)}</span>
            <span className="legend-item ck-key is-c">{tx.lane(c.about)}</span>
            <span className="legend-item mean">{tx.keyMean}</span>
            <span className="legend-item mem-key-sd">{tx.keySd}</span>
          </div>
        }
        foot={
          <>
            <div className="nd-feedback" data-tour="feedback" aria-live="polite">
              <p className="nd-hint">{(grew ? tx.grew : tx.grewLittle)(Number.isFinite(ratio) ? num(ratio, 1) : '–')}</p>
              <p className="nd-fact">{tx.growFact}</p>
              {c.ratioMean < 0.9 && <p className="nd-fact">{tx.under(pct(num(c.ratioMean * 100, 0)))}</p>}
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                {tx.nextRelative}
              </button>
            </div>
          </>
        }
      >
        <div className="mem-main is-single">
          {guide.view}
          <ErrorChart series={rows('errors')} showStats scale={ERR_SCALE} labels={errLabels} />
        </div>
      </Stage>
    )
  }

  // ---------- 3. Relative spread ----------
  const cvs = sizes.map((s) => s.cv)
  const close = Math.max(...cvs) / Math.min(...cvs) < 2
  const ratioView = view === 'ratio'
  return (
    <Stage
      {...common}
      say={
        <p>
          <strong>{ratioView ? tx.cvStrong(...cvs.map(fmtRatio)) : tx.dotsStrong}</strong> {ratioView ? tx.relSay : tx.dotsSay}
        </p>
      }
      bar={
        <div className="segmented" role="group" aria-label={tx.viewGroup} data-tour="view">
          {['dots', 'ratio'].map((k) => (
            <button key={k} type="button" className={view === k ? 'is-active' : ''} aria-pressed={view === k} onClick={() => setView(k)}>
              {tx.views[k]}
            </button>
          ))}
        </div>
      }
      foot={
        <>
          <div className="nd-feedback is-good" data-tour="feedback" aria-live="polite">
            <p className="nd-hint">{close ? tx.cvSame : tx.cvApart}</p>
            <p className="nd-fact">{tx.cvFact}</p>
            <p className="nd-fact">{tx.cvCaveat}</p>
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
        {ratioView ? (
          <ErrorChart key="ratio" series={rows('ratios')} showStats scale={RATIO_SCALE} labels={{ aria: tx.ratioAria, empty: tx.chartEmpty, zero: tx.zeroRatio }} />
        ) : (
          <ErrorChart key="dots" series={rows('errors')} showStats scale={ERR_SCALE} labels={errLabels} />
        )}
      </div>
    </Stage>
  )
}

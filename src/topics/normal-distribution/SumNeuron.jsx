import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { num, useLang, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import BellChart from './BellChart.jsx'
import NeuronPic from './NeuronPic.jsx'
import { stats } from './clock.js'
import { MAX_TRIALS, MIN_BELL, MIN_FIRST, SIM, SMALL, SYNAPSES, allSame, axis, fire } from './sum.js'
import { SUM } from './sumText.js'

// Topic 03, game 2: "A neuron adds up". Why is the normal distribution everywhere? Because many
// small, independent pushes add up to a bell. Each synapse pushes the neuron +1 or −1 at random;
// the neuron adds them up; each trial is one dot.
//   1. One synapse: guess the shape first, then fire: two bars, not a bell
//   2. More synapses (2, 4, 16, 64): a triangle, then a bell, with its fitted normal curve
//   3. Why bells? 1, 2, 4, 16 and 64 synapses side by side (3,000 simulated trials each)

const TOUR_IDS = ['one', 'many', 'why']
const TOUR_TARGETS = {
  one: [null, 'neuron', 'guess', 'fire', 'chart', 'steps', 'next'],
  many: ['synapses', 'chart', 'feedback'],
  why: ['chart', 'feedback'],
}
const TOUR_PLACE = { next: 'top', neuron: 'right', fire: 'right' }
const GUESSES = ['bars', 'bell', 'flat']
const emptyResults = () => Object.fromEntries(SMALL.map((k) => [k, []]))
// Fewer, symmetric ticks for the small multiples.
const smallTicks = (k, ticks) => {
  if (k % 2) return [-3, -1, 1, 3]
  const mx = Math.max(...ticks)
  return [-mx, -mx / 2, 0, mx / 2, mx].filter((t) => ticks.includes(t))
}
const signed = (v) => (v > 0 ? `+${num(v)}` : v < 0 ? `−${num(-v)}` : '0')

export default function SumNeuron() {
  const tx = useText(SUM)
  const tc = useText(COMMON)
  const { lang } = useLang()
  const big = (v) => new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-US').format(v)
  const [step, setStep] = useState(0)
  const [guess, setGuess] = useState(null)
  const [results, setResults] = useState(emptyResults)
  const [k, setK] = useState(2)
  const [last, setLast] = useState(null)
  const [seed, setSeed] = useState(0) // "Simulate again" in step 3

  const tourId = TOUR_IDS[step]
  const guide = useGuide(`sum-${tourId}`, TOUR_TARGETS[tourId], tx.tour[tourId], { place: TOUR_PLACE, doneLabel: step === 0 ? tx.tourPlay : undefined })

  const kNow = step === 0 ? 1 : k
  const values = results[kNow]
  const n = values.length
  const full = n >= MAX_TRIALS

  function fireN(times, kk = kNow) {
    let lastTrial = null
    const sums = []
    for (let i = 0; i < times; i++) {
      lastTrial = fire(kk)
      sums.push(lastTrial.sum)
    }
    setResults((rs) => ({ ...rs, [kk]: [...rs[kk], ...sums].slice(0, MAX_TRIALS) }))
    setLast({ ...lastTrial, id: Date.now() + Math.random() })
  }

  // Step 3: thousands of simulated trials per number of synapses (new ones with "Simulate again").
  const sims = useMemo(
    () => (step === 2 ? SMALL.map((kk) => ({ k: kk, values: Array.from({ length: SIM }, () => fire(kk).sum) })) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, seed],
  )

  const allTopics = (
    <Link to="/topics" className="btn btn-ghost">
      {tc.allTopics}
    </Link>
  )
  const common = { title: tx.title, className: 'ck-stage nr-stage', steps: tx.steps, current: step, onGuide: guide.start }
  const ax = axis(kNow)
  const chartLabels = { empty: tx.chartEmpty, axis: tx.axis, sd1: '', sd2: '' }

  const fireButtons = (disabled) => (
    <div className="nr-fire" data-tour="fire">
      <button type="button" className="btn btn-primary" disabled={disabled || full} onClick={() => fireN(1)}>
        {tx.fire1}
      </button>
      <div className="nr-fire-more">
        <button type="button" className="btn btn-ghost btn-sm" disabled={disabled || full} onClick={() => fireN(10)}>
          {tx.fire10}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={disabled || full} onClick={() => fireN(100)}>
          {tx.fire100}
        </button>
      </div>
    </div>
  )
  const panel = (disabled) => (
    <div className="nr-panel">
      <div className="nr-neuron" data-tour="neuron">
        <NeuronPic k={kNow} last={last} fmtSum={signed} aria={tx.neuronAria(kNow)} />
        <p className="nr-caption">{last && last.inputs.length === kNow ? tx.lastSum(signed(last.sum)) : tx.synapsesLabel(kNow)}</p>
      </div>
      {fireButtons(disabled)}
    </div>
  )

  // ---------- 1. One synapse ----------
  if (step === 0) {
    const plus = values.filter((v) => v > 0).length
    let hint = guess ? tx.hintFire : tx.hintGuess
    if (n) hint = `${tx.oneResult(plus, n)} ${tx.guessVerdict[guess]}`
    const locked = n < MIN_FIRST
    return (
      <Stage
        {...common}
        say={
          <p>
            <strong>{tx.sayStrong}</strong> {tx.sayOne}
          </p>
        }
        bar={
          <>
            <div className="pg-scenarios" role="group" aria-label={tx.guessLabel} data-tour="guess">
              <span className="pg-scenarios-label">{tx.guessLabel}</span>
              {GUESSES.map((g) => (
                <button key={g} type="button" className={`pg-chip${guess === g ? ' is-on' : ''}`} aria-pressed={guess === g} disabled={n > 0} onClick={() => setGuess(g)}>
                  {tx.guesses[g]}
                </button>
              ))}
            </div>
            <div className="legend">
              <span className="legend-item ck-key is-a">{tx.count(n)}</span>
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
                className={`btn btn-primary ${n >= MIN_FIRST ? 'nd-glow' : 'ck-next'}`}
                data-tour="next"
                disabled={locked}
                title={locked ? tx.unlocks(MIN_FIRST) : undefined}
                onClick={() => {
                  setLast(null)
                  setStep(1)
                }}
              >
                {locked ? tx.lockedNext(MIN_FIRST - n) : tx.nextMany}
              </button>
            </div>
          </>
        }
      >
        <div className="ck-main nr-main">
          {guide.view}
          {panel(!guess)}
          <BellChart series={[{ key: 'a', values }]} domain={ax.domain} bin={ax.bin} ticks={ax.ticks} tickFmt={signed} lastKey="a" labels={chartLabels} aria={tx.chartAria(kNow, n)} />
        </div>
      </Stage>
    )
  }

  // ---------- 2. More synapses ----------
  if (step === 1) {
    const st = stats(values)
    let hint = tx.hintFire
    if (n) {
      hint = tx.shape[k](big(allSame(k)))
      if (n >= 5 && st.sd > 0) hint += ` ${tx.sdNow(num(st.sd, 1), num(Math.sqrt(k), Number.isInteger(Math.sqrt(k)) ? 0 : 2))}`
    }
    const bellDone = Math.max(results[16].length, results[64].length) >= MIN_BELL
    return (
      <Stage
        {...common}
        say={
          <p>
            <strong>{tx.sayManyStrong}</strong> {tx.sayMany}
          </p>
        }
        bar={
          <>
            <div className="segmented pg-groups" role="group" aria-label={tx.synapsesGroup} data-tour="synapses">
              <span className="pg-groups-label">{tx.synapsesGroup}</span>
              {SYNAPSES.map((kk) => (
                <button
                  key={kk}
                  type="button"
                  className={k === kk ? 'is-active' : ''}
                  aria-pressed={k === kk}
                  onClick={() => {
                    setK(kk)
                    setLast(null)
                  }}
                >
                  {kk}
                </button>
              ))}
            </div>
            <div className="legend">
              <span className="legend-item ck-key is-a">{tx.count(n)}</span>
              {n >= 5 && <span className="legend-item bell-key">{tx.bellKey}</span>}
            </div>
          </>
        }
        foot={
          <>
            <div className="nd-feedback" data-tour="feedback" aria-live="polite">
              <p className="nd-hint">{hint}</p>
              {!bellDone && <p className="nd-fact">{tx.toUnlock(MIN_BELL)}</p>}
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className={`btn btn-primary ${bellDone ? 'nd-glow' : 'ck-next'}`} disabled={!bellDone} title={bellDone ? undefined : tx.toUnlock(MIN_BELL)} onClick={() => setStep(2)}>
                {tx.nextWhy}
              </button>
            </div>
          </>
        }
      >
        <div className="ck-main nr-main">
          {guide.view}
          {panel(false)}
          <BellChart key={k} series={[{ key: 'a', values }]} domain={ax.domain} bin={ax.bin} ticks={ax.ticks} tickFmt={signed} fit lastKey="a" labels={chartLabels} aria={tx.chartAria(k, n)} />
        </div>
      </Stage>
    )
  }

  // ---------- 3. Why bells? ----------
  return (
    <Stage
      {...common}
      say={
        <p>
          <strong>{tx.whyStrong}</strong> {tx.whySay(big(SIM))}
        </p>
      }
      bar={
        <div className="tools">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSeed((s) => s + 1)}>
            {tx.again}
          </button>
        </div>
      }
      foot={
        <>
          <div className="nd-feedback is-good" data-tour="feedback" aria-live="polite">
            <p className="nd-hint">{tx.whyHint}</p>
            <p className="nd-fact">{tx.whyFact}</p>
            <p className="nd-fact">{tx.whyNot}</p>
          </div>
          <div className="actions">
            {allTopics}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setResults(emptyResults())
                setGuess(null)
                setLast(null)
                setK(2)
                setStep(0)
              }}
            >
              {tc.playAgain}
            </button>
          </div>
        </>
      }
    >
      <div className="nr-multiples" data-tour="chart">
        {guide.view}
        {sims.map((s) => {
          const a = axis(s.k)
          return (
            <figure key={s.k} className="nr-multiple">
              <figcaption>{tx.synapsesChip(s.k)}</figcaption>
              <BellChart series={[{ key: 'a', values: s.values }]} domain={a.domain} bin={a.bin} ticks={smallTicks(s.k, a.ticks)} tickFmt={signed} fit bars small aria={tx.chartAria(s.k, SIM)} />
            </figure>
          )
        })}
      </div>
    </Stage>
  )
}

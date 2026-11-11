import { useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { num, pct, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import CategoryChart from './CategoryChart.jsx'
import { COLOURS, CROWD_COLOURS, CROWD_NUMBERS, NUMBERS, colourModes, meanColour, numberStats, total, withYou } from './blue.js'
import { BLUE } from './blueText.js'

// Topic 01, game 3: "Pick a random number" (the blue-seven effect).
//   1. Choose: a number from 1 to 10 "at random", then a colour
//   2. The crowd: 200 simulated people + you; 7 towers over the "if random" line → the mode
//   3. Colours: blue is the mode; no median (no order), and the "mean colour" is mud

const TOUR_IDS = ['choose', 'crowd', 'colours']
const TOUR_TARGETS = {
  choose: [null, 'task', 'steps'],
  crowd: ['chart', 'chart', 'chart'],
  colours: ['chart', 'mean'],
}

export default function BlueSeven() {
  const tx = useText(BLUE)
  const tc = useText(COMMON)
  const [step, setStep] = useState(0)
  const [number, setNumber] = useState(null)
  const [colour, setColour] = useState(null)

  const tourId = TOUR_IDS[step]
  const guide = useGuide(`blue-${tourId}`, TOUR_TARGETS[tourId], tx.tour[tourId], {
    doneLabel: step === 0 ? tx.tourPlay : undefined,
  })
  const allTopics = (
    <Link to="/topics" className="btn btn-ghost">
      {tc.allTopics}
    </Link>
  )
  const share = (k, of) => pct(num((100 * k) / of, 0))

  // ---------- 1. Choose ----------
  if (step === 0) {
    const ready = number !== null && colour !== null
    return (
      <Stage
        title={tx.title}
        className="bs-stage"
        steps={tx.steps}
        current={0}
        onGuide={guide.start}
        say={
          <p>
            <strong>{tx.sayStrong}</strong> {tx.say}
          </p>
        }
        foot={
          <>
            <p className="ck-flash" aria-live="polite">
              {ready ? tx.yourAnswers(number, tx.colours[colour]) : tx.pickBoth}
            </p>
            <div className="actions">
              {allTopics}
              <button type="button" className={`btn btn-primary${ready ? ' nd-glow' : ' ck-next'}`} disabled={!ready} onClick={() => setStep(1)}>
                {tx.nextCrowd}
              </button>
            </div>
          </>
        }
      >
        <div className="bs-main" data-tour="task">
          {guide.view}
          <fieldset className="bs-q">
            <legend>{tx.qNumber}</legend>
            <div className="bs-numbers">
              {NUMBERS.map((v) => (
                <button key={v} type="button" className={`bs-num${number === v ? ' is-on' : ''}`} aria-pressed={number === v} onClick={() => setNumber(v)}>
                  {v}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className={`bs-q${number === null ? ' is-later' : ''}`} disabled={number === null}>
            <legend>{tx.qColour}</legend>
            <div className="bs-colours">
              {COLOURS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`bs-colour${colour === c.key ? ' is-on' : ''}`}
                  aria-pressed={colour === c.key}
                  onClick={() => setColour(c.key)}
                >
                  <span className="bs-swatch" style={{ background: c.hex }} aria-hidden="true" />
                  {tx.colours[c.key]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </Stage>
    )
  }

  // ---------- 2. The crowd ----------
  if (step === 1) {
    const counts = withYou(CROWD_NUMBERS, number)
    const n = total(counts)
    const st = numberStats(counts)
    const at = (v) => v - NUMBERS[0] // position of a digit among the bars (also between two bars)
    return (
      <Stage
        title={tx.title}
        className="bs-stage"
        steps={tx.steps}
        current={1}
        onGuide={guide.start}
        say={
          <p>
            <strong>{tx.crowdStrong(share(counts[7], n))}</strong> {tx.crowdSay}
          </p>
        }
        bar={
          <div className="legend" data-tour="legend">
            <span className="legend-item ds-key-bar">{tx.keyCrowd}</span>
            <span className="legend-item bs-key-you">{tx.keyYou}</span>
            <span className="legend-item ds-key-mode">{tx.keyMode}</span>
            <span className="legend-item bs-key-chance">{tx.keyChance}</span>
          </div>
        }
        foot={
          <>
            <div className="nd-feedback" data-tour="feedback" aria-live="polite">
              <p className="nd-hint">{number === 7 ? tx.youSeven : tx.youOther(number)}</p>
              <p className="nd-fact">{tx.crowdFact(num(st.median, Number.isInteger(st.median) ? 0 : 1), num(st.mean, 1))}</p>
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                {tx.nextColours}
              </button>
            </div>
          </>
        }
      >
        <div className="bs-main is-chart">
          {guide.view}
          <CategoryChart
            bars={NUMBERS.map((v) => ({ key: v, label: String(v), count: counts[v] ?? 0 }))}
            you={number}
            modes={st.modes}
            lines={[
              { key: 'median', at: at(st.median), label: tx.markMedian(num(st.median, Number.isInteger(st.median) ? 0 : 1)) },
              { key: 'mean', at: at(st.mean), label: tx.markMean(num(st.mean, 1)) },
            ]}
            chance={n / NUMBERS.length}
            labels={{ you: tx.you, mode: tx.markMode(st.modes.join(', ')), chance: tx.chance }}
            aria={tx.aria(tx.ariaNumbers)}
          />
        </div>
      </Stage>
    )
  }

  // ---------- 3. Colours ----------
  const counts = withYou(CROWD_COLOURS, colour)
  const n = total(counts)
  const modes = colourModes(counts)
  const mud = meanColour(counts)
  return (
    <Stage
      title={tx.title}
      className="bs-stage"
      steps={tx.steps}
      current={2}
      onGuide={guide.start}
      say={
        <p>
          <strong>{tx.coloursStrong(modes.map((k) => tx.colours[k]).join(' / '), share(counts[modes[0]], n))}</strong> {tx.coloursSay}
        </p>
      }
      foot={
        <>
          <div className="nd-feedback is-good" data-tour="feedback" aria-live="polite">
            <div className="bs-mean" data-tour="mean">
              <span className="bs-mean-swatch" style={{ background: mud }} aria-hidden="true" />
              <p className="nd-hint">
                {tx.meanTitle} <span className="bs-mean-name">{tx.meanSwatch}</span>, {tx.meanFact}
              </p>
            </div>
            <p className="nd-fact">
              {tx.noMedian} {tx.youColour(tx.colours[colour])}
            </p>
            <p className="nd-fact">{tx.crowdNote}</p>
          </div>
          <div className="actions">
            {allTopics}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setNumber(null)
                setColour(null)
                setStep(0)
              }}
            >
              {tc.playAgain}
            </button>
          </div>
        </>
      }
    >
      <div className="bs-main is-chart">
        {guide.view}
        <CategoryChart
          bars={COLOURS.map((c) => ({ key: c.key, label: tx.colours[c.key], count: counts[c.key] ?? 0, fill: c.hex }))}
          you={colour}
          modes={modes}
          labels={{ you: tx.you, mode: tx.markMode(modes.map((k) => tx.colours[k]).join(' / ')) }}
          aria={tx.aria(tx.ariaColours)}
        />
      </div>
    </Stage>
  )
}

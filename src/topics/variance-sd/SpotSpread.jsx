import TrainShell from '../../components/TrainShell.jsx'
import { num, useText } from '../../i18n.jsx'
import SpreadSpotChart from './SpreadSpotChart.jsx'
import { CLOSE, PILES, axisOf, fmtShare, fmtValue, grade, kindOf, makeRound, newGame, summary } from './spotSpread.js'
import { SSPREAD } from './spotSpreadText.js'

// Topic 02, Train your eye: "Spot the spread" (/topics/variance-sd/spot-the-spread).
// 10 rounds: tap where the mean + 1 SD of a pile is, or which of two piles has the bigger SD (traps:
// same range, two clusters, more dots). The end says whether the student's SDs were too wide (read
// from the outermost dots, like a range) or too narrow. Rounds, sounds and the end screen:
// components/TrainShell.jsx; data: spotSpread.js (simulated).

export default function SpotSpread() {
  const tx = useText(SSPREAD)
  const dataKey = (r) => (r.kind === 'sd' ? r.pile : 'pair')
  const tick = (ax) => (t) => fmtValue({ ...ax, digits: Number.isInteger(t) ? 0 : 1 }, t)
  return (
    <TrainShell
      title={tx.title}
      guideId="spot-spread"
      tour={tx.tour}
      makeGame={newGame}
      kindOf={kindOf}
      makeRound={makeRound}
      level={(r, a) => grade(r, a).level}
      endLink={{ to: '/topics/variance-sd/quiz', label: tx.toQuiz }}
      say={(r) => (
        <p data-tour="question">
          <strong>{tx.question[r.kind]}</strong> {tx.data[dataKey(r)].say}
        </p>
      )}
      chart={({ round, answer, onAnswer }) => {
        const ax = axisOf(round)
        return (
          <SpreadSpotChart
            round={round}
            answer={answer}
            onAnswer={onAnswer}
            fmt={(v) => fmtValue(ax, v)}
            fmtTick={tick(ax)}
            labels={{ ...tx.labels, axis: tx.data[dataKey(round)].axis }}
            aria={tx.chartAria(tx.question[round.kind], tx.data[dataKey(round)].say)}
          />
        )
      }}
      feedback={(r, a) => {
        if (r.kind === 'compare') return <p className="nd-fact">{tx.whyCompare[r.trap]}</p>
        const g = grade(r, a)
        const k = Math.round(r.within * r.values.length)
        return (
          <p className="nd-fact">
            {g.err > CLOSE && <strong className="spot-warn">{tx.tooFar} </strong>}
            {g.err < -CLOSE && <strong className="spot-warn">{tx.tooNear} </strong>}
            {tx.within(k, r.values.length, fmtShare(r.within))} {tx.whySd[PILES[r.pile].shape]}
          </p>
        )
      }}
      end={(rounds, answers) => {
        const s = summary(rounds, answers)
        return (
          <>
            <p>{tx.endCompare(s.compareRight, s.compareN)}</p>
            <p>{s.ratio > 1.2 ? tx.endWide(num(s.ratio, 1)) : s.ratio < 0.83 ? tx.endNarrow(num(s.ratio * 100, 0)) : tx.endGood}</p>
          </>
        )
      }}
    />
  )
}

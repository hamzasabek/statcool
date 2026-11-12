import TrainShell from '../../components/TrainShell.jsx'
import { num, useText } from '../../i18n.jsx'
import SpotChart from './SpotChart.jsx'
import { CLOSE, SCENARIOS, fmtValue, grade, newGame, summary } from './spot.js'
import { SPOT } from './spotText.js'

// Topic 01, Train your eye: "Spot the centre" (/topics/mean-median/spot-the-centre).
// 10 rounds: a pile of dots and one question (mean, median or mode); one tap answers, the answer
// shows at once with why; at the end, how close the student was and whether their means sat too
// close to the peak of skewed data (the classic slip). Simulated data (spot.js). The rounds, the
// sounds and the end screen come from components/TrainShell.jsx.

export default function SpotCentre() {
  const tx = useText(SPOT)
  return (
    <TrainShell
      title={tx.title}
      guideId="spot-centre"
      tour={tx.tour}
      makeGame={newGame}
      level={(r, a) => grade(r, a).level}
      endLink={{ to: '/topics/mean-median/quiz', label: tx.toQuiz }}
      say={(r) => (
        <p data-tour="question">
          <strong>{tx.question[r.stat]}</strong> {tx.data[r.scenario].say}
        </p>
      )}
      chart={({ round, answer, onAnswer }) => (
        <SpotChart
          round={round}
          guess={answer}
          onGuess={onAnswer}
          fmt={(v) => fmtValue(round.scenario, v)}
          labels={{ ...tx.labels, axis: tx.data[round.scenario].axis }}
          aria={tx.chartAria(tx.question[round.stat], tx.data[round.scenario].say)}
        />
      )}
      feedback={(r, a) => {
        const sc = SCENARIOS[r.scenario]
        const g = grade(r, a)
        const towardTail = sc.shape === 'left' ? -g.err : g.err
        const nearPeak = r.stat === 'mean' && sc.shape !== 'sym' && towardTail < -CLOSE
        return (
          <p className="nd-fact">
            {nearPeak && <strong className="spot-warn">{tx.nearPeak} </strong>}
            {tx.why[r.stat][r.stat === 'mode' ? 'sym' : sc.shape]}
          </p>
        )
      }}
      end={(rounds, answers) => {
        const s = summary(rounds, answers)
        const b = num(Math.abs(s.bias), 1)
        return (
          <>
            <p>{tx.endErrs(num(s.meanErr, 1), num(s.medianErr, 1))}</p>
            <p>{s.bias < -CLOSE / 2 ? tx.biasPeak(b) : s.bias > CLOSE / 2 ? tx.biasTail(b) : tx.biasNone}</p>
          </>
        )
      }}
    />
  )
}

import TrainShell from '../../components/TrainShell.jsx'
import { num, useText } from '../../i18n.jsx'
import ReadBellChart from './ReadBellChart.jsx'
import { BELLS, CLOSE, fmtSd, grade, newGame, summary } from './readBell.js'
import { fmtArea, fmtV } from './normal.js'
import { RBELL } from './readBellText.js'

// Topic 03, Train your eye: "Read the bell" (/topics/normal-distribution/read-the-bell).
// 10 rounds on a drawn normal curve: tap the point with a given share of the area to its left, or
// 1 or 2 SDs from the mean; the area is shaded at once. The end says whether the student puts the
// tails too close to the centre. Rounds, sounds and the end screen: components/TrainShell.jsx.

const WHY = { 0: 'z0', 1: 'z1', '-1': 'zm1', 1.96: 'z196', '-1.96': 'zm196', 3: 'z3' }

export default function ReadBell() {
  const tx = useText(RBELL)
  const question = (r) => (r.kind === 'below' ? tx.below(fmtArea(r.share)) : tx.sd(r.z > 0 ? '+' : '−', num(Math.abs(r.z), 0)))
  return (
    <TrainShell
      title={tx.title}
      guideId="read-bell"
      tour={tx.tour}
      makeGame={newGame}
      simulated={false}
      level={(r, a) => grade(r, a).level}
      endLink={{ to: '/topics/normal-distribution/quiz', label: tx.toQuiz }}
      say={(r) => (
        <p data-tour="question">
          <strong>{question(r)}</strong> {tx.data[r.bell].say}
        </p>
      )}
      chart={({ round, answer, onAnswer }) => {
        const b = BELLS[round.bell]
        return (
          <ReadBellChart
            round={round}
            answer={answer}
            onAnswer={onAnswer}
            fmt={(v) => fmtV(v, b)}
            fmtTick={(t) => fmtV(t, { ...b, digits: Number.isInteger(t) ? 0 : 1 })}
            fmtShare={fmtArea}
            labels={{
              axis: tx.data[round.bell].axis,
              truth: round.kind === 'below' ? tx.truthBelow : tx.truthSd,
              you: round.kind === 'below' ? tx.youBelow : tx.youSd,
            }}
            aria={tx.chartAria(question(round), tx.data[round.bell].say)}
          />
        )
      }}
      feedback={(r, a) => {
        const g = grade(r, a)
        const out = Math.sign(r.z || 1) * g.err // > 0: too far from the mean
        const key = r.kind === 'sd' ? (Math.abs(r.z) === 1 ? 'sd1' : 'sd2') : WHY[r.z]
        return (
          <p className="nd-fact">
            {r.z !== 0 && out > CLOSE && <strong className="spot-warn">{tx.tooFar} </strong>}
            {r.z !== 0 && out < -CLOSE && <strong className="spot-warn">{tx.tooCentral} </strong>}
            {tx.why[key]}
          </p>
        )
      }}
      end={(rounds, answers) => {
        const s = summary(rounds, answers)
        const t = fmtSd(Math.abs(s.tail))
        return (
          <>
            <p>{tx.endAvg(fmtSd(s.avg))}</p>
            <p>{s.tail < -0.2 ? tx.endCentral(t) : s.tail > 0.2 ? tx.endFar(t) : tx.endGood}</p>
          </>
        )
      }}
    />
  )
}

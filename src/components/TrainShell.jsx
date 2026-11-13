import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Stage } from './Stage.jsx'
import { useGuide } from './Tour.jsx'
import { useText } from '../i18n.jsx'
import { sfx, useChime } from '../sound.js'
import { TRAIN } from './trainText.js'
import { MAX_FACTOR, afterAnswer, isMastered } from './trainPlan.js'

// The shell of every "Train your eye" game (quick practice, one per topic): a series of rounds, one
// gesture answers a round, the answer and why show at once, Enter (or the button) goes on, and an
// end screen sums up. The game gives what is specific:
//   title, guideId, tour        : page title, tour id, tour texts (targets: intro, question, chart, feedback)
//   makeGame()                  : the first list of rounds (every kind of question comes up at least twice)
//   kindOf(round)               : the kind of question of a round ('mean', 'tail'…): mastery is counted per kind
//   makeRound(kind, from)       : a new round of that kind; `from` = the missed round it replaces (same item,
//                                 new data), or undefined (any item of the kind)
//   level(round, answer)        : 'spot' | 'close' | 'off' (sound: right for spot / close, wrong for off)
//   say(round)                  : the question line (put data-tour="question" on it)
//   chart({ round, answer, onAnswer }) : the chart (data-tour="chart"); answer = null until answered
//   feedback(round, answer)     : the explanation under the grade
//   end(rounds, answers)        : the paragraphs of the end screen (after the score)
//   endLink                     : { to, label } a link on the end screen (e.g. the quiz), optional
//   simulated                   : show the "Simulated data" note (default true)
//   fastSec                     : "fast" = answered within this many seconds (default 12)
//
// Practice follows Kellman's perceptual learning modules ([@kellman2010]; [@mettler2016]):
//  - mastery: a kind is mastered after STREAK answers in a row that are right (spot on or close) AND
//    fast; the set ends when every kind is mastered (or at MAX_FACTOR × the first list);
//  - adaptive spacing: after a miss the kind comes back after 2 other rounds, after a right but slow
//    answer after 3, after a right and fast answer (not yet mastered) after 5; a mastered kind stops.

export default function TrainShell({ title, guideId, tour, makeGame, kindOf, makeRound, level, say, chart, feedback, end, endLink, simulated = true, fastSec = 12 }) {
  const tc = useText(TRAIN)
  const [rounds, setRounds] = useState(makeGame)
  const [answers, setAnswers] = useState([])
  const [sharp, setSharp] = useState([]) // per answered round: right and fast
  const [i, setI] = useState(0)
  const [ended, setEnded] = useState(false)
  const [game, setGame] = useState(0) // a new game remounts the chart
  const [kinds, setKinds] = useState(() => [...new Set(rounds.map(kindOf))])
  const [maxRounds, setMaxRounds] = useState(() => rounds.length * MAX_FACTOR)
  const startRef = useRef(performance.now())
  const guide = useGuide(guideId, [null, 'question', 'chart', 'feedback'], tour, { place: { feedback: 'top' }, doneLabel: tc.tourPlay })
  const n = rounds.length
  useChime(ended ? 1 : 0, 1) // the set is over
  useEffect(() => {
    startRef.current = performance.now() // the clock of a round starts when it appears
  }, [game, i])

  const mastered = kinds.filter((k) => isMastered(rounds, sharp, k, kindOf)).length

  const round = rounds[i]
  const answer = answers[i] ?? null
  const answered = answer !== null
  const last = i === n - 1
  const levels = answers.map((a, k) => level(rounds[k], a))
  const good = levels.filter((l) => l !== 'off').length

  function onAnswer(v) {
    if (answered || ended) return
    const lv = level(round, v)
    const fast = performance.now() - startRef.current <= fastSec * 1000
    const sh = [...sharp, lv !== 'off' && fast]
    const rs = afterAnswer({ rounds, i, sharp: sh, right: lv !== 'off', fast, kindOf, makeRound, maxRounds })
    setRounds(rs)
    setAnswers((a) => [...a, v])
    setSharp(sh)
    if (lv === 'off') sfx.wrong()
    else sfx.right()
  }
  function next() {
    if (!answered) return
    if (last) setEnded(true)
    else setI(i + 1)
  }
  function again() {
    const first = makeGame()
    setRounds(first)
    setKinds([...new Set(first.map(kindOf))])
    setMaxRounds(first.length * MAX_FACTOR)
    setAnswers([])
    setSharp([])
    setI(0)
    setEnded(false)
    setGame((g) => g + 1)
  }

  // Enter goes on once the round is answered (not when a button, a link or the chart has the focus:
  // they use Enter themselves).
  const nextRef = useRef(next)
  nextRef.current = next
  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Enter' || e.repeat) return
      if (e.target instanceof Element && e.target.closest('button, a, svg')) return
      nextRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ---------- The end ----------
  if (ended)
    return (
      <Stage
        title={title}
        className="spot-stage"
        onGuide={guide.start}
        say={<p>{tc.endSay(n)}</p>}
        foot={
          <div className="actions">
            {endLink && (
              <Link to={endLink.to} className="btn btn-ghost">
                {endLink.label}
              </Link>
            )}
            <button type="button" className="btn btn-primary" onClick={again}>
              {tc.again}
            </button>
          </div>
        }
      >
        {guide.view}
        <div className="spot-end" data-tour="feedback">
          <h2>{tc.endTitle}</h2>
          <p className="spot-end-score">{tc.endScore(good, n)}</p>
          <p>{tc.endMastery(mastered, kinds.length, fastSec)}</p>
          <ol className="qz-progress spot-dots" aria-hidden="true">
            {levels.map((l, k) => (
              <li key={k} className={l === 'off' ? 'is-wrong' : 'is-right'} />
            ))}
          </ol>
          {end(rounds, answers)}
        </div>
      </Stage>
    )

  // ---------- A round ----------
  const lv = answered ? level(round, answer) : null
  return (
    <Stage
      title={title}
      className="spot-stage"
      onGuide={guide.start}
      say={say(round)}
      bar={
        <div className="legend">
          <span className="legend-item ck-key is-b">{tc.count(i + 1)}</span>
          <span className="ck-stats" title={tc.masteryRule(fastSec)}>
            {tc.score(good)} · {tc.mastered(mastered, kinds.length)}
          </span>
          {simulated && <span className="spot-sim">{tc.simulated}</span>}
        </div>
      }
      foot={
        <>
          <div className="nd-feedback" data-tour="feedback" aria-live="polite">
            {answered ? (
              <>
                <p className={`nd-hint spot-grade is-${lv}`}>{tc.grade[lv]}</p>
                {feedback(round, answer)}
              </>
            ) : (
              <p className="nd-hint muted">{tc.hint}</p>
            )}
          </div>
          <div className="actions">
            <button type="button" className={`btn btn-primary ${answered ? 'nd-glow' : 'ck-next'}`} disabled={!answered} onClick={next} title={tc.keyHint}>
              {last ? tc.results : tc.next}
            </button>
          </div>
        </>
      }
    >
      {guide.view}
      <Fragment key={`${game}-${i}`}>{chart({ round, answer, onAnswer })}</Fragment>
    </Stage>
  )
}

import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Stage } from './Stage.jsx'
import { useGuide } from './Tour.jsx'
import { useText } from '../i18n.jsx'
import { sfx, useChime } from '../sound.js'
import { TRAIN } from './trainText.js'

// The shell of every "Train your eye" game (quick practice, one per topic): a series of rounds, one
// gesture answers a round, the answer and why show at once, Enter (or the button) goes on, and an
// end screen sums up. The game gives what is specific:
//   title, guideId, tour        : page title, tour id, tour texts (targets: intro, question, chart, feedback)
//   makeGame()                  : a new list of rounds
//   level(round, answer)        : 'spot' | 'close' | 'off' (sound: right for spot / close, wrong for off)
//   say(round)                  : the question line (put data-tour="question" on it)
//   chart({ round, answer, onAnswer }) : the chart (data-tour="chart"); answer = null until answered
//   feedback(round, answer)     : the explanation under the grade
//   end(rounds, answers)        : the paragraphs of the end screen (after the score)
//   endLink                     : { to, label } a link on the end screen (e.g. the quiz), optional
//   simulated                   : show the "Simulated data" note (default true)

export default function TrainShell({ title, guideId, tour, makeGame, level, say, chart, feedback, end, endLink, simulated = true }) {
  const tc = useText(TRAIN)
  const [rounds, setRounds] = useState(makeGame)
  const [answers, setAnswers] = useState([])
  const [i, setI] = useState(0)
  const [ended, setEnded] = useState(false)
  const [game, setGame] = useState(0) // a new game remounts the chart
  const guide = useGuide(guideId, [null, 'question', 'chart', 'feedback'], tour, { place: { feedback: 'top' }, doneLabel: tc.tourPlay })
  const n = rounds.length
  useChime(answers.length, n) // the last round answered

  const round = rounds[i]
  const answer = answers[i] ?? null
  const answered = answer !== null
  const last = i === n - 1
  const levels = answers.map((a, k) => level(rounds[k], a))
  const good = levels.filter((l) => l !== 'off').length

  function onAnswer(v) {
    if (answered || ended) return
    setAnswers((a) => [...a, v])
    if (level(round, v) === 'off') sfx.wrong()
    else sfx.right()
  }
  function next() {
    if (!answered) return
    if (last) setEnded(true)
    else setI(i + 1)
  }
  function again() {
    setRounds(makeGame())
    setAnswers([])
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
          <span className="legend-item ck-key is-b">{tc.count(i + 1, n)}</span>
          <span className="ck-stats">{tc.score(good)}</span>
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

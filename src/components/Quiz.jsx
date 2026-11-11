import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { MotionConfig, motion } from 'motion/react'
import { Stage } from './Stage.jsx'
import { useGuide } from './Tour.jsx'
import { num, useLang, useText } from '../i18n.jsx'
import { QUIZ_UI } from './quizText.js'

// A topic's quiz: one question at a time, multiple choice. After an answer the right option turns
// green (yours red if wrong) and a short explanation appears; the dots at the bottom keep the score.
// At the end: the score and a review of every question. Keyboard: 1–4 (or A–D) answer, Enter goes on.
//   questions : the bank, { en: [...], fr: [...] }, each { q, figure?, options, answer, why } (see
//               topics/mean-median/quiz.js)
//   count     : how many questions to draw from the bank at each attempt (default: all). The draw
//               keeps the bank's order (it goes from basics to harder ideas), and the options of each
//               question are shuffled, so the right answer is not always in the same place. "Try
//               again" draws a new set.
//   title     : the page title (per language: { en, fr })
//   topic     : the topic's slug (the "back to the games" link)
//   guideId   : the id of the guided tour (seen once per browser)

const LETTERS = ['A', 'B', 'C', 'D']
const DROP = { type: 'spring', stiffness: 420, damping: 24, mass: 0.9 }

const shuffle = (a) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}
// One attempt: which questions of the bank (in bank order) and, for each, the order of its options.
function draw(bank, count) {
  const picked = shuffle(bank.map((_, k) => k))
    .slice(0, Math.min(count ?? bank.length, bank.length))
    .sort((a, b) => a - b)
  return picked.map((k) => ({ k, order: shuffle(bank[k].options.map((_, o) => o)) }))
}

export default function Quiz({ questions, title, topic, guideId, count }) {
  const tx = useText(QUIZ_UI)
  const { lang } = useLang()
  const bank = useText(questions)
  const [set, setSet] = useState(() => draw(bank, count))
  // This attempt's questions, options in their shuffled order (the same order in both languages).
  const qs = set.map(({ k, order }) => {
    const b = bank[k]
    return { ...b, options: order.map((o) => b.options[o]), answer: order.indexOf(b.answer) }
  })
  const [i, setI] = useState(0)
  const [picks, setPicks] = useState(() => qs.map(() => null))
  const [done, setDone] = useState(false)
  const guide = useGuide(guideId, [null, 'question', 'options', 'progress'], tx.tour, { doneLabel: tx.tourDone })

  const q = qs[i]
  const pick = picks[i]
  const answered = pick !== null
  const score = picks.filter((p, k) => p === qs[k].answer).length
  const last = i === qs.length - 1

  function choose(k) {
    if (answered || done) return
    setPicks((p) => p.map((x, j) => (j === i ? k : x)))
  }
  function next() {
    if (!answered) return
    if (last) setDone(true)
    else setI(i + 1)
  }
  function restart() {
    const next = draw(bank, count)
    setSet(next)
    setPicks(next.map(() => null))
    setI(0)
    setDone(false)
  }

  // Keyboard: 1–4 or A–D answer, Enter goes on.
  const keyRef = useRef(null)
  keyRef.current = (e) => {
    if (done || e.ctrlKey || e.metaKey || e.altKey) return
    if (e.target instanceof HTMLElement && e.target.closest('input, textarea')) return
    const k = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase())
    if (k >= 0 && k < q.options.length && e.key.length === 1) {
      choose(k)
      e.preventDefault()
    } else if (e.key === 'Enter' && answered && !(e.target instanceof HTMLElement && e.target.closest('button, a'))) {
      next()
      e.preventDefault()
    }
  }
  useEffect(() => {
    const onKey = (e) => keyRef.current(e)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const back = (
    <Link to={`/topics/${topic}`} className="btn btn-ghost">
      {tx.toGames}
    </Link>
  )
  const progress = (
    <ol className="qz-progress" aria-label={tx.progressLabel} data-tour="progress">
      {qs.map((qq, k) => {
        const p = picks[k]
        const state = p === null ? (k === i && !done ? 'is-now' : '') : p === qq.answer ? 'is-right' : 'is-wrong'
        return <li key={k} className={state} aria-label={tx.dotLabel(k + 1, p === null ? null : p === qq.answer)} />
      })}
    </ol>
  )

  // ---------- The score ----------
  if (done) {
    const share = score / qs.length
    const msg = share === 1 ? tx.perfect : share >= 0.75 ? tx.great : share >= 0.5 ? tx.good : tx.again
    return (
      <Stage title={title[lang]} className="qz-stage" onGuide={guide.start} say={<p>{tx.endSay}</p>} foot={
        <div className="actions">
          {back}
          <button type="button" className="btn btn-primary" onClick={restart}>
            {tx.restart}
          </button>
        </div>
      }>
        {guide.view}
        <div className="qz-main">
          <section className="qz-card qz-score">
            <p className="qz-score-num">
              {score} <span>/ {qs.length}</span>
            </p>
            <p className="qz-score-msg">{msg}</p>
            {progress}
          </section>
          <ol className="qz-review">
            {qs.map((qq, k) => {
              const ok = picks[k] === qq.answer
              return (
                <li key={k} className={ok ? 'is-right' : 'is-wrong'}>
                  <span className="qz-review-mark" aria-hidden="true">
                    {ok ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className="qz-review-q">{qq.q}</p>
                    <p className="qz-review-a">
                      {ok ? tx.youRight(qq.options[qq.answer]) : tx.youWrong(qq.options[picks[k]], qq.options[qq.answer])}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </Stage>
    )
  }

  // ---------- A question ----------
  const right = answered && pick === q.answer
  return (
    <Stage
      title={title[lang]}
      className="qz-stage"
      onGuide={guide.start}
      say={
        <p>
          <strong>{tx.counter(i + 1, qs.length)}</strong> {tx.scoreSoFar(score, picks.filter((p) => p !== null).length)}
        </p>
      }
      foot={
        <>
          {progress}
          <div className="actions">
            {back}
            <button type="button" className={`btn btn-primary${answered ? ' nd-glow' : ' ck-next'}`} disabled={!answered} onClick={next}>
              {last ? tx.seeScore : tx.nextQuestion}
            </button>
          </div>
        </>
      }
    >
      {guide.view}
      <div className="qz-main">
        <section key={i} className="qz-card" data-tour="question">
          <h2 className="qz-q">{q.q}</h2>
          {q.figure && <QuizFigure figure={q.figure} />}
          <div className="qz-options" role="group" aria-label={tx.optionsLabel} data-tour="options">
            {q.options.map((o, k) => {
              let state = ''
              if (answered && k === q.answer) state = ' is-right'
              else if (answered && k === pick) state = ' is-wrong'
              else if (answered) state = ' is-off'
              return (
                <button key={k} type="button" className={`qz-opt${state}`} disabled={answered} aria-pressed={k === pick} onClick={() => choose(k)}>
                  <span className="qz-letter" aria-hidden="true">
                    {answered && k === q.answer ? '✓' : answered && k === pick ? '✗' : LETTERS[k]}
                  </span>
                  {o}
                </button>
              )
            })}
          </div>
          {answered && (
            <div className={`qz-why${right ? ' is-right' : ' is-wrong'}`} aria-live="polite">
              <strong>{right ? tx.right : tx.wrong}</strong> {q.why}
            </div>
          )}
        </section>
      </div>
    </Stage>
  )
}

// A small dot plot for a question: the values stacked on a number line (they fall in like the
// dots of the games).
function QuizFigure({ figure }) {
  const ref = useRef(null)
  const [width, setWidth] = useState(560)
  useLayoutEffect(() => {
    const el = ref.current
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const { values, domain: [lo, hi], step, unit } = figure
  const cols = Math.round((hi - lo) / step) + 1
  const W = Math.max(220, width)
  const colW = (W - 24) / cols
  const xOf = (v) => 12 + ((v - lo) / step + 0.5) * colW
  const counts = {}
  const dots = values.map((v, k) => ({ v, k, level: (counts[v] = (counts[v] ?? 0) + 1) - 1 }))
  const cap = Math.max(4, ...Object.values(counts))
  const H = 128
  const base = H - 26
  const size = Math.min(colW, (base - 8) / cap, 18)
  const r = Math.max(2.5, size / 2 - 0.75)
  const every = Math.max(1, Math.ceil(cols / Math.max(2, Math.floor((W - 24) / 44))))
  const ticks = Array.from({ length: cols }, (_, k) => lo + k * step).filter((_, k) => k % every === 0)
  return (
    <div ref={ref} className="qz-figure">
      <MotionConfig reducedMotion="user">
        <svg className="chart" width={W} height={H} role="img" aria-label={values.join(', ')}>
          {dots.map((d) => (
            <motion.circle
              key={d.k}
              className="ck-dot is-a"
              initial={{ cx: xOf(d.v), cy: 0, r, opacity: 0 }}
              animate={{ cx: xOf(d.v), cy: base - (d.level + 0.5) * size, r, opacity: 1 }}
              transition={{ ...DROP, delay: d.k * 0.025 }}
            />
          ))}
          <line className="axis-line" x1={12} x2={W - 12} y1={base} y2={base} />
          {ticks.map((v) => (
            <text key={v} className="tick-label" x={xOf(v)} y={base + 18} textAnchor="middle">
              {num(v)}
              {unit && v === ticks[ticks.length - 1] ? ` ${unit}` : ''}
            </text>
          ))}
        </svg>
      </MotionConfig>
    </div>
  )
}

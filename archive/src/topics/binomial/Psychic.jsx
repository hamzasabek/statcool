import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import BinomChart from './BinomChart.jsx'
import {
  CLASS,
  MAX_ROUNDS,
  N,
  N_CHOICES,
  P,
  P_CHOICES,
  REVEAL_MS,
  THRESHOLDS,
  atLeast,
  fmtNum,
  fmtShare,
  simulateClass,
} from './binom.js'
import { BIN } from './text.js'

// Topic 05 "The binomial distribution": are you psychic?
//   1. Guess the card: 2 cards, one hides a star; 10 guesses per round; the score is a dot.
//   2. The class: 100 simulated classmates guess by chance; their scores build the binomial
//      shape (expected counts as a line). Explore n (10 / 20 / 50) and p (½ ¼ ⅕).
//   3. Psychic?: how often pure guessing scores k/10 or more (a first p-value).

const newStar = () => (Math.random() < 0.5 ? 0 : 1)
const share = (x) => fmtShare(x, x < 0.1 ? 1 : 0) // 5.5 %, but 17 %

function Card({ side, star, picked, revealed, disabled, label, onPick }) {
  const isStar = revealed && star === side
  return (
    <button
      type="button"
      className={`bn-card${revealed ? ' is-open' : ''}${picked ? ' is-picked' : ''}${isStar ? ' is-star' : ''}`}
      disabled={disabled}
      aria-label={label}
      onClick={() => onPick(side)}
    >
      <span className="bn-card-face" aria-hidden="true">
        {isStar ? '★' : ''}
      </span>
    </button>
  )
}

export default function Psychic() {
  const tx = useText(BIN)
  const tc = useText(COMMON)
  const [step, setStep] = useState(0)
  const [rounds, setRounds] = useState([]) // your scores out of N
  const [guesses, setGuesses] = useState([]) // this round: { pick, star, ok }
  const [phase, setPhase] = useState('pick') // pick | reveal | over
  const [star, setStar] = useState(newStar)
  const [n, setN] = useState(N)
  const [p, setP] = useState(P)
  const [k, setK] = useState(8)
  const [classBase, setClassBase] = useState([]) // 100 scores for n = 10, p = ½ (steps 2 and 3)
  const [shown, setShown] = useState(0) // class dots revealed so far (drop animation)
  const timer = useRef(null)
  const samples = useRef({}) // other (n, p) classes, made on demand

  useEffect(() => () => clearTimeout(timer.current), [])

  // ---------- 1. Guess the card ----------
  function pick(side) {
    if (step !== 0 || phase !== 'pick') return
    const g = { pick: side, star, ok: side === star }
    const next = [...guesses, g]
    setGuesses(next)
    setPhase('reveal')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (next.length >= N) {
        setRounds((rs) => [...rs, next.filter((x) => x.ok).length])
        setPhase('over')
      } else {
        setStar(newStar())
        setPhase('pick')
      }
    }, REVEAL_MS)
  }

  function anotherRound() {
    setGuesses([])
    setStar(newStar())
    setPhase('pick')
  }

  // ← / → choose a card
  const pickRef = useRef(pick)
  pickRef.current = pick
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (e.target instanceof HTMLElement && e.target.closest('input')) return
        e.preventDefault()
        pickRef.current(e.key === 'ArrowLeft' ? 0 : 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function goClass() {
    clearTimeout(timer.current)
    if (!classBase.length) setClassBase(simulateClass(N, P))
    setStep(1)
  }

  function playAgain() {
    clearTimeout(timer.current)
    setRounds([])
    setGuesses([])
    setStar(newStar())
    setPhase('pick')
    setN(N)
    setP(P)
    setK(8)
    setClassBase([])
    samples.current = {}
    setStep(0)
  }

  // The class for the chosen n and p (n = 10, p = ½ is the one the student played).
  const isGame = n === N && p === P
  const classScores = useMemo(() => {
    if (step === 0) return []
    if (step === 2 || isGame) return classBase
    const key = `${n}-${p}`
    if (!samples.current[key]) samples.current[key] = simulateClass(n, p)
    return samples.current[key]
  }, [step, n, p, isGame, classBase])

  // Drop the class in, a few dots at a time, whenever the class changes.
  useEffect(() => {
    if (!classScores.length) return undefined
    setShown(0)
    const id = setInterval(() => {
      setShown((s) => {
        if (s >= classScores.length) {
          clearInterval(id)
          return s
        }
        return s + 4
      })
    }, 24)
    return () => clearInterval(id)
  }, [classScores])

  const you = rounds.map((score, i) => ({ id: i, k: score, kind: 'you' }))
  const cls = classScores.slice(0, shown).map((score, i) => ({ id: i, k: score, kind: 'class' }))
  const allTopics = (
    <Link to="/" className="btn btn-ghost">
      {tc.allTopics}
    </Link>
  )
  const youKey = <span className="legend-item bn-key-you">{tx.youKey}</span>

  if (step === 0) {
    const right = guesses.filter((g) => g.ok).length
    const last = guesses.at(-1)
    const revealed = phase !== 'pick'
    let hint = tx.pickHint
    if (phase === 'over') hint = rounds.length >= MAX_ROUNDS ? tx.maxRounds(MAX_ROUNDS) : tx.roundScore(right, N)
    else if (phase === 'reveal' && last) hint = last.ok ? tx.right : tx.wrong
    else if (guesses.length) hint = tx.roundLeft(right, guesses.length, N)

    return (
      <Stage
        title={tx.title}
        className="mm-stage bn-stage"
        steps={tx.steps}
        current={0}
        say={
          <p>
            <strong>{tx.sayStrong}</strong> {tx.say}
          </p>
        }
        bar={
          <div className="legend">
            {youKey}
            {rounds.length > 0 && <span className="bn-rounds">{tx.roundsKey(rounds.join(', '))}</span>}
          </div>
        }
        foot={
          <>
            <p className={`ck-flash${phase === 'reveal' && last ? (last.ok ? ' is-good-flash' : ' is-warn') : ''}`} aria-live="polite">
              {hint}
            </p>
            <div className="actions">
              {allTopics}
              {phase === 'over' && rounds.length < MAX_ROUNDS && (
                <button type="button" className="btn" onClick={anotherRound}>
                  {tx.anotherRound}
                </button>
              )}
              <button
                type="button"
                className={`btn btn-primary ck-next${phase === 'over' ? ' nd-glow' : ''}`}
                disabled={!rounds.length}
                onClick={goClass}
              >
                {rounds.length ? tx.nextClass : tx.lockedClass}
              </button>
            </div>
          </>
        }
      >
        <div className="mm-main">
          <div className="bn-game">
            <div className="bn-cards">
              {[0, 1].map((side) => (
                <Card
                  key={side}
                  side={side}
                  star={star}
                  picked={revealed && last?.pick === side}
                  revealed={revealed}
                  disabled={phase !== 'pick'}
                  label={tx.cardLabel(side)}
                  onPick={pick}
                />
              ))}
            </div>
            <ol className="bn-progress" aria-hidden="true">
              {Array.from({ length: N }, (_, i) => {
                const g = guesses[i]
                return <li key={i} className={g ? (g.ok ? 'is-ok' : 'is-no') : ''} />
              })}
            </ol>
          </div>
          <BinomChart n={N} points={you} />
        </div>
      </Stage>
    )
  }

  // ---------- 2. The class ----------
  if (step === 1) {
    const pLabel = P_CHOICES.find((c) => c.v === p).label
    let shape = p === 0.5 ? tx.shapeHalf : tx.shapeSkew
    if (n === 50) shape = tx.shapeBell
    return (
      <Stage
        title={tx.title}
        className="mm-stage bn-stage"
        steps={tx.steps}
        current={1}
        say={
          <p>
            <strong>{tx.classStrong(CLASS)}</strong> {tx.classSay}
          </p>
        }
        bar={
          <>
            <div className="bn-controls">
              <span className="bn-control-label">{tx.guessesPer}</span>
              <div className="segmented" role="group" aria-label={tx.guessesPer}>
                {N_CHOICES.map((v) => (
                  <button key={v} type="button" className={n === v ? 'is-active' : ''} aria-pressed={n === v} onClick={() => setN(v)}>
                    {v}
                  </button>
                ))}
              </div>
              <span className="bn-control-label">{tx.chancePer}</span>
              <div className="segmented" role="group" aria-label={tx.chancePer}>
                {P_CHOICES.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    className={p === c.v ? 'is-active' : ''}
                    aria-pressed={p === c.v}
                    onClick={() => setP(c.v)}
                  >
                    {tx.cardsOption(c.label, c.cards)}
                  </button>
                ))}
              </div>
            </div>
            <div className="legend">
              {isGame && youKey}
              <span className="legend-item bn-key-class">{tx.classKey(CLASS)}</span>
              <span className="legend-item bn-key-curve">{tx.expectedKey}</span>
            </div>
          </>
        }
        foot={
          <>
            <div className="nd-feedback" aria-live="polite">
              <p className="nd-hint">
                {tx.average(n, pLabel, fmtNum(n * p, Number.isInteger(n * p) ? 0 : 1))}
                {isGame && tx.yourScores(rounds.join(', '))}
              </p>
              <p className="nd-fact">
                {tx.binomialFact}
                {shape}
              </p>
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                {tx.nextPsychic}
              </button>
            </div>
          </>
        }
      >
        <div className="mm-main">
          <BinomChart n={n} points={isGame ? [...you, ...cls] : cls} curve={{ p, size: CLASS }} />
        </div>
      </Stage>
    )
  }

  // ---------- 3. Psychic? ----------
  const chance = atLeast(k, N, P)
  const inClass = classBase.filter((s) => s >= k).length
  const best = rounds.length ? Math.max(...rounds) : null
  return (
    <Stage
      title={tx.title}
      className="mm-stage bn-stage"
      steps={tx.steps}
      current={2}
      say={
        <p>
          <strong>{tx.psychicStrong(k)}</strong>
        </p>
      }
      bar={
        <>
          <div className="bn-controls">
            <span className="bn-control-label">{tx.psychicSay}</span>
            <div className="segmented" role="group" aria-label={tx.psychicSay}>
              {THRESHOLDS.map((v) => (
                <button key={v} type="button" className={k === v ? 'is-active' : ''} aria-pressed={k === v} onClick={() => setK(v)}>
                  {tx.scoreOption(v)}
                </button>
              ))}
            </div>
          </div>
          <div className="legend">
            {youKey}
            <span className="legend-item bn-key-class">{tx.classKey(CLASS)}</span>
            <span className="legend-item bn-key-tail">{tx.tailKey(k)}</span>
          </div>
        </>
      }
      foot={
        <>
          <div className="nd-feedback is-good" aria-live="polite">
            <p className="nd-hint">
              {tx.pChance(tx.orMore(k), share(chance), Math.round(1 / chance), fmtNum(100 * chance, 100 * chance >= 1 ? 0 : 1))}
              {tx.pClass(inClass, tx.orMore(k))}
            </p>
            <p className="nd-fact">
              {tx.pValue}
              {best !== null && tx.yourBest(best, share(atLeast(best, N, P)))}
            </p>
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
      <div className="mm-main">
        <BinomChart n={N} points={[...you, ...cls]} curve={{ p: P, size: CLASS }} from={k} />
      </div>
    </Stage>
  )
}

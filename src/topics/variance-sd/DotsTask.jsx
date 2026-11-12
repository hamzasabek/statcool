import { useEffect, useRef, useState } from 'react'
import { useText } from '../../i18n.jsx'
import { MAX_GUESS, SIZES, TIMES, cloud, randomCount, trialOrder } from './dots.js'
import { DOTS } from './dotsText.js'

// One round of "How many dots?". Each trial: a cross → a cloud of dots for 0.7 s (too fast to
// count) → it disappears and the student types a number (Enter or OK) → the true number is shown
// for a moment → next trial, by itself. The answer box stays on screen (read-only while the dots
// show), so a phone keeps its keyboard open between trials.
// onAnswer({ size, truth, guess }); `count` = answers so far (the next trial is order[count]).

export default function DotsTask({ count, done, onAnswer }) {
  const tx = useText(DOTS)
  const [order] = useState(trialOrder)
  const [phase, setPhase] = useState('idle') // idle | fix | show | ask | feedback
  const [trial, setTrial] = useState(null) // { size, truth, pts }
  const [value, setValue] = useState('')
  const [last, setLast] = useState(null) // { truth, guess }
  const inputRef = useRef(null)
  const timer = useRef(null)
  const countRef = useRef(count)
  countRef.current = count
  const doneRef = useRef(done)
  doneRef.current = done

  useEffect(() => () => clearTimeout(timer.current), [])
  function after(ms, fn) {
    clearTimeout(timer.current)
    timer.current = setTimeout(fn, ms)
  }

  function startTrial() {
    const id = order[countRef.current % order.length]
    const size = SIZES.find((s) => s.id === id)
    const truth = randomCount(size)
    setTrial({ size: id, truth, pts: cloud(truth) })
    setValue('')
    setLast(null)
    setPhase('fix')
    after(TIMES.fix, () => {
      setPhase('show')
      after(TIMES.show, () => {
        setPhase('ask')
        inputRef.current?.focus()
      })
    })
  }

  const guess = Number(value)
  const valid = value !== '' && Number.isInteger(guess) && guess >= 1 && guess <= MAX_GUESS
  function submit(e) {
    e?.preventDefault()
    if (phase !== 'ask' || !valid) return
    setLast({ truth: trial.truth, guess })
    setPhase('feedback')
    onAnswer({ size: trial.size, truth: trial.truth, guess })
    after(TIMES.feedback, () => (doneRef.current ? setPhase('idle') : startTrial()))
  }

  useEffect(() => {
    if (done && phase !== 'feedback') {
      clearTimeout(timer.current)
      setPhase('idle')
    }
  }, [done, phase])

  let caption = ''
  if (phase === 'fix') caption = tx.capReady
  else if (phase === 'show') caption = tx.capLook
  else if (phase === 'ask') caption = tx.capHowMany
  else if (phase === 'feedback' && last) caption = last.guess === last.truth ? tx.capExact(last.truth) : tx.capOff(last.guess, last.truth)

  return (
    <div className={`mem-task dots-task is-${phase}`} data-tour="task">
      <svg className="mem-svg dots-svg" viewBox="-50 -50 100 100" role="img" aria-label={phase === 'show' ? tx.cloudAria : caption || tx.taskLabel}>
        <rect className="mem-bg" x="-50" y="-50" width="100" height="100" rx="8" />
        {phase === 'fix' && <path className="mem-fix" d="M-3,0h6M0,-3v6" />}
        {phase === 'show' && trial.pts.map(([x, y], i) => <circle key={i} className="dots-dot" cx={x} cy={y} r={1.7} />)}
        {phase === 'feedback' && last && (
          <text className="dots-truth" x="0" y="6" textAnchor="middle">
            {last.truth}
          </text>
        )}
      </svg>

      <div className="mem-under">
        {phase === 'idle' ? (
          done ? (
            <p className="mem-caption">{tx.roundDone}</p>
          ) : (
            <button type="button" className="btn btn-primary btn-lg mem-start" onClick={startTrial}>
              {tx.start}
            </button>
          )
        ) : (
          <form className="dots-form" onSubmit={submit}>
            <label className={`mem-caption${phase === 'feedback' ? ' is-feedback' : ''}`} htmlFor="dots-guess" aria-live="polite">
              {caption}
            </label>
            <span className="dots-row">
              <input
                ref={inputRef}
                id="dots-guess"
                className="dots-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                maxLength={3}
                value={value}
                readOnly={phase !== 'ask'}
                onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
                aria-label={tx.inputLabel}
              />
              <button type="submit" className="btn btn-primary" disabled={phase !== 'ask' || !valid} data-tour="confirm">
                {tx.ok}
              </button>
            </span>
          </form>
        )}
      </div>
    </div>
  )
}

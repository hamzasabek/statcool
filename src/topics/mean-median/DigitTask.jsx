import { useEffect, useRef, useState } from 'react'
import { useText } from '../../i18n.jsx'
import { MAX_LENGTH, MIN_LENGTH, TIMES, randomList } from './span.js'
import { SPAN } from './spanText.js'

// One digit-span run at a time. Digits appear one by one (0.8 s each); then the student types the
// list back (on-screen keypad, or the keyboard: digits, Backspace, Enter). A correct list makes the
// next one a digit longer; the first mistake ends the run, and onRunEnd(span) gets the longest list
// recalled. `start` = length of the run's first list, `run` = its number, `done` = all runs played.

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok']

export default function DigitTask({ start, run, done, onRunEnd }) {
  const tx = useText(SPAN)
  const [phase, setPhase] = useState('idle') // idle | show | recall | feedback
  const [list, setList] = useState([])
  const [shown, setShown] = useState(-1) // index of the digit on screen (−1 = blank)
  const [typed, setTyped] = useState([])
  const [result, setResult] = useState(null) // { ok } after a list
  const [lastSpan, setLastSpan] = useState(null)
  const timer = useRef(null)
  const clear = () => clearTimeout(timer.current)
  useEffect(() => clear, [])
  const after = (ms, fn) => {
    clear()
    timer.current = setTimeout(fn, ms)
  }

  function present(L) {
    const l = randomList(L)
    setList(l)
    setTyped([])
    setResult(null)
    setPhase('show')
    const step = (i) => {
      if (i >= l.length) {
        setShown(-1)
        setPhase('recall')
        return
      }
      setShown(i)
      after(TIMES.on, () => {
        setShown(-1)
        after(TIMES.off, () => step(i + 1))
      })
    }
    setShown(-1)
    after(500, () => step(0))
  }

  function startRun() {
    setLastSpan(null)
    present(start)
  }

  function endRun(span) {
    setLastSpan(span)
    setPhase('idle')
    onRunEnd(span)
  }

  function submit() {
    if (phase !== 'recall' || typed.length !== list.length) return
    const ok = typed.every((d, i) => d === list[i])
    setResult({ ok })
    setPhase('feedback')
    const L = list.length
    after(TIMES.feedback, () => {
      if (!ok) endRun(Math.max(MIN_LENGTH - 1, L - 1))
      else if (L >= MAX_LENGTH) endRun(L)
      else present(L + 1)
    })
  }

  function press(k) {
    if (phase !== 'recall') return
    if (k === 'del') setTyped((t) => t.slice(0, -1))
    else if (k === 'ok') submit()
    else setTyped((t) => (t.length < list.length ? [...t, Number(k)] : t))
  }

  // Keyboard: digits, Backspace, Enter.
  const keyRef = useRef(null)
  keyRef.current = (e) => {
    if (phase !== 'recall') return
    if (/^[0-9]$/.test(e.key)) press(e.key)
    else if (e.key === 'Backspace') press('del')
    else if (e.key === 'Enter') {
      if (e.target instanceof HTMLElement && e.target.closest('button')) return // the button handles it
      press('ok')
    } else return
    e.preventDefault()
  }
  useEffect(() => {
    const onKey = (e) => keyRef.current(e)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const L = list.length
  let caption = ''
  if (phase === 'show') caption = tx.capWatch(L)
  else if (phase === 'recall') caption = tx.capType(L)
  else if (phase === 'feedback') caption = result.ok ? tx.capRight : tx.capWrong

  return (
    <div className={`ds-task is-${phase}`} data-tour="task">
      <div className="ds-screen" aria-live="polite">
        {phase === 'idle' &&
          (done ? (
            <p className="ds-msg">{lastSpan !== null ? tx.lastSpan(lastSpan) : tx.allDone}</p>
          ) : (
            <>
              {lastSpan !== null && <p className="ds-msg">{tx.lastSpan(lastSpan)}</p>}
              <button type="button" className="btn btn-primary btn-lg ds-start" onClick={startRun}>
                {tx.startRun(run, start)}
              </button>
            </>
          ))}
        {phase === 'show' && (
          <span key={shown} className="ds-digit">
            {shown >= 0 ? list[shown] : ''}
          </span>
        )}
        {(phase === 'recall' || phase === 'feedback') && (
          <div className="ds-slots">
            {list.map((d, i) => {
              const v = typed[i]
              let cls = ''
              if (phase === 'feedback') cls = v === d ? ' is-right' : ' is-wrong'
              return (
                <span key={i} className={`ds-slot${cls}${phase === 'recall' && i === typed.length ? ' is-next' : ''}`}>
                  {v ?? ''}
                  {phase === 'feedback' && v !== d && <small>{d}</small>}
                </span>
              )
            })}
          </div>
        )}
      </div>
      <p className={`ds-caption${result && !result.ok && phase === 'feedback' ? ' is-wrong' : ''}`}>{caption}</p>
      <div className={`ds-pad${phase === 'recall' ? '' : ' is-off'}`} aria-hidden={phase !== 'recall'}>
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            className={`ds-key${k === 'ok' ? ' is-ok' : ''}${k === 'del' ? ' is-del' : ''}`}
            disabled={phase !== 'recall' || (k === 'ok' && typed.length !== L) || (k === 'del' && !typed.length)}
            onClick={() => press(k)}
            aria-label={k === 'del' ? tx.del : k === 'ok' ? tx.ok : k}
          >
            {k === 'del' ? '⌫' : k === 'ok' ? tx.ok : k}
          </button>
        ))}
      </div>
    </div>
  )
}

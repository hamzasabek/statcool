import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Stage } from '../../components/Stage.jsx'
import { useGuide } from '../../components/Tour.jsx'
import { num, pct, useText } from '../../i18n.jsx'
import { COMMON } from '../../text.js'
import { useChime, useSoundOn } from '../../sound.js'
import BellChart from './BellChart.jsx'
import { stats } from './clock.js'
import { BIN, COUNT_IN, DOMAIN, IDLE_BEATS, MIN_TAPS, PREDICT, TAPS, TICKS, asynchrony, useMetronome } from './beat.js'
import { BEAT } from './beatText.js'

// Topic 03, game 3: "Tap with the beat". Tap along with a metronome; each tap's timing error to the
// click is a dot. The dots form a bell, and two numbers, the mean and the SD, describe it all.
//   1. Tap: 40 taps with the clicks (after 4 clicks to listen)
//   2. Your bell: the fitted normal curve, ±1 SD and ±2 SD; how many taps fall inside (68 %, 95 %)
//   3. Predict: mean ± 2 SD should catch about 95 % of taps: tap 10 more and see

const TOUR_IDS = ['tap', 'bell', 'predict']
const TOUR_TARGETS = {
  tap: [null, 'pad', 'chart', 'legend', 'steps', 'next'],
  bell: ['chart', 'chart', 'feedback'],
  predict: ['chart', 'pad', 'feedback'],
}
const TOUR_PLACE = { pad: 'right', next: 'top' }
const ms = (v, signed = false) => `${signed ? (v > 0 ? '+' : v < 0 ? '−' : '') : ''}${num(Math.abs(v))} ms`

export default function TapBeat() {
  const tx = useText(BEAT)
  const tc = useText(COMMON)
  const [step, setStep] = useState(0)
  const [taps, setTaps] = useState([]) // asynchronies of step 1, ms
  const [extra, setExtra] = useState([]) // asynchronies of step 3
  const [running, setRunning] = useState(false)
  const [beat, setBeat] = useState(-1) // index of the last click (the pulse)
  const [flash, setFlash] = useState(null) // { text, warn }
  const lastTapBeat = useRef(0)
  const padRef = useRef(null)

  const metro = useMetronome((i) => {
    setBeat(i)
    // nobody tapping for a while: stop by itself
    if (i - lastTapBeat.current > IDLE_BEATS) {
      metro.stop()
      setRunning(false)
      setFlash({ text: tx.idleStop, warn: true })
    }
  })

  const tourId = TOUR_IDS[step]
  const guide = useGuide(`beat-${tourId}`, TOUR_TARGETS[tourId], tx.tour[tourId], {
    place: TOUR_PLACE,
    doneLabel: step === 0 ? tx.tourPlay : undefined,
    onStart: () => {
      metro.stop()
      setRunning(false)
    },
  })

  const list = step === 2 ? extra : taps
  const goal = step === 2 ? PREDICT : TAPS
  const done = list.length >= goal
  // No sound on the taps themselves (hearing your own taps shifts them); one chime once the
  // metronome has stopped: the round is full.
  useChime(taps.length, TAPS)
  useChime(extra.length, PREDICT)
  const [sound, setSound] = useSoundOn()
  const soundHint = !sound && (
    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSound(true)}>
      {tx.soundOffOn}
    </button>
  )

  function start() {
    lastTapBeat.current = 0
    setBeat(-1)
    setFlash(null)
    setRunning(true)
    metro.start()
  }
  function stop() {
    metro.stop()
    setRunning(false)
  }

  function tap(t) {
    if (!running) {
      if (!done) start()
      return
    }
    const a = asynchrony(t, metro.beats.current)
    if (a === null) {
      setFlash({ text: tx.waitCountIn, warn: true })
      return
    }
    lastTapBeat.current = metro.beats.current.length
    const setList = step === 2 ? setExtra : setTaps
    setList((l) => {
      if (l.length >= goal) return l
      const next = [...l, a]
      if (next.length >= goal) {
        metro.stop()
        setRunning(false)
      }
      return next
    })
    setFlash({ text: Math.abs(a) < 5 ? tx.onBeat(ms(a, true)) : tx.offBeat(ms(a, true), a < 0), warn: false })
  }

  // Space taps too (except on other buttons, which keep their own Space).
  const tapRef = useRef(tap)
  tapRef.current = tap
  const stepRef = useRef(step)
  stepRef.current = step
  useEffect(() => {
    function onKey(e) {
      if (e.code !== 'Space' || e.repeat || stepRef.current === 1) return
      const el = e.target
      if (el instanceof HTMLElement && el !== padRef.current && el.closest('button, a')) el.blur()
      e.preventDefault()
      tapRef.current(e.timeStamp)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const allTopics = (
    <Link to="/topics" className="btn btn-ghost">
      {tc.allTopics}
    </Link>
  )
  const common = { title: tx.title, className: 'ck-stage tb-stage', steps: tx.steps, current: step, onGuide: guide.start }
  const st = stats(taps)
  const range = st.n >= 2 ? [st.mean - 2 * st.sd, st.mean + 2 * st.sd] : null
  const chartLabels = {
    empty: tx.chartEmpty,
    axis: tx.axis,
    sd1: tx.sd1,
    sd2: tx.sd2,
    mean: (m) => tx.meanMark(ms(m, true)),
    range: range ? tx.rangeMark : undefined,
  }

  // The big round pad: Start, then Tap; it pulses with every click (the count-in shows 1 2 3 4).
  const counting = running && beat < COUNT_IN
  let padLabel = tx.padStart
  if (running) padLabel = counting ? tx.padListen : tx.padTap
  if (done) padLabel = tx.padDone
  const pad = (
    <div className="ck-pad tb-padbox">
      <button
        ref={padRef}
        type="button"
        data-tour="pad"
        className={`ck-button tb-pad${running ? ' is-running' : ''}${done ? ' is-next' : ''}`}
        disabled={done && !running}
        onPointerDown={(e) => {
          if (e.button !== 0) return
          e.preventDefault()
          tap(e.timeStamp)
        }}
        aria-label={`${padLabel}. ${tx.spaceToo}`}
      >
        {running && beat >= 0 && <span key={beat} className={`tb-pulse${beat < COUNT_IN ? ' is-count' : ''}`} aria-hidden="true" />}
        <span className="ck-button-label">{counting && beat >= 0 ? beat + 1 : padLabel}</span>
        {!done && <small>{running ? (counting ? tx.listenSmall : tx.tapSmall) : tx.startSmall}</small>}
      </button>
      {running && (
        <button type="button" className="btn btn-ghost btn-sm tb-stop" onClick={stop}>
          {tx.stop}
        </button>
      )}
    </div>
  )

  // ---------- 1. Tap ----------
  if (step === 0) {
    const n = taps.length
    const locked = n < MIN_TAPS
    let hint = running ? (counting ? tx.hintListen : tx.hintTap) : n ? tx.hintLeft(TAPS - n, MIN_TAPS - n) : tx.hintIdle
    if (done) hint = tx.hintFull(TAPS)
    if (flash) hint = `${flash.text}${done ? ` ${tx.hintFull(TAPS)}` : ''}`
    return (
      <Stage
        {...common}
        say={
          <p>
            <strong>{tx.sayStrong}</strong> {tx.say}
          </p>
        }
        bar={
          <div className="legend" data-tour="legend">
            <span className="legend-item ck-key is-a">{tx.count(n, TAPS)}</span>
            {n >= 5 && <span className="legend-item bell-key">{tx.bellKey}</span>}
            {n >= 2 && <span className="ck-stats">{tx.stats(ms(st.mean, true), ms(st.sd))}</span>}
            {soundHint}
          </div>
        }
        foot={
          <>
            <p className={`ck-flash${flash?.warn ? ' is-warn' : ''}`} aria-live="polite">
              {hint}
            </p>
            <div className="actions">
              {allTopics}
              <button
                type="button"
                className={`btn btn-primary ${done ? 'nd-glow' : 'ck-next'}`}
                data-tour="next"
                disabled={locked}
                title={locked ? tx.unlocks(MIN_TAPS) : undefined}
                onClick={() => {
                  stop()
                  setFlash(null)
                  setStep(1)
                }}
              >
                {locked ? tx.lockedNext(MIN_TAPS - n) : tx.nextBell}
              </button>
            </div>
          </>
        }
      >
        <div className="ck-main tb-main">
          {pad}
          <BellChart series={[{ key: 'a', values: taps }]} domain={DOMAIN} bin={BIN} ticks={TICKS} tickFmt={(t) => ms(t, true)} fit lastKey="a" labels={{ empty: tx.chartEmpty, axis: tx.axis }} aria={tx.chartAria(n)} />
          {guide.view}
        </div>
      </Stage>
    )
  }

  // ---------- 2. Your bell ----------
  if (step === 1) {
    const in1 = taps.filter((v) => Math.abs(v - st.mean) <= st.sd).length
    const in2 = taps.filter((v) => Math.abs(v - st.mean) <= 2 * st.sd).length
    const share = (k) => pct(num((k / st.n) * 100, 0))
    return (
      <Stage
        {...common}
        say={
          <p>
            <strong>{tx.bellStrong(ms(st.mean, true), ms(st.sd))}</strong> {tx.bellSay}
          </p>
        }
        bar={
          <div className="legend" data-tour="legend">
            <span className="legend-item ck-key is-a">{tx.keyTaps}</span>
            <span className="legend-item bell-key">{tx.bellKey}</span>
            <span className="legend-item tb-key-1">{tx.sd1}</span>
            <span className="legend-item tb-key-2">{tx.sd2}</span>
          </div>
        }
        foot={
          <>
            <div className="nd-feedback" data-tour="feedback" aria-live="polite">
              <p className="nd-hint">{tx.rule(in1, in2, st.n, share(in1), share(in2))}</p>
              <p className="nd-fact">{st.mean < -5 ? tx.early(ms(-st.mean)) : st.mean > 5 ? tx.late(ms(st.mean)) : tx.onTime}</p>
              <p className="nd-fact">{tx.twoNumbers}</p>
            </div>
            <div className="actions">
              {allTopics}
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                {tx.nextPredict}
              </button>
            </div>
          </>
        }
      >
        <div className="tb-main is-single">
          <BellChart series={[{ key: 'a', values: taps }]} domain={DOMAIN} bin={BIN} ticks={TICKS} tickFmt={(t) => ms(t, true)} fit bands labels={chartLabels} aria={tx.chartAria(st.n)} />
          {guide.view}
        </div>
      </Stage>
    )
  }

  // ---------- 3. Predict ----------
  const inside = range ? extra.filter((v) => v >= range[0] && v <= range[1]).length : 0
  let hint = running ? (counting ? tx.hintListen : tx.hintTap) : extra.length ? tx.predictLeft(PREDICT - extra.length) : tx.predictIdle
  if (flash && running) hint = flash.text
  if (done) hint = tx.predictResult(inside, extra.length)
  return (
    <Stage
      {...common}
      say={
        <p>
          <strong>{tx.predictStrong(ms(range[0], true), ms(range[1], true))}</strong> {tx.predictSay}
        </p>
      }
      bar={
        <div className="legend" data-tour="legend">
          <span className="legend-item ck-key is-a">{tx.keyTaps}</span>
          <span className="legend-item ck-key is-b">{tx.keyNew(extra.length, PREDICT)}</span>
          <span className="legend-item tb-key-range">{tx.rangeMark}</span>
          {soundHint}
        </div>
      }
      foot={
        <>
          <div className={`nd-feedback${done ? ' is-good' : ''}`} data-tour="feedback" aria-live="polite">
            <p className="nd-hint">{hint}</p>
            {done && <p className="nd-fact">{tx.predictFact}</p>}
          </div>
          <div className="actions">
            {allTopics}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                stop()
                setTaps([])
                setExtra([])
                setFlash(null)
                setStep(0)
              }}
            >
              {tc.playAgain}
            </button>
          </div>
        </>
      }
    >
      <div className="ck-main tb-main">
        {pad}
        <BellChart
          series={[
            { key: 'a', values: taps },
            { key: 'b', values: extra },
          ]}
          domain={DOMAIN}
          bin={BIN}
          ticks={TICKS}
          tickFmt={(t) => ms(t, true)}
          fit
          range={range}
          lastKey="b"
          labels={chartLabels}
          aria={tx.chartAria(st.n + extra.length)}
        />
        {guide.view}
      </div>
    </Stage>
  )
}

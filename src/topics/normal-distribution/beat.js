// "Tap with the beat": sensorimotor synchronization (review: Repp, 2005). A metronome clicks every
// 600 ms; the student taps along. Each tap's asynchrony (tap time − the nearest click, in ms) is one
// dot: − = before the click, + = after. The asynchronies form a bell; most people tap a little
// before the click on average ("negative mean asynchrony", often a few tens of ms).

import { useEffect, useRef } from 'react'
import { isSoundOn } from '../../sound.js'

export const IOI = 600 // ms between two clicks (100 beats per minute)
export const COUNT_IN = 4 // clicks to listen to before tapping counts
export const TAPS = 40 // taps in step 1
export const MIN_TAPS = 25 // the student may go on after this many
export const PREDICT = 10 // taps in step 3
export const IDLE_BEATS = 24 // the metronome stops by itself after this many clicks without a tap
export const DOMAIN = [-250, 250] // ms, the column centres of the chart
export const BIN = 10 // ms per column
export const TICKS = [-200, -100, 0, 100, 200]

// The asynchrony of a tap at time t (performance.now() ms) to the nearest counted click, or null
// (during the count-in, or too far from any click).
export function asynchrony(t, beats) {
  let best = null
  for (let i = COUNT_IN; i < beats.length; i++) {
    const d = t - beats[i]
    if (best === null || Math.abs(d) < Math.abs(best)) best = d
  }
  // a tap just before the first counted click is fine; one before the count-in ends is not
  if (best === null || Math.abs(best) > IOI / 2) return null
  return best
}

// A metronome. Clicks are planned on the performance.now() clock (the one taps are measured on),
// then played through Web Audio at the matching moment, earlier by the output latency so the sound
// is heard on time. onBeat(i) runs at each click (within 25 ms; the visual pulse); beats.current holds the
// planned times. Without audio (muted, unsupported) the pulse still runs.
export function useMetronome(onBeat) {
  const ctx = useRef(null)
  const beats = useRef([])
  const timer = useRef(null)
  const onBeatRef = useRef(onBeat)
  onBeatRef.current = onBeat

  function click(when, high) {
    const ac = ctx.current
    if (!ac || !isSoundOn()) return // the site's sound switch (the pad still pulses)
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.frequency.value = high ? 1320 : 880
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.exponentialRampToValueAtTime(0.5, when + 0.003)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.06)
    osc.connect(gain).connect(ac.destination)
    osc.start(when)
    osc.stop(when + 0.07)
  }

  function stop() {
    clearInterval(timer.current)
    timer.current = null
  }

  function start() {
    stop()
    if (!ctx.current) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (AC) ctx.current = new AC()
    }
    ctx.current?.resume?.()
    beats.current = []
    const t0 = performance.now() + 400
    let i = 0 // the next click to plan
    let shown = -1 // the last click shown (the pulse)
    const plan = () => {
      const now = performance.now()
      // plan the sounds a little ahead, so Web Audio plays them exactly on time
      while (t0 + i * IOI < now + 160) {
        const at = t0 + i * IOI
        beats.current.push(at)
        const ac = ctx.current
        if (ac && ac.state === 'running') {
          const latency = ac.outputLatency || ac.baseLatency || 0
          const when = ac.currentTime + (at - now) / 1000 - latency
          if (when > ac.currentTime) click(when, i < COUNT_IN)
        }
        i++
      }
      // the pulse follows the clock (checked every 25 ms)
      const cur = Math.floor((now - t0) / IOI)
      if (cur > shown && cur >= 0) {
        shown = cur
        onBeatRef.current(cur)
      }
    }
    plan()
    timer.current = setInterval(plan, 25)
  }

  useEffect(
    () => () => {
      stop()
      ctx.current?.close?.()
    },
    [],
  )

  return { start, stop, beats }
}

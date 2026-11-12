import { useEffect, useRef, useSyncExternalStore } from 'react'

// Feedback sounds for the whole site, synthesised with Web Audio (no audio files).
// One switch in the header turns every sound of the site on or off (saved in localStorage,
// on by default). Three kinds of feedback, used the same way in every game (context/project.md):
//   sfx.tick()  an answer was recorded (it became a dot); says nothing about right or wrong
//   sfx.right() / sfx.wrong(): only where a right answer exists and is already shown on screen
//               (quiz, digit span, reaction time "too early")
//   sfx.chime() a milestone: the next step unlocks, a round ends, a challenge is done
// Rules: no sound between a stimulus and the response of a timed task, no right / wrong in games
// that give no feedback on purpose, none on sliders or drags, one sound for a batch.
// The experiment sounds (the neuron's spikes, the metronome) also follow the switch: isSoundOn().

const KEY = 'statscool-sound'

function load() {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

let on = load()
const listeners = new Set()

export function isSoundOn() {
  return on
}

export function setSoundOn(v) {
  on = !!v
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    /* not saved, still switched */
  }
  listeners.forEach((f) => f())
  if (on) unlock()
}

function subscribe(f) {
  listeners.add(f)
  return () => listeners.delete(f)
}

// [on, setOn] for a switch (the header's, the neuron game's).
export function useSoundOn() {
  const v = useSyncExternalStore(subscribe, isSoundOn, () => true)
  return [v, setSoundOn]
}

// ---------- Audio context: created and resumed on the first gesture (browsers require one) ----------
let ctx = null
let master = null

function unlock() {
  if (!ctx) {
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
    if (!AC) return null
    try {
      ctx = new AC()
    } catch {
      return null
    }
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume?.().catch(() => {})
  return ctx
}

if (typeof window !== 'undefined') {
  const first = () => {
    if (on) unlock()
  }
  window.addEventListener('pointerdown', first, { capture: true, passive: true })
  window.addEventListener('keydown', first, { capture: true })
}

function ready() {
  if (!on || (typeof document !== 'undefined' && document.hidden)) return null
  const c = unlock()
  return c && c.state !== 'closed' ? c : null
}

// One note: a soft attack, an exponential decay; optional glide to `to` Hz.
function note(c, { f, to, at = 0, dur = 0.12, gain = 0.2, type = 'triangle' }) {
  const t0 = c.currentTime + 0.005 + at
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(f, t0)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(master)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

// Throttle per kind, so a batch or two triggers in the same moment play once.
const last = {}
function play(kind, gap, draw) {
  const c = ready()
  if (!c) return
  const now = performance.now()
  if (now - (last[kind] ?? -1e9) < gap) return
  last[kind] = now
  draw(c)
}

function tick() {
  play('tick', 45, (c) => note(c, { f: 880, to: 520, dur: 0.07, gain: 0.16, type: 'sine' }))
}

function right() {
  play('answer', 150, (c) => {
    note(c, { f: 659, dur: 0.11, gain: 0.16 })
    note(c, { f: 988, at: 0.08, dur: 0.2, gain: 0.16 })
  })
}

function wrong() {
  play('answer', 150, (c) => {
    note(c, { f: 247, to: 196, dur: 0.24, gain: 0.22, type: 'sine' })
  })
}

function chime() {
  play('chime', 400, (c) => {
    note(c, { f: 523, dur: 0.18, gain: 0.13 })
    note(c, { f: 659, at: 0.09, dur: 0.18, gain: 0.13 })
    note(c, { f: 784, at: 0.18, dur: 0.34, gain: 0.14 })
  })
}

// Usage: sfx.tick(), sfx.right(), sfx.wrong(), sfx.chime() (one object, so no local name hides them).
export const sfx = { tick, right, wrong, chime }

// A milestone chime when `count` goes up past one of the thresholds (any rise if none is given):
// useChime(n, MIN_TRIALS, TRIALS) rings when the next step unlocks and when the round is full,
// useChime(done.length) when a challenge is done, useChime(Number(finished)) once at the end.
// Going back (undo, reset, another step) never rings; reaching a threshold again does.
export function useChime(count, ...thresholds) {
  const prev = useRef(count)
  const key = thresholds.join(',')
  useEffect(() => {
    const before = prev.current
    prev.current = count
    if (!(count > before)) return
    if (!thresholds.length || thresholds.some((t) => before < t && t <= count)) chime()
  }, [count, key])
}

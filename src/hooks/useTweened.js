import { useEffect, useRef, useState } from 'react'
import { easeCubicOut, interpolate, timer } from 'd3'

const QUERY = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia?.(QUERY).matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.(QUERY)
    if (!mq) return
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

const finite = (v) => typeof v === 'number' && Number.isFinite(v)
const canTween = (a, b) =>
  (finite(a) && finite(b)) ||
  (Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every(finite) && b.every(finite))

/**
 * Smoothly animates a number or an array of numbers towards `target`
 * (like Svelte's `tweened` store). Jumps straight to the target when
 * `immediate` is true (e.g. while dragging), when the user prefers reduced
 * motion, or when the shape of the value changes (e.g. a different array length).
 */
export function useTweened(target, { duration = 300, immediate = false } = {}) {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(target)
  const current = useRef(target)
  // Compare by content, so a new array with the same numbers doesn't restart the animation.
  const key = Array.isArray(target) ? target.join(',') : String(target)

  useEffect(() => {
    const from = current.current
    if (immediate || reduced || !canTween(from, target)) {
      current.current = target
      setValue(target)
      return
    }
    const interp = interpolate(from, target)
    const t = timer((elapsed) => {
      const k = Math.min(1, elapsed / duration)
      const raw = interp(easeCubicOut(k))
      // d3 reuses the same array between frames; copy it so React sees a new value.
      const v = Array.isArray(raw) ? Array.from(raw) : raw
      current.current = v
      setValue(v)
      if (k === 1) t.stop()
    })
    return () => t.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, duration, immediate, reduced])

  return value
}

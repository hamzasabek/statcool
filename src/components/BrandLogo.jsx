import { useSyncExternalStore } from 'react'
import { useLocation } from 'react-router'
import { MotionConfig, motion } from 'motion/react'
import logoDark from '../assets/logo-dark.svg'
import logoLight from '../assets/logo-light.svg'

// The StatsCool logo, one version per theme (CSS shows the one that matches <html data-theme>).
// There is only ever one on screen: big in the Home hero while the page is near the top, otherwise
// in the header. Both use the same Motion layoutId, so when it changes place (scrolling down, or
// going to another page) it flies from one spot to the other. Reduced motion: it just swaps.

const THRESHOLD = 60 // px scrolled before the logo goes back to the header

let scrolled = typeof window !== 'undefined' && window.scrollY > THRESHOLD
const listeners = new Set()
if (typeof window !== 'undefined') {
  window.addEventListener(
    'scroll',
    () => {
      const now = window.scrollY > THRESHOLD
      if (now !== scrolled) {
        scrolled = now
        listeners.forEach((f) => f())
      }
    },
    { passive: true },
  )
}
const subscribe = (f) => {
  listeners.add(f)
  return () => listeners.delete(f)
}

// True while the logo belongs in the Home hero (Home page, not scrolled).
export function useLogoInHero() {
  const { pathname } = useLocation()
  const down = useSyncExternalStore(subscribe, () => scrolled)
  return pathname === '/' && !down
}

export default function BrandLogo({ big = false }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        layoutId="brand-logo"
        className={`brand-logo${big ? ' is-hero' : ''}`}
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      >
        <img className="logo-img is-light" src={logoLight} alt="" />
        <img className="logo-img is-dark" src={logoDark} alt="" />
      </motion.div>
    </MotionConfig>
  )
}

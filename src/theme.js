import { useEffect, useState } from 'react'

// Light / dark mode. index.html sets <html data-theme> before the first paint (saved choice, or
// the system setting). Until the student picks one, the site follows the system setting.

const KEY = 'statscool-theme'
const OLD_KEY = 'statcool-theme' // before the repo was renamed: still read, so no one loses their choice

function saved() {
  try {
    const t = localStorage.getItem(KEY) ?? localStorage.getItem(OLD_KEY)
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

function apply(t) {
  document.documentElement.dataset.theme = t
}

export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function onChange(e) {
      if (saved()) return // the student chose: keep it
      const t = e.matches ? 'dark' : 'light'
      apply(t)
      setTheme(t)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  function toggle() {
    const t = theme === 'dark' ? 'light' : 'dark'
    apply(t)
    try {
      localStorage.setItem(KEY, t)
    } catch {
      /* not saved, still switched */
    }
    setTheme(t)
  }

  return [theme, toggle]
}

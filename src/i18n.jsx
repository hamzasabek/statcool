import { createContext, useContext, useEffect, useState } from 'react'

// Language (English / French). The choice is saved in localStorage; the first visit follows the
// browser language. Every text lives in a dictionary { en: {...}, fr: {...} } next to the
// component that uses it; components pick theirs with useText(dict).

export const LANGS = ['en', 'fr']
const KEY = 'statcool-lang'
let current = 'en' // read by the number formatters below

function initialLang() {
  try {
    const saved = localStorage.getItem(KEY)
    if (LANGS.includes(saved)) return saved
  } catch {
    /* storage blocked: fall back to the browser language */
  }
  return (navigator.language || '').toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

const LangContext = createContext({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)
  current = lang
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  function setLang(l) {
    setLangState(l)
    try {
      localStorage.setItem(KEY, l)
    } catch {
      /* not saved, still switched */
    }
  }
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
export const useText = (dict) => dict[useContext(LangContext).lang]

// ---------- Numbers ----------
// French: decimal comma, and a (no-break) space before %.
export function num(v, digits = 0) {
  const s = v.toFixed(digits)
  return current === 'fr' ? s.replace('.', ',') : s
}
export const pct = (s) => (current === 'fr' ? `${s} %` : `${s}%`)

// ---------- French typography ----------
// No-break space before : ; ! ? » and after «, so they never start a new line.
const typo = (s) => s.replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ')

export function frenchTypo(value) {
  if (typeof value === 'string') return typo(value)
  if (typeof value === 'function') {
    return (...args) => {
      const r = value(...args)
      return typeof r === 'string' ? typo(r) : r
    }
  }
  if (Array.isArray(value)) return value.map(frenchTypo)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, frenchTypo(v)]))
  }
  return value
}

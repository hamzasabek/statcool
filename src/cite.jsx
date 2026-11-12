import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { REFS } from './references.js'

// APA 7 citations, in English and French (the French adaptation: "et" instead of "&", "éd.",
// "trad.", "Œuvre originale publiée en"). Texts carry tokens (see references.js):
//   [@key], [@a; @b], [prefix @key], [plain text; @key], @key (narrative), [-@key] (year only).
// useText() turns every string that has a token into <Cited>: the in-text citation is a button
// that opens the full references (DOI links) in a small bubble.

const KEY = String.raw`[a-z][a-z-]*\d{4}[a-z]?`
// [ … @key … ]  or a narrative @key (not inside an e-mail address or a word)
export const TOKEN = new RegExp(String.raw`\[([^\[\]]*?-?@${KEY}[^\[\]]*)\]|(?<![\w@.])@(${KEY})`, 'g')
const hasToken = (s) => typeof s === 'string' && s.includes('@') && new RegExp(TOKEN.source).test(s)

const L = {
  en: { and: '&', andNarr: 'and', etAl: 'et al.', ed: (n) => `${ordinal(n)} ed.`, vol: 'Vol.', trans: 'Trans.', original: (y) => `(Original work published ${y})`, article: 'Article', all: 'All references', close: 'Close' },
  fr: { and: 'et', andNarr: 'et', etAl: 'et al.', ed: (n) => `${n}${n === 1 ? 're' : 'e'} éd.`, vol: 'vol.', trans: 'trad.', original: (y) => `(Œuvre originale publiée en ${y})`, article: 'Article', all: 'Toutes les références', close: 'Fermer' },
}
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? 'th'
  return `${n}${s}`
}

export function getRef(key) {
  const r = REFS[key]
  if (!r) throw new Error(`Unknown reference @${key} (add it to src/references.js)`)
  return r
}

// ---------- In-text ----------
const yearOf = (r) => (r.original ? `${r.original}/${r.year}` : String(r.year))
function names(r, narrative, lang) {
  const a = r.authors.map(([f]) => f)
  if (a.length === 1) return a[0]
  if (a.length === 2) return `${a[0]} ${narrative ? L[lang].andNarr : L[lang].and} ${a[1]}`
  return `${a[0]} ${L[lang].etAl}`
}
// "Repp, 2005" (inside parentheses) or "Repp (2005)" (narrative)
export const inText = (key, lang, narrative = false) => {
  const r = getRef(key)
  return narrative ? `${names(r, true, lang)} (${yearOf(r)})` : `${names(r, false, lang)}, ${yearOf(r)}`
}
const sortKey = (key) => {
  const r = getRef(key)
  return `${r.authors.map(([f]) => f).join(' ')} ${r.year}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
export const byApaOrder = (a, b) => sortKey(a).localeCompare(sortKey(b))

// One bracket "[review: @a; @b]" → { text: "(review: A, 2005; B, 2006)", keys }
function bracket(inner, lang) {
  const parts = inner.split(';').map((p) => p.trim())
  const items = parts.map((p) => {
    const m = p.match(new RegExp(String.raw`^(.*?)(-?)@(${KEY})(.*)$`))
    if (!m) return { plain: p }
    const [, pre, yearOnly, key, post] = m
    const r = getRef(key)
    return { key, pre, post, label: yearOnly ? yearOf(r) : inText(key, lang) }
  })
  // APA: several works in one parenthesis go in alphabetical order (when they are plain citations)
  const cites = items.filter((i) => i.key)
  if (cites.length > 1 && items.every((i) => i.key && !i.pre && !i.post)) items.sort((a, b) => byApaOrder(a.key, b.key))
  const sep = lang === 'fr' ? ' ; ' : '; '
  const text = `(${items.map((i) => (i.key ? `${i.pre}${i.label}${i.post}` : i.plain)).join(sep)})`
  return { text, keys: cites.map((i) => i.key) }
}

// A string with tokens → [string | { text, keys }]
export function parse(s, lang) {
  const out = []
  let last = 0
  for (const m of s.matchAll(new RegExp(TOKEN.source, 'g'))) {
    if (m.index > last) out.push(s.slice(last, m.index))
    if (m[1] !== undefined) out.push(bracket(m[1], lang))
    else out.push({ text: inText(m[2], lang, true), keys: [m[2]] })
    last = m.index + m[0].length
  }
  if (last < s.length) out.push(s.slice(last))
  return out
}
// Plain text, for places that cannot hold a button (a card that is a link, an aria-label).
export const plainCites = (s, lang) => (hasToken(s) ? parse(s, lang).map((p) => (typeof p === 'string' ? p : p.text)).join('') : s)
// Every key in a string
export const keysIn = (s) => (hasToken(s) ? parse(s, 'en').flatMap((p) => (typeof p === 'string' ? [] : p.keys)) : [])

// ---------- Reference list entry (APA 7) ----------
function authorList(r, lang) {
  const a = r.authors.map(([f, i]) => `${f}, ${i}`)
  const and = lang === 'fr' ? ' et ' : ', & '
  if (a.length === 1) return a[0]
  if (a.length <= 20) return `${a.slice(0, -1).join(', ')}${and}${a[a.length - 1]}`
  return `${a.slice(0, 19).join(', ')}, … ${a[a.length - 1]}`
}
const end = (s) => (/[.?!]$/.test(s) ? s : `${s}.`)

// → [{ t: text } | { i: italic text } | { a: url }]
export function refParts(key, lang) {
  const r = getRef(key)
  const l = L[lang]
  const p = [{ t: `${authorList(r, lang)} (${r.year}). ` }]
  if (r.type === 'book') {
    const extra = [r.edition && r.edition > 1 ? l.ed(r.edition) : null, r.volume ? `${l.vol} ${r.volume}` : null].filter(Boolean)
    p.push({ i: r.title }, { t: `${extra.length ? ` (${extra.join(', ')})` : ''}${r.translator ? ` (${r.translator}, ${l.trans})` : ''}. ${end(r.publisher)}` })
  } else {
    p.push({ t: `${end(`${r.title}${r.translator ? ` (${r.translator}, ${l.trans})` : ''}`)} ` })
    p.push({ i: r.journal })
    if (r.volume !== undefined) {
      p.push({ t: ', ' }, { i: String(r.volume) })
      if (r.issue !== undefined) p.push({ t: `(${r.issue})` })
    }
    if (r.article) p.push({ t: `, ${l.article} ${r.article}` })
    else if (r.pages) p.push({ t: `, ${r.pages}` })
    p.push({ t: '.' })
  }
  if (r.doi) p.push({ t: ' ' }, { a: `https://doi.org/${r.doi}` })
  else if (r.url) p.push({ t: ' ' }, { a: r.url })
  if (r.original) p.push({ t: ` ${l.original(r.original)}` })
  return p
}
export const refText = (key, lang) => refParts(key, lang).map((x) => x.t ?? x.i ?? x.a).join('')

export function Reference({ id, lang }) {
  return refParts(id, lang).map((x, k) =>
    x.i ? (
      <em key={k}>{x.i}</em>
    ) : x.a ? (
      <a key={k} href={x.a} target="_blank" rel="noreferrer">
        {x.a}
      </a>
    ) : (
      <span key={k}>{x.t}</span>
    ),
  )
}

// ---------- The clickable citation and its bubble ----------
function CiteButton({ text, keys, lang }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const btn = useRef(null)
  const pop = useRef(null)

  useLayoutEffect(() => {
    if (!open || !btn.current || !pop.current) return
    const b = btn.current.getBoundingClientRect()
    const w = Math.min(420, window.innerWidth - 24)
    const h = pop.current.offsetHeight
    const left = Math.max(12, Math.min(b.left + b.width / 2 - w / 2, window.innerWidth - w - 12))
    const below = b.bottom + 8 + h < window.innerHeight - 8
    setPos({ left, width: w, top: below ? b.bottom + 8 : Math.max(8, b.top - 8 - h) })
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') return
      if (e.type === 'pointerdown' && (pop.current?.contains(e.target) || btn.current?.contains(e.target))) return
      setOpen(false)
      if (e.type === 'keydown') btn.current?.focus()
    }
    const onScroll = () => setOpen(false)
    window.addEventListener('pointerdown', close, true)
    window.addEventListener('keydown', close, true)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('pointerdown', close, true)
      window.removeEventListener('keydown', close, true)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open])

  return (
    <>
      <button
        ref={btn}
        type="button"
        className={`cite${open ? ' is-open' : ''}`}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setPos(null)
          setOpen((o) => !o)
        }}
      >
        {text}
      </button>
      {open && (
        <span
          ref={pop}
          className="cite-pop"
          role="dialog"
          aria-label={text}
          style={pos ? { left: pos.left, top: pos.top, width: pos.width } : { visibility: 'hidden', left: 0, top: 0 }}
        >
          {keys.map((k) => (
            <span key={k} className="cite-ref">
              <Reference id={k} lang={lang} />
            </span>
          ))}
          <a className="cite-all" href={`#/references#ref-${keys[0]}`} onClick={() => setOpen(false)}>
            {L[lang].all} →
          </a>
        </span>
      )}
    </>
  )
}

export function Cited({ s, lang }) {
  return parse(s, lang).map((p, k) => (typeof p === 'string' ? p : <CiteButton key={k} text={p.text} keys={p.keys} lang={lang} />))
}

// useText(): every string with a citation becomes <Cited>; functions are wrapped (their result is
// converted); other values are kept as they are. Cached per dictionary and language.
function convert(v, lang) {
  if (typeof v === 'string') return hasToken(v) ? <Cited s={v} lang={lang} /> : v
  if (typeof v === 'function') return (...a) => convert(v(...a), lang)
  if (Array.isArray(v)) return v.map((x) => convert(x, lang))
  if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    const o = {}
    for (const k in v) o[k] = convert(v[k], lang)
    return o
  }
  return v
}
const cache = new WeakMap()
export function withCites(dict, lang) {
  let byLang = cache.get(dict)
  if (!byLang) cache.set(dict, (byLang = {}))
  return (byLang[lang] ??= convert(dict[lang], lang))
}

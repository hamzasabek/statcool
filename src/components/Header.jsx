import { Link } from 'react-router'
import { LANGS, useLang, useText } from '../i18n.jsx'
import { COMMON } from '../text.js'
import { useTheme } from '../theme.js'

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="var(--navy)" />
      <rect x="6" y="14" width="4" height="8" rx="1" fill="var(--sky)" />
      <rect x="12" y="7" width="4" height="15" rx="1" fill="var(--sun)" />
      <rect x="18" y="11" width="4" height="11" rx="1" fill="var(--blue)" />
    </svg>
  )
}

const Moon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
  </svg>
)

const Sun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
  </svg>
)

export default function Header() {
  const { lang, setLang } = useLang()
  const tx = useText(COMMON)
  const [theme, toggleTheme] = useTheme()
  const dark = theme === 'dark'
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand">
          <Logo />
          StatCool
        </Link>
        <div className="header-tools">
          <div className="segmented lang-switch" role="group" aria-label={tx.language}>
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                lang={l}
                className={l === lang ? 'is-active' : ''}
                aria-pressed={l === lang}
                onClick={() => setLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-ghost theme-toggle"
            aria-label={dark ? tx.toLight : tx.toDark}
            title={dark ? tx.toLight : tx.toDark}
            onClick={toggleTheme}
          >
            {dark ? <Sun /> : <Moon />}
          </button>
        </div>
      </div>
    </header>
  )
}

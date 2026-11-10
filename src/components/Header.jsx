import { Link } from 'react-router'

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

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand">
          <Logo />
          StatCool
        </Link>
      </div>
    </header>
  )
}

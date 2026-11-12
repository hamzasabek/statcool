import { useState } from 'react'
import { Link } from 'react-router'
import photo from '../assets/author.jpg'
import { useText } from '../i18n.jsx'
import { ABOUT } from './text.js'

// About page (/about): why StatsCool exists, the author, how to cite it, the experiments behind the
// games, inspiration, privacy, open source and licences (code MIT, content CC BY 4.0, logo / name /
// photo reserved), how it is built (with the AI disclosure), and feedback.

const REPO = 'https://github.com/hamzasabek/statscool'
const SITE = 'https://hamzasabek.github.io/statscool/'
const YEAR = 2026 // the citation's year (APA: the year of the version; also in CITATION.cff)
// The author's public profiles (no phone or personal email: contact goes through GitHub issues).
const PROFILES = [
  ['ResearchGate', 'https://www.researchgate.net/profile/Hamza-Sabek'],
  ['LinkedIn', 'https://www.linkedin.com/in/hamza-sabek-19819470/'],
  ['GitHub', 'https://github.com/hamzasabek'],
]

const Out = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
)

// The APA reference, with a button that copies it as plain text.
function Citation({ tx }) {
  const [copied, setCopied] = useState(false)
  const plain = `Sabek, H. (${YEAR}). ${tx.citeWork} [${tx.citeKind}]. ${SITE}`
  function copy() {
    navigator.clipboard?.writeText(plain).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      },
      () => {},
    )
  }
  return (
    <div className="about-cite">
      <p className="about-ref">
        Sabek, H. ({YEAR}). <em>{tx.citeWork}</em> [{tx.citeKind}]. <Out href={SITE}>{SITE}</Out>
      </p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={copy} aria-live="polite">
        {copied ? tx.copied : tx.copy}
      </button>
    </div>
  )
}

export default function About() {
  const tx = useText(ABOUT)
  return (
    <article className="about prose">
      <h1>{tx.title}</h1>
      <p className="lead">{tx.lead}</p>

      <h2>{tx.whyTitle}</h2>
      <p>{tx.why}</p>

      <h2>{tx.pathTitle}</h2>
      <p>{tx.pathIntro}</p>
      <ul className="about-experiments">
        {tx.path.map(([step, text]) => (
          <li key={step}>
            <strong>{step}</strong>
            {tx.sep}
            {text}
          </li>
        ))}
      </ul>
      <p>{tx.pathOrder}</p>

      <h2>{tx.authorTitle}</h2>
      <div className="about-author">
        <img className="about-photo" src={photo} alt={tx.photoAlt} width="112" height="112" />
        <div>
          <p>{tx.author}</p>
          <p className="about-links">
            {PROFILES.map(([name, href]) => (
              <Out key={name} href={href}>
                {name}
              </Out>
            ))}
          </p>
        </div>
      </div>

      <h2>{tx.citeTitle}</h2>
      <p>{tx.citeIntro}</p>
      <Citation tx={tx} />

      <h2>{tx.expTitle}</h2>
      <ul className="about-experiments">
        {tx.experiments.map(([game, text]) => (
          <li key={game}>
            <strong>{game}</strong>
            {tx.sep}
            {text}
          </li>
        ))}
      </ul>
      <p>
        <Link to="/references">{tx.allRefs}</Link>
      </p>

      <h2>{tx.inspTitle}</h2>
      <p>
        {tx.inspBefore}
        <Out href="https://rpsychologist.com">rpsychologist.com</Out>
        {tx.inspAfter}
      </p>

      <h2>{tx.privacyTitle}</h2>
      <p>{tx.privacy}</p>

      <h2>{tx.openTitle}</h2>
      <p>
        {tx.openBefore}
        <Out href={REPO}>{tx.github}</Out>
        {tx.openAfter}
      </p>
      <p>
        {tx.ccBefore}
        <Out href={tx.ccUrl}>{tx.cc}</Out>
        {tx.ccAfter}
      </p>
      <p>{tx.reserved}</p>

      <h2>{tx.builtTitle}</h2>
      <p>{tx.built}</p>
      <p>{tx.ai}</p>

      <h2>{tx.contactTitle}</h2>
      <p>
        {tx.contactBefore}
        <Out href={`${REPO}/issues`}>{tx.issue}</Out>
        {tx.contactAfter}
      </p>

      <p className="about-play">
        <Link to="/topics" className="btn btn-primary">
          {tx.play}
        </Link>
      </p>
    </article>
  )
}

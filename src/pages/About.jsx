import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import photo from '../assets/author.jpg'
import { useText } from '../i18n.jsx'
import { ABOUT } from './text.js'

// About page (/about), in five tabs so nothing needs a long scroll (the tab is in the address: /about?tab=teaching):
//   idea        why StatsCool exists + the four steps at a glance
//   teaching    why each step is there (the learning science, cited) + what is not claimed
//               (rationale tracker: context/rationale.md; full review: docs/learning-science-review.md)
//   experiments the experiments behind the games, one small card each (opens to the finding)
//   use         how to cite, privacy, open source and licences (code MIT, content CC BY 4.0, logo / name /
//               photo reserved), how it is built (with the AI disclosure)
//   author      the author, the inspiration, contact

const REPO = 'https://github.com/hamzasabek/statscool'
const SITE = 'https://hamzasabek.github.io/statscool/'
const YEAR = 2026 // the citation's year (APA: the year of the version; also in CITATION.cff)
// The author's public profiles (no phone or personal email: contact goes through GitHub issues).
const PROFILES = [
  ['ResearchGate', 'https://www.researchgate.net/profile/Hamza-Sabek'],
  ['LinkedIn', 'https://www.linkedin.com/in/hamza-sabek-19819470/'],
  ['GitHub', 'https://github.com/hamzasabek'],
]
const TABS = ['idea', 'teaching', 'experiments', 'use', 'author']
const STEP_CLASS = ['is-discover', 'is-play', 'is-train', 'is-quiz'] // one logo colour per step

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

function Idea({ tx, go }) {
  return (
    <>
      <p className="lead">{tx.lead}</p>
      <p className="about-why">{tx.why}</p>
      <h2>{tx.stepsTitle}</h2>
      <ol className="about-steps">
        {tx.steps.map(([name, line], k) => (
          <li key={name} className={`about-step-card ${STEP_CLASS[k]}`}>
            <strong>{name}</strong>
            <span>{line}</span>
          </li>
        ))}
      </ol>
      <div className="about-foot">
        <p className="about-order">{tx.pathOrder}</p>
        <p className="about-actions">
          <Link to="/topics" className="btn btn-primary">
            {tx.play}
          </Link>
          <button type="button" className="btn btn-ghost" onClick={() => go('teaching')}>
            {tx.seeWhy}
          </button>
        </p>
      </div>
    </>
  )
}

function Teaching({ tx }) {
  return (
    <>
      <h2>{tx.teachTitle}</h2>
      <p className="about-intro">{tx.teachIntro}</p>
      <div className="about-teach">
        {tx.teach.map(([name, does, why], k) => (
          <details key={name} className={`about-teach-row ${STEP_CLASS[k]}`}>
            <summary>
              <span className="about-teach-what">
                <span className="about-teach-name">{name}</span>
                <span>{does}</span>
              </span>
              <span className="about-more">{tx.research}</span>
            </summary>
            <p className="about-teach-why">{why}</p>
          </details>
        ))}
      </div>
      <h2>{tx.principlesTitle}</h2>
      <div className="about-grid about-grid-3">
        {tx.principles.map(([title, text]) => (
          <section key={title} className="about-card">
            <h3>{title}</h3>
            <p>{text}</p>
          </section>
        ))}
      </div>
    </>
  )
}

function Experiments({ tx }) {
  return (
    <>
      <h2>{tx.expTitle}</h2>
      <p className="about-intro">{tx.expIntro}</p>
      <div className="about-exps">
        {tx.experiments.map(([game, text]) => (
          <details key={game} className="about-exp">
            <summary>{game}</summary>
            <p>{text}</p>
          </details>
        ))}
      </div>
      <p>
        <Link to="/references">{tx.allRefs}</Link>
      </p>
    </>
  )
}

function Use({ tx }) {
  return (
    <>
      <h2>{tx.citeTitle}</h2>
      <p className="about-intro">{tx.citeIntro}</p>
      <Citation tx={tx} />
      <h2>{tx.detailsTitle}</h2>
      <div className="about-grid">
        <section className="about-card">
          <h3>{tx.openTitle}</h3>
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
        </section>
        <section className="about-card">
          <h3>{tx.privacyTitle}</h3>
          <p>{tx.privacy}</p>
        </section>
        <section className="about-card">
          <h3>{tx.builtTitle}</h3>
          <p>{tx.built}</p>
          <p>{tx.ai}</p>
        </section>
      </div>
    </>
  )
}

function Author({ tx }) {
  return (
    <>
      <h2>{tx.authorTitle}</h2>
      <div className="about-author">
        <img className="about-photo" src={photo} alt={tx.photoAlt} width="136" height="136" />
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
      <div className="about-grid">
        <section className="about-card">
          <h3>{tx.inspTitle}</h3>
          <p>
            {tx.inspBefore}
            <Out href="https://rpsychologist.com">rpsychologist.com</Out>
            {tx.inspAfter}
          </p>
        </section>
        <section className="about-card">
          <h3>{tx.contactTitle}</h3>
          <p>
            {tx.contactBefore}
            <Out href={`${REPO}/issues`}>{tx.issue}</Out>
            {tx.contactAfter}
          </p>
        </section>
      </div>
    </>
  )
}

export default function About() {
  const tx = useText(ABOUT)
  const [params, setParams] = useSearchParams()
  const asked = params.get('tab')
  const tab = TABS.includes(asked) ? asked : 'idea'
  const refs = useRef({})
  const go = (t) => setParams(t === 'idea' ? {} : { tab: t }, { replace: true, preventScrollReset: true })

  // Arrow keys move between the tabs (WAI-ARIA tabs pattern)
  function onKey(e) {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : e.key === 'Home' ? -99 : e.key === 'End' ? 99 : 0
    if (!d) return
    e.preventDefault()
    const i = Math.min(TABS.length - 1, Math.max(0, d === -99 ? 0 : d === 99 ? TABS.length - 1 : TABS.indexOf(tab) + d))
    go(TABS[i])
    refs.current[TABS[i]]?.focus()
  }

  const View = { idea: Idea, teaching: Teaching, experiments: Experiments, use: Use, author: Author }[tab]
  return (
    <article className="about prose">
      <h1>{tx.title}</h1>
      <div className="about-tabs" role="tablist" aria-label={tx.tabsAria} onKeyDown={onKey}>
        {TABS.map((t) => (
          <button
            key={t}
            ref={(el) => (refs.current[t] = el)}
            type="button"
            role="tab"
            id={`about-tab-${t}`}
            aria-selected={t === tab}
            aria-controls="about-panel"
            tabIndex={t === tab ? 0 : -1}
            onClick={() => go(t)}
          >
            {tx.tabs[t]}
          </button>
        ))}
      </div>
      <div className="about-panel" id="about-panel" role="tabpanel" aria-labelledby={`about-tab-${tab}`} key={tab}>
        <View tx={tx} go={go} />
      </div>
    </article>
  )
}

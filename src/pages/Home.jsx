import { Link } from 'react-router'
import { useLang, useText } from '../i18n.jsx'
import { COMMON } from '../text.js'
import TopicGlyph from '../components/TopicGlyph.jsx'
import { firstGamePath, topics } from '../topics/topics.js'
import { HOME } from './text.js'
import HeroField from './HeroField.jsx'

// Home page (/): what StatsCool is. A hero over a crowd of yellow dots that the pointer pushes
// through (HeroField.jsx), how it works in three steps, what makes it
// different, the topics, and a last call to play.

export default function Home() {
  const { lang } = useLang()
  const tx = useText(HOME)
  const tc = useText(COMMON)
  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-text">
          <p className="eyebrow">{tx.eyebrow}</p>
          <h1>{tx.title}</h1>
          <p className="lead">{tx.lead}</p>
          <div className="home-cta">
            <Link to="/topics" className="btn btn-primary btn-lg">
              {tx.start}
            </Link>
            <Link to="/about" className="btn btn-ghost btn-lg">
              {tx.about}
            </Link>
          </div>
        </div>
        <HeroField caption={tx.heroCaption} aria={tx.heroAria} />
      </section>

      <section className="home-section">
        <h2>{tx.howTitle}</h2>
        <ol className="home-steps">
          {tx.how.map((s, i) => (
            <li key={s.title}>
              <span className="home-step-num" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* The four steps of every topic (the learning path) */}
      <section className="home-section">
        <h2>{tx.pathTitle}</h2>
        <p className="lead home-path-lead">{tx.pathLead}</p>
        <ol className="home-path">
          {tx.path.map((s, i) => (
            <li key={s.title} className={`is-${['discover', 'explore', 'train', 'check'][i]}`}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section">
        <h2>{tx.whyTitle}</h2>
        <ul className="home-why">
          {tx.why.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section">
        <div className="home-section-head">
          <h2>{tx.topicsTitle}</h2>
          <Link to="/topics" className="home-more">
            {tx.topicsMore}
          </Link>
        </div>
        <ul className="home-topics">
          {topics.map((t, i) => {
            const { title } = t.text[lang]
            return (
              <li key={t.slug}>
                <Link to={`/topics/${t.slug}`} className="home-topic">
                  <TopicGlyph shape={t.shape} />
                  <span className="home-topic-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="home-topic-title">{title}</span>
                  <span className="home-topic-game">{tc.gamesCount(t.games.length)}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="home-end">
        <h2>{tx.endTitle}</h2>
        <Link to={firstGamePath(topics[0])} className="btn btn-primary btn-lg">
          {tx.endButton}
        </Link>
      </section>
    </div>
  )
}

import { Link } from 'react-router'
import { useLang, useText } from '../i18n.jsx'
import { COMMON } from '../text.js'
import TopicGlyph from '../components/TopicGlyph.jsx'
import { firstGamePath, topics } from '../topics/topics.js'
import { HOME } from './text.js'

// Home page (/): what StatsCool is. A hero with a splash of yellow dots inside a bold dashed circle,
// ringed by grey circles that slowly switch between small and big (the Ebbinghaus illusion, the
// game of topic 06), how it works in three steps, what makes it different, the topics, and a last
// call to play.

// ---------- Hero drawing ----------
const VIEW = 480
const C = VIEW / 2 // centre of the figure
const RC = 64 // the bold circle around the splash
const DOT_R = 4.3
const N_DOTS = 100
// The splash: dots packed on a sunflower spiral (even spacing, no seed needed), inside the circle.
const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const SPLASH = Array.from({ length: N_DOTS }, (_, i) => {
  const d = (RC - 9) * Math.sqrt((i + 0.5) / N_DOTS)
  const a = i * GOLDEN
  return { x: C + d * Math.cos(a), y: C + d * Math.sin(a), d }
})
// The ring around it (as in the Ebbinghaus game, but 6 circles in both states so they can morph):
// small = radius 0.42 × RC, close in; big = 1.15 × RC, further out. The splash never changes.
const RING = 6
const SMALL = { r: RC * 0.42, dist: RC + RC * 0.42 + 9 }
const BIG = { r: RC * 1.15, dist: RC + RC * 1.15 + 10 }
const ringPose = (i, { r, dist }) => `translate(${C}px, ${C}px) rotate(${(i * 360) / RING - 90}deg) translateX(${dist}px) scale(${r})`
const SPLASH_MS = 1500 // last dot lands
const RING_DELAY = 2300

function HeroDots({ caption, aria }) {
  return (
    <figure className="hero-figure">
      <svg className="hero-dots" viewBox={`0 0 ${VIEW} ${VIEW}`} role="img" aria-label={aria}>
        <g className="hero-ring" style={{ animationDelay: `${RING_DELAY}ms` }}>
          {Array.from({ length: RING }, (_, i) => (
            <circle
              key={i}
              r={1}
              style={{
                transform: ringPose(i, SMALL),
                '--small': ringPose(i, SMALL),
                '--big': ringPose(i, BIG),
                animationDelay: `${RING_DELAY + 2600}ms`,
              }}
            />
          ))}
        </g>
        {SPLASH.map((p, i) => (
          <circle
            key={i}
            className="hero-dot"
            cx={p.x}
            cy={p.y}
            r={DOT_R}
            style={{
              '--dx': `${C - p.x}px`,
              '--dy': `${C - p.y}px`,
              animationDelay: `${150 + (p.d / RC) * 700 + (i % 5) * 40}ms`,
            }}
          />
        ))}
        <circle className="hero-circle" cx={C} cy={C} r={RC} style={{ animationDelay: `${SPLASH_MS}ms` }} />
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

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
        <HeroDots caption={tx.heroCaption} aria={tx.heroAria} />
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

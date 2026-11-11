import { Link } from 'react-router'
import { useLang, useText } from '../i18n.jsx'
import TopicGlyph from '../components/TopicGlyph.jsx'
import { topics } from '../topics/topics.js'
import { HOME } from './text.js'

// Home page (/): what StatsCool is. A hero with a drawing of dots dropping into a bell (the idea of
// every game), how it works in three steps, what makes it different, the topics, and a last call
// to play.

// ---------- Hero drawing ----------
const COLS = 17
const MID = (COLS - 1) / 2
const SIZE = 22 // one dot + gap, in viewBox units
const W = COLS * SIZE + 44
const BASE = 200
const H = BASE + 34
const X0 = 22
const height = (c) => 7.6 * Math.exp(-0.5 * ((c - MID) / 2.9) ** 2) // the bell, in dots per column

// Dots per column = the rounded bell (0 0 1 2 3 4 6 7 8 7 6 4 3 2 1 0 0), so the dots fit the curve.
const DOTS = []
for (let c = 0; c < COLS; c++) {
  for (let level = 0; level < Math.round(height(c)); level++) DOTS.push({ c, level })
}
// Drop order: shuffled with a fixed seed (the same every visit), like presses coming in at random.
let seed = 7
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const ORDER = DOTS.map((d, i) => ({ i, k: rand() }))
  .sort((a, b) => a.k - b.k)
  .map((o) => o.i)
// A dot can only land on the dots under it: re-number so each column fills from the bottom up.
const dropAt = new Array(DOTS.length)
const nextLevel = new Array(COLS).fill(0)
ORDER.forEach((di, step) => {
  const { c } = DOTS[di]
  const j = DOTS.findIndex((d) => d.c === c && d.level === nextLevel[c])
  nextLevel[c] += 1
  dropAt[j] = step
})
const DROP_MS = 55
const CURVE = Array.from({ length: 121 }, (_, i) => {
  const c = -0.5 + (i / 120) * COLS
  return `${i ? 'L' : 'M'}${(X0 + (c + 0.5) * SIZE).toFixed(1)},${(BASE - height(c) * SIZE).toFixed(1)}`
}).join('')

function HeroDots({ caption, aria, target }) {
  const cx = (c) => X0 + (c + 0.5) * SIZE
  return (
    <figure className="hero-figure">
      <svg className="hero-dots" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria}>
        <line className="hero-target" x1={cx(MID)} x2={cx(MID)} y1={18} y2={BASE} />
        {DOTS.map((d, i) => (
          <circle
            key={i}
            className="hero-dot"
            cx={cx(d.c)}
            cy={BASE - (d.level + 0.5) * SIZE}
            r={SIZE / 2 - 1.5}
            style={{ animationDelay: `${dropAt[i] * DROP_MS}ms` }}
          />
        ))}
        <path
          className="hero-curve"
          d={CURVE}
          pathLength="1"
          style={{ animationDelay: `${DOTS.length * DROP_MS + 250}ms` }}
        />
        <line className="hero-axis" x1={X0 - 6} x2={X0 + COLS * SIZE + 6} y1={BASE + 0.5} y2={BASE + 0.5} />
        <text className="hero-target-label" x={cx(MID)} y={BASE + 22} textAnchor="middle">
          {target}
        </text>
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

export default function Home() {
  const { lang } = useLang()
  const tx = useText(HOME)
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
        <HeroDots caption={tx.heroCaption} aria={tx.heroAria} target={tx.target} />
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
            const { game, title } = t.text[lang]
            return (
              <li key={t.slug}>
                <Link to={`/topics/${t.slug}`} className="home-topic">
                  <TopicGlyph shape={t.shape} />
                  <span className="home-topic-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="home-topic-title">{title}</span>
                  <span className="home-topic-game">{game}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="home-end">
        <h2>{tx.endTitle}</h2>
        <Link to="/topics/normal-distribution" className="btn btn-primary btn-lg">
          {tx.endButton}
        </Link>
      </section>
    </div>
  )
}

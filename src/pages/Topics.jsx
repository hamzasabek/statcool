import { Link } from 'react-router'
import { topics } from '../topics/topics.js'

export default function Topics() {
  return (
    <section>
      <h1>Topics</h1>
      <p className="lead">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Pick a topic to start exploring.
      </p>

      <ul className="topic-grid">
        {topics.map((t, i) => (
          <li key={t.slug}>
            {t.available ? (
              <Link to={`/topics/${t.slug}`} className="topic-card">
                <span className="topic-num">{String(i + 1).padStart(2, '0')}</span>
                <h2>{t.title}</h2>
                <p>{t.summary}</p>
                <span className="topic-cta">Start exploring →</span>
              </Link>
            ) : (
              <div className="topic-card is-disabled" aria-disabled="true">
                <span className="topic-num">{String(i + 1).padStart(2, '0')}</span>
                <h2>{t.title}</h2>
                <p>{t.summary}</p>
                <span className="topic-cta">Coming soon</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

import { Link } from 'react-router'
import { useLang, useText } from '../i18n.jsx'
import { COMMON } from '../text.js'
import { topics } from '../topics/topics.js'

export default function Topics() {
  const { lang } = useLang()
  const tx = useText(COMMON)
  return (
    <section>
      <h1>{tx.homeTitle}</h1>
      <p className="lead">{tx.homeLead}</p>

      <ul className="topic-grid">
        {topics.map((t, i) => {
          const { title, summary } = t.text[lang]
          const num = <span className="topic-num">{String(i + 1).padStart(2, '0')}</span>
          return (
            <li key={t.slug}>
              {t.available ? (
                <Link to={`/topics/${t.slug}`} className="topic-card">
                  {num}
                  <h2>{title}</h2>
                  <p>{summary}</p>
                  <span className="topic-cta">{tx.play}</span>
                </Link>
              ) : (
                <div className="topic-card is-disabled" aria-disabled="true">
                  {num}
                  <h2>{title}</h2>
                  <p>{summary}</p>
                  <span className="topic-cta">{tx.comingSoon}</span>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

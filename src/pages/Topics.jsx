import { Link } from 'react-router'
import { useLang, useText } from '../i18n.jsx'
import { COMMON } from '../text.js'
import { topics } from '../topics/topics.js'
import TopicGlyph from '../components/TopicGlyph.jsx'

// Topics page (/topics): the topics as a vertical timeline (numbered nodes on a line), each with
// the game's name, the title, one sentence and a small drawing of its distribution.

export default function Topics() {
  const { lang } = useLang()
  const tx = useText(COMMON)
  return (
    <section className="topics-page">
      <h1>{tx.topicsTitle}</h1>
      <p className="lead">{tx.topicsLead}</p>

      <ol className="timeline">
        {topics.map((t, i) => {
          const { game, title, summary } = t.text[lang]
          const inner = (
            <>
              <span className="tl-node" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="tl-body">
                <span className="tl-game">{game}</span>
                <span className="tl-title">{title}</span>
                <span className="tl-summary">{summary}</span>
                <span className="tl-cta">{t.available ? tx.play : tx.comingSoon}</span>
              </span>
              <TopicGlyph shape={t.shape} />
            </>
          )
          return (
            <li key={t.slug} className="tl-item" style={{ '--i': i }}>
              {t.available ? (
                <Link to={`/topics/${t.slug}`} className="tl-link">
                  {inner}
                </Link>
              ) : (
                <div className="tl-link is-disabled" aria-disabled="true">
                  {inner}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

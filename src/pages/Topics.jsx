import { Link } from 'react-router'
import { useLang, useText } from '../i18n.jsx'
import { COMMON } from '../text.js'
import { PARTS, topics } from '../topics/topics.js'
import TopicGlyph from '../components/TopicGlyph.jsx'

// Topics page (/topics): the course plan. One heading per part (PARTS), and under it the part's
// topics as a vertical timeline (numbered nodes on a line), each with its number of games, the
// title, one sentence, its games as chips and a small drawing. Numbers run on across parts.

export default function Topics() {
  const { lang } = useLang()
  const tx = useText(COMMON)
  return (
    <section className="topics-page">
      <h1>{tx.topicsTitle}</h1>
      <p className="lead">{tx.topicsLead}</p>

      {PARTS.map((part, p) => {
        const { title, lead } = part.text[lang]
        const items = topics.map((t, i) => ({ t, i })).filter(({ t }) => t.part === part.id)
        return (
          <section key={part.id} className={`tl-part${part.soon ? ' is-soon' : ''}`} aria-labelledby={`part-${part.id}`}>
            <p className="tl-part-label">{tx.part(p + 1)}</p>
            <h2 id={`part-${part.id}`}>{title}</h2>
            <p className="tl-part-lead">{lead}</p>
            {items.length > 0 && (
              <ol className="timeline">
                {items.map(({ t, i }, j) => (
                  <TopicItem key={t.slug} topic={t} number={i + 1} delay={j} lang={lang} tx={tx} />
                ))}
              </ol>
            )}
          </section>
        )
      })}
    </section>
  )
}

function TopicItem({ topic: t, number, delay, lang, tx }) {
  const { title, summary } = t.text[lang]
  return (
    <li className="tl-item" style={{ '--i': delay }}>
      <Link to={`/topics/${t.slug}`} className="tl-link">
        <span className="tl-node" aria-hidden="true">
          {String(number).padStart(2, '0')}
        </span>
        <span className="tl-body">
          <span className="tl-game">{tx.gamesCount(t.games.length)}</span>
          <span className="tl-title">{title}</span>
          <span className="tl-summary">{summary}</span>
          <span className="tl-games">
            {t.games.map((g) => (
              <span key={g.slug} className={`tl-chip${g.available ? '' : ' is-soon'}`}>
                {g.text[lang].name}
              </span>
            ))}
            {t.playground && <span className="tl-chip is-play">{tx.playground}</span>}
            {t.quiz && <span className="tl-chip is-quiz">{tx.quiz}</span>}
          </span>
        </span>
        <TopicGlyph shape={t.shape} />
      </Link>
    </li>
  )
}

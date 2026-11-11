import { Link, useParams } from 'react-router'
import { useLang, useText } from '../i18n.jsx'
import { COMMON } from '../text.js'
import { PARTS, findTopic, topics } from '../topics/topics.js'
import { GAMES } from '../topics/games.jsx'
import TopicGlyph from '../components/TopicGlyph.jsx'
import NotFound from './NotFound.jsx'

// A topic's page (/topics/<slug>): its title and idea, then one card per game (the experiment
// behind it and the one idea it teaches), its extras (free play, quiz), and links to the previous
// and next topics.
export function TopicPage() {
  const { slug } = useParams()
  const { lang } = useLang()
  const tx = useText(COMMON)
  const topic = findTopic(slug)
  if (!topic) return <NotFound />
  const i = topics.indexOf(topic)
  const part = PARTS.findIndex((p) => p.id === topic.part)
  const { title, summary } = topic.text[lang]
  const prev = topics[i - 1]
  const next = topics[i + 1]
  const num = (k) => String(k + 1).padStart(2, '0')

  return (
    <section className="topic-page">
      <Link to="/topics" className="back-link">
        {tx.back}
      </Link>
      <header className="topic-head">
        <div>
          <p className="eyebrow">{tx.topicEyebrow(part + 1, num(i))}</p>
          <h1>{title}</h1>
          <p className="lead">{summary}</p>
        </div>
        <TopicGlyph shape={topic.shape} />
      </header>

      <h2 className="topic-games-title">{tx.gamesCount(topic.games.length)}</h2>
      <ol className="topic-games">
        {topic.games.map((g, k) => {
          const { name, ref, idea } = g.text[lang]
          const inner = (
            <>
              <span className="topic-game-num">{tx.gameN(k + 1)}</span>
              <span className="topic-game-name">{name}</span>
              <span className="topic-game-ref">{ref}</span>
              <span className="topic-game-idea">{idea}</span>
              <span className="tl-cta">{g.available ? tx.play : tx.comingSoon}</span>
            </>
          )
          return (
            <li key={g.slug}>
              {g.available ? (
                <Link to={`/topics/${topic.slug}/${g.slug}`} className="topic-game">
                  {inner}
                </Link>
              ) : (
                <div className="topic-game is-disabled" aria-disabled="true">
                  {inner}
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {topic.extras?.map((x) => (
        <Link key={x.slug} to={`/topics/${topic.slug}/${x.slug}`} className={`topic-play is-${x.kind}`}>
          <span className="topic-play-tag">{x.kind === 'quiz' ? tx.quizTag : tx.playgroundTag}</span>
          <span className="topic-game-name">{x.text[lang].name}</span>
          <span className="topic-game-idea">{x.text[lang].idea}</span>
          <span className="tl-cta">{tx.play}</span>
        </Link>
      ))}

      <nav className="topic-nav" aria-label={tx.topicNav}>
        {prev ? (
          <Link to={`/topics/${prev.slug}`} className="topic-nav-link is-prev">
            <span>{tx.prevTopic}</span>
            {num(i - 1)} · {prev.text[lang].title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/topics/${next.slug}`} className="topic-nav-link is-next">
            <span>{tx.nextTopic}</span>
            {num(i + 1)} · {next.text[lang].title}
          </Link>
        )}
      </nav>
    </section>
  )
}

// A game's page (/topics/<slug>/<game>): the game's component, or 404.
export function GamePage() {
  const { slug, game } = useParams()
  const Game = GAMES[`${slug}/${game}`]
  return Game ? <Game /> : <NotFound />
}

import { Link } from 'react-router'
import { useText } from '../i18n.jsx'
import { ABOUT } from './text.js'

// About page (/about): why StatCool exists, the experiments behind the games, inspiration, privacy,
// open source, how it is built, and how to give feedback.

const REPO = 'https://github.com/hamzasabek/statcool'

const Out = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
)

export default function About() {
  const tx = useText(ABOUT)
  return (
    <article className="about prose">
      <h1>{tx.title}</h1>
      <p className="lead">{tx.lead}</p>

      <h2>{tx.whyTitle}</h2>
      <p>{tx.why}</p>

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
        {tx.openMiddle}
        <Out href={`${REPO}/blob/main/docs/CODE_GUIDE.md`}>{tx.guide}</Out>
        {tx.openAfter}
      </p>

      <h2>{tx.builtTitle}</h2>
      <p>{tx.built}</p>

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

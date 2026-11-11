import { Link } from 'react-router'
import { useText } from '../i18n.jsx'
import { COMMON } from '../text.js'

export default function NotFound() {
  const tx = useText(COMMON)
  return (
    <section>
      <h1>{tx.notFoundTitle}</h1>
      <p className="lead">
        {tx.notFoundText} <Link to="/topics">{tx.notFoundLink}</Link>.
      </p>
    </section>
  )
}

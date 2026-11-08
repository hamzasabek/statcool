import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section>
      <h1>Page not found</h1>
      <p className="lead">
        That page doesn&apos;t exist. <Link to="/topics">Go to the topics</Link>.
      </p>
    </section>
  )
}

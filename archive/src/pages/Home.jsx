import { Link } from 'react-router'

export default function Home() {
  return (
    <section className="hero">
      <p className="eyebrow">Welcome Hamza</p>
      <h1>Learn statistics by playing with it</h1>
      <p className="lead">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <p className="lead">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident.
      </p>
      <Link to="/topics" className="btn btn-primary">
        Browse topics
      </Link>
    </section>
  )
}

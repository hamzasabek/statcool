import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import Topics from './pages/Topics.jsx'
import About from './pages/About.jsx'
import NotFound from './pages/NotFound.jsx'
import References from './pages/References.jsx'
import { GamePage, TopicPage } from './pages/TopicPage.jsx'

// Home = the concept of the site, Topics = the course plan, a page per topic (its games), each
// game, About. Archived pages are in archive/.
function App() {
  // A new page starts at the top (the router keeps the scroll position otherwise).
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <Header />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/about" element={<About />} />
          <Route path="/references" element={<References />} />
          <Route path="/topics/:slug" element={<TopicPage />} />
          <Route path="/topics/:slug/:game" element={<GamePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}

export default App

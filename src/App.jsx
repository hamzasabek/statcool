import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import Topics from './pages/Topics.jsx'
import About from './pages/About.jsx'
import NotFound from './pages/NotFound.jsx'
import ClockGame from './topics/normal-distribution/ClockGame.jsx'
import MeanMedian from './topics/mean-median/MeanMedian.jsx'
import ReactionTime from './topics/right-skewed/ReactionTime.jsx'
import Neuron from './topics/exponential/Neuron.jsx'
import Ebbinghaus from './topics/binomial/Ebbinghaus.jsx'
import MemoryGame from './topics/variance-sd/MemoryGame.jsx'

// Home = the concept of the site, Topics = the list of games, About. Archived pages are in archive/.
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
          <Route path="/topics/normal-distribution" element={<ClockGame />} />
          <Route path="/topics/mean-median" element={<MeanMedian />} />
          <Route path="/topics/variance-sd" element={<MemoryGame />} />
          <Route path="/topics/right-skewed" element={<ReactionTime />} />
          <Route path="/topics/exponential" element={<Neuron />} />
          <Route path="/topics/binomial" element={<Ebbinghaus />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}

export default App

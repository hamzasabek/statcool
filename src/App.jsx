import { Navigate, Route, Routes } from 'react-router'
import Header from './components/Header.jsx'
import Topics from './pages/Topics.jsx'
import NotFound from './pages/NotFound.jsx'
import ClockGame from './topics/normal-distribution/ClockGame.jsx'
import MeanMedian from './topics/mean-median/MeanMedian.jsx'
import ReactionTime from './topics/right-skewed/ReactionTime.jsx'
import Neuron from './topics/exponential/Neuron.jsx'
import Psychic from './topics/binomial/Psychic.jsx'

// The site opens on the topic list. Archived pages (Home, About, other topics) are in archive/.
function App() {
  return (
    <>
      <Header />
      <main className="page">
        <Routes>
          <Route path="/" element={<Topics />} />
          <Route path="/topics" element={<Navigate to="/" replace />} />
          <Route path="/topics/normal-distribution" element={<ClockGame />} />
          <Route path="/topics/mean-median" element={<MeanMedian />} />
          <Route path="/topics/right-skewed" element={<ReactionTime />} />
          <Route path="/topics/exponential" element={<Neuron />} />
          <Route path="/topics/binomial" element={<Psychic />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}

export default App

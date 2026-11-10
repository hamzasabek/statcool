import { Route, Routes } from 'react-router'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import Topics from './pages/Topics.jsx'
import About from './pages/About.jsx'
import NotFound from './pages/NotFound.jsx'
import DataDistributions from './topics/data-distributions/DataDistributions.jsx'
import NormalDistribution from './topics/normal-distribution/NormalDistribution.jsx'
import MeanMedianMode from './topics/mean-median-mode/MeanMedianMode.jsx'

function App() {
  return (
    <>
      <Header />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/topics/normal-distribution" element={<NormalDistribution />} />
          <Route path="/topics/data-distributions" element={<DataDistributions />} />
          <Route path="/topics/mean-median-mode" element={<MeanMedianMode />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}

export default App

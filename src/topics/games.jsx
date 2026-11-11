import ClockGame from './normal-distribution/ClockGame.jsx'
import MeanMedian from './mean-median/MeanMedian.jsx'
import ReactionTime from './right-skewed/ReactionTime.jsx'
import Neuron from './exponential/Neuron.jsx'
import Ebbinghaus from './binomial/Ebbinghaus.jsx'
import MemoryGame from './variance-sd/MemoryGame.jsx'

// The component of each game, by "<topic slug>/<game slug>" (the texts are in topics.js).
export const GAMES = {
  'mean-median/muller-lyer': MeanMedian,
  'variance-sd/memory': MemoryGame,
  'normal-distribution/inner-clock': ClockGame,
  'right-skewed/reaction-time': ReactionTime,
  'exponential/neuron': Neuron,
  'binomial/ebbinghaus': Ebbinghaus,
}

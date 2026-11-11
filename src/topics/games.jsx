import ClockGame from './normal-distribution/ClockGame.jsx'
import MeanMedian from './mean-median/MeanMedian.jsx'
import DigitSpan from './mean-median/DigitSpan.jsx'
import BlueSeven from './mean-median/BlueSeven.jsx'
import ReactionTime from './right-skewed/ReactionTime.jsx'
import Neuron from './exponential/Neuron.jsx'
import Ebbinghaus from './binomial/Ebbinghaus.jsx'
import MemoryGame from './variance-sd/MemoryGame.jsx'

// The component of each game, by "<topic slug>/<game slug>" (the texts are in topics.js).
export const GAMES = {
  'mean-median/muller-lyer': MeanMedian,
  'mean-median/digit-span': DigitSpan,
  'mean-median/blue-seven': BlueSeven,
  'variance-sd/memory': MemoryGame,
  'normal-distribution/inner-clock': ClockGame,
  'right-skewed/reaction-time': ReactionTime,
  'exponential/neuron': Neuron,
  'binomial/ebbinghaus': Ebbinghaus,
}

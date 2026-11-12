import ClockGame from './normal-distribution/ClockGame.jsx'
import MeanMedian from './mean-median/MeanMedian.jsx'
import DigitSpan from './mean-median/DigitSpan.jsx'
import BlueSeven from './mean-median/BlueSeven.jsx'
import Playground from './mean-median/Playground.jsx'
import MeanQuiz from './mean-median/MeanQuiz.jsx'
import CalcLab from './mean-median/CalcLab.jsx'
import MeanRecap from './mean-median/MeanRecap.jsx'
import ReactionTime from './right-skewed/ReactionTime.jsx'
import Neuron from './exponential/Neuron.jsx'
import Ebbinghaus from './binomial/Ebbinghaus.jsx'
import MemoryGame from './variance-sd/MemoryGame.jsx'
import Bisection from './variance-sd/Bisection.jsx'
import Dots from './variance-sd/Dots.jsx'

// The component of each game, by "<topic slug>/<game slug>" (the texts are in topics.js).
export const GAMES = {
  'mean-median/muller-lyer': MeanMedian,
  'mean-median/digit-span': DigitSpan,
  'mean-median/blue-seven': BlueSeven,
  'mean-median/playground': Playground,
  'mean-median/calculate': CalcLab,
  'mean-median/quiz': MeanQuiz,
  'variance-sd/memory': MemoryGame,
  'variance-sd/find-the-middle': Bisection,
  'variance-sd/how-many-dots': Dots,
  'normal-distribution/inner-clock': ClockGame,
  'right-skewed/reaction-time': ReactionTime,
  'exponential/neuron': Neuron,
  'binomial/ebbinghaus': Ebbinghaus,
}

// A recap sheet per topic, shown on the topic page after the games (optional).
export const RECAPS = {
  'mean-median': MeanRecap,
}

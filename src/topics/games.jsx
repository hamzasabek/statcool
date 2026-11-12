import ClockGame from './normal-distribution/ClockGame.jsx'
import SumNeuron from './normal-distribution/SumNeuron.jsx'
import TapBeat from './normal-distribution/TapBeat.jsx'
import NormalPlay from './normal-distribution/NormalPlay.jsx'
import NormalCalc from './normal-distribution/NormalCalc.jsx'
import MeanMedian from './mean-median/MeanMedian.jsx'
import DigitSpan from './mean-median/DigitSpan.jsx'
import BlueSeven from './mean-median/BlueSeven.jsx'
import Playground from './mean-median/Playground.jsx'
import MeanQuiz from './mean-median/MeanQuiz.jsx'
import SpotCentre from './mean-median/SpotCentre.jsx'
import CalcLab from './mean-median/CalcLab.jsx'
import MeanRecap from './mean-median/MeanRecap.jsx'
import ReactionTime from './right-skewed/ReactionTime.jsx'
import Neuron from './exponential/Neuron.jsx'
import Ebbinghaus from './binomial/Ebbinghaus.jsx'
import MemoryGame from './variance-sd/MemoryGame.jsx'
import Bisection from './variance-sd/Bisection.jsx'
import Dots from './variance-sd/Dots.jsx'
import SpreadPlay from './variance-sd/SpreadPlay.jsx'
import SdCalc from './variance-sd/SdCalc.jsx'
import SdQuiz from './variance-sd/SdQuiz.jsx'
import SpotSpread from './variance-sd/SpotSpread.jsx'
import ReadBell from './normal-distribution/ReadBell.jsx'

// The component of each game, by "<topic slug>/<game slug>" (the texts are in topics.js).
export const GAMES = {
  'mean-median/muller-lyer': MeanMedian,
  'mean-median/digit-span': DigitSpan,
  'mean-median/blue-seven': BlueSeven,
  'mean-median/playground': Playground,
  'mean-median/calculate': CalcLab,
  'mean-median/spot-the-centre': SpotCentre,
  'mean-median/quiz': MeanQuiz,
  'variance-sd/memory': MemoryGame,
  'variance-sd/find-the-middle': Bisection,
  'variance-sd/how-many-dots': Dots,
  'variance-sd/playground': SpreadPlay,
  'variance-sd/calculate': SdCalc,
  'variance-sd/spot-the-spread': SpotSpread,
  'variance-sd/quiz': SdQuiz,
  'normal-distribution/inner-clock': ClockGame,
  'normal-distribution/neuron-sum': SumNeuron,
  'normal-distribution/tap-the-beat': TapBeat,
  'normal-distribution/playground': NormalPlay,
  'normal-distribution/read-the-bell': ReadBell,
  'normal-distribution/calculate': NormalCalc,
  'right-skewed/reaction-time': ReactionTime,
  'exponential/neuron': Neuron,
  'binomial/ebbinghaus': Ebbinghaus,
}

// A recap sheet per topic, shown on the topic page after the games (optional).
export const RECAPS = {
  'mean-median': MeanRecap,
}

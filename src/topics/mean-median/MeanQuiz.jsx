import Quiz from '../../components/Quiz.jsx'
import { QUIZ } from './quiz.js'

// Topic 01's quiz: 9 questions about the three games and the playground.
const TITLE = { en: 'Quiz: mean, median and mode', fr: 'Quiz\u00a0: moyenne, médiane et mode' }

export default function MeanQuiz() {
  return <Quiz questions={QUIZ} title={TITLE} topic="mean-median" guideId="quiz-mean-median" />
}

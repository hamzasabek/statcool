import Quiz from '../../components/Quiz.jsx'
import { QUIZ } from './quiz.js'

// Topic 01's quiz: 9 questions drawn at random from a bank of 30 (quiz.js), a new set each time.
const TITLE = { en: 'Quiz: mean, median and mode', fr: 'Quiz\u00a0: moyenne, médiane et mode' }

export default function MeanQuiz() {
  return <Quiz questions={QUIZ} count={9} title={TITLE} topic="mean-median" guideId="quiz-mean-median" />
}

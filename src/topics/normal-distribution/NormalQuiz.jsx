import Quiz from '../../components/Quiz.jsx'
import { QUIZ } from './quiz.js'

// Topic 03's quiz: 9 questions drawn at random from a bank of 30 (quiz.js), a new set each time.
const TITLE = { en: 'Quiz: the normal distribution', fr: 'Quiz : la loi normale' }

export default function NormalQuiz() {
  return <Quiz questions={QUIZ} count={9} title={TITLE} topic="normal-distribution" guideId="quiz-normal-distribution" />
}

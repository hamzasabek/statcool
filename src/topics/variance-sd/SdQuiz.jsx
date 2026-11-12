import Quiz from '../../components/Quiz.jsx'
import { QUIZ } from './quiz.js'

// Topic 02's quiz: 9 questions drawn at random from a bank of 30 (quiz.js), a new set each time.
const TITLE = { en: 'Quiz: variance and standard deviation', fr: 'Quiz : variance et écart-type' }

export default function SdQuiz() {
  return <Quiz questions={QUIZ} count={9} title={TITLE} topic="variance-sd" guideId="quiz-variance-sd" />
}

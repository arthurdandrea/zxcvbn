import Matching from './Matching'
import scoring from './scoring'
import TimeEstimates from './TimeEstimates'
import Feedback from './Feedback'
import { normalizeOptions } from './Options'
import { OptionsType } from './types'

const time = () => new Date().getTime()

export default function zxcvbn(
  password: string,
  userInputs: any[] = [],
  options: OptionsType = {},
) {
  const normalizedOptions = normalizeOptions({ ...options, userInputs })
  const feedback = new Feedback(normalizedOptions.translations)
  const timeEstimates = new TimeEstimates(normalizedOptions.translations)
  const start = time()
  const matching = new Matching(normalizedOptions)
  const matches = matching.match(password)
  const matchSequence = scoring.mostGuessableMatchSequence(
    password,
    matches,
    normalizedOptions,
  )
  const calcTime = time() - start
  const attackTimes = timeEstimates.estimateAttackTimes(matchSequence.guesses)
  return {
    calcTime,
    ...matchSequence,
    ...attackTimes,
    feedback: feedback.getFeedback(attackTimes.score, matchSequence.sequence),
  }
}

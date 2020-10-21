import Matching from './Matching'
import { mostGuessableMatchSequence } from './scoring'
import * as estimates from './TimeEstimates'
import getFeedback from './Feedback'
import { normalizeOptions } from './Options'
import {
  CrackTimesDisplay,
  CrackTimesSeconds,
  FeedbackType,
  OptionsType,
} from './types'
import { AnyEstimatedMatch } from './scoring/estimate'
import utils from './scoring/utils'

export { OptionsType as Options } from './types'

const time = () => new Date().getTime()

export interface ZxcvbnResponse {
  password: string
  score: 0 | 1 | 2 | 3 | 4
  crackTimesSeconds: CrackTimesSeconds
  crackTimesDisplay: CrackTimesDisplay
  sequence: AnyEstimatedMatch[]
  guesses: number
  guessesLog10: number
  calcTime: number
  feedback: FeedbackType
}

export default function zxcvbn(
  password: string,
  userInputs: any[] = [],
  options: OptionsType = {},
): ZxcvbnResponse {
  const normalizedOptions = normalizeOptions({ ...options, userInputs })
  const start = time()
  const matching = new Matching(normalizedOptions)
  const matches = matching.match(password)
  const { guesses, sequence } = mostGuessableMatchSequence(
    password,
    matches,
    normalizedOptions,
  )
  const calcTime = time() - start
  const crackTimesSeconds = estimates.estimateAttackTimes(guesses)
  const score = estimates.guessesToScore(guesses)
  return {
    password,
    calcTime,
    guesses,
    guessesLog10: utils.log10(guesses),
    sequence,
    crackTimesSeconds,
    crackTimesDisplay: estimates.translateAttackTimes(
      crackTimesSeconds,
      normalizedOptions.translations,
    ),
    score,
    feedback: getFeedback(score, sequence, normalizedOptions.translations),
  }
}

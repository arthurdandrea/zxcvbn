import Matching from './Matching'
import { mostGuessableMatchSequence } from './scoring'
import estimateAttackTimes from './TimeEstimates'
import getFeedback from './Feedback'
import { normalizeOptions } from './Options'
import {
  CrackTimesDisplay,
  CrackTimesSeconds,
  FeedbackType,
  OptionsType,
} from './types'
import { AnyEstimatedMatch } from './scoring/estimate'

const time = () => new Date().getTime()

export interface ZxcvbnResponse {
  password: string
  score: 1 | 2 | 3 | 4
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
  const matchSequence = mostGuessableMatchSequence(
    password,
    matches,
    normalizedOptions,
  )
  const calcTime = time() - start
  const attackTimes = estimateAttackTimes(
    matchSequence.guesses,
    normalizedOptions.translations,
  )
  return {
    calcTime,
    ...matchSequence,
    ...attackTimes,
    feedback: getFeedback(
      attackTimes.score,
      matchSequence.sequence,
      normalizedOptions.translations,
    ),
  }
}

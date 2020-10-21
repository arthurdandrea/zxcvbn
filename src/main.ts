import type { FeedbackType } from './Feedback'
import getFeedback from './Feedback'
import Matching from './Matching'
import { normalizeOptions } from './Options'
import { mostGuessableMatchSequence } from './scoring'
import type { AnyEstimatedMatch } from './scoring/estimate'
import { log10 } from './scoring/utils'
import type { CrackTimesDisplay, CrackTimesSeconds } from './TimeEstimates'
import {
  estimateAttackTimes,
  guessesToScore,
  translateAttackTimes,
} from './TimeEstimates'
import type { Options } from './types'

export type { FeedbackType } from './Feedback'
export type { AnyEstimatedMatch } from './scoring/estimate'
export type { CrackTimesDisplay, CrackTimesSeconds } from './TimeEstimates'
export type {
  Dictionary,
  Graphs,
  Keyboards,
  Keypads,
  Options,
  Translations,
} from './types'

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
  options: Options = {},
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
  const crackTimesSeconds = estimateAttackTimes(guesses)
  const score = guessesToScore(guesses)
  return {
    password,
    calcTime,
    guesses,
    guessesLog10: log10(guesses),
    sequence,
    crackTimesSeconds,
    crackTimesDisplay: translateAttackTimes(
      crackTimesSeconds,
      normalizedOptions.translations,
    ),
    score,
    feedback: getFeedback(score, sequence, normalizedOptions.translations),
  }
}

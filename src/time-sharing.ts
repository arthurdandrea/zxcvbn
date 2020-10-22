import getFeedback from './Feedback'
import type {
  Options as MainOptions,
  ZxcvbnResponse as MainZxcvbnResponse,
} from './main'
import Matching from './Matching'
import { normalizeOptions } from './Options'
import { mostGuessableMatchSequence } from './scoring'
import { log10 } from './scoring/utils'
import * as estimates from './TimeEstimates'
import type { IdleDeadline, TimeSharingContinuation } from './types'

export type { FeedbackType } from './Feedback'
export type { AnyEstimatedMatch } from './scoring/estimate'
export type { CrackTimesDisplay, CrackTimesSeconds } from './TimeEstimates'
export type {
  Dictionary,
  Graphs,
  Keyboards,
  Keypads,
  TimeSharingContinuation,
  Translations,
} from './types'

export interface Options extends MainOptions {
  idleDeadline: IdleDeadline
}

export interface ZxcvbnResponse extends Omit<MainZxcvbnResponse, 'calcTime'> {}

export default function timeSharingZxcvbn(
  password: string,
  options: Options,
  callback: (err: any, response?: ZxcvbnResponse) => void,
): TimeSharingContinuation | void {
  const normalizedOptions = normalizeOptions(options)
  const matcher = new Matching(normalizedOptions)
  return matcher.timeSharingMatch(
    password,
    options.idleDeadline,
    (err, matches) => {
      if (err) {
        callback(err)
        return
      }
      let response!: ZxcvbnResponse
      try {
        const { guesses, sequence } = mostGuessableMatchSequence(
          password,
          matches!,
          normalizedOptions,
        )
        const crackTimesSeconds = estimates.estimateAttackTimes(guesses)
        const score = estimates.guessesToScore(guesses)
        response = {
          password,
          guesses,
          guessesLog10: log10(guesses),
          sequence,
          crackTimesSeconds,
          crackTimesDisplay: estimates.translateAttackTimes(
            crackTimesSeconds,
            normalizedOptions.translations,
          ),
          score,
          feedback: getFeedback(
            score,
            sequence,
            normalizedOptions.translations,
          ),
        }
      } catch (err2) {
        callback(err2)
        return
      }
      callback(null, response)
    },
  )
}

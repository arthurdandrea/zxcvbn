import {
  MIN_SUBMATCH_GUESSES_SINGLE_CHAR,
  MIN_SUBMATCH_GUESSES_MULTI_CHAR,
} from '~/data/const'
import bruteforceGuesses from './guesses/bruteforce'
import dateGuesses from './guesses/date'
import dictionaryGuesses from './guesses/dictionary'
import regexGuesses from './guesses/regex'
import repeatGuesses from './guesses/repeat'
import sequenceGuesses from './guesses/sequence'
import spatialGuesses from './guesses/spatial'
import utils from './utils'
import { ExtendedMatch, Match } from '../types'
import { NormalizedOptions } from '~/Options'

const estimationFunctions = {
  bruteforce: bruteforceGuesses,
  repeat: repeatGuesses,
  sequence: sequenceGuesses,
  regex: regexGuesses,
  date: dateGuesses,
}

// ------------------------------------------------------------------------------
// guess estimation -- one function per match pattern ---------------------------
// ------------------------------------------------------------------------------

export default (
  match: ExtendedMatch | Match,
  password: string,
  options: NormalizedOptions,
) => {
  const extraData: {
    baseGuesses?: number
    uppercaseVariations?: number
    l33tVariations?: number
  } = {}
  // a match's guess estimate doesn't change. cache it.
  if ('guesses' in match && match.guesses != null) {
    return match
  }
  let minGuesses = 1
  if (match.token.length < password.length) {
    if (match.token.length === 1) {
      minGuesses = MIN_SUBMATCH_GUESSES_SINGLE_CHAR
    } else {
      minGuesses = MIN_SUBMATCH_GUESSES_MULTI_CHAR
    }
  }
  let guesses: number
  if (match.pattern === 'dictionary') {
    const result = dictionaryGuesses(match as any)
    guesses = result.calculation
    extraData.baseGuesses = result.baseGuesses
    extraData.uppercaseVariations = result.uppercaseVariations
    extraData.l33tVariations = result.l33tVariations
  } else if (match.pattern === 'spatial') {
    guesses = spatialGuesses(match as any, options)
  } else {
    guesses = estimationFunctions[match.pattern](match as any)
  }
  const matchGuesses = Math.max(guesses, minGuesses)
  return {
    ...match,
    ...extraData,
    guesses: matchGuesses,
    guessesLog10: utils.log10(matchGuesses),
  }
}

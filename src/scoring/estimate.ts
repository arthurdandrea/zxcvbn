import {
  MIN_SUBMATCH_GUESSES_MULTI_CHAR,
  MIN_SUBMATCH_GUESSES_SINGLE_CHAR,
} from '~/data/const'
import type { NormalizedOptions } from '~/Options'

import type { AnyDictionaryMatch, AnyMatch } from '../types'
import bruteforceGuesses from './guesses/bruteforce'
import dateGuesses from './guesses/date'
import dictionaryGuesses from './guesses/dictionary'
import regexGuesses from './guesses/regex'
import repeatGuesses from './guesses/repeat'
import sequenceGuesses from './guesses/sequence'
import spatialGuesses from './guesses/spatial'
import { log10 } from './utils'

// ------------------------------------------------------------------------------
// guess estimation -- one function per match pattern ---------------------------
// ------------------------------------------------------------------------------

export interface Guesses {
  readonly guesses: number
  readonly guessesLog10: number
}

export interface DictionaryGuesses extends Guesses {
  baseGuesses: number
  uppercaseVariations: number
  l33tVariations: number
}

export type AnyDictionaryEstimatedMatch = AnyDictionaryMatch & DictionaryGuesses

export type AnyEstimatedMatch =
  | (Exclude<AnyMatch, AnyDictionaryMatch> & Guesses)
  | AnyDictionaryEstimatedMatch

export default function estimateGuesses(
  match: AnyMatch,
  password: string,
  options: NormalizedOptions,
): AnyEstimatedMatch {
  if (match.pattern === 'dictionary') {
    const result = dictionaryGuesses(match)
    return {
      ...match,
      baseGuesses: result.baseGuesses,
      uppercaseVariations: result.uppercaseVariations,
      l33tVariations: result.l33tVariations,
      ...helper(result.calculation),
    }
  }
  if (match.pattern === 'spatial') {
    return {
      ...match,
      ...helper(spatialGuesses(match, options)),
    }
  }
  if (match.pattern === 'repeat') {
    return {
      ...match,
      // FIXME
      ...helper(repeatGuesses(match as any)),
    }
  }
  if (match.pattern === 'bruteforce') {
    return {
      ...match,
      ...helper(bruteforceGuesses(match)),
    }
  }
  if (match.pattern === 'date') {
    return {
      ...match,
      ...helper(dateGuesses(match)),
    }
  }
  if (match.pattern === 'sequence') {
    return {
      ...match,
      ...helper(sequenceGuesses(match)),
    }
  }
  return {
    ...match,
    ...helper(regexGuesses(match)),
  }

  function helper(guesses: number) {
    let minGuesses = 1
    if (match.token.length < password.length) {
      if (match.token.length === 1) {
        minGuesses = MIN_SUBMATCH_GUESSES_SINGLE_CHAR
      } else {
        minGuesses = MIN_SUBMATCH_GUESSES_MULTI_CHAR
      }
    }
    const matchGuesses = Math.max(guesses, minGuesses)
    return {
      guesses: matchGuesses,
      get guessesLog10() {
        const value = log10(this.guesses)
        Object.defineProperty(this, 'guessesLog10', {
          value,
          enumerable: true,
        })
        return value
      },
    }
  }
}

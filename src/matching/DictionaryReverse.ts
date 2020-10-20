import { sorted } from '~/helper'
import MatchDictionary, { DictionaryMatch } from './Dictionary'

export interface ReverseDictionaryMatch
  extends Omit<DictionaryMatch, 'reversed'> {
  reversed: true
}

/*
 * -------------------------------------------------------------------------------
 *  Dictionary reverse ----------------------------------------------------------------
 * -------------------------------------------------------------------------------
 */
class MatchDictionaryReverse {
  dictionary: MatchDictionary

  constructor(options: MatchDictionary | MatchDictionary.Options) {
    this.dictionary =
      options instanceof MatchDictionary
        ? options
        : new MatchDictionary(options)
  }

  match(password: string): ReverseDictionaryMatch[] {
    const passwordReversed = password.split('').reverse().join('')
    const matches = this.dictionary.match(passwordReversed).map((match) => ({
      ...match,
      token: match.token.split('').reverse().join(''), // reverse back
      reversed: true as const,
      // map coordinates back to original string
      i: password.length - 1 - match.j,
      j: password.length - 1 - match.i,
    }))
    return sorted(matches)
  }
}

export default MatchDictionaryReverse

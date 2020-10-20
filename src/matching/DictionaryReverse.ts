import { sorted } from '~/helper'
import MatchDictionary from './Dictionary'
import { ExtendedMatch, Matcher } from '../types'

/*
 * -------------------------------------------------------------------------------
 *  Dictionary reverse ----------------------------------------------------------------
 * -------------------------------------------------------------------------------
 */
class MatchDictionaryReverse implements Matcher {
  dictionary: MatchDictionary

  constructor(options: MatchDictionary | MatchDictionary.Options) {
    this.dictionary =
      options instanceof MatchDictionary
        ? options
        : new MatchDictionary(options)
  }

  match(password: string) {
    const passwordReversed = password.split('').reverse().join('')
    const matches = this.dictionary
      .match(passwordReversed)
      .map((match: ExtendedMatch) => ({
        ...match,
        token: match.token.split('').reverse().join(''), // reverse back
        reversed: true,
        // map coordinates back to original string
        i: password.length - 1 - match.j,
        j: password.length - 1 - match.i,
      }))
    return sorted(matches)
  }
}

export default MatchDictionaryReverse

import { sorted } from '~/helper'
import type { Matcher } from '~/types'

import type { DictionaryMatch } from './Dictionary'
import DictionaryMatcher from './Dictionary'

export interface ReverseDictionaryMatch
  extends Omit<DictionaryMatch, 'reversed'> {
  reversed: true
}

/*
 * -------------------------------------------------------------------------------
 * Dictionary reverse ------------------------------------------------------------
 * -------------------------------------------------------------------------------
 */
class ReverseDictionaryMatcher implements Matcher {
  dictionary: DictionaryMatcher

  constructor(options: DictionaryMatcher | DictionaryMatcher.Options) {
    this.dictionary =
      options instanceof DictionaryMatcher
        ? options
        : new DictionaryMatcher(options)
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

export default ReverseDictionaryMatcher

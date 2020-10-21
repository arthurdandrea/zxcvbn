import { sorted } from '~/helper'
import { buildRankedDictionaries } from '~/Options'

import type { Matcher, RankedDictionaries } from '../types'

export interface DictionaryMatch {
  pattern: 'dictionary'
  i: number
  j: number
  token: string
  matchedWord: string
  rank: number
  dictionaryName: string
  reversed: false
  l33t: false
  sub?: never
}

class DictionaryMatcher implements Matcher {
  readonly rankedDictionaries: RankedDictionaries

  constructor(options?: DictionaryMatcher.Options) {
    if (options && 'rankedDictionaries' in options) {
      this.rankedDictionaries = options.rankedDictionaries
    } else {
      this.rankedDictionaries = buildRankedDictionaries(
        (options && 'dictionaries' in options && options?.dictionaries) ||
          undefined,
        options?.userInputs,
      )
    }
  }

  match(password: string) {
    // rankedDictionaries variable is for unit testing purposes
    const matches: DictionaryMatch[] = []
    const passwordLength = password.length
    const passwordLower = password.toLowerCase()

    for (const [dictionaryName, rankedDict] of this.rankedDictionaries) {
      for (let i = 0; i < passwordLength; i += 1) {
        for (let j = i; j < passwordLength; j += 1) {
          const word = passwordLower.slice(i, +j + 1 || 9e9)
          const rank = rankedDict.get(word)
          if (rank) {
            matches.push({
              pattern: 'dictionary',
              i,
              j,
              token: password.slice(i, +j + 1 || 9e9),
              matchedWord: word,
              rank,
              dictionaryName,
              reversed: false,
              l33t: false,
            })
          }
        }
      }
    }
    return sorted(matches)
  }
}

namespace DictionaryMatcher {
  export interface RankedDictionariesOptions {
    rankedDictionaries: RankedDictionaries
  }
  export interface DictionariesOptions {
    dictionaries?: Record<string, string[]>
    userInputs?: string[]
  }
  export type Options = DictionariesOptions | RankedDictionariesOptions
}

export default DictionaryMatcher

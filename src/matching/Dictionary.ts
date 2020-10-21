import { sorted } from '~/helper'
import { RankedDictionaries } from '../types'
import { buildRankedDictionaries } from '~/Options'

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

class MatchDictionary {
  readonly rankedDictionaries: RankedDictionaries

  constructor(options?: MatchDictionary.Options) {
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

namespace MatchDictionary {
  export interface RankedDictionariesOptions {
    rankedDictionaries: RankedDictionaries
  }
  export interface DictionariesOptions {
    dictionaries?: Record<string, string[]>
    userInputs?: string[]
  }
  export type Options = DictionariesOptions | RankedDictionariesOptions
}

export default MatchDictionary

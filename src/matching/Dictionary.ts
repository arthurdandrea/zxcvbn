import { buildRankedDictionary, sorted } from '~/helper'
import { ExtendedMatch, DictionaryNames, RankedDictionaries } from '../types'
import frequencyLists from '~/data/frequency_lists'

class MatchDictionary {
  readonly rankedDictionaries: Readonly<
    Record<string, Readonly<Record<string, number>>>
  >

  constructor(options?: MatchDictionary.Options) {
    let mutable = false
    let rankedDictionaries: RankedDictionaries
    if (options && 'rankedDictionaries' in options) {
      ;({ rankedDictionaries } = options)
    } else {
      mutable = true
      rankedDictionaries = {}
      const dictionary =
        (options && 'dictionaries' in options && options?.dictionaries) ||
        frequencyLists
      Object.keys(dictionary).forEach((name) => {
        rankedDictionaries[name] = buildRankedDictionary(dictionary[name])
      })
    }
    if (options?.userInputs) {
      const rankedUserInputs = buildRankedDictionary(options.userInputs)
      if (mutable) {
        rankedDictionaries.userInputs = rankedUserInputs
      } else {
        rankedDictionaries = {
          ...rankedDictionaries,
          userInputs: rankedUserInputs,
        }
      }
    }
    this.rankedDictionaries = rankedDictionaries
  }

  match(password: string) {
    // rankedDictionaries variable is for unit testing purposes
    const matches: ExtendedMatch[] = []
    const passwordLength = password.length
    const passwordLower = password.toLowerCase()

    Object.keys(this.rankedDictionaries).forEach(
      // @ts-ignore
      (dictionaryName: DictionaryNames) => {
        const rankedDict = this.rankedDictionaries[dictionaryName]
        for (let i = 0; i < passwordLength; i += 1) {
          for (let j = i; j < passwordLength; j += 1) {
            if (passwordLower.slice(i, +j + 1 || 9e9) in rankedDict) {
              const word = passwordLower.slice(i, +j + 1 || 9e9)
              const rank = rankedDict[word]
              // @ts-ignore
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
      },
    )
    return sorted(matches)
  }
}

namespace MatchDictionary {
  export interface RankedDictionariesOptions {
    rankedDictionaries: Readonly<
      Record<string, Readonly<Record<string, number>>>
    >
  }
  export interface DictionariesOptions {
    dictionaries: Record<string, string[]>
  }
  export type Options = (
    | DictionariesOptions
    | RankedDictionariesOptions
    | {}
  ) & {
    userInputs?: string[]
  }
}

export default MatchDictionary

import { extend, sorted } from './helper'
import Dictionary from './matching/Dictionary'
import L33t from './matching/L33t'
import DictionaryReverse from './matching/DictionaryReverse'
import Spatial from './matching/Spatial'
import Repeat from './matching/Repeat'
import Sequence from './matching/Sequence'
import Regex from './matching/Regex'
import Date from './matching/Date'
import { ExtendedMatch, Matcher } from './types'
import { NormalizedOptions } from './Options'

/*
 * -------------------------------------------------------------------------------
 *  Omnimatch combine matchers ---------------------------------------------------------------
 * -------------------------------------------------------------------------------
 */

class Matching {
  private matchers: readonly Matcher[]

  constructor(options: NormalizedOptions) {
    const dictionary = new Dictionary({
      rankedDictionaries: options.rankedDictionaries,
    })
    this.matchers = [
      dictionary,
      new DictionaryReverse(dictionary),
      new L33t({ dictionary, l33tTable: options.l33tTable }),
      new Spatial({ adjacencyGraphs: options.adjacencyGraphs }),
      new Repeat(),
      new Sequence(),
      new Regex(),
      new Date(),
    ]
  }

  match(password: string) {
    const matches: ExtendedMatch[] = []
    this.matchers.forEach((matcher) => {
      extend(matches, matcher.match(password))
    })
    return sorted(matches)
  }
}

export default Matching

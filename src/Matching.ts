import { extend, sorted } from './helper'
import DateMatcher from './matching/Date'
import DictionaryMatcher from './matching/Dictionary'
import ReverseDictionaryMatcher from './matching/DictionaryReverse'
import L33tMatcher from './matching/L33t'
import RegexMatcher from './matching/Regex'
import RepeatMatcher from './matching/Repeat'
import SequenceMatcher from './matching/Sequence'
import SpatialMatcher from './matching/Spatial'
import type { NormalizedOptions } from './Options'
import type { AnyMatch, Matcher } from './types'

/*
 * -------------------------------------------------------------------------------
 *  Omnimatch combine matchers ---------------------------------------------------------------
 * -------------------------------------------------------------------------------
 */

class Matching {
  private matchers: readonly Matcher[]

  constructor(options: NormalizedOptions) {
    const dictionary = new DictionaryMatcher({
      rankedDictionaries: options.rankedDictionaries,
    })
    this.matchers = [
      dictionary,
      new ReverseDictionaryMatcher(dictionary),
      new L33tMatcher({ dictionary, l33tTable: options.l33tTable }),
      new SpatialMatcher({ adjacencyGraphs: options.adjacencyGraphs }),
      new RepeatMatcher(),
      new SequenceMatcher(),
      new RegexMatcher(),
      new DateMatcher(),
    ]
  }

  match(password: string) {
    const matches: AnyMatch[] = []
    this.matchers.forEach((matcher) => {
      extend(matches, matcher.match(password))
    })
    return sorted(matches)
  }
}

export default Matching

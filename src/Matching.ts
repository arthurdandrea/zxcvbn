import { extend, sorted } from './helper'
import DictionaryMatcher from './matching/Dictionary'
import L33tMatcher from './matching/L33t'
import ReverseDictionaryMatcher from './matching/DictionaryReverse'
import SpatialMatcher from './matching/Spatial'
import RepeatMatcher from './matching/Repeat'
import SequenceMatcher from './matching/Sequence'
import RegexMatcher from './matching/Regex'
import DateMatcher from './matching/Date'
import { AnyMatch, Matcher } from './types'
import { NormalizedOptions } from './Options'

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

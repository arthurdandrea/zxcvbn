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
import type {
  AnyMatch,
  IdleDeadline,
  Matcher,
  TimeSharingCallback,
  TimeSharingContinuation,
} from './types'

/*
 * -------------------------------------------------------------------------------
 *  Omnimatch combine matchers ---------------------------------------------------------------
 * -------------------------------------------------------------------------------
 */

class Matching {
  private matchers: readonly Matcher[]

  constructor(options: NormalizedOptions) {
    const dictionary = new DictionaryMatcher(options)
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

  timeSharingMatch(
    password: string,
    idleDeadline: IdleDeadline,
    callback: TimeSharingCallback<AnyMatch[]>,
  ): TimeSharingContinuation | void {
    const matches: AnyMatch[] = []
    const iterator = this.matchers[Symbol.iterator]()
    let subIterator: Iterator<void, AnyMatch[]> | undefined = undefined
    const next: TimeSharingContinuation = () => {
      try {
        while (idleDeadline.timeRemaining() > 0) {
          if (subIterator) {
            const subResult = subIterator.next()
            if (subResult.done) {
              extend(matches, subResult.value)
              subIterator = undefined
            } else {
              break
            }
          } else {
            const result = iterator.next()
            if (result.done) {
              return callback(null, sorted(matches))
            }
            if (result.value.timeSharingMatch) {
              subIterator = result.value.timeSharingMatch(
                password,
                idleDeadline,
              )
              break
            } else {
              extend(matches, result.value.match(password))
            }
          }
        }
        return next
      } catch (err) {
        return callback(err, undefined)
      }
    }
    return next()
  }
}

export default Matching

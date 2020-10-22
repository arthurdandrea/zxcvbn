import { nCk } from '~/scoring/utils'
import type { AnyDictionaryMatch } from '~/types'

export default (match: Pick<AnyDictionaryMatch, 'l33t' | 'sub' | 'token'>) => {
  if (!match.l33t || !match.sub) {
    return 1
  }
  const { sub: subs, token } = match
  const lowerCaseToken = token.toLowerCase()
  return Object.entries(subs).reduce((variations, [subbed, unsubbed]) => {
    let subbedCount = 0 // num of subbed chars
    let unsubbedCount = 0 // num of unsubbed chars
    // lower-case match.token before calculating: capitalization shouldn't affect l33t calc.
    for (const char of lowerCaseToken) {
      if (char === subbed) {
        subbedCount++
      }
      if (char === unsubbed) {
        unsubbedCount++
      }
    }

    if (subbedCount === 0 || unsubbedCount === 0) {
      // for this sub, password is either fully subbed (444) or fully unsubbed (aaa)
      // treat that as doubling the space (attacker needs to try fully subbed chars in addition to
      // unsubbed.)
      return variations * 2
    }
    // this case is similar to capitalization:
    // with aa44a, U = 3, S = 2, attacker needs to try unsubbed + one sub + two subs
    const p = Math.min(unsubbedCount, subbedCount)
    let possibilities = 0
    for (let i = 1; i <= p; i += 1) {
      possibilities += nCk(unsubbedCount + subbedCount, i)
    }
    return variations * possibilities
  }, 1)
}

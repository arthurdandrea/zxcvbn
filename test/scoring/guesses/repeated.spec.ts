import repeatGuesses from '~/scoring/guesses/repeat'
import { mostGuessableMatchSequence } from '~/scoring'
import MatchOmni from '~/Matching'
import { normalizeOptions } from '~/Options'

const options = normalizeOptions({})
const omniMatch = new MatchOmni(options)
describe('scoring guesses repeated', () => {
  const data: [string, string, number][] = [
    ['aa', 'a', 2],
    ['999', '9', 3],
    ['$$$$', '$', 4],
    ['abab', 'ab', 2],
    ['batterystaplebatterystaplebatterystaple', 'batterystaple', 3],
  ]

  data.forEach(([token, baseToken, repeatCount]) => {
    const baseGuesses = mostGuessableMatchSequence(
      baseToken,
      omniMatch.match(baseToken),
      options,
    ).guesses
    const match = {
      token,
      baseToken,
      baseGuesses,
      repeatCount,
    }
    it('asd', () => {
      expect(true).toBeTruthy()
    })
    const expectedGuesses = baseGuesses * repeatCount
    const msg = `the repeat pattern '${token}' has guesses of ${expectedGuesses}`

    // eslint-disable-next-line jest/valid-title
    it(msg, () => {
      expect(repeatGuesses(match)).toEqual(expectedGuesses)
    })
  })
})

import ReverseDictionaryMatcher from '~/matching/DictionaryReverse'

import checkMatches from '../helper/checkMatches'

describe('dictionary reverse matching', () => {
  const testDicts = {
    d1: ['123', '321', '456', '654'],
  }
  const reverseMatcher = new ReverseDictionaryMatcher({
    dictionaries: testDicts,
    userInputs: [],
  })
  const password = '0123456789'
  const matches = reverseMatcher.match(password)
  const msg = 'matches against reversed words'
  checkMatches(
    msg,
    matches,
    'dictionary',
    ['123', '456'],
    [
      [1, 3],
      [4, 6],
    ],
    {
      matchedWord: ['321', '654'],
      reversed: [true, true],
      dictionaryName: ['d1', 'd1'],
      rank: [2, 4],
    },
  )
})

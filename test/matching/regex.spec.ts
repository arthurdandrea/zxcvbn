import RegexMatcher from '~/matching/Regex'

import checkMatches from '../helper/checkMatches'

describe('regex matching', () => {
  const data = [
    ['1922', 'recentYear'],
    ['2017', 'recentYear'],
  ]

  const regexMatcher = new RegexMatcher()
  data.forEach(([pattern, name]) => {
    const matches = regexMatcher.match(pattern)
    const msg = `matches ${pattern} as a ${name} pattern`
    checkMatches(msg, matches, 'regex', [pattern], [[0, pattern.length - 1]], {
      regexName: [name],
    })
  })
})

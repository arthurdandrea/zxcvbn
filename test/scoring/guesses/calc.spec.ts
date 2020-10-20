import estimate from '~/scoring/estimate'
import dateGuesses from '~/scoring/guesses/date'
import { normalizeOptions } from '~/Options'

const options = normalizeOptions({})
describe('scoring', () => {
  it('estimate_guesses returns cached guesses when available', () => {
    const match = {
      guesses: 1,
    }
    expect(estimate(match as any, '', options)).toEqual({
      guesses: 1,
    })
  })

  it('estimate_guesses delegates based on pattern', () => {
    const match = {
      pattern: 'date',
      token: '1977',
      year: 1977,
      month: 7,
      day: 14,
    }
    expect(estimate(match as any, '1977', options)).toEqual({
      pattern: 'date',
      token: '1977',
      year: 1977,
      month: 7,
      day: 14,
      guesses: dateGuesses(match),
      guessesLog10: 4.195761320036061,
    })
  })
})

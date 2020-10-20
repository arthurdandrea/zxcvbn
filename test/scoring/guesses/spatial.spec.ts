import spatialGuesses from '~/scoring/guesses/spatial'
import utils from '~/scoring/utils'
import { normalizeOptions } from '~/Options'

const options = normalizeOptions({})

const { nCk } = utils

describe('scoring: guesses spatial', () => {
  const getKeyBoardBaseGuesses = (token) =>
    options.keyboardStartingPositions *
    options.keyboardAverageDegree *
    (token.length - 1)
  const getKeyPadBaseGuesses = (token) =>
    options.keypadStartingPositions *
    options.keypadAverageDegree *
    (token.length - 1)
  it('with no turns or shifts, guesses is starts * degree * (len-1)', () => {
    const match = {
      token: 'zxcvbn',
      graph: 'qwerty' as const,
      turns: 1,
      shiftedCount: 0,
    }

    expect(spatialGuesses(match, options)).toEqual(
      getKeyBoardBaseGuesses(match.token),
    )
  })

  it('guesses is added for shifted keys, similar to capitals in dictionary matching', () => {
    const match = {
      token: 'ZxCvbn',
      graph: 'qwerty' as const,
      turns: 1,
      shiftedCount: 2,
      guesses: null,
    }
    const result = getKeyBoardBaseGuesses(match.token) * (nCk(6, 2) + nCk(6, 1))
    expect(spatialGuesses(match, options)).toEqual(result)
  })

  it('when everything is shifted, guesses are doubled', () => {
    const match = {
      token: 'ZXCVBN',
      graph: 'qwerty' as const,
      turns: 1,
      shiftedCount: 6,
      guesses: null,
    }
    const result = getKeyBoardBaseGuesses(match.token) * 2
    expect(spatialGuesses(match, options)).toEqual(result)
  })

  it('spatial guesses accounts for turn positions, directions and starting keys', () => {
    const match = {
      token: 'zxcft6yh',
      graph: 'qwerty' as const,
      turns: 3,
      shiftedCount: 0,
    }
    let guesses = 0
    const tokenLength = match.token.length
    for (let i = 2; i <= tokenLength; i += 1) {
      const turnLength = Math.min(match.turns, i - 1)
      for (let j = 1; j <= turnLength; j += 1) {
        guesses +=
          nCk(i - 1, j - 1) *
          options.keyboardStartingPositions *
          options.keyboardAverageDegree ** j
      }
    }

    expect(spatialGuesses(match, options)).toEqual(guesses)
  })

  it('use default key graph if graph not available', () => {
    const match = {
      token: 'zxcvbn',
      graph: 'abcdef' as any,
      turns: 1,
      shiftedCount: 0,
    }

    expect(spatialGuesses(match, options)).toEqual(
      getKeyPadBaseGuesses(match.token),
    )
  })
})

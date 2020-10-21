import SequenceMatcher from '~/matching/Sequence'

import checkMatches from '../helper/checkMatches'
import genpws from '../helper/genpws'

describe('sequence matching', () => {
  const sequenceMatcher = new SequenceMatcher()

  it("doesn't match length sequences", () => {
    const data = ['', 'a', '1']

    data.forEach((password) => {
      expect(sequenceMatcher.match(password)).toEqual([])
    })
  })

  checkMatches(
    'matches overlapping patterns',
    sequenceMatcher.match('abcbabc'),
    'sequence',
    ['abc', 'cba', 'abc'],
    [
      [0, 2],
      [2, 4],
      [4, 6],
    ],
    {
      ascending: [true, false, true],
    },
  )

  const pattern = 'jihg'
  const generatedGenPws = genpws(pattern, ['!', '22'], ['!', '22'])

  generatedGenPws.forEach(([password, i, j]) => {
    checkMatches(
      `matches embedded sequence patterns ${password}`,
      sequenceMatcher.match(password),
      'sequence',
      [pattern],
      [[i, j]],
      {
        sequenceName: ['lower'],
        ascending: [false],
      },
    )
  })

  const data: [string, string, boolean][] = [
    ['ABC', 'upper', true],
    ['CBA', 'upper', false],
    ['PQR', 'upper', true],
    ['RQP', 'upper', false],
    ['XYZ', 'upper', true],
    ['ZYX', 'upper', false],
    ['abcd', 'lower', true],
    ['dcba', 'lower', false],
    ['jihg', 'lower', false],
    ['wxyz', 'lower', true],
    ['zxvt', 'lower', false],
    ['0369', 'digits', true],
    ['97531', 'digits', false],
  ]

  data.forEach(([dataPattern, name, isAscending]) => {
    checkMatches(
      `matches '${dataPattern}' as a '${name}' sequence`,
      sequenceMatcher.match(dataPattern),
      'sequence',
      [dataPattern],
      [[0, dataPattern.length - 1]],
      {
        sequenceName: [name],
        ascending: [isAscending],
      },
    )
  })
})

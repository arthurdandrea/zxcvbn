import DictionaryMatcher from '~/matching/Dictionary'
import L33tMatcher from '~/matching/L33t'

import checkMatches from '../helper/checkMatches'

describe('l33t matching', () => {
  let msg
  const testTable = {
    a: ['4', '@'],
    c: ['(', '{', '[', '<'],
    g: ['6', '9'],
    o: ['0'],
  }

  const dicts = {
    words: ['aac', 'password', 'paassword', 'asdf0'],
    words2: ['cgo'],
  }

  describe('default const', () => {
    const l33tMatcher = new L33tMatcher()
    it("doesn't match single-character l33ted words", () => {
      expect(l33tMatcher.match('4 1 @')).toEqual([])
    })
  })

  describe('main match', () => {
    const l33tMatcher = new L33tMatcher({
      dictionary: new DictionaryMatcher({
        dictionaries: dicts,
      }),
      l33tTable: testTable,
    })

    it("doesn't match ''", () => {
      expect(l33tMatcher.match('')).toEqual([])
    })

    it("doesn't match pure dictionary words", () => {
      expect(l33tMatcher.match('password')).toEqual([])
    })

    it("doesn't match when multiple l33t substitutions are needed for the same letter", () => {
      expect(l33tMatcher.match('p4@ssword')).toEqual([])
    })

    it("doesn't match with subsets of possible l33t substitutions", () => {
      expect(l33tMatcher.match('4sdf0')).toEqual([])
    })
    const data = [
      [
        'p4ssword',
        'p4ssword',
        'password',
        'words',
        3,
        [0, 7],
        {
          4: 'a',
        },
      ],
      [
        'p@ssw0rd',
        'p@ssw0rd',
        'password',
        'words',
        3,
        [0, 7],
        {
          '@': 'a',
          '0': 'o',
        },
      ],
      [
        'aSdfO{G0asDfO',
        '{G0',
        'cgo',
        'words2',
        1,
        [5, 7],
        {
          '{': 'c',
          '0': 'o',
        },
      ],
    ] as const

    data.forEach(([password, pattern, word, dictionaryName, rank, ij, sub]) => {
      msg = 'matches against common l33t substitutions'
      checkMatches(
        msg,
        l33tMatcher.match(password as string),
        'dictionary',
        [pattern],
        [ij],
        {
          l33t: [true],
          sub: [sub],
          matchedWord: [word],
          rank: [rank],
          dictionaryName: [dictionaryName],
        },
      )
    })
    const matches = l33tMatcher.match('@a(go{G0')
    msg = 'matches against overlapping l33t patterns'
    checkMatches(
      msg,
      matches,
      'dictionary',
      ['@a(', '(go', '{G0'],
      [
        [0, 2],
        [2, 4],
        [5, 7],
      ],
      {
        l33t: [true, true, true],
        sub: [
          {
            '@': 'a',
            '(': 'c',
          },
          {
            '(': 'c',
          },
          {
            '{': 'c',
            '0': 'o',
          },
        ],
        matchedWord: ['aac', 'cgo', 'cgo'],
        rank: [1, 1, 1],
        dictionaryName: ['words', 'words2', 'words2'],
      },
    )
  })

  describe('helpers', () => {
    it('reduces l33t table to only the substitutions that a password might be employing', () => {
      const data: [string, Record<string, string[]>][] = [
        ['', {}],
        ['abcdefgo123578!#$&*)]}>', {}],
        ['a', {}],
        [
          '4',
          {
            a: ['4'],
          },
        ],
        [
          '4@',
          {
            a: ['4', '@'],
          },
        ],
        [
          '4({60',
          {
            a: ['4'],
            c: ['(', '{'],
            g: ['6'],
            o: ['0'],
          },
        ],
      ]

      data.forEach(([pw, expected]) => {
        expect(L33tMatcher.relevantL33tSubtable(pw, testTable)).toEqual(
          expected,
        )
      })
    })

    it('enumerates the different sets of l33t substitutions a password might be using', () => {
      const data = [
        [{}, [{}]],
        [
          {
            a: ['@'],
          },
          [
            {
              '@': 'a',
            },
          ],
        ],
        [
          {
            a: ['@', '4'],
          },
          [
            {
              '@': 'a',
            },
            {
              4: 'a',
            },
          ],
        ],
        [
          {
            a: ['@', '4'],
            c: ['('],
          },
          [
            {
              '@': 'a',
              '(': 'c',
            },
            {
              '4': 'a',
              '(': 'c',
            },
          ],
        ],
      ]

      data.forEach(([table, subs]) => {
        expect(L33tMatcher.enumerateL33tSubs(table)).toEqual(subs)
      })
    })
  })
})

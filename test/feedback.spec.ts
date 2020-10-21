import translations from '../src/data/feedback/en'
import getFeedback from '../src/Feedback'

describe('feedback', () => {
  describe('with default translations', () => {
    it('should return no feedback for a good password', () => {
      const data = getFeedback(3, [{} as any], translations)
      expect(data).toEqual({
        warning: '',
        suggestions: [],
      })
    })

    it('should return default feedback for no sequence', () => {
      const data = getFeedback(3, [], translations)
      expect(data).toEqual({
        warning: '',
        suggestions: [
          translations.suggestions.useWords,
          translations.suggestions.noNeed,
        ],
      })
    })

    it('should return some basic feedback if no feedback could be generated', () => {
      const data = getFeedback(1, [{} as any], translations)
      expect(data).toEqual({
        warning: '',
        suggestions: [translations.suggestions.anotherWord],
      })
    })

    it('should return feedback for dictionary', () => {
      const options = {
        pattern: 'dictionary',
        token: 'tests',
        dictionaryName: 'passwords',
        reversed: false,
        l33t: false,
        rank: 10,
        guessesLog10: 4,
      }
      let data = getFeedback(
        1,
        [
          {
            ...options,
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.topTen,
        suggestions: [translations.suggestions.anotherWord],
      })

      data = getFeedback(
        1,
        [
          {
            ...options,
            rank: 100,
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.topHundred,
        suggestions: [translations.suggestions.anotherWord],
      })

      data = getFeedback(
        1,
        [
          {
            ...options,
            rank: 1000,
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.common,
        suggestions: [translations.suggestions.anotherWord],
      })

      data = getFeedback(
        1,
        [
          {
            ...options,
            l33t: true,
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.similarToCommon,
        suggestions: [
          translations.suggestions.anotherWord,
          translations.suggestions.l33t,
        ],
      })

      data = getFeedback(
        1,
        [
          {
            ...options,
            reversed: true,
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.similarToCommon,
        suggestions: [
          translations.suggestions.anotherWord,
          translations.suggestions.reverseWords,
        ],
      })

      data = getFeedback(
        1,
        [
          {
            ...options,
            reversed: true,
            guessesLog10: 5,
            token: 'Tests',
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: '',
        suggestions: [
          translations.suggestions.anotherWord,
          translations.suggestions.capitalization,
          translations.suggestions.reverseWords,
        ],
      })

      data = getFeedback(
        1,
        [
          {
            ...options,
            reversed: true,
            guessesLog10: 5,
            token: 'TESTS',
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: '',
        suggestions: [
          translations.suggestions.anotherWord,
          translations.suggestions.allUppercase,
          translations.suggestions.reverseWords,
        ],
      })

      data = getFeedback(
        1,
        [
          {
            ...options,
            dictionaryName: 'english_wikipedia',
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.wordByItself,
        suggestions: [translations.suggestions.anotherWord],
      })

      data = getFeedback(
        1,
        [
          {
            ...options,
            dictionaryName: 'english_wikipedia',
          } as any,
          {
            ...options,
            dictionaryName: 'english_wikipedia',
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: '',
        suggestions: [translations.suggestions.anotherWord],
      })

      data = getFeedback(
        1,
        [
          {
            ...options,
            dictionaryName: 'test_name',
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: '',
        suggestions: [translations.suggestions.anotherWord],
      })

      data = getFeedback(
        1,
        [
          {
            ...options,
            dictionaryName: 'surnames',
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.namesByThemselves,
        suggestions: [translations.suggestions.anotherWord],
      })
      data = getFeedback(
        1,
        [
          {
            ...options,
            dictionaryName: 'maleNames',
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.namesByThemselves,
        suggestions: [translations.suggestions.anotherWord],
      })

      data = getFeedback(
        1,
        [
          {
            ...options,
            dictionaryName: 'femaleNames',
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.namesByThemselves,
        suggestions: [translations.suggestions.anotherWord],
      })

      data = getFeedback(
        1,
        [
          {
            ...options,
            dictionaryName: 'femaleNames',
          } as any,
          {
            ...options,
            dictionaryName: 'femaleNames',
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.commonNames,
        suggestions: [translations.suggestions.anotherWord],
      })
    })

    it('should return feedback for spatial', () => {
      const options = {
        pattern: 'spatial',
        token: 'tests',
        graph: 'qwerty',
        turns: 1,
      }
      let data = getFeedback(
        2,
        [
          {
            ...options,
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.straightRow,
        suggestions: [
          translations.suggestions.anotherWord,
          translations.suggestions.longerKeyboardPattern,
        ],
      })
      data = getFeedback(
        2,
        [
          {
            ...options,
            turns: 2,
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.keyPattern,
        suggestions: [
          translations.suggestions.anotherWord,
          translations.suggestions.longerKeyboardPattern,
        ],
      })
    })

    it('should return feedback for repeat', () => {
      const options = {
        pattern: 'repeat',
        token: 'tests',
        baseToken: 'a',
      }
      let data = getFeedback(
        2,
        [
          {
            ...options,
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.simpleRepeat,
        suggestions: [
          translations.suggestions.anotherWord,
          translations.suggestions.repeated,
        ],
      })
      data = getFeedback(
        2,
        [
          {
            ...options,
            baseToken: 'aa',
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.extendedRepeat,
        suggestions: [
          translations.suggestions.anotherWord,
          translations.suggestions.repeated,
        ],
      })
    })

    it('should return feedback for sequence', () => {
      const options = {
        pattern: 'sequence',
        token: 'tests',
      }
      const data = getFeedback(
        2,
        [
          {
            ...options,
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.sequences,
        suggestions: [
          translations.suggestions.anotherWord,
          translations.suggestions.sequences,
        ],
      })
    })

    it('should return feedback for regex', () => {
      const options = {
        pattern: 'regex',
        token: 'tests',
        regexName: 'recentYear',
      }
      const data = getFeedback(
        2,
        [
          {
            ...options,
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.recentYears,
        suggestions: [
          translations.suggestions.anotherWord,
          translations.suggestions.recentYears,
          translations.suggestions.associatedYears,
        ],
      })
    })

    it('should return feedback for date', () => {
      const options = {
        pattern: 'date',
        token: 'tests',
      }
      const data = getFeedback(
        2,
        [
          {
            ...options,
          } as any,
        ],
        translations,
      )
      expect(data).toEqual({
        warning: translations.warnings.dates,
        suggestions: [
          translations.suggestions.anotherWord,
          translations.suggestions.dates,
        ],
      })
    })
  })
})

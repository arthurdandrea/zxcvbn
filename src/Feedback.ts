import { START_UPPER, ALL_UPPER_INVERTED } from './data/const'
import { ExtendedMatch, FeedbackType, TranslationKeys } from './types'

/*
 * -------------------------------------------------------------------------------
 *  Generate feedback ---------------------------------------------------------------
 * -------------------------------------------------------------------------------
 */
class Feedback {
  defaultFeedback: FeedbackType = {
    warning: '',
    suggestions: [],
  }

  translations: TranslationKeys

  constructor(translations: TranslationKeys) {
    this.translations = translations
    this.defaultFeedback.suggestions.push(
      translations.suggestions.useWords,
      translations.suggestions.noNeed,
    )
  }

  getFeedback(score: number, sequence: ExtendedMatch[]) {
    if (sequence.length === 0) {
      return this.defaultFeedback
    }
    if (score > 2) {
      return {
        warning: '',
        suggestions: [],
      }
    }
    const longestMatch = sequence.reduce((longerMatch, match) => {
      if (match.token.length > longerMatch.token.length) {
        return match
      }
      return longerMatch
    })
    let feedback = this.getMatchFeedback(longestMatch, sequence.length === 1)
    const extraFeedback = this.translations.suggestions.anotherWord
    if (feedback !== null && feedback !== undefined) {
      feedback.suggestions.unshift(extraFeedback)
      if (feedback.warning == null) {
        feedback.warning = ''
      }
    } else {
      feedback = {
        warning: '',
        suggestions: [extraFeedback],
      }
    }
    return feedback
  }

  getMatchFeedback(match: ExtendedMatch, isSoleMatch: boolean) {
    let warning: string

    switch (match.pattern) {
      case 'dictionary':
        return this.getDictionaryMatchFeedback(match, isSoleMatch)
      case 'spatial':
        warning = this.translations.warnings.keyPattern
        if (match.turns === 1) {
          warning = this.translations.warnings.straightRow
        }
        return {
          warning,
          suggestions: [this.translations.suggestions.longerKeyboardPattern],
        }
      case 'repeat':
        warning = this.translations.warnings.extendedRepeat
        if (match.baseToken.length === 1) {
          warning = this.translations.warnings.simpleRepeat
        }

        return {
          warning,
          suggestions: [this.translations.suggestions.repeated],
        }
      case 'sequence':
        return {
          warning: this.translations.warnings.sequences,
          suggestions: [this.translations.suggestions.sequences],
        }
      case 'regex':
        if (match.regexName === 'recentYear') {
          return {
            warning: this.translations.warnings.recentYears,
            suggestions: [
              this.translations.suggestions.recentYears,
              this.translations.suggestions.associatedYears,
            ],
          }
        }
        break
      case 'date':
        return {
          warning: this.translations.warnings.dates,
          suggestions: [this.translations.suggestions.dates],
        }
      default:
        return {
          warning: '',
          suggestions: [],
        }
    }
    return {
      warning: '',
      suggestions: [],
    }
  }

  getDictionaryMatchFeedback(match: ExtendedMatch, isSoleMatch: boolean) {
    let warning = ''
    const suggestions: string[] = []
    const word = match.token
    const dictName = match.dictionaryName
    if (dictName === 'passwords') {
      if (isSoleMatch && !match.l33t && !match.reversed) {
        if (match.rank <= 10) {
          warning = this.translations.warnings.topTen
        } else if (match.rank <= 100) {
          warning = this.translations.warnings.topHundred
        } else {
          warning = this.translations.warnings.common
        }
      } else if (match.guessesLog10 <= 4) {
        warning = this.translations.warnings.similarToCommon
      }
    } else if (dictName.includes('wikipedia')) {
      if (isSoleMatch) {
        warning = this.translations.warnings.wordByItself
      }
    } else if (
      dictName === 'surnames' ||
      dictName === 'maleNames' ||
      dictName === 'femaleNames'
    ) {
      if (isSoleMatch) {
        warning = this.translations.warnings.namesByThemselves
      } else {
        warning = this.translations.warnings.commonNames
      }
    }

    if (word.match(START_UPPER)) {
      suggestions.push(this.translations.suggestions.capitalization)
    } else if (word.match(ALL_UPPER_INVERTED) && word.toLowerCase() !== word) {
      suggestions.push(this.translations.suggestions.allUppercase)
    }
    if (match.reversed && match.token.length >= 4) {
      suggestions.push(this.translations.suggestions.reverseWords)
    }
    if (match.l33t) {
      suggestions.push(this.translations.suggestions.l33t)
    }
    return {
      warning,
      suggestions,
    }
  }
}

export default Feedback

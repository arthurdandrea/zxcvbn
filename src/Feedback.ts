import { ALL_UPPER_INVERTED, START_UPPER } from './data/const'
import type {
  AnyDictionaryEstimatedMatch,
  AnyEstimatedMatch,
} from './scoring/estimate'
import type { Translations } from './types'

export interface FeedbackType {
  warning: string
  suggestions: string[]
}

/*
 * -------------------------------------------------------------------------------
 *  Generate feedback ------------------------------------------------------------
 * -------------------------------------------------------------------------------
 */
export default function getFeedback(
  score: number,
  sequence: AnyEstimatedMatch[],
  translations: Translations,
): FeedbackType {
  if (sequence.length === 0) {
    return {
      warning: '',
      suggestions: [
        translations.suggestions.useWords,
        translations.suggestions.noNeed,
      ],
    }
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
  let feedback = getMatchFeedback(
    longestMatch,
    sequence.length === 1,
    translations,
  )
  const extraFeedback = translations.suggestions.anotherWord
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

function getMatchFeedback(
  match: AnyEstimatedMatch,
  isSoleMatch: boolean,
  translations: Translations,
) {
  let warning: string

  switch (match.pattern) {
    case 'dictionary':
      return getDictionaryMatchFeedback(match, isSoleMatch, translations)
    case 'spatial':
      warning = translations.warnings.keyPattern
      if (match.turns === 1) {
        warning = translations.warnings.straightRow
      }
      return {
        warning,
        suggestions: [translations.suggestions.longerKeyboardPattern],
      }
    case 'repeat':
      warning = translations.warnings.extendedRepeat
      if (match.baseToken.length === 1) {
        warning = translations.warnings.simpleRepeat
      }

      return {
        warning,
        suggestions: [translations.suggestions.repeated],
      }
    case 'sequence':
      return {
        warning: translations.warnings.sequences,
        suggestions: [translations.suggestions.sequences],
      }
    case 'regex':
      if (match.regexName === 'recentYear') {
        return {
          warning: translations.warnings.recentYears,
          suggestions: [
            translations.suggestions.recentYears,
            translations.suggestions.associatedYears,
          ],
        }
      }
      break
    case 'date':
      return {
        warning: translations.warnings.dates,
        suggestions: [translations.suggestions.dates],
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

function getDictionaryMatchFeedback(
  match: AnyDictionaryEstimatedMatch,
  isSoleMatch: boolean,
  translations: Translations,
) {
  let warning = ''
  const suggestions: string[] = []
  const word = match.token
  const dictName = match.dictionaryName
  if (dictName === 'passwords') {
    if (isSoleMatch && !match.l33t && !match.reversed) {
      if (match.rank <= 10) {
        warning = translations.warnings.topTen
      } else if (match.rank <= 100) {
        warning = translations.warnings.topHundred
      } else {
        warning = translations.warnings.common
      }
    } else if (match.guessesLog10 <= 4) {
      warning = translations.warnings.similarToCommon
    }
  } else if (dictName.includes('wikipedia')) {
    if (isSoleMatch) {
      warning = translations.warnings.wordByItself
    }
  } else if (
    dictName === 'surnames' ||
    dictName === 'maleNames' ||
    dictName === 'femaleNames'
  ) {
    if (isSoleMatch) {
      warning = translations.warnings.namesByThemselves
    } else {
      warning = translations.warnings.commonNames
    }
  }

  if (word.match(START_UPPER)) {
    suggestions.push(translations.suggestions.capitalization)
  } else if (word.match(ALL_UPPER_INVERTED) && word.toLowerCase() !== word) {
    suggestions.push(translations.suggestions.allUppercase)
  }
  if (match.reversed && match.token.length >= 4) {
    suggestions.push(translations.suggestions.reverseWords)
  }
  if (match.l33t) {
    suggestions.push(translations.suggestions.l33t)
  }
  return {
    warning,
    suggestions,
  }
}

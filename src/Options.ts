import defaultGraphs from '~/data/adjacency_graphs'
import translationsEn from '~/data/feedback/en'
import translationKeys from '~/data/feedback/keys'
import frequencyLists from '~/data/frequency_lists'
import defaultL33tTable from '~/data/l33tTable'
import { buildRankedDictionary } from '~/helper'
import type {
  Graphs,
  Options,
  RankedDictionaries,
  RankedDictionary,
  Translations,
} from '~/types'

function calcAverageDegree(graph: Graphs[string]) {
  let average = 0
  if (graph) {
    Object.keys(graph).forEach((key) => {
      const neighbors = graph[key]
      average += Object.entries(neighbors).length
    })
    average /= Object.entries(graph).length
  }
  return average
}

function checkCustomTranslations(translations: Translations) {
  let valid = true
  Object.keys(translationKeys).forEach((type) => {
    if (type in translations) {
      Object.keys(translationKeys[type]).forEach((key) => {
        if (!(key in translations[type])) {
          valid = false
        }
      })
    } else {
      valid = false
    }
  })
  return valid
}

export interface NormalizedOptions {
  readonly usedKeypad: string
  readonly usedKeyboard: string
  readonly l33tTable: Readonly<Record<string, string[]>>
  readonly adjacencyGraphs: Readonly<
    Record<string, Record<string, (string | null)[]>>
  >
  readonly keyboardAverageDegree: number
  readonly keyboardStartingPositions: number
  readonly keypadAverageDegree: number
  readonly keypadStartingPositions: number
  readonly rankedDictionaries: RankedDictionaries
  readonly translations: Translations
}

export function normalizeOptions(options: Options): NormalizedOptions {
  const adjacencyGraphs = options.graphs ?? defaultGraphs
  const usedKeyboard = options?.usedKeyboard ?? 'qwerty'
  const usedKeypad = options?.usedKeypad ?? 'keypad'
  const keyboardAverageDegree = calcAverageDegree(adjacencyGraphs[usedKeyboard])
  const keyboardStartingPositions = adjacencyGraphs[usedKeyboard]
    ? Object.keys(adjacencyGraphs[usedKeyboard]).length
    : 0
  const keypadAverageDegree = calcAverageDegree(adjacencyGraphs[usedKeypad])
  const keypadStartingPositions = adjacencyGraphs[usedKeypad]
    ? Object.keys(adjacencyGraphs[usedKeypad]).length
    : 0
  const rankedDictionaries = buildRankedDictionaries(
    options.dictionary,
    options.userInputs,
  )
  let translations: Translations
  if (options.translations) {
    if (!checkCustomTranslations(options.translations)) {
      throw new Error('Invalid translations object fallback to keys')
    }
    ;({ translations } = options)
  } else {
    translations = translationsEn
  }
  return {
    usedKeyboard: options.usedKeyboard ?? 'qwerty',
    usedKeypad: options.usedKeypad ?? 'keypad',
    l33tTable: options.l33tTable ?? defaultL33tTable,
    adjacencyGraphs,
    keyboardAverageDegree: keyboardAverageDegree ?? 0,
    keyboardStartingPositions: keyboardStartingPositions ?? 0,
    keypadAverageDegree: keypadAverageDegree ?? 0,
    keypadStartingPositions: keypadStartingPositions ?? 0,
    rankedDictionaries,
    translations,
  }
}

let defaultRankedDictionaries: RankedDictionaries | undefined
export function buildRankedDictionaries(
  dictionary: Record<string, string[]> = frequencyLists,
  userInputs?: string[],
): RankedDictionaries {
  if (
    dictionary === frequencyLists &&
    defaultRankedDictionaries &&
    (!userInputs || userInputs.length === 0)
  ) {
    return defaultRankedDictionaries
  }

  let ranked =
    (dictionary === frequencyLists && defaultRankedDictionaries) ||
    new Map<string, RankedDictionary>(
      Object.keys(dictionary).map((name) => [
        name,
        buildRankedDictionary(dictionary![name]),
      ]),
    )
  if (dictionary === frequencyLists) {
    defaultRankedDictionaries = ranked
  }
  if (userInputs && userInputs.length > 0) {
    // don't modify cached
    if (ranked === defaultRankedDictionaries) {
      ranked = new Map(ranked)
    }
    ;(ranked as Map<string, RankedDictionary>).set(
      'userInputs',
      buildRankedDictionary(sanitizeUserInputs(userInputs)),
    )
  }
  return ranked
}

function sanitizeUserInputs(userInputs: string[]) {
  if (!userInputs || userInputs.length === 0) {
    return []
  }
  const sanitizedInputs: string[] = []
  userInputs.forEach((input: string | number | boolean) => {
    const inputType = typeof input
    if (
      inputType === 'string' ||
      inputType === 'number' ||
      inputType === 'boolean'
    ) {
      sanitizedInputs.push(input.toString().toLowerCase())
    }
  })
  return sanitizedInputs
}

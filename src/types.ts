import type defaultAdjacencyGraphs from '~/data/adjacency_graphs'
import type translationKeys from '~/data/feedback/keys'
import type frequencyLists from '~/data/frequency_lists'

import type { DateMatch } from './matching/Date'
import type { DictionaryMatch } from './matching/Dictionary'
import type { ReverseDictionaryMatch } from './matching/DictionaryReverse'
import type { L33tMatch } from './matching/L33t'
import type { RegexMatch } from './matching/Regex'
import type { RepeatMatch } from './matching/Repeat'
import type { SequenceMatch } from './matching/Sequence'
import type { SpatialMatch } from './matching/Spatial'
import type { BruteforceMatch } from './scoring'

export type DefaultAdjacencyGraphsKeys = keyof typeof defaultAdjacencyGraphs
export type DefaultAdjacencyGraphs = typeof defaultAdjacencyGraphs
export type TranslationKeys = typeof translationKeys
export type FrequencyLists = typeof frequencyLists

export type Pattern =
  | 'dictionary'
  | 'regex'
  | 'repeat'
  | 'bruteforce'
  | 'sequence'
  | 'spatial'
  | 'date'

export type DictionaryNames =
  | 'passwords'
  | 'maleNames'
  | 'femaleNames'
  | 'tvAndFilm'
  | 'wikipedia'
  | 'surnames'
  | 'userInputs'

export interface Match {
  pattern: Pattern
  i: number
  j: number
  token: string
}

export interface OldExtendedMatch {
  pattern: Pattern
  i: number
  j: number
  token: string
  matchedWord?: string
  rank?: number
  dictionaryName?: string
  reversed?: boolean
  l33t?: boolean
  baseGuesses?: number
  uppercaseVariations?: number
  l33tVariations?: number
  guesses?: number
  guessesLog10?: number
  turns?: number
  baseToken?: string[] | string
  sub?: Record<string, string>
  subDisplay?: string
  sequenceName?: 'lower' | 'digits'
  sequenceSpace?: number
  ascending?: boolean
  regexName?: string
  shiftedCount?: number
  graph?: string
  repeatCount?: number
  regexMatch?: string[]
  year?: number
  month?: number
  day?: number
  separator?: string
}

export type AnyDictionaryMatch =
  | DictionaryMatch
  | ReverseDictionaryMatch
  | L33tMatch

export type AnyMatch =
  | BruteforceMatch
  | DictionaryMatch
  | ReverseDictionaryMatch
  | L33tMatch
  | SpatialMatch
  | RepeatMatch
  | RegexMatch
  | DateMatch
  | SequenceMatch

export interface Optimal {
  m: Match
  pi: Match
  g: Match
}

export interface CrackTimesSeconds {
  onlineThrottling100PerHour: number
  onlineThrottling10PerSecond: number
  offlineSlowHashing1e4PerSecond: number
  offlineFastHashing1e10PerSecond: number
}

export interface CrackTimesDisplay {
  onlineThrottling100PerHour: string
  onlineThrottling10PerSecond: string
  offlineSlowHashing1e4PerSecond: string
  offlineFastHashing1e10PerSecond: string
}

export interface FeedbackType {
  warning: string
  suggestions: string[]
}

export type MatchingMatcherParams =
  | 'userInputs'
  | 'dictionary'
  | 'l33tTable'
  | 'graphs'

export type MatchingMatcherNames =
  | 'dictionary'
  | 'dictionaryReverse'
  | 'l33t'
  | 'spatial'
  | 'repeat'
  | 'sequence'
  | 'regex'
  | 'date'

export type DefaultKeyboards =
  | 'qwerty'
  | 'qwertz'
  | 'qwertz_altgr'
  | 'qwertz_altgr_shift'
  | 'dvorak'
export type Keyboards = DefaultKeyboards | string

export type DefaultKeypads = 'keypad' | 'mac_keypad'
export type Keypads = DefaultKeypads | string

export type OptionsL33tTable = Record<string, string[]>
export type OptionsDictionary = Record<string, string[]>
export type RankedDictionary = ReadonlyMap<string, number>
export type RankedDictionaries = ReadonlyMap<string, RankedDictionary>
export type OptionsGraph = Record<string, Record<string, (string | null)[]>>

export interface OptionsType {
  translations?: TranslationKeys
  graphs?: OptionsGraph
  usedKeyboard?: Keyboards
  usedKeypad?: Keypads
  l33tTable?: OptionsL33tTable
  dictionary?: OptionsDictionary
  userInputs?: string[]
}

export interface Matcher {
  match(password: string): AnyMatch[]
}

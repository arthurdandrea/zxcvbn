import type translationKeys from '~/data/feedback/keys'

import type { DateMatch } from './matching/Date'
import type { DictionaryMatch } from './matching/Dictionary'
import type { ReverseDictionaryMatch } from './matching/DictionaryReverse'
import type { L33tMatch } from './matching/L33t'
import type { RegexMatch } from './matching/Regex'
import type { RepeatMatch } from './matching/Repeat'
import type { SequenceMatch } from './matching/Sequence'
import type { SpatialMatch } from './matching/Spatial'
import type { BruteforceMatch } from './scoring'

export type Translations = typeof translationKeys

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

export type DefaultKeyboards =
  | 'qwerty'
  | 'qwertz'
  | 'qwertz_altgr'
  | 'qwertz_altgr_shift'
  | 'dvorak'
export type Keyboards = DefaultKeyboards | string

export type DefaultKeypads = 'keypad' | 'mac_keypad'
export type Keypads = DefaultKeypads | string

export type L33tTable = Record<string, string[]>
export type Dictionary = Record<string, string[]>
export type RankedDictionary = ReadonlyMap<string, number>
export type RankedDictionaries = ReadonlyMap<string, RankedDictionary>
export type Graphs = Record<string, Record<string, (string | null)[]>>

export interface Options {
  translations?: Translations
  graphs?: Graphs
  usedKeyboard?: Keyboards
  usedKeypad?: Keypads
  l33tTable?: L33tTable
  dictionary?: Dictionary
  userInputs?: string[]
}

export interface Matcher {
  match(password: string): AnyMatch[]
}

import { sorted, empty, translate } from '~/helper'
import DictionaryMatcher, { DictionaryMatch } from './Dictionary'
import { Matcher, OptionsL33tTable } from '../types'
import defaultL33tTable from '~/data/l33tTable'

export interface L33tMatch extends Omit<DictionaryMatch, 'l33t' | 'sub'> {
  l33t: true
  sub: Record<string, string>
  subDisplay: string
}

/*
 * -------------------------------------------------------------------------------
 *  date matching ----------------------------------------------------------------
 * -------------------------------------------------------------------------------
 */
class L33tMatcher implements Matcher {
  readonly dictionary: DictionaryMatcher

  readonly l33tTable: Readonly<Record<string, readonly string[]>>

  constructor(options?: L33tMatcher.Options) {
    this.dictionary = options?.dictionary ?? new DictionaryMatcher()
    this.l33tTable = options?.l33tTable ?? defaultL33tTable
  }

  match(password: string) {
    const matches: L33tMatch[] = []
    const enumeratedSubs = L33tMatcher.enumerateL33tSubs(
      L33tMatcher.relevantL33tSubtable(password, this.l33tTable),
    )
    for (let i = 0; i < enumeratedSubs.length; i += 1) {
      const sub = enumeratedSubs[i]
      // corner case: password has no relevant subs.
      if (empty(sub)) {
        break
      }
      const subbedPassword = translate(password, sub)
      const matchedDictionary = this.dictionary.match(subbedPassword)
      matchedDictionary.forEach((match: DictionaryMatch) => {
        const token = password.slice(match.i, +match.j + 1 || 9e9)
        // only return the matches that contain an actual substitution
        if (token.toLowerCase() !== match.matchedWord) {
          // subset of mappings in sub that are in use for this match
          const matchSub: Record<string, string> = {}
          Object.keys(sub).forEach((subbedChr) => {
            const chr = sub[subbedChr]
            if (token.indexOf(subbedChr) !== -1) {
              matchSub[subbedChr] = chr
            }
          })
          const subDisplay = Object.keys(matchSub)
            .map((k) => `${k} -> ${matchSub[k]}`)
            .join(', ')
          matches.push({
            ...match,
            l33t: true,
            token,
            sub: matchSub,
            subDisplay,
          })
        }
      })
    }
    // filter single-character l33t matches to reduce noise.
    // otherwise '1' matches 'i', '4' matches 'a', both very common English words
    // with low dictionary rank.
    return sorted(matches.filter((match) => match.token.length > 1))
  }

  // makes a pruned copy of l33t_table that only includes password's possible substitutions
  static relevantL33tSubtable(
    password: string,
    l33tTable: Readonly<Record<string, readonly string[]>>,
  ) {
    const passwordChars: Record<string, true> = {}
    const subTable: Record<string, string[]> = {}
    password.split('').forEach((char: string) => {
      passwordChars[char] = true
    })

    Object.keys(l33tTable).forEach((letter) => {
      const subs = l33tTable[letter]
      const relevantSubs = subs.filter((sub: string) => sub in passwordChars)
      if (relevantSubs.length > 0) {
        subTable[letter] = relevantSubs
      }
    })
    return subTable
  }

  // returns the list of possible 1337 replacement dictionaries for a given password
  static enumerateL33tSubs(table: Readonly<Record<string, readonly string[]>>) {
    const tableKeys = Object.keys(table)
    const subs = L33tMatcher.getSubs(tableKeys, [[]], table)
    // convert from assoc lists to dicts
    return subs.map((sub) => {
      const subDict: Record<string, string> = {}
      sub.forEach(([l33tChr, chr]) => {
        subDict[l33tChr] = chr
      })
      return subDict
    })
  }

  static getSubs(
    keys: string[],
    subs: string[][],
    table: Readonly<Record<string, readonly string[]>>,
  ): string[][] {
    if (!keys.length) {
      return subs
    }
    const firstKey = keys[0]
    const restKeys = keys.slice(1)
    const nextSubs: string[][] = []
    table[firstKey].forEach((l33tChr) => {
      subs.forEach((sub) => {
        let dupL33tIndex = -1
        for (let i = 0; i < sub.length; i += 1) {
          if (sub[i][0] === l33tChr) {
            dupL33tIndex = i
            break
          }
        }
        if (dupL33tIndex === -1) {
          // @ts-ignore
          const subExtension = sub.concat([[l33tChr, firstKey]])
          nextSubs.push(subExtension)
        } else {
          const subAlternative = sub.slice(0)
          subAlternative.splice(dupL33tIndex, 1)
          // @ts-ignore
          subAlternative.push([l33tChr, firstKey])
          nextSubs.push(sub)
          nextSubs.push(subAlternative)
        }
      })
    })
    const newSubs = L33tMatcher.dedup(nextSubs)
    if (restKeys.length) {
      return L33tMatcher.getSubs(restKeys, newSubs, table)
    }
    return newSubs
  }

  static dedup(subs: string[][]) {
    const deduped: string[][] = []
    const members = new Set<string>()
    subs.forEach((sub) => {
      const assoc = sub.map((k, index) => [k, index])
      assoc.sort()
      const label = assoc.map(([k, v]) => `${k},${v}`).join('-')
      if (!members.has(label)) {
        members.add(label)
        deduped.push(sub)
      }
    })
    return deduped
  }
}

namespace L33tMatcher {
  export interface Options {
    dictionary?: DictionaryMatcher
    l33tTable?: OptionsL33tTable
  }
}

export default L33tMatcher

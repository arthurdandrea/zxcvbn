import defaultL33tTable from '~/data/l33tTable'
import { empty, sorted, translate } from '~/helper'

import type { L33tTable, Matcher } from '../types'
import type { DictionaryMatch } from './Dictionary'
import DictionaryMatcher from './Dictionary'

export interface L33tMatch extends Omit<DictionaryMatch, 'l33t' | 'sub'> {
  l33t: true
  sub: Record<string, string>
  subDisplay: string
}

type Subs = [string, string][][]

type ReadonlyL33tTable = Readonly<Record<string, readonly string[]>>

/*
 * -------------------------------------------------------------------------------
 *  date matching ----------------------------------------------------------------
 * -------------------------------------------------------------------------------
 */
class L33tMatcher implements Matcher {
  readonly dictionary: DictionaryMatcher
  readonly l33tTable: ReadonlyL33tTable

  constructor(options?: L33tMatcher.Options) {
    this.dictionary = options?.dictionary ?? new DictionaryMatcher()
    this.l33tTable = options?.l33tTable ?? defaultL33tTable
  }

  match(password: string) {
    const matches: L33tMatch[] = []
    for (const sub of L33tMatcher.enumerateL33tSubs(
      L33tMatcher.relevantL33tSubtable(password, this.l33tTable),
    )) {
      // corner case: password has no relevant subs.
      if (empty(sub)) {
        break
      }
      const subbedPassword = translate(password, sub)
      for (const match of this.dictionary.match(subbedPassword)) {
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
          matches.push({
            ...match,
            l33t: true,
            token,
            sub: matchSub,
            subDisplay: Object.keys(matchSub)
              .map((k) => `${k} -> ${matchSub[k]}`)
              .join(', '),
          })
        }
      }
    }
    // filter single-character l33t matches to reduce noise.
    // otherwise '1' matches 'i', '4' matches 'a', both very common English words
    // with low dictionary rank.
    return sorted(matches.filter((match) => match.token.length > 1))
  }

  // makes a pruned copy of l33t_table that only includes password's possible substitutions
  static relevantL33tSubtable(password: string, l33tTable: ReadonlyL33tTable) {
    const passwordChars = new Set<string>(password)
    const subTable: Record<string, string[]> = {}
    Object.keys(l33tTable).forEach((letter) => {
      const subs = l33tTable[letter]
      const relevantSubs = subs.filter((sub) => passwordChars.has(sub))
      if (relevantSubs.length > 0) {
        subTable[letter] = relevantSubs
      }
    })
    return subTable
  }

  // returns the list of possible 1337 replacement dictionaries for a given password
  static enumerateL33tSubs(table: ReadonlyL33tTable) {
    const subs = L33tMatcher.getSubs(table)
    // convert from assoc lists to dicts
    return subs.map((sub) => {
      const subDict: Record<string, string> = {}
      sub.forEach(([l33tChr, chr]) => {
        subDict[l33tChr] = chr
      })
      return subDict
    })
  }

  static getSubs(table: ReadonlyL33tTable): Subs {
    const keys = Object.keys(table)
    let subs: Subs = [[]]
    let firstKey: string | undefined
    while ((firstKey = keys.pop())) {
      const nextSubs: Subs = []
      for (const l33tChr of table[firstKey]) {
        for (const sub of subs) {
          let dupL33tIndex = -1
          for (let i = 0; i < sub.length; i += 1) {
            if (sub[i][0] === l33tChr) {
              dupL33tIndex = i
              break
            }
          }
          if (dupL33tIndex === -1) {
            const subExtension = sub.concat([[l33tChr, firstKey]])
            nextSubs.push(subExtension)
          } else {
            const subAlternative = sub.slice()
            subAlternative.splice(dupL33tIndex, 1)
            subAlternative.push([l33tChr, firstKey])
            nextSubs.push(sub)
            nextSubs.push(subAlternative)
          }
        }
      }
      subs = L33tMatcher.dedup(nextSubs)
    }
    return subs
  }

  static dedup(subs: Subs) {
    const deduped: Subs = []
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
    l33tTable?: L33tTable
  }
}

export default L33tMatcher

import type { RankedDictionary } from './types'

export const empty = (obj: Record<string, unknown> | unknown[]) =>
  Object.keys(obj).length === 0

export const extend = <T>(listToExtend: T[], list: T[]) =>
  listToExtend.push.apply(listToExtend, list) // eslint-disable-line prefer-spread

export const translate = (string: string, chrMap: Record<string, string>) => {
  return Array.from(string, (char) => chrMap[char] || char).join('')
}

// mod implementation that works for negative numbers
export const mod = (n: number, m: number) => ((n % m) + m) % m

// sort on i primary, j secondary
export const sorted = <T extends { i: number; j: number }>(matches: T[]) =>
  matches.sort((m1, m2) => m1.i - m2.i || m1.j - m2.j)

export const buildRankedDictionary = (
  orderedList: readonly string[],
): RankedDictionary => {
  const result = new Map<string, number>(
    orderedList.map(
      (word, index) => [word, index + 1] /* rank starts at 1, not 0 */,
    ),
  )
  return result
}

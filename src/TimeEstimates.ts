import type { Translations } from './types'

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

function translate(
  displayStr: string,
  value: number | undefined,
  displayNum: number | null,
  translations: Translations,
) {
  let key = displayStr
  if (displayNum != null && displayNum !== 1) {
    key += 's'
  }
  return translations.timeEstimation[key].replace('{base}', value)
}

/*
 * -------------------------------------------------------------------------------
 *  Estimates time for an attacker ---------------------------------------------------------------
 * -------------------------------------------------------------------------------
 */
export function estimateAttackTimes(guesses: number): CrackTimesSeconds {
  return {
    onlineThrottling100PerHour: guesses / (100 / 3600),
    onlineThrottling10PerSecond: guesses / 10,
    offlineSlowHashing1e4PerSecond: guesses / 1e4,
    offlineFastHashing1e10PerSecond: guesses / 1e10,
  }
}

export function translateAttackTimes(
  crackTimesSeconds: CrackTimesSeconds,
  translations: Translations,
): CrackTimesDisplay {
  const crackTimesDisplay: Partial<CrackTimesDisplay> = {}
  Object.keys(crackTimesSeconds).forEach((scenario: string) => {
    const seconds = crackTimesSeconds[scenario as keyof CrackTimesSeconds]
    crackTimesDisplay[scenario] = displayTime(seconds, translations)
  })
  return crackTimesDisplay as any
}

export function guessesToScore(guesses: number): 0 | 1 | 2 | 3 | 4 {
  const DELTA = 5
  if (guesses < 1e3 + DELTA) {
    // risky password: "too guessable"
    return 0
  }
  if (guesses < 1e6 + DELTA) {
    // modest protection from throttled online attacks: "very guessable"
    return 1
  }
  if (guesses < 1e8 + DELTA) {
    // modest protection from unthrottled online attacks: "somewhat guessable"
    return 2
  }
  if (guesses < 1e10 + DELTA) {
    // modest protection from offline attacks: "safely unguessable"
    // assuming a salted, slow hash function like bcrypt, scrypt, PBKDF2, argon, etc
    return 3
  }
  // strong protection from offline attacks under same scenario: "very unguessable"
  return 4
}

function displayTime(seconds: number, translations: Translations) {
  const minute = 60
  const hour = minute * 60
  const day = hour * 24
  const month = day * 31
  const year = month * 12
  const century = year * 100
  let displayNum = null
  let displayStr = 'centuries'
  let base
  if (seconds < 1) {
    displayNum = null
    displayStr = 'ltSecond'
  } else if (seconds < minute) {
    base = Math.round(seconds)
    displayNum = base
    displayStr = 'second'
  } else if (seconds < hour) {
    base = Math.round(seconds / minute)
    displayNum = base
    displayStr = 'minute'
  } else if (seconds < day) {
    base = Math.round(seconds / hour)
    displayNum = base
    displayStr = 'hour'
  } else if (seconds < month) {
    base = Math.round(seconds / day)
    displayNum = base
    displayStr = 'day'
  } else if (seconds < year) {
    base = Math.round(seconds / month)
    displayNum = base
    displayStr = 'month'
  } else if (seconds < century) {
    base = Math.round(seconds / year)
    displayNum = base
    displayStr = 'year'
  }
  return translate(displayStr, base, displayNum, translations)
}

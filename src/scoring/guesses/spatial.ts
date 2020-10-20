import { NormalizedOptions } from '~/Options'
import utils from '~/scoring/utils'
import { ExtendedMatch } from '~/types'

export default (
  {
    graph,
    token,
    turns,
    shiftedCount,
  }: Pick<ExtendedMatch, 'graph' | 'token' | 'turns' | 'shiftedCount'>,
  options: NormalizedOptions,
) => {
  let startingPosition = options.keypadStartingPositions ?? 1
  let averageDegree = options.keypadAverageDegree ?? 1
  if (graph && Object.keys(options.adjacencyGraphs).includes(graph)) {
    startingPosition = options.keyboardStartingPositions ?? 1
    averageDegree = options.keyboardAverageDegree ?? 1
  }
  let guesses = 0
  const tokenLength = token.length
  // # estimate the number of possible patterns w/ tokenLength or less with turns or less.
  for (let i = 2; i <= tokenLength; i += 1) {
    const possibleTurns = Math.min(turns, i - 1)
    for (let j = 1; j <= possibleTurns; j += 1) {
      guesses += utils.nCk(i - 1, j - 1) * startingPosition * averageDegree ** j
    }
  }
  // add extra guesses for shifted keys. (% instead of 5, A instead of a.)
  // math is similar to extra guesses of l33t substitutions in dictionary matches.
  if (shiftedCount) {
    const unShiftedCount = token.length - shiftedCount
    if (shiftedCount === 0 || unShiftedCount === 0) {
      guesses *= 2
    } else {
      let shiftedVariations = 0
      for (let i = 1; i <= Math.min(shiftedCount, unShiftedCount); i += 1) {
        shiftedVariations += utils.nCk(shiftedCount + unShiftedCount, i)
      }
      guesses *= shiftedVariations
    }
  }
  return guesses
}

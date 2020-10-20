import uppercaseVariant from '../variant/uppercase'
import l33tVariant from '../variant/l33t'
import { DictionaryMatch } from '~/matching/Dictionary'
import { ReverseDictionaryMatch } from '~/matching/DictionaryReverse'
import { L33tMatch } from '~/matching/L33t'

export default (
  match: DictionaryMatch | L33tMatch | ReverseDictionaryMatch,
) => {
  const baseGuesses = match.rank // keep these as properties for display purposes
  const uppercaseVariations = uppercaseVariant(match.token)
  const l33tVariations = l33tVariant(match)
  const reversedVariations = match.reversed ? 2 : 1
  const calculation =
    baseGuesses * uppercaseVariations * l33tVariations * reversedVariations
  return {
    baseGuesses,
    uppercaseVariations,
    l33tVariations,
    calculation,
  }
}

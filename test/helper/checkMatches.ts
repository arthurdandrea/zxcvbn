// eslint-disable-next-line jest/no-export
export default function checkMatches(
  prefix: string,
  matches: any[],
  patternNames: string | string[],
  patterns: any[],
  ijs: readonly (readonly [number, number])[],
  props: Record<string, any[]>,
) {
  const usedPatternNames =
    typeof patternNames === 'string'
      ? patterns.map(() => patternNames)
      : patternNames
  if (
    usedPatternNames.length !== patterns.length ||
    patterns.length !== ijs.length ||
    Object.keys(props).some((prop) => {
      const lst = props[prop]
      return lst.length !== patterns.length
    })
  ) {
    throw Error('unequal argument lists to checkMatches')
  }
  it(`${prefix}: matches.length == ${patterns.length}`, () => {
    expect(matches.length).toEqual(patterns.length)
  })
  for (let k = 0; k < patterns.length - 1; k += 1) {
    const match = matches[k]
    const patternName = usedPatternNames[k]
    const pattern = patterns[k]
    const [i, j] = ijs[k]
    it(`${prefix}: matches[${k}].pattern == '${usedPatternNames}'`, () => {
      expect(match.pattern).toEqual(patternName)
    })
    it(`${prefix}: matches[${k}] should have [i, j] of [${i}, ${j}]`, () => {
      expect([match.i, match.j]).toEqual([i, j])
    })
    it(`${prefix}: matches[${k}].token == '${pattern}'`, () => {
      expect(match.token).toEqual(pattern)
    })

    Object.keys(props).forEach((propName) => {
      const propList = props[propName]
      let propMsg = propList[k]
      if (typeof propMsg === 'string') {
        propMsg = `'${propMsg}'`
      }
      it(`${prefix}: matches[${k}].${propName} == ${propMsg}`, () => {
        expect(match[propName]).toEqual(propList[k])
      })
    })
  }
}

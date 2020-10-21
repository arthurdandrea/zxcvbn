import zxcvbn from '../src/main'

describe('main', () => {
  it('should check without userInputs', () => {
    const result = zxcvbn('test')
    expect(result).toMatchSnapshot({
      calcTime: expect.any(Number),
    })
  })

  it('should check with userInputs', () => {
    const result = zxcvbn('test', ['test', 12, true, []])
    expect(result).toMatchSnapshot({
      calcTime: expect.any(Number),
    })
  })

  describe('password tests', () => {
    ;[
      '1q2w3e4r5t',
      '1Q2w3e4r5t',
      '1q2w3e4r5T',
      'abcdefg123',
      'TESTERINO',
      'aaaaaaa',
      'Daniel',
      '1234qwer',
      '1234qwe',
      '1234qwert',
      'password',
      '2010abc',
      'abcabcabcabc',
      'qwer',
      'P4$$w0rd',
      'aA!1',
      'dgo9dsghasdoghi8/!&IT/§(ihsdhf8o7o',
    ].forEach((password) => {
      it(`should resolve ${password}`, () => {
        const result = zxcvbn(password)
        expect(result).toMatchSnapshot({
          calcTime: expect.any(Number),
        })
      })
    })
  })
})

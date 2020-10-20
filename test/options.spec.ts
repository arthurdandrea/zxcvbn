import { normalizeOptions } from '~/Options'
import translationsKeys from '~/data/feedback/keys'

describe('Options', () => {
  describe('translations', () => {
    it('should return default feedback for no sequence on custom translations', () => {
      const options = normalizeOptions({ translations: translationsKeys })
      expect(options.translations).toEqual(translationsKeys)
    })
    const customTranslations = {
      warnings: {
        straightRow: 'straightRow',
        keyPattern: 'keyPattern',
      },
    }

    it('should return error for wrong custom translations', () => {
      expect(() => {
        // @ts-expect-error
        normalizeOptions({ translations: customTranslations })
      }).toThrow('Invalid translations object fallback to keys')
    })
  })

  it('should set custom keyboard', () => {
    const options = normalizeOptions({ usedKeyboard: 'someKeyboard' })
    expect(options.usedKeyboard).toEqual('someKeyboard')
  })

  it('should set custom keypad', () => {
    const options = normalizeOptions({ usedKeypad: 'someKeypad' })
    expect(options.usedKeypad).toEqual('someKeypad')
  })
})

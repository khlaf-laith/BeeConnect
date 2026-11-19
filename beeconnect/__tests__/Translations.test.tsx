import i18n from 'i18next'

import enTranslation from '../public/locales/en/common.json'
import frTranslation from '../public/locales/fr/common.json'

type CommonTranslationKey = keyof typeof enTranslation

describe('Translations', () => {
  beforeAll(async () => {
    await i18n.init({
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      resources: {
        en: { common: enTranslation },
        fr: { common: frTranslation },
      },
    })
  })

  const expectTranslation = (
    language: string,
    key: CommonTranslationKey,
    value: string
  ): void => {
    expect(i18n.getResource(language, 'common', key)).toBe(value)
  }

  describe('translation resources', () => {
    test('renders the "Sign Up" translation in English', () => {
      expectTranslation('en', 'signUp', 'Sign Up')
    })

    test('renders the "Sign Up" translation in French', () => {
      expectTranslation('fr', 'signUp', "S'inscrire")
    })

    test('renders the "English" translation in English', () => {
      expectTranslation('en', 'english', 'English')
    })

    test('renders the "English" translation in French', () => {
      expectTranslation('fr', 'english', 'Anglais')
    })

    test('renders the "Dark Mode" translation in English', () => {
      expectTranslation('en', 'darkMode', 'Dark Mode')
    })

    test('renders the "Dark Mode" translation in French', () => {
      expectTranslation('fr', 'darkMode', 'Mode sombre')
    })

    test('renders the "noResults" translation in English', () => {
      expectTranslation('en', 'noResults', 'No results found')
    })

    test('renders the "noResults" translation in French', () => {
      expectTranslation('fr', 'noResults', 'Aucun résultat')
    })

    test('renders the "newMessage" translation in English', () => {
      expectTranslation('en', 'newMessage', 'New Message')
    })

    test('renders the "newMessage" translation in French', () => {
      expectTranslation('fr', 'newMessage', 'Nouveau message')
    })
  })
})

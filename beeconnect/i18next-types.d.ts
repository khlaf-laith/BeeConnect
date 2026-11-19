// Augment i18next's default namespace and resource types.
import 'i18next'
import type common from '../public/locales/en/common.json'
import type marketing from '../public/locales/en/marketing.json'

interface I18nNamespaces {
  common: typeof common
  marketing: typeof marketing
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: I18nNamespaces
  }
}

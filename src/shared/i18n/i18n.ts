import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { ru } from './locales/ru'
import { ua } from './locales/ua'

export const defaultNS = 'common'

export const resources = {
  en,
  ru,
  ua,
} as const

export type SupportedLocale = keyof typeof resources

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return Object.hasOwn(resources, locale)
}

const pathLocale = window.location.pathname.split('/')[1]
const initialLanguage = isSupportedLocale(pathLocale) ? pathLocale : 'en'

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: 'en',
  defaultNS,
  ns: ['common', 'hero', 'joinUs', 'contactForm'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

export default i18n

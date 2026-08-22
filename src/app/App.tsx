import { useEffect } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import Home from '@pages/Home'
import NotFound from '@pages/NotFound'
import Seo from '@components/common/seo/Seo'
import i18n, { isSupportedLocale, type SupportedLocale } from '@i18n/i18n'

const htmlLanguage: Record<SupportedLocale, string> = {
  en: 'en',
  ru: 'ru',
  ua: 'uk',
}

function LocalizedHome() {
  const { locale } = useParams<{ locale?: string }>()
  const language = locale ?? 'en'
  const isValidLocale = locale === undefined || (locale !== 'en' && isSupportedLocale(locale))

  useEffect(() => {
    if (!isValidLocale) return

    void i18n.changeLanguage(language)
    document.documentElement.lang = htmlLanguage[language as SupportedLocale]
  }, [isValidLocale, language])

  if (!isValidLocale) {
    return (
      <>
        <Seo locale="en" noIndex />
        <NotFound />
      </>
    )
  }

  return (
    <>
      <Seo locale={language as SupportedLocale} />
      <Home />
    </>
  )
}

function NotFoundRoute() {
  return (
    <>
      <Seo locale="en" noIndex />
      <NotFound />
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LocalizedHome />} />
      <Route path="/:locale" element={<LocalizedHome />} />
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  )
}

export default App

import { useEffect } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import Home from '@pages/Home'
import NotFound from '@pages/NotFound'
import i18n, { isSupportedLocale } from '@i18n/i18n'

function LocalizedHome() {
  const { locale } = useParams<{ locale?: string }>()
  const language = locale ?? 'en'
  const isValidLocale = locale === undefined || (locale !== 'en' && isSupportedLocale(locale))

  useEffect(() => {
    if (!isValidLocale) return

    void i18n.changeLanguage(language)
    document.documentElement.lang = language
  }, [isValidLocale, language])

  return isValidLocale ? <Home /> : <NotFound />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LocalizedHome />} />
      <Route path="/:locale" element={<LocalizedHome />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App

import { Helmet } from 'react-helmet-async'
import type { SupportedLocale } from '@i18n/i18n'

type SeoProps = {
  locale: SupportedLocale
  noIndex?: boolean
}

const metadata: Record<
  SupportedLocale,
  { title: string; description: string; language: string; socialLocale: string }
> = {
  en: {
    title: 'CPA Snake | Performance Marketing Solutions',
    description:
      'CPA Snake delivers performance marketing solutions tested on real products and advertising budgets.',
    language: 'en',
    socialLocale: 'en_US',
  },
  ru: {
    title: 'CPA Snake | Эффективный performance-маркетинг',
    description:
      'CPA Snake предлагает эффективные performance-маркетинговые решения, проверенные на собственных продуктах и рекламных бюджетах.',
    language: 'ru',
    socialLocale: 'ru_RU',
  },
  ua: {
    title: 'CPA Snake | Ефективний performance-маркетинг',
    description:
      'CPA Snake пропонує ефективні performance-маркетингові рішення, перевірені на власних продуктах і рекламних бюджетах.',
    language: 'uk',
    socialLocale: 'uk_UA',
  },
}

const localePaths: Record<SupportedLocale, string> = {
  en: '/',
  ru: '/ru',
  ua: '/ua',
}

function Seo({ locale, noIndex = false }: SeoProps) {
  const { title, description, language, socialLocale } = metadata[locale]
  const origin = window.location.origin
  const canonicalUrl = `${origin}${localePaths[locale]}`
  const robots = noIndex ? 'noindex, nofollow' : 'index, follow'
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonicalUrl,
    inLanguage: language,
    isPartOf: {
      '@type': 'WebSite',
      name: 'CPA Snake',
      url: origin,
    },
  }

  return (
    <Helmet htmlAttributes={{ lang: language }}>
      <title>{noIndex ? `404 | CPA Snake` : title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      {!noIndex && <link rel="canonical" href={canonicalUrl} />}
      {!noIndex && <link rel="alternate" hrefLang="en" href={`${origin}/`} />}
      {!noIndex && <link rel="alternate" hrefLang="ru" href={`${origin}/ru`} />}
      {!noIndex && <link rel="alternate" hrefLang="uk" href={`${origin}/ua`} />}
      {!noIndex && <link rel="alternate" hrefLang="x-default" href={`${origin}/`} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="CPA Snake" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={socialLocale} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {!noIndex && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
    </Helmet>
  )
}

export default Seo

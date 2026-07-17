export const getLocalizedPath = (locale: string, path: string): string => {
  if (locale === 'en') {
    return path
  }
  return `/${locale}${path}`
}

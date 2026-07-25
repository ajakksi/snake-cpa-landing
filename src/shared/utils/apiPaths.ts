export const getLocalizedPath = (locale: string, path: string): string => {
  const normalizedLocale = locale.toLowerCase().split('-')[0]
  return `/${normalizedLocale}${path}`
}

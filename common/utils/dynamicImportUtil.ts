const elLocaleMap = new Map<string, any>()
export async function getElLocaleMessage(locale: string) {
  if (elLocaleMap.has(locale)) {
    return elLocaleMap.get(locale)
  }
  let elLocale: any
  if (locale === 'zh') {
    elLocale = (await import('element-plus/es/locale/lang/zh-cn')).default
  } else if (locale === 'en') {
    elLocale = (await import('element-plus/es/locale/lang/en')).default
  }
  elLocaleMap.set(locale, elLocale)
  return elLocale
}

const i18nLocaleMap = new Map<string, any>()
export async function getI18nLocaleMessage(
  locale: string,
  setLocaleMessage?: any
) {
  if (i18nLocaleMap.has(locale)) return i18nLocaleMap.get(locale)
  const i18nLocale = (await import(`./../i18n/${locale}.ts`)).default
  setLocaleMessage && setLocaleMessage(locale, i18nLocale)
  if (process.server) {
    i18nLocaleMap.set(locale, i18nLocale)
  } else {
    i18nLocaleMap.set(locale, '')
  }
  return i18nLocale
}

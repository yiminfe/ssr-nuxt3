export function getDefaultLocale() {
  const language: any = {
    'zh-cn': 'zh',
    zh: 'zh',
    'en-us': 'en',
    'en-gb': 'en',
    en: 'en'
  }

  const locale = useCookie<string>('locale')
  if (!locale.value) {
    locale.value = 'zh'
    if (process.server) {
      const nuxtApp = useNuxtApp()
      const reqLocale =
        nuxtApp.ssrContext?.event.req.headers['accept-language']?.split(',')[0]
      if (reqLocale) {
        locale.value = language[reqLocale.toLowerCase()]
      }
    } else if (process.client) {
      const navLang = navigator.language
      if (navLang) {
        locale.value = language[navLang.toLowerCase()]
      }
    }
  }
  return locale.value
}

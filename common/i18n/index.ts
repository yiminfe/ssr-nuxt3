import { createI18n } from 'vue-i18n'
import { getI18nLocaleMessage } from '../utils/dynamicImportUtil'

export async function createSSRI18n() {
  const locale = useLocale().value
  const i18nLocaleMessage = await getI18nLocaleMessage(locale)
  const messages: any = {}
  messages[locale] = i18nLocaleMessage
  const i18n: any = createI18n({
    locale,
    legacy: false,
    messages
  })
  return i18n
}

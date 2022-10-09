import { useI18n } from 'vue-i18n'
import {
  getElLocaleMessage,
  getI18nLocaleMessage
} from '~~/common/utils/dynamicImportUtil'
import { getDefaultLocale } from '~~/common/utils/localeUtil'

export function useLocale() {
  const locale = useState<string>('locale')
  if (!locale.value) {
    locale.value = getDefaultLocale()
  }
  return locale
}

export async function useWatchLocale() {
  const locale = useLocale()
  const localeCookie = useCookie<string>('locale')
  const { locale: i18nLocale, setLocaleMessage } = useI18n()
  const defaultElLocale = await getElLocaleMessage(locale.value)
  const elLocale = ref(defaultElLocale)
  watch(locale, async newLocale => {
    localeCookie.value = newLocale
    elLocale.value = await getElLocaleMessage(locale.value)
    await getI18nLocaleMessage(locale.value, setLocaleMessage)
    i18nLocale.value = locale.value
  })
  return elLocale
}

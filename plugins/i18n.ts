import { createSSRI18n } from '~~/common/i18n'

export default defineNuxtPlugin(async nuxtApp => {
  const { vueApp } = nuxtApp
  const i18n = await createSSRI18n()
  vueApp.use(i18n)
})

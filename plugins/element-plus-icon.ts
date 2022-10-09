import { ArrowDown } from '@element-plus/icons-vue'

export default defineNuxtPlugin(nuxtApp => {
  const { vueApp } = nuxtApp
  vueApp.component('arrow-down', ArrowDown)
})

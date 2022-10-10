import {
  ID_INJECTION_KEY,
  ElMessage,
  ElButton,
  ElConfigProvider,
  ElCalendar,
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElTabs,
  ElTabPane,
  ElForm,
  ElFormItem,
  ElInput,
  ElSkeletonItem,
  ElSkeleton,
  ElPagination,
  ElImage,
  ElEmpty,
  ElAlert,
  ElCarouselItem,
  ElCarousel,
  ElTag,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon,
  ElPopover,
  ElBacktop
} from 'element-plus'

if (process.dev) {
  await import('element-plus/dist/index.css')
}

export default defineNuxtPlugin(nuxtApp => {
  const { vueApp } = nuxtApp
  vueApp.config.globalProperties.$message = ElMessage
  vueApp.component('el-config-provider', ElConfigProvider)
  vueApp.component('el-button', ElButton)
  vueApp.component('el-calendar', ElCalendar)
  vueApp.component('el-menu', ElMenu)
  vueApp.component('el-menu-item', ElMenuItem)
  vueApp.component('el-sub-menu', ElSubMenu)
  vueApp.component('el-tabs', ElTabs)
  vueApp.component('el-tab-pane', ElTabPane)
  vueApp.component('el-form', ElForm)
  vueApp.component('el-form-item', ElFormItem)
  vueApp.component('el-input', ElInput)
  vueApp.component('el-skeleton', ElSkeleton)
  vueApp.component('el-skeleton-item', ElSkeletonItem)
  vueApp.component('el-pagination', ElPagination)
  vueApp.component('el-image', ElImage)
  vueApp.component('el-empty', ElEmpty)
  vueApp.component('el-alert', ElAlert)
  vueApp.component('el-carousel-item', ElCarouselItem)
  vueApp.component('el-carousel', ElCarousel)
  vueApp.component('el-tag', ElTag)
  vueApp.component('el-dropdown', ElDropdown)
  vueApp.component('el-dropdown-menu', ElDropdownMenu)
  vueApp.component('el-dropdown-item', ElDropdownItem)
  vueApp.component('el-icon', ElIcon)
  vueApp.component('el-popover', ElPopover)
  vueApp.component('el-backtop', ElBacktop)

  vueApp.provide(ID_INJECTION_KEY, {
    prefix: 100,
    current: 0
  })
})

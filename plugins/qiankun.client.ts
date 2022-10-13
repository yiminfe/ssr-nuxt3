export default defineNuxtPlugin(nuxtApp => {
  const { vueApp } = nuxtApp

  // window['nuxt-ssr'] = {
  //   bootstrap: () => {
  //     console.log('nuxt-ssr bootstrap')
  //     return Promise.resolve()
  //   },
  //   mount: () => {
  //     console.log('nuxt-ssr mount')
  //     vueApp.unmount()
  //     return Promise.resolve()
  //   },
  //   unmount: () => {
  //     console.log('nuxt-ssr unmount')
  //     vueApp.unmount()
  //     return Promise.resolve()
  //   }
  // }
})

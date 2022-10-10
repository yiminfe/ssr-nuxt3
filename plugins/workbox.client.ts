import { Workbox } from 'workbox-window'
export default defineNuxtPlugin(() => {
  const wb = new Workbox(import.meta.env.VITE_APP_SW_FILE)

  wb.addEventListener('installed', event => {
    if (event.isUpdate) {
      window.location.reload()
    }
  })

  wb.register()
})

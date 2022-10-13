;(global => {
  global['nuxt-ssr'] = {
    bootstrap: () => {
      console.log('nuxt-ssr bootstrap')
      return Promise.resolve()
    },
    mount: () => {
      console.log('nuxt-ssr mount')
      try {
        document.querySelector('#__nuxt').innerHTML = ''
      } catch (error) {
        console.error(error)
      }
      return Promise.resolve()
    },
    unmount: () => {
      console.log('nuxt-ssr unmount')
      try {
        document.querySelector('#__nuxt').innerHTML = ''
      } catch (error) {
        console.error(error)
      }
      return Promise.resolve()
    }
  }
})(window)

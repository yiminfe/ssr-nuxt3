const cacheScrollTop = new Map<string | Symbol, number>()

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    cacheScrollTop.set(from.name, window.scrollY)
    let left = 0
    if (cacheScrollTop.has(to.name)) {
      left = cacheScrollTop.get(to.name)
      console.log(to.name, left)
    }

    // window.requestAnimationFrame(() => {
    //   console.log('requestAnimationFrame')
    // })

    setTimeout(() => {
      // console.log('setTimeout')
      window.scrollY !== left && window.scrollTo(0, left)
    }, 100)
  }
})

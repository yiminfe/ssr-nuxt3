export default defineNuxtRouteMiddleware((to, from) => {
  const userStatus = useUserStatus()
  if (userStatus.value !== 1) {
    return navigateTo(`/login?redirect=${to.path}`)
  }
})

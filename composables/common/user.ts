export function useUserStatus() {
  const userStatus = useState<number>('userStatus')
  if (!userStatus.value) {
    userStatus.value = useCookie<number>('userStatus').value
  }
  return userStatus
}

export function useWatchUserStatus() {
  const userStatus = useUserStatus()
  const userStatusCookie = useCookie<number>('userStatus')
  watch(userStatus, newUserStatus => {
    userStatusCookie.value = newUserStatus
  })
}

interface Result {
  checkLogin: (path?: string) => boolean
  pushPath: (path: string) => void
}

// 登录拦截
export function useUserInterceptor(): Result {
  const userStatus = useUserStatus()
  const router = useRouter()

  function checkLogin(path?: string) {
    const { pathname } = window.location
    if (userStatus.value !== 1) {
      router.push({
        path: '/login',
        query: {
          redirect: path || pathname
        }
      })
      return false
    }
    return true
  }

  function pushPath(path: string) {
    const result = checkLogin(path)
    result && router.push({ path })
  }
  return {
    checkLogin,
    pushPath
  }
}

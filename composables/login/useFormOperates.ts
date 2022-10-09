import { userLoginApi, userSignApi } from '~~/common/api/login'
import { IResultOr } from '~~/common/types/fetchType'
interface IRuleForm {
  mobile: string
  password: string
}
interface Result {
  userSign: () => void
  userLogin: () => void
}

export function useFormOperates(params: IRuleForm): Result {
  const { proxy }: any = getCurrentInstance()
  const route = useRoute()
  const router = useRouter()
  const userStatus = useUserStatus()
  // 注册接口
  function userSign(): void {
    userSignApi(params).then((res: IResultOr) => {
      const { success, message } = res
      if (success) {
        proxy.$message.success(message)
      } else {
        proxy.$message.error(message)
      }
    })
  }

  // 登录接口
  function userLogin(): void {
    userLoginApi(params).then((res: IResultOr) => {
      const { success, message, result } = res
      if (success) {
        userStatus.value = 1
        const { redirect }: any = route.query
        router.push({ path: redirect || '/' })
      } else {
        proxy.$message.error(message)
      }
    })
  }
  return {
    userSign,
    userLogin
  }
}

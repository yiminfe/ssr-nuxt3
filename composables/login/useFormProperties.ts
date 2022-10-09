import { Ref } from 'nuxt/dist/app/compat/capi'
import { useI18n } from 'vue-i18n'

interface IRuleForm {
  mobile: string
  password: string
}
interface IRuleItem {
  required: boolean
  min?: number
  max?: number
  message: string
  trigger: string
}
interface IRules {
  [index: string]: IRuleItem[]
  mobile: IRuleItem[]
  password: IRuleItem[]
}
interface Result {
  activeName: Ref<string>
  loginText: Ref<any>
  ruleFormRef: any
  ruleForm: IRuleForm
  rules: IRules
}

export function useFormProperties(): Result {
  const { t } = useI18n()

  const activeName = ref('login')
  const loginText = ref(t('login.loginBtn'))
  const ruleFormRef = ref()
  const ruleForm = reactive({
    mobile: '',
    password: ''
  })
  const rules = reactive({
    mobile: [
      {
        required: true,
        min: 11,
        max: 11,
        message: t('login.placeMobile'),
        trigger: 'blur'
      }
    ],
    password: [
      {
        required: true,
        message: t('login.placePass'),
        trigger: 'blur'
      }
    ]
  })
  return {
    activeName,
    loginText,
    ruleFormRef,
    ruleForm,
    rules
  }
}

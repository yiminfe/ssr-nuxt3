<script setup lang="ts">
import { userLogoutApi } from '~~/common/api/login'
import { IResultOr } from '~~/common/types/fetchType'

const router = useRouter()
const userStatus = useUserStatus()

const { proxy }: any = getCurrentInstance()
// 登出接口
function userLogout() {
  userLogoutApi().then((res: IResultOr) => {
    const { success, message } = res
    if (success) {
      userStatus.value = 0
      router.push({ name: 'login' })
    } else {
      proxy.$message.error(message)
    }
  })
}

const { checkLogin } = useUserInterceptor()

function handleLogin(action: string) {
  if (action === 'login') {
    router.push('/login')
  } else if (action === 'logout') {
    userLogout()
  }
}

const locale = useLocale()
function handleLanguage(language: string) {
  locale.value = language
}

const orderPopoverRef = ref()
function handleOrderVisible(visible: boolean) {
  if (visible && userStatus.value === 1) {
    orderPopoverRef.value.refresh()
  }
}

const orderPopoverDropdownRef = ref()
function handleCloseOrder() {
  orderPopoverDropdownRef.value.handleClose()
}
</script>

<template>
  <el-menu
    :default-active="$route.path"
    class="el-menu-demo"
    mode="horizontal"
    :ellipsis="false"
    router
  >
    <el-menu-item index="/" key="logo"
      ><img
        class="logo"
        src="../../assets/images/layout/logo.png"
        alt="爱此迎"
        loading="lazy"
    /></el-menu-item>

    <div class="flex-grow" key="flex-grow"></div>

    <el-menu-item index="/record" key="records">{{
      $t('header.records')
    }}</el-menu-item>

    <CommonElDropdown
      @visible-change="handleOrderVisible"
      ref="orderPopoverDropdownRef"
    >
      <span class="el-dropdown-link order">
        {{ $t('header.orders') }}
        <el-icon>
          <arrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <Suspense>
          <template #default>
            <LazyOrderPopover
              ref="orderPopoverRef"
              @handleClose="handleCloseOrder"
              v-if="userStatus === 1"
            />
            <div v-else class="loading-block">{{ $t('login.loginLost') }}</div>
          </template>
          <template #fallback>
            <div class="loading-block">{{ $t('common.loading') }}</div>
          </template>
        </Suspense>
      </template>
    </CommonElDropdown>

    <el-button
      class="header-login"
      link
      v-if="userStatus === 1"
      @click="userLogout"
      key="logout"
      >{{ $t('login.logout') }}</el-button
    >
    <el-button
      class="header-login"
      link
      v-else
      key="login"
      @click="$router.push('/login')"
      >{{ $t('login.loginTab') }}/{{ $t('login.signTab') }}</el-button
    >

    <CommonElDropdown @command="handleLanguage">
      <span class="el-dropdown-link language">
        {{ $t('header.language') }}
        <el-icon>
          <arrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="zh" :disabled="locale == 'zh'"
            >中文</el-dropdown-item
          >
          <el-dropdown-item command="en" :disabled="locale == 'en'"
            >English</el-dropdown-item
          >
        </el-dropdown-menu>
      </template>
    </CommonElDropdown>
  </el-menu>
</template>

<style lang="scss" scope>
@import '@/assets/scss/layout/commonHeader.scss';
</style>

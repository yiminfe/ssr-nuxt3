<script setup lang="ts">
console.log('刷新了路由')
</script>
<template>
  <div key="ssr-nuxt-app" class="ssr-nuxt-app">
    <LayoutHeader v-show="$route.name !== 'login'" />
    <slot />
    <LayoutFooter v-show="$route.name !== 'login'" />
  </div>
</template>

<style scoped></style>

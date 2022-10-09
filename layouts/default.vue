<script setup lang="ts">
console.log('刷新了路由')
</script>
<template>
  <div>
    <LayoutHeader v-show="$route.name !== 'login'" />
    <slot />
    <LayoutFooter v-show="$route.name !== 'login'" />
  </div>
</template>

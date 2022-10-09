<script setup lang="ts">
const locale = await useWatchLocale()
useWatchUserStatus()
</script>

<template>
  <CommonSeo></CommonSeo>
  <el-backtop :right="100" :bottom="100" />
  <NuxtLoadingIndicator :height="4" color="#409EFF" />
  <el-config-provider :locale="locale">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </el-config-provider>
</template>

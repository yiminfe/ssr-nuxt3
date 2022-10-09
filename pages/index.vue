<script setup lang="ts">
definePageMeta({
  title: '首页'
})

console.log('首页初始化')

onActivated(() => {
  console.log('首页 onActivated')
})
</script>

<template>
  <div class="home-page">
    <!-- banner -->
    <div class="banner"></div>
    <!-- 房屋列表 -->
    <div class="main-wapper">
      <h2 class="title">{{ $t('home.h2Title') }}</h2>
      <p class="sub-title">{{ $t('home.subTitle') }}</p>
      <!-- 首页列表 -->
      <HomeList />
    </div>
  </div>
</template>

<style lang="scss" scope>
@import '@/assets/scss/home/index.scss';
</style>

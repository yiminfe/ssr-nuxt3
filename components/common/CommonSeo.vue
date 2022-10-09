<script setup lang="ts">
const pageMeta = {
  title: '爱此迎-全球大型房屋租赁平台',
  keywords: '爱此迎，特价房源，品质房源，租赁平台',
  description:
    '爱此迎（Aircnb）是房屋租赁平台。爱此迎（Aircnb）的房屋涉及上海、北京、杭州、苏州等60个城市，覆盖了特价房源、品质房源，帮助用户实现从线上房屋预定和浏览功能。 '
}
</script>

<template>
  <Head>
    <Title>{{ pageMeta.title }}{{ $route.meta.title || '' }}</Title>
    <Meta
      name="keywords"
      :content="pageMeta.keywords + ($route.meta.keywords || '')"
    />
    <Meta
      name="description"
      :content="pageMeta.description + ($route.meta.description || '')"
    />
  </Head>
</template>

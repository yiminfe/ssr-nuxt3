<script setup lang="ts">
const props = defineProps<{
  loading: boolean
  count: number
}>()
</script>

<template>
  <el-skeleton :loading="loading" animated>
    <template #template>
      <div class="home-list">
        <div class="item" v-for="i in count" :key="i">
          <el-skeleton-item
            variant="image"
            style="width: 100%; height: 250px; border-radius: 4px"
          ></el-skeleton-item>
          <el-skeleton-item
            variant="p"
            style="width: 100%; margin: 15px 0px; height: 25px"
          ></el-skeleton-item>
          <el-skeleton-item
            variant="p"
            style="width: 30%; height: 16px"
          ></el-skeleton-item>
        </div>
      </div>
    </template>
    <template #default>
      <slot></slot>
    </template>
  </el-skeleton>
</template>

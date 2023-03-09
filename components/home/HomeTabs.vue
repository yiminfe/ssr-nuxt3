<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
}>()

const cityCode = ref(props.modelValue)

watch(cityCode, newCityCode => {
  emit('update:modelValue', newCityCode)
})

const cityArr = [
  {
    cityCode: 'cd',
    cityName: '成都'
  },
  {
    cityCode: 'nj',
    cityName: '南京'
  },
  {
    cityCode: 'cq',
    cityName: '重庆'
  },
  {
    cityCode: 'bj',
    cityName: '北京'
  },
  {
    cityCode: 'sz',
    cityName: '苏州'
  }
]
</script>

<template>
  <!-- 城市筛选 -->
  <el-tabs v-model="cityCode" type="card">
    <el-tab-pane
      v-for="(item, index) in cityArr"
      :key="index"
      :lazy="true"
      :label="$t(`home.city['${item.cityCode}']`)"
      :name="item.cityCode"
    ></el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
const props = defineProps<{
  pageNo: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  (e: 'update:pageNo', pageNo: number): void
  (e: 'update:pageSize', pageSize: number): void
}>()

function changePage(pageNo: number) {
  emit('update:pageNo', pageNo)
}
function changeSize(pageSize: number) {
  emit('update:pageSize', pageSize)
}
</script>

<template>
  <el-pagination
    :current-page="pageNo"
    :page-size="pageSize"
    :total="total"
    :page-sizes="[3, 6, 9, 12]"
    background
    layout="sizes,prev,pager,next"
    prev-text="<<"
    next-text=">>"
    @current-change="changePage"
    @size-change="changeSize"
  ></el-pagination>
</template>

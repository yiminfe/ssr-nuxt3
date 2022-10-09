<script setup lang="ts">
const dropdownRef = ref()

function handleClose() {
  dropdownRef.value.handleClose()
}

defineExpose({
  handleClose
})
</script>

<template>
  <el-dropdown v-bind="$attrs" ref="dropdownRef">
    <slot></slot>
    <template #dropdown>
      <slot name="dropdown"></slot>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { RoomListParams } from '~~/common/types/fetchType'

const pageNo = ref(1)
const pageSize = ref(12)
const cityCode = ref('hz')
const roomListParams: RoomListParams = {
  pageNo: pageNo.value,
  pageSize: pageSize.value,
  cityCode: cityCode.value
}
const { data, pending, refresh } = await useFetchRoomList(roomListParams)

watch([pageNo, pageSize, cityCode], ([newPageNo, newPageSize, newCityCode]) => {
  if (
    (newCityCode !== roomListParams.cityCode ||
      newPageSize !== roomListParams.pageSize) &&
    newPageNo !== 1
  ) {
    pageNo.value = 1
    return
  }
  roomListParams.pageNo = newPageNo
  roomListParams.pageSize = newPageSize
  roomListParams.cityCode = newCityCode
  refresh()
})
</script>

<template>
  <!-- 城市筛选 -->
  <HomeTabs v-model="cityCode" />
  <!-- 首页列表数据 -->
  <div>
    <CommonSkeleton :loading="pending" :count="pageSize">
      <div class="home-list">
        <div
          class="item"
          @click="$router.push(`/detail/${item.id}`)"
          v-for="(item, index) in data.result.orders.data"
          :key="item.id"
        >
          <img :src="item.pictureUrl" :alt="item.title" loading="lazy" />
          <p class="title">{{ item.title }}</p>
          <p class="price">¥{{ item.price }}元</p>
        </div>
      </div>
    </CommonSkeleton>
  </div>

  <!-- 分页 -->
  <CommonPagination
    v-model:pageNo="pageNo"
    v-model:pageSize="pageSize"
    :total="data.result.total"
  />
</template>

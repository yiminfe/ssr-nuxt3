<script setup lang="ts">
import { fetchOrderApi } from '~~/common/api/order'

const emit = defineEmits<{
  (e: 'handleClose'): void
}>()

const orderData = ref([])
const router = useRouter()
const { proxy }: any = getCurrentInstance()

// 房屋订单中心列表
function fetchOrder() {
  return fetchOrderApi().then(res => {
    const { result, success, message } = res
    console.log(result)
    if (success) {
      orderData.value = result
      console.log(orderData.value.length)
    } else {
      proxy.$message.error(message)
    }
  })
}

function refresh() {
  fetchOrder()
}

onMounted(refresh)

function toDetail(item: any) {
  emit('handleClose')
  const { orderId: id } = item
  router.push(`/detail/${id}`)
}

defineExpose({
  refresh
})
</script>

<template>
  <ul v-if="orderData.length > 0">
    <li
      v-for="(item, index) in orderData"
      :key="index"
      @click.stop="toDetail(item)"
    >
      <img :src="item.pictureUrl" loading="lazy" />
      <div class="mess">
        <p class="title">{{ item.title }}</p>
        <p class="info">
          ¥{{ item.price }}/{{ $t('detail.night') }} · {{ item.personNumber
          }}{{ $t('detail.person') }}
        </p>
      </div>
    </li>
  </ul>
  <div v-else class="loading-block">{{ $t('common.empty') }}</div>
</template>

<style scoped lang="scss">
ul {
  max-height: 290px;
  min-height: 56px;
  overflow-y: auto;
  padding: 0px 10px;
}
li {
  @include flex-layout(row, space-between, center);
  border-bottom: 1px solid #eee;
  padding: 10px 0;
  cursor: pointer;
  &:last-child {
    border-bottom: none;
  }
  img {
    width: 65px;
    height: 45px;
    border-radius: 4px;
    margin-right: 5px;
    object-fit: cover;
  }
  .mess {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-left: 10px;
    p {
      line-height: 16px;
      font-weight: normal;
      margin: 5px 0;
      max-width: 100px;
    }
    .title {
      font-weight: bold;
      color: #333;
      font-size: 14px;
      display: inline-block;
      @include line-text-overflow;
    }
    .info {
      color: #666;
      font-size: 12px;
    }

    &:hover {
      .title {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>

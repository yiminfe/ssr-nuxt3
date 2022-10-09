<script setup lang="ts">
import { saveRecordApi } from '~~/common/api/record'
import { saveOrderApi } from '~~/common/api/order'

console.log('详情页初始化')

const route = useRoute()
const { id: recordId } = route.params
const roomDetailParams = {
  id: recordId
}

const { data, refresh } = await useFetchRoomDetail(roomDetailParams)
watchEffect(() => {
  const { result } = data.value
  route.meta.title = result.title
  const owner = result.owner || {}
  route.meta.keywords = owner.introduce || ''
  route.meta.description = owner.introduce || ''
})

const orderForm = reactive({
  personNumber: 1
})

const { proxy }: any = getCurrentInstance()
const { visible: toastVisible, showToast } = useToast()
const { checkLogin } = useUserInterceptor()

function submitForm() {
  if (checkLogin()) {
    saveOrder()
  }
}

// 立即预定
function saveOrder() {
  const { id: orderId } = route.params
  const { title, price, imgs } = data.value.result
  const { personNumber } = orderForm
  const params = {
    orderId,
    title,
    price,
    personNumber,
    pictureUrl: imgs[0]
  }
  saveOrderApi(params).then(res => {
    console.log(res)
    const { success, message } = res
    if (success) {
      showToast(1500)
    } else {
      proxy.$message.error(message)
    }
  })
}

// 保存历史足迹
function saveRecord() {
  const { title, price, imgs, personNumber } = data.value.result
  const params = {
    recordId,
    title,
    price,
    personNumber,
    pictureUrl: imgs[0]
  }
  saveRecordApi(params)
}

onMounted(() => {
  console.log('详情页 onMounted')
  saveRecord()
})

onActivated(() => {
  console.log('详情页 onActivated')
})
</script>

<template>
  <div>
    <!-- Toast -->
    <Teleport to="#__nuxt" v-if="toastVisible">
      <el-alert
        :title="$t('detail.reservated')"
        type="success"
        :closable="false"
      ></el-alert>
    </Teleport>
    <div v-if="data.result && data.result.info && data.result.owner">
      <!-- 照片墙 -->
      <el-carousel
        v-if="data.result.imgs && data.result.imgs.length > 0"
        class="imgs-wall"
        trigger="click"
        height="380px"
        :interval="3000"
        indicator-position="none"
        type="card"
      >
        <el-carousel-item
          v-for="(item, index) in data.result.imgs"
          :key="index"
        >
          <img :src="item" loading="lazy" />
        </el-carousel-item>
      </el-carousel>

      <div class="main-wapper">
        <!-- 房屋详情信息 -->
        <div class="room-detail">
          <div class="detail-part">
            <h2>{{ data.result.title }}</h2>
            <!-- 房屋信息 -->
            <div class="info">
              <span class="room"
                >{{ data.result.info.room }} {{ $t('detail.rooms') }}</span
              >
              <span class="bed"
                >{{ data.result.info.bed }} {{ $t('detail.beds') }}</span
              >
              <span class="toilet"
                >{{ data.result.info.toilet }}
                {{ $t('detail.bathrooms') }}</span
              >
              <span class="live-number"
                >{{ $t('detail.living') }} {{ data.result.info.liveNumber }}
                {{ $t('detail.personNumber') }}</span
              >
            </div>
            <div class="tags">
              <el-tag size="small"
                >{{ data.result.info.remarks }}
                {{ $t('detail.remarks') }}</el-tag
              >
              <el-tag
                size="small"
                class="ml-10"
                type="danger"
                v-if="data.result.info.metro"
                >{{ $t('detail.nearSubway') }}</el-tag
              >
              <el-tag
                size="small"
                class="ml-10"
                type="warning"
                v-if="data.result.info.parking"
                >{{ $t('detail.freeParking') }}</el-tag
              >
              <el-tag
                size="small"
                class="ml-10"
                type="success"
                v-if="data.result.info.luggage"
                >{{ $t('detail.luggage') }}</el-tag
              >
            </div>
            <hr />
            <!-- 房东信息 -->
            <div class="owner-detail">
              <img :src="data.result.owner.avatar" loading="lazy" />
              <div class="info">
                <p>{{ $t('detail.landlord') }}：{{ data.result.owner.name }}</p>
                <p>
                  <span v-if="data.result.owner.certify">{{
                    $t('detail.authenticated')
                  }}</span>
                  <span v-if="data.result.info.goodOwner">{{
                    $t('detail.greatlandlord')
                  }}</span>
                </p>
              </div>
            </div>
            <!-- 基本介绍 -->
            <div class="introduce">{{ data.result.owner.introduce || '' }}</div>
          </div>
          <div class="form-part">
            <p class="price">
              <span>¥{{ data.result.price }}</span>
              / {{ $t('detail.night') }}
            </p>
            <!-- 表单 -->
            <el-form
              :model="orderForm"
              label-position="top"
              class="order-ruleForm"
            >
              <el-form-item
                prop="personNumber"
                :label="$t('detail.personNumber')"
              >
                <select v-model="orderForm.personNumber">
                  <option v-for="item in 3" :value="item" :key="item">
                    {{ item }}
                  </option>
                </select>
              </el-form-item>
              <el-form-item>
                <el-button
                  class="btn-primary"
                  type="primary"
                  @click="submitForm"
                  >{{ $t('detail.order') }}</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scope>
@import '@/assets/scss/detail/index.scss';
@import '@/assets/scss/common/toast.scss';

.el-carousel--horizontal {
  overflow: hidden;
}
</style>

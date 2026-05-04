<template>
  <div class="page-container">
    <div class="tool-name">同行店铺调研-饿了么</div>
    <div class="tool-time">
      <div class="time-left">
        <span class="time">到期时间：{{ endTime }}</span>
        <el-button :icon="Refresh" type="primary" @click="payFunShow">续费</el-button>
        <el-button :icon="Management" @click="openTutorials">使用教程</el-button>
      </div>
      <div class="time-right">
        <el-button
          :disabled="endTime == '已到期'"
          :icon="toolState ? VideoPause : VideoPlay"
          type="primary"
          @click="changeToolState"
        >
          {{ toolState ? '关闭调研' : '开启调研' }}
        </el-button>
        <el-button
          v-if="poiInfo && poiInfo.storeHead && poiInfo.storeHead.storeInfo && poiInfo.storeHead.storeInfo.name"
          :icon="Download"
          @click="exportExelData"
          >数据导出</el-button
        >
      </div>
    </div>
    <div class="shopinformation">
      <h4>店铺基本信息</h4>
      <!-- <div class="shopcart">
        <div class="cartleft">
          <div class="carttext">
            <span>店铺名称：</span>
            <span v-if="poiInfo.storeHead && poiInfo.storeHead.storeInfo && poiInfo.storeHead.storeInfo.name">
              {{ poiInfo.storeHead.storeInfo.name }}
            </span>
          </div>
          <div v-if="poiInfo.storeHead && poiInfo.storeHead.storeInfo && poiInfo.storeHead.storeInfo.serviceDesc" class="carttext">
            <span>月售：</span>
            {{ poiInfo.storeHead.storeInfo.serviceDesc[1] }}
          </div>
        </div>
        <div>
          <div v-if="poiInfo.storeHead && poiInfo.storeHead.storeInfo && poiInfo.storeHead.storeInfo.scoreRate" class="carttext">
            <span>评分：</span>
            {{ poiInfo.storeHead.storeScore.scoreRate }}
          </div>
          <div v-if="poiInfo.storeHead && poiInfo.storeHead.storeInfo && poiInfo.storeHead.storeInfo.announcement" class="carttext">
            <span>店铺公告：</span>
            {{ poiInfo.storeHead.storeInfo.announcement }}
          </div>
        </div>
      </div> -->
      <div class="imglist">
        <div style="width: fit-content; display: flex; flex-direction: column">
          <div class="imgbox imgbox1">
            <div class="img">
              <el-image
                v-if="poiInfo && poiInfo.storeHead && poiInfo.storeHead.storeHeadPoster"
                fit="cover"
                :initial-index="4"
                :max-scale="7"
                :min-scale="0.2"
                :preview-src-list="[handlePicUrl(poiInfo.storeHead.storeHeadPoster.headImage)]"
                show-progress
                :src="handlePicUrl(poiInfo.storeHead.storeHeadPoster.headImage)"
                style="width: 100%; height: 100%"
                :zoom-rate="1.2"
              />
              <el-image v-else>
                <template #error>
                  <div class="image-slot">
                    <el-icon><icon-picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <!-- <div
            v-if="poiInfo && poiInfo.storeHead && poiInfo.storeHead.storeInfo"
            @click="downImg(handlePicUrl(poiInfo.storeHead.storeInfo.storeLogo))"
          >
            <el-button :icon="Download">下载店铺logo</el-button>
          </div> -->
          </div>
          <el-button
            style="margin: auto"
            :disabled="!(poiInfo && poiInfo.storeHead && poiInfo.storeHead.storeInfo)"
            :icon="Download"
            @click="downImg(handlePicUrl(poiInfo.storeHead.storeInfo.storeLogo))"
            >下载店铺logo</el-button
          >
        </div>
        <div class="boxflexlist">
          <div class="shoptext">
            <div class="textbox">
              <div class="textboxtop">
                <div class="carttext" style="width: 500px">
                  <span>店铺名称：</span>
                  <span v-if="poiInfo.storeHead && poiInfo.storeHead.storeInfo && poiInfo.storeHead.storeInfo.name">
                    {{ poiInfo.storeHead.storeInfo.name }}
                  </span>
                </div>
                <div class="carttext" style="width: 200px">
                  <span>月售：</span>
                  <span
                    v-if="poiInfo.storeHead && poiInfo.storeHead.storeInfo && poiInfo.storeHead.storeInfo.serviceDesc"
                  >
                    {{ poiInfo.storeHead.storeInfo.serviceDesc[1] }}
                  </span>
                </div>
                <div class="carttext">
                  <span>店铺评分：</span>
                  <span
                    v-if="poiInfo.storeHead && poiInfo.storeHead.storeInfo && poiInfo.storeHead.storeInfo.scoreRate"
                  >
                    {{ poiInfo.storeHead.storeScore.scoreRate }}
                  </span>
                </div>
              </div>
              <div class="carttext">
                <span>店铺公告：</span>
                <span
                  v-if="poiInfo.storeHead && poiInfo.storeHead.storeInfo && poiInfo.storeHead.storeInfo.announcement"
                >
                  {{ poiInfo.storeHead.storeInfo.announcement }}
                </span>
              </div>
            </div>
          </div>
          <div style="width: fit-content; display: flex; flex-direction: column; width: 25%; min-width: 350px">
            <div class="imgbox">
              <div class="img">
                <el-image
                  v-if="poiInfo && poiInfo.storeHead && poiInfo.storeHead.storeHeadPoster"
                  fit="cover"
                  :initial-index="4"
                  :max-scale="7"
                  :min-scale="0.2"
                  :preview-src-list="[handlePicUrl(poiInfo.storeHead.storeHeadPoster.headImage)]"
                  show-progress
                  :src="handlePicUrl(poiInfo.storeHead.storeHeadPoster.headImage)"
                  style="width: 100%; height: 100%"
                  :zoom-rate="1.2"
                />
                <el-image v-else>
                  <template #error>
                    <div class="image-slot">
                      <el-icon><icon-picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>
            <el-button
              style="margin: auto"
              :disabled="!(poiInfo && poiInfo.storeHead && poiInfo.storeHead.storeHeadPoster)"
              :icon="Download"
              @click="downImg(handlePicUrl(poiInfo.storeHead.storeHeadPoster.headImage))"
              >下载店铺招牌</el-button
            >
          </div>
          <div style="width: fit-content; display: flex; flex-direction: column; width: 25%; min-width: 350px">
            <div class="imgbox">
              <div class="img">
                <el-carousel
                  v-if="operationSourceList && operationSourceList.length > 0"
                  indicator-position="none"
                  style="width: 100%; height: 100%"
                >
                  <el-carousel-item v-for="item in operationSourceList" :key="item.image">
                    <img alt="" :src="handlePicUrl(item.image)" style="width: 100%; height: 100%" />
                  </el-carousel-item>
                </el-carousel>
                <el-image>
                  <template #error>
                    <div class="image-slot">
                      <el-icon><icon-picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
              <!-- <div v-if="operationSourceList && operationSourceList.length > 0" @click="openChange">
            </div> -->
            </div>
            <el-button
              style="margin: auto"
              :disabled="!(operationSourceList && operationSourceList.length > 0)"
              :icon="Download"
              @click="openChange"
              >下载店铺海报</el-button
            >
          </div>
          <div class="tablebox">
            <el-table :data="poiTags" :height="148" style="width: 100%">
              <el-table-column label="序号" width="180">
                <template #default="scope">
                  {{ scope.$index + 1 }}
                </template>
              </el-table-column>
              <el-table-column label="活动类型">
                <template #default="{ row }">
                  {{ getActiveType(row.type) }}
                </template>
              </el-table-column>
              <el-table-column label="活动名称">
                <template #default="{ row }">
                  {{ row.text }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- <div class="imgbox">
          <div class="img">
            <el-image
              v-if="poiInfo && poiInfo.storeHead && poiInfo.storeHead.storeHeadPoster"
              fit="cover"
              :initial-index="4"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="[handlePicUrl(poiInfo.storeHead.storeHeadPoster.headImage)]"
              show-progress
              :src="handlePicUrl(poiInfo.storeHead.storeHeadPoster.headImage)"
              style="width: 100%; height: 100%"
              :zoom-rate="1.2"
            />
            <el-image v-else>
              <template #error>
                <div class="image-slot">
                  <el-icon><icon-picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div
            v-if="poiInfo && poiInfo.storeHead && poiInfo.storeHead.storeHeadPoster"
            @click="downImg(handlePicUrl(poiInfo.storeHead.storeHeadPoster.headImage))"
          >
            <el-button :icon="Download">下载店铺招牌</el-button>
          </div>
        </div> -->
        <!-- <div class="imgbox">
          <div class="img">
            <el-carousel
              v-if="operationSourceList && operationSourceList.length > 0"
              indicator-position="none"
              style="width: 100%; height: 100%"
            >
              <el-carousel-item v-for="item in operationSourceList" :key="item.image">
                <img alt="" :src="handlePicUrl(item.image)" style="width: 100%; height: 100%" />
              </el-carousel-item>
            </el-carousel>
            <el-image>
              <template #error>
                <div class="image-slot">
                  <el-icon><icon-picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div v-if="operationSourceList && operationSourceList.length > 0" @click="openChange">
            <el-button :icon="Download">下载店铺海报</el-button>
          </div>
        </div> -->
      </div>
      <div>
        <!-- <h5>店铺活动列表</h5>
        <el-table :data="poiTags" :height="poiTags.length > 8 ? 300 : undefined" style="width: 100%">
          <el-table-column label="序号" width="180">
            <template #default="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="活动类型">
            <template #default="{ row }">
              {{ getActiveType(row.type) }}
            </template>
          </el-table-column>
          <el-table-column label="活动名称">
            <template #default="{ row }">
              {{ row.text }}
            </template>
          </el-table-column>
        </el-table> -->
        <h5>店铺商品列表</h5>
        <div class="good-container">
          <div class="good-list">
            <div
              v-for="(item, index) in foodSpuTags"
              :key="index"
              class="list-item"
              :class="{ 'group-is-active': currentGroupIndex === index }"
              @click="getGroupGoodList(item, index)"
            >
              <div style="width: 100%">
                <div style="color: #999999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  {{ item.name }}
                </div>
                <div v-if="item.items" style="font-weight: 400; font-size: 12px; color: #999999; margin-top: 4px">
                  商品（{{ item.items.length }}）
                </div>
              </div>
            </div>
          </div>
          <div class="good-detail-list">
            <div v-for="item in currentGoodList" :key="item.index" class="good-detail">
              <div class="detail-left">
                <div class="detail-img">
                  <img alt="" :src="handlePicUrl(item.imageHash)" />
                </div>
                <div class="ai-btn">AI去水印</div>
                <div class="ai-btn">AI美化</div>
                <img
                  v-if="handlePicUrl(item.imageHash)"
                  alt=""
                  class="travelcube"
                  src="https://p0.meituan.net/travelcube/8be28067646744c6f878dfdbf1a714b316766.png"
                />
              </div>
              <div class="detail-right">
                <div class="detail-line" style="display: flex; align-items: center; justify-content: space-between">
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">名称</div>
                  <el-input v-model="item.name" disabled style="width: calc(100% - 110px)" />
                </div>
                <div class="detail-line">
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">描述</div>
                  <el-input v-model="item.description" disabled style="width: calc(100% - 110px)" />
                </div>
                <div class="detail-line">
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">最小购买数</div>
                  <el-input v-model="item.purchaseButton.minPurchase" disabled style="width: 120px" />
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">月售</div>
                  <el-input disabled style="width: 120px" :value="item.tipTextList ? item.tipTextList[0] : ''" />
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">好评度</div>
                  <el-input disabled style="width: 120px" :value="item.tipTextList ? item.tipTextList[1] : ''" />
                </div>
                <div class="detail-line">
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">份量</div>
                  <el-input disabled style="width: 120px" :value="specifications" />
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">库存</div>
                  <el-input disabled style="width: 120px" :value="10000" />
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">折扣</div>
                  <el-input
                    disabled
                    style="width: 120px"
                    :value="item.labelDetails && item.labelDetails[0] ? item.labelDetails[0].text : ''"
                  />
                </div>
                <div class="detail-line">
                  <div class="specs-name" style="width: 120px; padding: 0 10px 0 20px">是否单点不送</div>
                  <el-input
                    disabled
                    style="width: 120px"
                    :value="item.labelDetails && item.labelDetails[1] ? item.labelDetails[1].text : ''"
                  />
                </div>
                <div v-for="(_item, _index) in item.attrs" :key="_index" class="detail-line specs-other">
                  <div class="specs-item" style="width: 100%; display: flex; align-items: flex-start">
                    <div class="specs-name specs-name-other" style="border: 1px solid #dcdfe6">{{ _item.name }}</div>
                    <div style="display: flex; flex-wrap: wrap; align-items: center; width: calc(100% - 90px)">
                      <div v-for="(__item, __index) in _item.details" :key="__index" class="litItemInput">
                        <el-input v-model="__item.name" class="lit-input" disabled />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="changeImgState" title="选择图片下载" width="30%">
      <div style="width: 100%; overflow-x: auto; display: flex; align-items: center; padding-bottom: 20px">
        <div
          v-for="item in operationSourceList"
          :key="item.image"
          style="width: 210px; height: 140px; margin-right: 10px; display: flex; align-items: center; flex-wrap: wrap"
        >
          <img alt="" :src="handlePicUrl(item.image)" style="width: 100%; height: 80px" />
          <div @click="downImg(handlePicUrl(item.image))"><el-button :icon="Download">下载海报</el-button></div>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      v-if="exportState"
      v-model="exportState"
      custom-class="dialog-min-width"
      title="请选择数据导出格式"
      width="30%"
    >
      <div style="padding: 10px">
        <el-form ref="ruleForm" class="demo-ruleForm" label-width="120px" :model="ruleForm">
          <el-form-item label="图片命名格式">
            <el-radio-group v-model="nameType1">
              <el-radio value="商品名称命名">商品名称命名</el-radio>
              <el-radio value="序号命名">序号命名</el-radio>
              <!--              <el-radio label="商品条码命名"></el-radio>-->
            </el-radio-group>
            <div class="form-tips">
              注意：使用商品名称命名图片，如果商品名称内包含 (/ | : * " <> )
              以上特殊符号会导致图片保存失败。解决办法再使用序号命名保存一次！
            </div>
          </el-form-item>
          <el-form-item label="数据导出格式">
            <el-radio-group v-model="exportType1">
              <el-radio value="默认表格">默认表格</el-radio>
              <!--              <el-radio label="餐饮上传表格"></el-radio>-->
              <el-radio value="数据分析表格">数据分析表格</el-radio>
              <el-radio value="只导出图片">只导出图片</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="导出路径">
            <div style="width: 100%; display: flex; align-items: center">
              <el-input v-model="fileAddress" disabled placeholder="不设置默认保存到桌面" style="width: 60%" />
              <el-button type="primary" @click="handleSelectFolder">设置</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer" style="display: flex; align-items: center; justify-content: flex-end">
          <el-button style="margin-right: 10px" @click="closeForm">取 消</el-button>
          <el-button type="primary" @click="submitForm()">立即导出</el-button>
        </span>
      </template>
    </el-dialog>
    <pay-dialog
      v-if="payDialogState"
      :pay-dialog-state="payDialogState"
      :pay-type-text="payTypeText"
      :shop-type="2"
      @close-dialog="closePayDialog"
      @pay-success="paySuccess"
    />
    <el-dialog
      v-if="tutorialsDialogState"
      v-model="tutorialsDialogState"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :title="currentTutorials"
      width="900px"
      @close="closeTutorialsDialog"
    >
      <div style="padding-bottom: 20px">
        <vab-player :config="configMp4" style="background-color: rgba(0, 0, 0, 0.87)" />
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { Download, Picture as IconPicture, Management, Refresh, VideoPause, VideoPlay } from '@element-plus/icons-vue'

import { getMyFunctionsV2 } from '/@/api/shop.ts'
import { gp } from '/@vab/plugins/vab.ts'
import path from 'node:path'
import PayDialog from '/@/views/shop/componentsV2/PayDialogUser.vue'
import { uniqueId } from 'lodash-es'
defineOptions({
  name: 'IntegralMt'
})

const getGroupGoodList = (item: any, index: number) => {
  currentGroupIndex.value = index
  currentGoodList.value = foodSpuTags.value[index].items
}

const configMp4 = reactive({
  url: 'http://file.waimaitong.com/Functional_movie_V3_pc/%E7%BE%8E%E5%9B%A2%E9%A5%BF%E4%BA%86%E4%B9%88%E7%AB%9E%E5%AF%B9%E5%88%86%E6%9E%90.mp4',
  id: uniqueId('uuid_mp4_'),
  lang: 'zh',
  volume: 0,
  autoplay: true,
  screenShot: true,
  playbackRate: [0.5, 0.75, 1, 1.5, 2],
  fluid: true
})
const tutorialsDialogState = ref(false)
const currentTutorials = ref('竞对店铺分析')
const closeTutorialsDialog = () => {
  tutorialsDialogState.value = false
}
const openTutorials = () => {
  tutorialsDialogState.value = true
}

const changeImgState = ref(false)
const openChange = () => {
  if (operationSourceList.value && operationSourceList.value.length > 0) {
    changeImgState.value = true
  } else {
    gp.$baseMessage('未获取到图片!', 'error', 'hey')
  }
}
const downImg = (url: any) => {
  if (url) {
    // if(url.indexOf('?')>-1){
    //   url=url.split('?')[0]
    // }
    // if(url.indexOf('@')>-1){
    //   url=url.split('@')[0];
    // }
    globalThis.electron.downImage(url)
  } else {
    gp.$baseMessage('未获取到图片!', 'error', 'hey')
  }
}
const getActiveType = (row: any) => {
  let typeList = [
    '',
    '满减活动',
    '减配送费',
    '折扣活动',
    '门店新客立减',
    '买赠活动',
    '收藏有礼',
    '集点返卷',
    '下单返卷',
    '店内领卷',
    '超值换购'
  ]
  return row ? typeList[row] : ''
}

const toolState = ref(false)
const changeToolState = () => {
  if (toolState.value) {
    closeInvestigation()
  } else {
    openInvestigation()
  }
}
const openInvestigation = () => {
  toolState.value = true
  globalThis.electron.startProxy()
  gp.$baseMessage('开启成功!', 'success', 'hey')
}
const closeInvestigation = () => {
  toolState.value = false
  globalThis.electron.stopProxy()
  gp.$baseMessage('关闭成功!', 'success', 'hey')
}
const onDataReceived = (res: any) => {
  // 链接如果是图片就不执行
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg']
  if (imageTypes.some(type => res.url.toLowerCase().includes(type))) {
    return
  }
  handleDetailUrl(res)
}

let unsubscribe: Function
onMounted(() => {
  unsubscribe = globalThis.electron.onReceiveInterceptedData(onDataReceived)
  handleGetDesktopPath()
})
onBeforeUnmount(() => {
  globalThis.electron.stopProxy()
  unsubscribe()
})
const currentGroupIndex = ref(0)
const handleDetailUrl = (data: any) => {
  if (data.url.includes('mtop.alsc.waimai.store.miniapp.store.detail.head.query.v2')) {
    data.body = JSON.parse(data.body)
    console.log('获取店铺详情', data.body.data.resultMap)
    handleFoodDetail(data.body.data.resultMap)
    currentGroupIndex.value = 0
  } else if (data.url.includes('mtop.alsc.waimai.store.miniapp.store.detail.body.query.v2')) {
    data.body = JSON.parse(data.body)
    console.log('获取分类列表', data.body.data.resultMap)
    handleProductList(data.body.data.resultMap)
  } else if (data.url.includes('mtop.alsc.waimai.store.detail.item.purchased')) {
    data.body = JSON.parse(data.body)
    console.log('获取商品列表', data.body.data.resultMap)
    handleClassificationFood(data.body.data.resultMap)
  }
}
const poiInfo = ref({})
const operationSourceList = ref([])
const poiTags = ref<any>([])
const operateData = ref<any>([])
const handleFoodDetail = (data: any) => {
  poiInfo.value = data
  poiTags.value = []
  data.storeHead.storePromotionInfo.storeActivityTags.forEach((item: any) => {
    if (item.extensionList && item.extensionList.length > 0) {
      item.extensionList.forEach((_item: any) => {
        poiTags.value.push({
          type: _item.type,
          text: _item.text
        })
      })
    } else {
      if (item.desc) {
        poiTags.value.push({
          type: '',
          text: item.desc
        })
      }
    }
  })
  let activeStr = ''
  if (
    poiInfo.value.storeHead.storePromotionInfo.storeActivityTags &&
    poiInfo.value.storeHead.storePromotionInfo.storeActivityTags.length > 0
  ) {
    poiInfo.value.storeHead.storePromotionInfo.storeActivityTags.forEach((item: any) => {
      if (item.text) {
        activeStr += `${item.text};`
      }
    })
  }
  operateData.value = [
    poiInfo.value.storeHead.storeInfo.name,
    poiInfo.value.storeHead.storeInfo.serviceDesc[3],
    poiInfo.value.storeHead.storeInfo.storeBlueTag ? poiInfo.value.storeHead.storeInfo.storeBlueTag.text : '',
    activeStr.slice(0, -1),
    poiInfo.value.storeHead.storeScore.scoreText
  ]
}
const foodSpuTags = ref<any>([])
const specifications = ref<any>([])
const currentGoodList = ref<any>([])
const tableDataList = ref<any>([])
const handleProductList = (data: any) => {
  tableDataList.value = []
  console.log(data, '商品数据')
  // specifications.value =
  //   data.storeWindow && data.storeWindow[0] && data.storeWindow[0].items && data.storeWindow[0].items[1] && data.storeWindow[0].items[1].itemRecommend
  //     ? data.storeWindow[0].items[1].itemRecommend.reasons[0].textLabel.text
  //     : ''
  foodSpuTags.value = data.menu.itemGroups
  foodSpuTags.value.forEach((item: any) => {
    item.items.splice(0, 1)
    if (item.groupType === 1) {
      tableDataList.value.push(...item.items)
    }
  })
  console.log(tableDataList.value, '商品列表数据')
  if (data.storePoster && data.storePoster.posters && data.storePoster.posters.length > 0) {
    operationSourceList.value = data.storePoster.posters
  }
  currentGoodList.value = foodSpuTags.value[currentGroupIndex.value].items
  handleExcelData()
}
const dataArr = ref<any>([])
const imgList = ref<any>([])
const exportName = ref('')
const handleExcelData = () => {
  dataArr.value = []
  const list = ref<any>([])
  imgList.value = []
  foodSpuTags.value.forEach((item: any) => {
    if (item.items && item.items.length > 0) {
      item.items.forEach((_item: any) => {
        _item.group_name = item.name
      })
      list.value.push(...item.items)
    }
  })
  list.value = list.value.filter((item: any) => item.group_name !== '折扣' && item.group_name !== '推荐')
  list.value.forEach((item: any, index: number) => {
    let attribute = ''
    if (item.attrs && item.attrs.length > 0) {
      item.attrs.forEach((_item: any) => {
        if (_item.details && _item.details.length > 0) {
          _item.details.forEach((__item: any) => {
            attribute += `${__item.name}#`
          })
        }
      })
    }
    dataArr.value.push({
      id: index + 1,
      name: item.group_name || '',
      product_name: item.name || '',
      month_sales_description: item.tipTextList ? item.tipTextList[0] : '',
      unit: specifications.value,
      min_price: item.price || '',
      max_discount: item.labelDetails && item.labelDetails[0] ? item.labelDetails[0].text : '' || '',
      origin_price: item.originPrice || '',
      stock: '10000' || '',
      today_stock: '10000' || '',
      meal_num: 1,
      meal_price: 1,
      format: specifications.value,
      min_order_count: item.purchaseButton.minPurchase || '',
      description: item.description || '',
      active_price: item.price || '', // 运营特有
      pack_price: 1, // 运营特有
      like_ratio_desc: item.tipTextList ? item.tipTextList[1] : '', // 运营特有
      attribute: attribute.slice(0, -1)
    })
    if (item.imageHash) {
      imgList.value.push({
        picture: handlePicUrl(item.imageHash),
        name: item.name
      })
    } else {
      imgList.value.push({
        picture: 'http://file.waimaitong.com/admin_image/user_614538240520197/white-bg.jpg',
        name: item.name
      })
    }
  })
  exportName.value = poiInfo.value.storeHead.storeInfo.name
}
const handleClassificationFood = (data: any) => {
  if (data && data.brand) {
  }
  foodSpuTags.value.forEach((item: any, index: number) => {
    if (item.items && item.items.length > 0) {
      item.items.forEach((_item: any, _index: number) => {
        if (_item.tbItemId === data.tbItemId) {
          console.log(_item.tbItemId, data.tbItemId, 123456)
          let attrs = []
          if (data.brand && data.brand.singleSpecFood) {
            attrs.push(data.brand.singleSpecFood)
          }
          if (data.brand && data.brand.attributes) {
            attrs.push(...data.brand.attributes)
          }
          foodSpuTags.value[index].items[_index].attrs = attrs
        }
      })
    }
  })
  handleExcelData()
}
const handlePicUrl = (str: any) => {
  if (!str) {
    return
  }
  const extensions = ['JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'WEBP', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
  let ext = ''
  for (let e of extensions) {
    if (str.endsWith(e)) {
      ext = `.${e}`
      break
    }
  }
  if (!ext) {
    ext = '.jpeg'
  }
  if (str.length < 6) {
    throw new Error('Input string is too short to be formatted.')
  }
  const firstTwo = str.slice(0, 1)
  const nextTwo = str.slice(1, 3)
  const rest = str.slice(3)
  const baseUrl = 'https://cube.elemecdn.com/'
  return `${baseUrl}${firstTwo}/${nextTwo}/${rest}${ext}`
}

const funcList = ref([])
const endTime = ref('')
const getFunctionList = () => {
  getMyFunctionsV2({ shopType: 2 }).then((res: any) => {
    if (res.code === 200) {
      funcList.value = res.data
      funcList.value.forEach((item: any) => {
        if (item.function_code === 'CONTENDANALYSE' && item.Function.shop_type === 2) {
          if (new Date(item.end_time) < new Date()) {
            endTime.value = '已到期'
          } else {
            endTime.value = item.end_time
          }
        } else {
          endTime.value = '已到期'
        }
      })
      if (funcList.value.length === 0) {
        endTime.value = '已到期'
      }
    }
  })
}
getFunctionList()

const payDialogState = ref(false)
const payTypeText = ref('竞对调研')
const payFunShow = () => {
  payDialogState.value = true
}
const closePayDialog = () => {
  payDialogState.value = false
}
const paySuccess = () => {
  closePayDialog()
  getFunctionList()
}

const exportState = ref(false)
const ruleForm = ref({
  nameType: '商品名称命名',
  exportType: '默认表格'
})
const fileAddress = ref('')
const exportExelData = () => {
  exportState.value = true
}
const closeForm = () => {
  exportState.value = false
  nameType1.value = '商品名称命名'
  exportType1.value = '默认表格'
  ruleForm.value = {
    nameType: '商品名称命名',
    exportType: '默认表格'
  }
  fileAddress.value = ''
}
const handleSelectFolder = async () => {
  try {
    fileAddress.value = await globalThis.electron.openDirectoryDialog()
  } catch (error) {
    console.error('Error opening directory dialog:', error)
  }
}
const desktopPath = ref('')
const handleGetDesktopPath = async () => {
  const path = await globalThis.electron.getDefaultExportPath()
  if (path) {
    desktopPath.value = path
  }
}
const submitForm = async () => {
  try {
    let baseFolderPath = ''
    if (fileAddress.value) {
      // 没有选择的情况下默认选择桌面
      baseFolderPath = fileAddress.value
    } else {
      // 第一步：让用户选择导出文件夹，默认选择桌面
      baseFolderPath = desktopPath.value
      console.log('Selected export folder or desktop:', baseFolderPath)
    }
    console.log(baseFolderPath)
    // 第二步：创建文件夹
    const subfolderName = poiInfo.value.storeHead.storeInfo.name
    const resultCreateFolder = await globalThis.electron.createFolder(baseFolderPath, subfolderName)
    const dataArrCopy = JSON.parse(JSON.stringify(dataArr.value))
    const operateDataCopy = JSON.parse(JSON.stringify(operateData.value))
    if (exportType1.value !== '只导出图片') {
      const excelFileName = `${exportType1.value}.xlsx`
      const excelFilePath = await globalThis.electron.pathMontage([baseFolderPath, subfolderName, excelFileName])
      if (exportType1.value === '默认表格') {
        const header = [
          '序号',
          '分类名称',
          '商品名称',
          '月售',
          '商品规格',
          '售价',
          '折扣',
          '原价',
          '当前库存',
          '每日库存',
          '餐盒数量',
          '餐盒价格',
          '单位',
          '最小购买数',
          '描述'
        ]
        const columnWidths = [10, 20, 40, 20, 20, 10, 10, 10, 10, 10, 10, 10, 10, 20, 100]
        console.log('resultCreateExcel111111111111')
        const resultCreateExcel = await globalThis.electron.createAndSaveExcel(
          excelFilePath,
          header,
          dataArrCopy,
          columnWidths
        )
        console.log(resultCreateExcel, 'resultCreateExcel22222222222')
      } else if (exportType1.value === '数据分析表格') {
        const header1 = ['商家运营概况']
        const headerRow1 = ['门店名称', '是否支持自取', '是否金牌商家', '商家活动', '门店评分']
        const columnWidths1 = [40, 30, 20, 80, 10]
        const header2 = ['门店商品信息（按销量排序）']
        const headerRow2 = [
          '分类名称',
          '商品名称',
          '月售',
          '商品规格',
          '售价',
          '活动价',
          '原价',
          '折扣',
          '库存',
          '打包费',
          '单位',
          '最小购买数',
          '好评度',
          '属性',
          '商品描述'
        ]
        const columnWidths2 = [15, 25, 10, 10, 10, 10, 10, 10, 10, 10, 10, 15, 10, 30, 60]
        const resultCreateExcel = await globalThis.electron.createAndSaveExcelOperate(
          excelFilePath,
          header1,
          headerRow1,
          columnWidths1,
          header2,
          headerRow2,
          columnWidths2,
          operateDataCopy,
          dataArrCopy
        )
        console.log(resultCreateExcel)
      }
    }

    const pathMontage1 = await globalThis.electron.pathMontage([baseFolderPath, subfolderName])

    // 第四步：下载图片
    await downloadImageFile(handlePicUrl(poiInfo.value.storeHead.storeInfo.storeLogo), pathMontage1, '店铺LOGO')
    await downloadImageFile(handlePicUrl(poiInfo.value.storeHead.storeHeadPoster.headImage), pathMontage1, '店铺招牌')
    if (operationSourceList.value && operationSourceList.value.length > 0) {
      operationSourceList.value.forEach((item: any, index: number) => {
        downloadImageFile(handlePicUrl(item.image), pathMontage1, `海报_${index}`)
      })
    }

    // 可以继续在此文件夹中创建更多的子文件夹和文件
    const deeperSubfolderName = '商品主图'
    await globalThis.electron.createFolder(pathMontage1, deeperSubfolderName)
    const pathMontage2 = await globalThis.electron.pathMontage([baseFolderPath, subfolderName, deeperSubfolderName])
    imgList.value.forEach((item: any, index: number) => {
      let num: string = index + 1 + ''
      downloadImageFile(item.picture, pathMontage2, nameType1.value === '商品名称命名' ? item.name : num)
    })
    setTimeout(() => {
      gp.$baseMessage(`导出成功！`, 'success', 'hey')
    }, 1000)
    console.log('Files and images exported successfully!')
  } catch (error) {
    gp.$baseMessage(`导出失败：${error}`, 'error', 'hey')
  }
}
const downloadImageFile = async (url: string, path: string, name: string) => {
  let nameStr = ''
  if (nameType1.value === '商品名称命名') {
    nameStr = name.replaceAll(/[\/|:*"<>]/g, '')
  } else {
    nameStr = name
  }
  if (url) {
    const resultDownloadImage = await globalThis.electron.downloadImageFile(url, path, `${nameStr}.jpg`)
    console.log(resultDownloadImage.message)
  }
}
const nameType1 = ref('商品名称命名')
const exportType1 = ref('默认表格')
</script>
<style scoped lang="scss">
.tool-name {
  width: 100%;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  line-height: 40px;
}

.tool-time {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .time-left {
    .time {
      margin-right: 10px;
    }
  }
}

.shopcart {
  border: 1px solid #eee;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .carttext {
    color: #000;
    line-height: 40px;

    span {
      color: #8b929b;
    }
  }
}

.boxflexlist {
  flex: 1;
  display: flex;
  // justify-content: space-between;
  align-content: space-between;
  flex-wrap: wrap;
  margin-left: 10px;

  .shoptext {
    width: 100%;
    // height:100px;
    min-width: fit-content;

    .textbox {
      // width:350px;
      min-width: 300px;
      border: 1px solid #eee;
      height: fit-content;
      padding: 5px 10px;
      box-sizing: border-box;

      .textboxtop {
        display: flex;
        flex-wrap: wrap;
      }

      .carttext {
        color: #000;
        line-height: 30px;
        margin-right: 10px;

        span {
          color: #8b929b;
        }
      }
    }
  }

  .tablebox {
    width: 45%;
    min-width: 350px;
    height: 100px;
  }

  .imgbox {
    // width: 25%;
    //aspect-ratio: 1 / 0.4;
    // min-width: 350px;
    width: 100%;
    height: 100px;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #eee;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-right: 10px;

    .el-button {
      width: 100%;
      margin-top: 10px;
    }

    .img {
      flex: 1;
      overflow: hidden;

      .el-image {
        width: 100%;
        height: 100%;

        .image-slot {
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;

          .el-icon {
            font-size: 16px;
          }
        }
      }
    }
  }
}

.imglist {
  display: flex;
  justify-content: space-between;
  // align-items: flex-end;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 20px;

  .imgbox1 {
    width: 200px;
    //aspect-ratio: 1 / 0.4;
    min-width: 200px;
    height: 200px;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #eee;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .el-button {
      width: 100%;
      margin-top: 10px;
    }

    .img {
      flex: 1;
      overflow: hidden;

      .el-image {
        width: 100%;
        height: 100%;

        .image-slot {
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;

          .el-icon {
            font-size: 16px;
          }
        }
      }
    }
  }

  .imgbox1 {
    height: 200px;
    // width:20%;
  }
}

.specs-name {
  font-weight: 500;
  font-size: 14px;
  color: #333333;
  line-height: 30px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  padding: 0 15px;
  border-right: none;
  background-color: #f5f7fa;
}

.good-container {
  display: flex;
  align-items: flex-start;
  width: 100%;
  justify-content: space-between;
}

.good-detail-list {
  width: calc(100% - 260px);
}

.good-detail {
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;

  .detail-left {
    position: relative;

    .detail-img {
      width: 78px;
      height: 78px;
      border-radius: 10px;
      overflow: hidden;

      img {
        width: 78px;
        height: 78px;
      }
    }

    .travelcube {
      position: absolute;
      top: 0;
      right: 0;
      height: 16px;
      width: auto;
    }

    .ai-btn {
      margin-top: 12px;
      padding: 0 14px;
      height: 30px;
      line-height: 30px;
      background-color: #f1f4ff;
      font-weight: 400;
      font-size: 12px;
      border-radius: 4px;
    }
  }

  .detail-right {
    width: calc(100% - 78px - 13px);

    .detail-line {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
    }

    .specs-other {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 20px;
      background: #f7f8fa;
      border-radius: 6px;
      border: 1px solid #ececec;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
  }
}

.good-list {
  width: 240px;
  background-color: #fff;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 14px;
}

.list-item {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  padding: 10px;
  cursor: pointer;

  ::v-deep .el-checkbox {
    display: flex;
    align-items: flex-start;

    .el-checkbox__input {
      margin-top: 4px;
    }
  }
}

.specs-name {
  font-weight: 500;
  font-size: 14px;
  color: #333333;
  line-height: 30px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  padding: 0 15px;
  border-right: none;
  background-color: #f5f7fa;
}

.specs-item {
  margin-right: 20px;
  display: flex;
  align-items: center;
  position: relative;

  ::v-deep .el-input {
    width: 140px;
  }

  ::v-deep .el-input__inner {
    border-radius: 0;
    width: 140px;
  }

  ::v-deep .el-select {
    .el-input {
      width: 80px;

      .el-input__inner {
        width: 100%;
      }
    }
  }
}

.group-is-active {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>

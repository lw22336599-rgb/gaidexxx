<template>
  <div class="page-container">
    <div class="tool-name">同行店铺调研-京东到家</div>
    <div class="tool-time">
      <div class="time-left">
        <span class="time">到期时间：{{ endTime }}</span>
        <el-button :icon="Refresh" type="primary" @click="payFunShow">续费</el-button>
        <el-button :icon="Management" @click="openTutorials">使用教程</el-button>
      </div>
      <div class="time-right">
        <el-button :icon="toolState ? VideoPause : VideoPlay" type="primary" @click="changeToolState">
          {{ toolState ? '关闭调研' : '开启调研' }}
        </el-button>
        <el-button v-if="poiInfo.pic_url" :icon="Download" @click="exportExelData">数据导出</el-button>
      </div>
    </div>
    <div class="shopinformation">
      <h4>店铺基本信息</h4>
      <!-- <div class="shopcart">
        <div class="cartleft">
          <div class="carttext">
            <span>店铺名称：</span>
            <span>
              {{ poiInfo.name }}
            </span>
          </div>
          <div class="carttext">
            <span>营业时间：</span>
            {{ poiInfo.shipping_time }}
          </div>
        </div>
        <div>
          <div class="carttext">
            <span>店铺评分：</span>
            {{ poiInfo.wm_poi_score }}
          </div>
          <div class="carttext">
            <span>店铺公告：</span>
            {{ poiInfo.bulletin }}
          </div>
        </div>
      </div> -->
      <div class="imglist">
        <div style="width: fit-content; display: flex; flex-direction: column">
          <div class="imgbox imgbox1">
            <div class="img">
              <el-image
                v-if="poiInfo && poiInfo.pic_url"
                fit="cover"
                :initial-index="4"
                :max-scale="7"
                :min-scale="0.2"
                :preview-src-list="[poiInfo.pic_url]"
                show-progress
                :src="poiInfo.pic_url"
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
            v-if="poiInfo && poiInfo.pic_url"
            @click="downImg(poiInfo.pic_url)"
          >
            <el-button :icon="Download">下载店铺logo</el-button>
          </div> -->
          </div>
          <el-button
            style="margin: auto"
            :disabled="!(poiInfo && poiInfo.pic_url)"
            :icon="Download"
            @click="downImg(poiInfo.pic_url)"
            >下载店铺logo</el-button
          >
        </div>

        <div class="boxflexlist">
          <div class="shoptext">
            <div class="textbox">
              <div class="textboxtop">
                <div class="carttext" style="width: 500px">
                  <span>店铺名称：</span>
                  <span>
                    {{ poiInfo.name }}
                  </span>
                </div>
                <div class="carttext" style="width: 200px">
                  <span>月销：</span>
                  {{ poiInfo.serviceDesc }}
                </div>
                <div class="carttext">
                  <span>店铺评分：</span>
                  {{ poiInfo.wm_poi_score }}
                </div>
              </div>
              <div class="carttext">
                <span>店铺公告：</span>
                {{ poiInfo.bulletin }}
              </div>
              <!-- <div class="carttext">
                  <span>营业时间：</span>
                  {{ poiInfo.businessTime }}
                </div> -->
              <!--businessTime  -->
            </div>
          </div>
          <div style="width: fit-content; display: flex; flex-direction: column; width: 25%; min-width: 350px">
            <div class="imgbox">
              <div class="img">
                <el-image
                  v-if="poiInfo && poiInfo.head_pic_url"
                  fit="cover"
                  :initial-index="4"
                  :max-scale="7"
                  :min-scale="0.2"
                  :preview-src-list="[poiInfo.head_pic_url]"
                  show-progress
                  :src="poiInfo.head_pic_url"
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
                      v-if="poiInfo && poiInfo.head_pic_url"
                      @click="downImg(poiInfo.head_pic_url)"
                    >
                  </div> -->
            </div>
            <el-button
              style="margin: auto"
              :disabled="!(poiInfo && poiInfo.head_pic_url)"
              :icon="Download"
              @click="downImg(poiInfo.head_pic_url)"
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
                  <el-carousel-item v-for="item in operationSourceList" :key="item.pic_url">
                    <img alt="" :src="item.pic_url" style="width: 100%; height: 100%" />
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
              <el-table-column label="序号" width="80">
                <template #default="scope">
                  {{ scope.$index + 1 }}
                </template>
              </el-table-column>
              <el-table-column label="活动类型" align="center" width="300">
                <template #default="{ row }">
                  <!-- {{ getActiveType(row.type) }} -->
                  {{ row.limitRuleShow }}
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
      </div>
      <!-- <div>
        <el-button :disabled="!(poiInfo && poiInfo.pic_url)" :icon="Download"  @click="downImg(poiInfo.pic_url)">下载店铺logo</el-button>
        <el-button :disabled="!(poiInfo && poiInfo.head_pic_url)" :icon="Download" @click='downImg(poiInfo.head_pic_url)'>下载店铺招牌</el-button>
        <el-button :disabled='!(operationSourceList && operationSourceList.length > 0)' :icon="Download" @click="openChange">下载店铺海报</el-button>
      </div> -->
      <div>
        <!-- <h5>店铺活动列表</h5> -->
        <!-- <el-table :data="poiTags" :height="poiTags.length > 8 ? 300 : undefined" style="width: 100%">
          <el-table-column label="序号" width="180">
            <template #default="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="活动类型">
            <template #default="{ row }">
              {{ getActiveType(row.sub_tags[0].category_id) }}
            </template>
          </el-table-column>
          <el-table-column label="活动名称">
            <template #default="{ row }">
              {{ row.sub_tags[0].text }}
            </template>
          </el-table-column>
        </el-table> -->
        <h5>店铺商品列表</h5>
        <div class="good-container">
          <div class="good-list">
            <div
              v-for="(item, index) in foodSpuTags"
              :key="item.id"
              class="list-item"
              :class="{ 'group-is-active': currentGroupIndex === index }"
              @click="getGroupGoodList(item, index)"
            >
              <div style="width: 100%">
                <div style="color: #999999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  {{ item.name }}
                </div>
                <div style="font-weight: 400; font-size: 12px; color: #999999; margin-top: 4px">
                  商品（{{ item.dynamic_spus.length }}/{{ item.prodNum || 0 }}）
                </div>
              </div>
            </div>
          </div>
          <div class="good-detail-list">
            <div v-for="item in currentGoodList" :key="item.index" class="good-detail">
              <div class="detail-left">
                <div class="detail-img">
                  <img alt="" :src="item.picture" />
                </div>
                <div class="ai-btn">AI去水印</div>
                <div class="ai-btn">AI美化</div>
                <!-- <img v-if="item.render_info.img_area.tag_icon_url" alt="" class="travelcube" src="https://p0.meituan.net/travelcube/8be28067646744c6f878dfdbf1a714b316766.png"> -->
              </div>
              <div class="detail-right">
                <div class="detail-line" style="display: flex; align-items: center; justify-content: space-between">
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">名称</div>
                  <el-input v-model="item.prodName" disabled style="width: calc(100% - 110px)" />
                </div>
                <div class="detail-line">
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">描述</div>
                  <el-input v-model="item.description" disabled style="width: calc(100% - 110px)" />
                </div>
                <div class="detail-line">
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">最小购买数</div>
                  <el-input v-model="item.min_order_count" disabled style="width: 120px" />
                  <!-- <el-input v-model="item.skus[0].min_order_count" disabled style="width: 120px;"/> -->
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">月售</div>
                  <!-- <el-input v-model="item.render_info.sale_info.month_sales_description" disabled style="width: 120px;"/> -->
                  <el-input v-model="item.month_sales_description" disabled style="width: 120px" />
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">好评度</div>
                  <!-- <el-input v-model="item.render_info.sale_info.month_sales_description" disabled style="width: 120px;"/> -->
                  <el-input v-model="item.like_ratio_desc" disabled style="width: 120px" />
                </div>
                <div class="detail-line">
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">份量</div>
                  <el-input v-model="item.unit" disabled style="width: 120px" />
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">库存</div>
                  <el-input disabled style="width: 120px" :value="item.stock > 0 ? item.stock : '无限'" />
                  <div class="specs-name" style="width: 110px; padding: 0 10px 0 20px">折扣</div>
                  <el-input v-model="item.max_discount" disabled style="width: 120px" />
                </div>
                <div class="detail-line">
                  <div class="specs-name" style="width: 130px; padding: 0 10px 0 20px">是否单点不送</div>
                  <el-input v-model="item.forbid_single_buy" disabled style="width: 120px" />
                </div>
                <!-- <div v-for="(_item, _index) in item.attrs" :key="_index" class="detail-line specs-other">
                  <div class="specs-item" style="width: 100%;display: flex;align-items: flex-start">
                    <div class="specs-name specs-name-other" style="border: 1px solid #DCDFE6">{{ _item.name }}</div>
                    <div style="display: flex;flex-wrap: wrap;align-items: center;width: calc(100% - 90px);">
                      <div v-for="(__item, __index) in _item.values" :key="__index" class="litItemInput">
                        <el-input v-model="__item.value" class="lit-input" disabled/>
                      </div>
                    </div>
                  </div>
                </div> -->
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
          :key="item.pic_url"
          style="width: 210px; height: 140px; margin-right: 10px; display: flex; align-items: center; flex-wrap: wrap"
        >
          <img alt="" :src="item.pic_url" style="width: 100%; height: 80px" />
          <div @click="downImg(item.pic_url)"><el-button :icon="Download">下载海报</el-button></div>
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
          <el-button type="primary" @click="submitForm">立即导出</el-button>
        </span>
      </template>
    </el-dialog>
    <pay-dialog
      v-if="payDialogState"
      :pay-dialog-state="payDialogState"
      :pay-type-text="payTypeText"
      :shop-type="6"
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
import { uniqueId } from 'lodash-es'
import PayDialog from '/@/views/shop/componentsV2/PayDialogUser.vue'
defineOptions({
  name: 'IntegralMt'
})

const getGroupGoodList = (item: any, index: number) => {
  currentGroupIndex.value = index
  currentGoodList.value = foodSpuTags.value[index].dynamic_spus
}
const jdlist = ref([])
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
  console.log(url, 'url', url.split('@'))

  if (url) {
    if (url.indexOf('?') > -1) {
      url = url.split('?')[0]
    }
    if (url.indexOf('@') > -1) {
      url = url.split('@')[0]
    }

    globalThis.electron.downImage(url)
  } else {
    gp.$baseMessage('未获取到图片!', 'error', 'hey')
  }
}
const getActiveType = (row: any) => {
  let typeList = [
    '',
    '满减活动',
    '店内领卷',
    '减配送费',
    '折扣活动',
    '门店新客立减',
    '买赠活动',
    '收藏有礼',
    '集点返卷',
    '下单返卷',
    '超值换购'
  ]
  return row ? typeList[row] : ''
}

const toolState = ref(false)
const changeToolState = () => {
  if (endTime.value === '已到期') {
    return gp.$baseMessage('功能已到期，请续费后再使用!', 'error', 'hey')
  }
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
  console.log(jdlist.value, 'jdlist')
}
const onDataReceived = (res: any) => {
  // 链接如果是图片就不执行
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg']
  if (imageTypes.some(type => res.url.toLowerCase().includes(type))) {
    return
  }
  handleDetailUrl(res)
}
onMounted(() => {
  globalThis.electron.onReceiveInterceptedData(onDataReceived)
  handleGetDesktopPath()
})
onBeforeUnmount(() => {
  globalThis.electron.stopProxy()
})
const currentGroupIndex = ref(0)

const handleDetailUrl = (data: any) => {
  // 'bady
  // console.log(data.url,data,'data',JSON.parse(data.body));
  // https://api.m.jd.com/client.action
  if (data.url.includes('client.action')) {
    // console.log('获取店铺详情', JSON.parse(data.body))
    const shopDetails = JSON.parse(data.body)
    // console.log(shopDetails,'shopDetails');

    // jdlist.value.push(shopDetails)
    // jdlist.value.map(item=>{
    // // item.body.commonData.name
    //   poiInfo.name=item.body.commonData.name
    // })
    currentGroupIndex.value = 0
    setpoiInfo(shopDetails)
  }
  // else if (data.url.includes('poi/productlist?')) {
  //   // console.log('获取分类列表', data.body)
  //   const productList = JSON.parse(data.body)
  //   handleProductList(productList.data)
  // } else if (data.url.includes('poi/food/render?')) {
  //   // console.log('获取商品列表', data.body)
  //   const render = JSON.parse(data.body)
  //   handleClassificationFood(render.data)
  // }
}
const poiInfo = ref({})
const operationSourceList = ref([])
const poiTags = ref<any>([])
const operateData = ref<any>([])
const setpoiInfo = (data: any) => {
  //
  console.log(data, '2555')
  if (data.body && data.body.btnStr && data.body.btnStr.includes('起送')) {
    poiInfo.value.min_price_tip = data.body.btnStr
  }
  // freightInfo.bar.secondText thirdText
  if (data.body && data.body.freightInfo && data.body.freightInfo.bar) {
    poiInfo.value.shipping_fee_tip = data.body.freightInfo.bar.secondText || data.body.freightInfo.bar.thirdText
  }
  if (data.body && data.body.floorsList && data.body.floorsList.length) {
    // console.log(data.body.floorsList,"data.body.floorsList");

    // foodSpuTags {id,dynamic_spus,name,all_sorted_spu_ids}
    data.body.floorsList.map(item => {
      // 门店信息
      if (item.floorTemplateID == 'StoreInfoFloor') {
        poiInfo.value.name = item.data.name
        poiInfo.value.businessTime = item.data.businessTime
        // slogan
        poiInfo.value.bulletin = item.data.slogan
      }
      // 商品分类
      if (item.floorTemplateID == 'CommodityFloor') {
        // tag
        //    if(data.body&&data.body.commonData&&data.body.commonData.venderId){
        //     item.data?.categoryList.map((item,index)=>{
        //    if(item.venderId)
        //  })

        foodSpuTags.value = item.data?.categoryList.map((tagitem, index) => {
          // console.log(tagitem,"tagitem1111");

          console.log(tagitem.venderId, data.body.commonData.venderId, 'tagitem.venderId', currentGroupIndex.value)

          return { id: tagitem.cateId, name: tagitem.cateName, dynamic_spus: [] }
        })
      }
      // 门头Bff楼层
      if (item.floorTemplateID == 'StoreInfoBffFloor') {
        //
        item.data.bffData.contents.map(pfitem => {
          if (pfitem.properties?.key && pfitem.properties?.key == 'storeScore') {
            poiInfo.value.wm_poi_score = pfitem.properties.subText
          }
          if (pfitem.properties?.key && pfitem.properties?.key == 'monthlySale') {
            poiInfo.value.serviceDesc = pfitem.properties.subText
          }
          if (pfitem.properties?.key && pfitem.properties?.key == 'logo') {
            poiInfo.value.pic_url = 'https://m.360buyimg.com/babel/' + pfitem.properties.imgUrl
          }
        })
      }
      // 优惠活动
      if (item.floorTemplateID == 'CouponBenefitFloor') {
        poiTags.value = item.data?.couponPromoInfo?.coupon.coupons.map(item => {
          return {
            type: item.couponType,
            limitRuleShow: item.limitRuleShow,
            text: item.couponType == 1 ? `满${item.quota}减${item.discount}` : item.discount + '元'
          }
        })
      }
    })
  }
  // console.log(poiInfo.value,foodSpuTags.value);

  if (data.body && data.body.prodList && data.body.prodList.length) {
    // console.log(data.body,"data.body");

    // prodNum
    foodSpuTags.value = foodSpuTags.value.map(item => {
      if (item.id == data.body.cid1) {
        let list = data.body.prodList.map(item => {
          item.picture = 'https://m.360buyimg.com/babel/' + item.imageUrl
          return item
        })

        // productId:"10028183120395"
        // let addlist=[]
        if (item.dynamic_spus.length) {
          // list.map(listitem=>{
          //   let obj=item.dynamic_spus.find(dyitem=>dyitem.productId==listitem.productId)
          // })
          item.dynamic_spus.map(dyitem => {
            list = list.filter(listitem => listitem.productId != dyitem.productId)
          })
          if (list.length) {
            item.dynamic_spus.push(...list)
          }
        } else {
          item.dynamic_spus.push(...list)
        }
        // forbid_single_buy
        item.dynamic_spus = item.dynamic_spus.map(dyitem => {
          if (dyitem.prodCard.tagInfo.prodCardInfos && dyitem.prodCard.tagInfo.prodCardInfos.length) {
            dyitem.forbid_single_buy = '否'
          } else {
            dyitem.forbid_single_buy = '是'
          }
          if (dyitem.prodCard.promotionInfo.prodCardInfos && dyitem.prodCard.promotionInfo.prodCardInfos.length) {
            // item.max_discount=1
            let discoun = dyitem.prodCard.promotionInfo.prodCardInfos.filter(promo => promo.type == 'discount')
            if (discoun.length) {
              dyitem.max_discount = discoun[0].text
            } else {
              dyitem.max_discount = ''
            }
          } else {
            dyitem.max_discount = ''
          }
          if (dyitem.prodCard.confidenceInfo.prodCardInfos && dyitem.prodCard.confidenceInfo.prodCardInfos.length) {
            let favorableRate = dyitem.prodCard.confidenceInfo.prodCardInfos.filter(
              promo => promo.type == 'favorableRate'
            )

            if (favorableRate.length) {
              dyitem.like_ratio_desc = favorableRate[0].text
            } else {
              dyitem.like_ratio_desc = ''
            }
          } else {
            dyitem.like_ratio_desc = ''
          }
          dyitem.origin_price = dyitem.originalPrice
          dyitem.min_price = dyitem.jgLinePrice
          dyitem.name = dyitem.prodName
          // min_price
          // origin_price
          // originalPrice
          return dyitem
          // confidenceInfo
        })
        item.prodNum = data.body.prodNum
      }
      return item
    })
    console.log(foodSpuTags.value, 'foodSpuTags.value')
    handleExcelData()
    let activeStr = ''
    poiTags.value.forEach(item => {
      activeStr += item.text + ';'
    })
    operateData.value = [
      poiInfo.value.name,
      poiInfo.value.shipping_fee_tip,
      poiInfo.value.min_price_tip,
      activeStr.slice(0, -1),
      poiInfo.value.wm_poi_score
    ]
    // foodSpuTags.value.map((item,index)=>{
    //   if(item.)
    // })
    // currentGroupIndex.value;
    currentGoodList.value = foodSpuTags.value[currentGroupIndex.value].dynamic_spus
  }
}
const handleFoodDetail = (data: any) => {
  console.log(data, '11111')
  poiInfo.value = data.poi_info || data.poi_base_info
  if (data.container_operation_source && data.container_operation_source.operation_source_list) {
    operationSourceList.value = data.container_operation_source.operation_source_list
  }
  if (poiInfo.value && poiInfo.value.poi_tags && poiInfo.value.poi_tags.length > 0) {
    poiTags.value = poiInfo.value.poi_tags || []
  } else {
    poiTags.value = []
  }

  let activeStr = ''
  if (poiInfo.value.poi_tags && poiInfo.value.poi_tags.length > 0) {
    poiInfo.value.poi_tags.forEach((item: any) => {
      if (item.sub_tags && item.sub_tags[0] && item.sub_tags[0].text) {
        activeStr += `${item.sub_tags[0].text};`
      }
    })
  }
  operateData.value = [
    poiInfo.value.name,
    poiInfo.value.shipping_fee_tip,
    poiInfo.value.min_price_tip,
    activeStr.slice(0, -1),
    poiInfo.value.wm_poi_score
  ]
}
const foodSpuTags = ref<any>([])
const specifications = ref<any>([])
const currentGoodList = ref<any>([])
const tableDataList = ref<any>([])
const attrs = ref([])
const handleProductList = (data: any) => {
  console.log(data, 'data')
  tableDataList.value = []
  foodSpuTags.value = data.food_spu_tags
  foodSpuTags.value.forEach((item: any) => {
    tableDataList.value.push(...item.dynamic_spus)
  })
  if (
    foodSpuTags.value &&
    foodSpuTags.value.length > 0 &&
    foodSpuTags.value[currentGroupIndex.value] &&
    foodSpuTags.value[currentGroupIndex.value].dynamic_spus
  ) {
    currentGoodList.value = foodSpuTags.value[currentGroupIndex.value].dynamic_spus
  }
  attrs.value = foodSpuTags.value[currentGroupIndex.value].attrs
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
    if (item.dynamic_spus && item.dynamic_spus.length > 0) {
      item.dynamic_spus.forEach((_item: any) => {
        _item.group_name = item.name
      })
      list.value.push(...item.dynamic_spus)
    }
  })
  console.log(list, '表格数据处理')

  list.value = list.value.filter((item: any) => item.group_name !== '折扣' && item.group_name !== '推荐')

  list.value.forEach((item: any, index: number) => {
    let attribute = ''
    if (item.attrs && item.attrs.length > 0) {
      item.attrs.forEach((_item: any) => {
        if (_item.values && _item.values.length > 0) {
          _item.values.forEach((__item: any) => {
            attribute += `${__item.value}#`
          })
        }
      })
    }
    dataArr.value.push({
      id: index + 1,
      name: item.group_name || '',
      product_name: item.prodName || '',
      month_sales_description: item.sales || '',
      unit: item.unit || '',
      min_price: item?.origin_price || '',
      max_discount: item.max_discount || '',
      origin_price: item?.origin_price || '',
      stock: item.stock || '',
      today_stock: item.stock || '',
      meal_num: 1,
      meal_price: 1,
      format: item.unit || '',
      min_order_count: item.min_order_count || '1',
      description: item.description || '',
      active_price: item?.min_price || '', // 运营特有
      pack_price: 1, // 运营特有
      like_ratio_desc: item.like_ratio_desc || '', // 运营特有
      attribute: attribute.slice(0, -1)
    })
    if (item.picture) {
      let price = handleSizeImg(item.picture)
      imgList.value.push({
        picture: price,
        name: item.name
      })
    } else {
      imgList.value.push({
        picture: 'http://file.waimaitong.com/admin_image/user_614538240520197/white-bg.jpg',
        name: item.name
      })
    }
    console.log(imgList.value, 'imgList')
  })
  exportName.value = poiInfo.value.name
}
const handleSizeImg = (filename: any) => {
  if (!filename) {
    return
  }
  // 首先移除最后一个 '?' 及其后面的内容（如果存在）
  let cleaned = filename
  const lastQuestionIndex = filename.lastIndexOf('?')
  if (lastQuestionIndex !== -1) {
    cleaned = filename.substring(0, lastQuestionIndex)
  }
  // 然后移除最后一个 '@' 及其后面的内容（如果存在）
  const lastAtIndex = cleaned.lastIndexOf('@')
  if (lastAtIndex !== -1) {
    cleaned = cleaned.substring(0, lastAtIndex)
  }
  return cleaned
}
const handleClassificationFood = (data: any) => {
  const foodTagMap = new Map(foodSpuTags.value.map((item: any) => [item.tag, item]))
  data.food_spu_tags.forEach((_item: any) => {
    const existingItem = foodTagMap.get(_item.tag)
    if (existingItem) {
      existingItem.dynamic_spus.push(..._item.dynamic_spus)
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
  getMyFunctionsV2({ shopType: 6 }).then((res: any) => {
    if (res.code === 200) {
      funcList.value = res.data
      funcList.value.forEach((item: any) => {
        if (item.function_code === 'CONTENDANALYSE' && item.Function.shop_type === 6) {
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
let ruleForm = reactive({
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
  ruleForm = {
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
    console.log(path, 'desktopPath.value')
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
    // 第二步：创建文件夹
    const subfolderName = poiInfo.value.name
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
        const resultCreateExcel = await globalThis.electron.createAndSaveExcel(
          excelFilePath,
          header,
          dataArrCopy,
          columnWidths
        )
      } else if (exportType1.value === '数据分析表格') {
        const header1 = ['商家运营概况']
        const headerRow1 = ['门店名称', '平均配送费', '起送价', '商家活动', '门店评分']
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
      }
    }

    const pathMontage1 = await globalThis.electron.pathMontage([baseFolderPath, subfolderName])

    // 第四步：下载图片
    await downloadImageFile(poiInfo.value.pic_url, pathMontage1, '店铺LOGO')
    await downloadImageFile(poiInfo.value.head_pic_url, pathMontage1, '店铺招牌')
    if (operationSourceList.value && operationSourceList.value.length > 0) {
      operationSourceList.value.forEach((item: any, index: number) => {
        downloadImageFile(item.pic_url, pathMontage1, `海报_${index}`)
      })
    }

    // 可以继续在此文件夹中创建更多的子文件夹和文件
    const deeperSubfolderName = '商品主图'
    const pathMontage2 = await globalThis.electron.pathMontage([baseFolderPath, subfolderName, deeperSubfolderName])
    await globalThis.electron.createFolder(pathMontage1, deeperSubfolderName)
    imgList.value.forEach((item: any, index: number) => {
      let num: string = index + 1 + ''
      downloadImageFile(item.picture, pathMontage2, nameType1.value === '商品名称命名' ? item.name : num)
    })

    setTimeout(() => {
      gp.$baseMessage(`导出成功！`, 'success', 'hey')
    }, 1000)
    console.log('Files and images exported successfully!')
  } catch (error) {
    console.log(error)
    gp.$baseMessage(`导出失败：${error}`, 'error', 'hey')
  }
}
const downloadImageFile = async (url: string, path: string, name: string) => {
  let imgUrl = handleSizeImg(url)
  let nameStr = ''
  if (ruleForm.nameType === '商品名称命名') {
    nameStr = name.replaceAll(/[\/|:*"<>]/g, '')
  } else {
    nameStr = name
  }
  if (imgUrl) {
    let suffix = ''
    const cleanUrl = imgUrl.split('?')[0].split('#')[0]
    const regex = /\.(png|gif|jpe?g)$/i // i表示不区分大小写
    const match = cleanUrl.match(regex)
    if (match) {
      suffix = `.${match[1].toLowerCase()}`
    } else {
      suffix = '.jpg'
    }
    // const resultDownloadImage = await globalThis.electron.downloadImageFile(`${imgUrl}@watermark=1&&object=L3dtcHJvZHVjdC9kZWJiN2M1ZTgyZjJiNjU4Y2ZmNzA1ZTg1N2FjOTcwYjgxLnBuZw==`, path, nameStr + suffix);
    const resultDownloadImage = await globalThis.electron.downloadImageFile(`${imgUrl}`, path, nameStr + suffix)
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

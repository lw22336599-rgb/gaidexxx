<template>
  <div class="homecont">
    <div class="felxdis">
      <div v-for="(item, index) in getAvailableTools" :key="item.toolId"
        style="width: calc((100% - 30px) / 3);background: var(--el-background-color);height: 210px;margin-bottom: 20px;margin-right: 15px;min-width: 400px;">
        <div class="tipslist">
          <img alt="" :src="item.img" style="width:50px;height:50px;margin-right: 10px" />
          <div class="conten">
            <div class="contentit">{{ item.name }}</div>
            <div class="tips-main" style="margin-bottom:10px">{{ item.text }}</div>
            <!-- <div v-if="index !== 2"><span class="supspan">{{ shopType == 2 ? item.elejifen : item.jifen
            }}积分</span>/30天一家店
            </div> -->
            <!-- <div v-if="index === 2" style="display: flex; align-items: center;justify-content: space-between">
              <span><span class="supspan">{{ item.jifen }}积分</span>/一个月</span>
            </div> -->
          </div>
          <div class="buton">
            <el-button class="item-btn" type="primary" @click="toUse(item)">去使用</el-button>
            <el-button class="item-btn" @click="openTutorials(item)">教程</el-button>
          </div>
        </div>
        <div class="imgflex" v-if="item.showSiteIcon && item.fromShopTypes && item.fromShopTypes.length > 0">
          <div class="shop-icon-container" v-if="item.showSiteIcon">
            <!-- 源平台图标 -->
            <template v-for="fromType in getFromShopTypes(item)" :key="fromType">
              <img v-if="fromType === ShopType.美团" class="shop-icon" src="../../../icon/mt.svg" alt="">
              <img v-if="fromType === ShopType.饿了么 || fromType === ShopType.饿了么官方" class="shop-icon"
                src="../../../icon/tbsg_wm.svg" alt="">
              <img v-if="fromType === ShopType.美团闪购" class="shop-icon" src="../../../icon/mt-shop.svg" alt="">
              <img v-if="fromType === ShopType.美团医药" class="shop-icon" src="../../../icon/mt-medicine.svg" alt="">
              <img v-if="fromType === ShopType.饿百零售" class="shop-icon" src="../../../icon/tbsg_ls.svg" alt="">
              <img v-if="fromType === ShopType.京东到家" class="shop-icon" src="../../../icon/jd-home.svg" alt="">
              <img v-if="fromType === ShopType.抖店即时零售" class="shop-icon" src="../../../icon/dy-retail.svg" alt="">
            </template>
            <!-- 箭头图标 -->
            <img style="width: 80px;height: 30px;margin-right: 20px;" src="../../../icon/jt.GIF.gif" alt="">
            <!-- 目标平台图标 -->
            <img v-if="shopType === ShopType.美团" class="shop-icon" src="../../../icon/mt.svg" alt="">
            <img v-if="shopType === ShopType.饿了么 || shopType === ShopType.饿了么官方" class="shop-icon"
              src="../../../icon/tbsg_wm.svg" alt="">
            <img v-if="shopType === ShopType.美团闪购" class="shop-icon" src="../../../icon/mt-shop.svg" alt="">
            <img v-if="shopType === ShopType.美团医药" class="shop-icon" src="../../../icon/mt-medicine.svg" alt="">
            <img v-if="shopType === ShopType.饿百零售" class="shop-icon" src="../../../icon/tbsg_ls.svg" alt="">
            <img v-if="shopType === ShopType.京东到家" class="shop-icon" src="../../../icon/jd-home.svg" alt="">
            <img v-if="shopType === ShopType.抖店即时零售" class="shop-icon" src="../../../icon/dy-retail.svg" alt="">
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="tutorialsDialogState" :close-on-click-modal="false" :destroy-on-close="true"
      :title="dialogTitle" width="1200px" @close="closeTutorialsDialog" class="tutorial-dialog">
      <div style="padding-bottom: 20px; height: 600px;">
        <!-- 如果是网页链接，使用 iframe -->
        <iframe v-if="isWebUrl" :src="currentTutorialUrl" style="width: 100%; height: 100%; border: 0;"
          allowfullscreen></iframe>
        <!-- 如果是视频文件，使用播放器 -->
        <div v-else class="player-container">
          <vab-player :config="configMp4" style="background-color: rgba(0, 0, 0, 0.87)" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { ShopType, ToolType } from '/@/types/shop'
import type { ToolItemDto } from '/@/TsModel/Alien/Entity/Function/Tool/ToolItemDto'

export interface ToolItemView {
  toolId: string
  name: string
  text: string
  points: number
  img: string
  showSiteIcon: boolean
  functionCodes: string[]
  fromShopTypes: ShopType[]
  tutorialUrl: string
  toolType: ToolType
  sort: number
  avtag: boolean
}

// 跨组件实例共享的工具缓存，避免组件重建时重复请求
export const toolCache = new Map<ShopType, ToolItemView[]>()
export const toolRequestCache = new Map<ShopType, Promise<void>>()
</script>

<script setup lang="ts">
import { ref, watch, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { uniqueId } from 'lodash-es'
import { apiManager } from '/@/TsModel/Api/ApiManager'
import { ToolApi } from '/@/TsModel/Api/Alien/Controllers/Function/ToolApi'

const emit = defineEmits<{
  (e: 'useTool', payload: ToolItemView & { type: ToolType; id: string; toUse: boolean }): void
}>()
const tutorialsDialogState = ref(false)
const currentTutorials = ref('')
const currentTutorialUrl = ref('')
const isWebUrl = ref(false)
const dialogTitle = ref('')
const shopType = ref<ShopType>(ShopType.美团) // 默认美团
const axiosInstance = apiManager.getAxiosInstance()
const baseUrl = axiosInstance.defaults.baseURL || ''
const toolApi = new ToolApi(axiosInstance, baseUrl)

const route = useRoute()

const toolList = ref<ToolItemView[]>([])

const assetUrlMap = import.meta.glob('../../../assets/**/*', { eager: true, as: 'url' })

const resolveImgPath = (path: string) => {
  if (!path) return ''
  const trimmed = path.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const key = trimmed.replace(/^\/@\/assets\//, '')
  const mapKey = `../../../assets/${key}`
  const mapped = (assetUrlMap as Record<string, string | undefined>)[mapKey]
  return mapped || trimmed
}

const configMp4 = reactive({
  url: '',
  id: uniqueId('uuid_mp4_'),
  lang: 'zh',
  volume: 0,
  autoplay: true,
  screenShot: true,
  playbackRate: [0.5, 0.75, 1, 1.5, 2],
  fluid: true,
  fullscreen: true, // 启用全屏功能
  fullscreenWeb: true, // 启用网页全屏
})

// 后端功能码与前端工具类型映射
const functionCodeMap: Record<ToolType, string> = {
  [ToolType.CopyOldShop]: 'FOODMOVE',       // 复制老店/竞对核心搬运
  [ToolType.CompareCopyShop]: 'FDMVCONTEND',    // 竞对数据拉取（假定为竞对复制功能码）
  [ToolType.BatchPrice]: 'FOODMANAGE',      // 商品批量管理
  [ToolType.UpdateFoodImg]: 'UPDATEFOODIMAGE', // 批量图片处理
}

/**
 * 将接口返回的功能代码转换为前端使用的工具类型
 */
const resolveToolType = (functionCodes: string[]): ToolType => {
  const normalized = functionCodes.map(code => code.toUpperCase())
  const entries = Object.entries(functionCodeMap)
  const found = entries.find(([, backendCode]) => normalized.includes(backendCode))
  if (!found) {
    throw new Error('未识别的工具功能代码，请检查后端配置')
  }
  return found[0] as ToolType
}

/**
 * 将后端的工具数据映射为前端展示所需的结构
 */
const mapToolItem = (item: ToolItemDto): ToolItemView => ({
  toolId: item.Id,
  name: item.Name,
  text: item.Text,
  points: item.Points,
  img: resolveImgPath(item.Img),
  showSiteIcon: item.ShowSiteIcon,
  functionCodes: item.FunctionCodes,
  fromShopTypes: item.FromShopTypes,
  tutorialUrl: item.TutorialUrl,
  toolType: resolveToolType(item.FunctionCodes),
  sort: item.Sort,
  avtag: item.Avtag
})

/**
 * 拉取指定店铺类型下可用的工具列表
 */
const fetchToolList = async (type: ShopType) => {
  // 已经拉取过的店铺类型直接用缓存结果，避免重复调用接口
  if (toolCache.has(type)) {
    toolList.value = [...toolCache.get(type)!]
    return
  }

  // 如果已有同类型的请求正在进行，复用该请求避免并发重复
  const existingRequest = toolRequestCache.get(type)
  if (existingRequest) {
    await existingRequest
    toolList.value = [...(toolCache.get(type) || [])]
    return
  }

  const request = (async () => {
    const items = await toolApi.GetList(type)
    const mapped = items.map(mapToolItem).sort((a, b) => a.sort - b.sort)
    toolCache.set(type, mapped)
    toolList.value = [...mapped]
  })()

  toolRequestCache.set(type, request)
  await request
}

/**
 * 判断链接是否为网页链接（非视频文件）
 */
const isWebLink = (url: string): boolean => {
  if (!url) return false
  const lowerUrl = url.toLowerCase().trim()
  // 视频文件扩展名
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.m3u8', '.flv']
  // 如果是 http/https 链接，检查是否是视频文件
  if (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')) {
    // 检查是否包含视频文件扩展名
    const hasVideoExtension = videoExtensions.some(ext => lowerUrl.includes(ext))
    // 如果包含视频扩展名，认为是视频文件
    if (hasVideoExtension) {
      return false
    }
    // 否则认为是网页链接
    return true
  }
  // 其他情况默认不是网页链接
  return false
}

/**
 * 获取店铺类型名称
 */
const getShopTypeName = (type: ShopType): string => {
  const typeMap: Record<ShopType, string> = {
    [ShopType.美团]: '美团外卖',
    [ShopType.饿了么]: '饿了么',
    [ShopType.美团闪购]: '美团闪购',
    [ShopType.美团医药]: '美团医药',
    [ShopType.饿百零售]: '饿百零售',
    [ShopType.京东到家]: '京东到家',
    [ShopType.抖店即时零售]: '抖音即时零售',
    [ShopType.饿了么官方]: '饿了么官方',
    [ShopType.None]: ''
  }
  return typeMap[type] || ''
}

const toUse = (item: ToolItemView) => {
  emit('useTool', { ...item, type: item.toolType, id: item.toolType, toUse: true })
}

const openTutorials = (item: ToolItemView) => {
  currentTutorials.value = item.name
  currentTutorialUrl.value = item.tutorialUrl
  isWebUrl.value = isWebLink(item.tutorialUrl)

  // 设置对话框标题：店铺类型 - 功能名称
  const shopTypeName = getShopTypeName(shopType.value)
  dialogTitle.value = `${shopTypeName} - ${item.name}`

  if (!isWebUrl.value) {
    // 视频文件，设置播放器配置
    // 更新播放器ID，确保每次打开都是新的实例，避免全屏功能失效
    configMp4.id = uniqueId('uuid_mp4_')
    configMp4.url = item.tutorialUrl
  }

  tutorialsDialogState.value = true
}

const closeTutorialsDialog = () => {
  configMp4.url = ''
  currentTutorialUrl.value = ''
  isWebUrl.value = false
  tutorialsDialogState.value = false
}

// 获取当前店铺类型可用的工具列表
const getAvailableTools = computed(() => {
  return toolList.value
})

// 监听路由变化
watch(
  () => route.meta.type,
  (newType) => {
    // 只有在店铺复制相关页面时才执行
    const validRouteNames = [
      'MtShopCopy',
      'ElmShopCopy',
      'ElmShopCopyNew',
      'JdDistributionShopCopy',
      'MtPurchaseShopCopy',
      'MtMedicineShopCopy',
      'ElmRetailShopCopy',
      'DyRetailShopCopy'
    ]

    if (!validRouteNames.includes(route.name as string)) {
      return
    }

    if (newType !== undefined && newType !== shopType.value) {
      shopType.value = newType as ShopType
    }
  },
  { immediate: true }
)

// 监听店铺类型变化
watch(
  shopType,
  (newType) => {
    fetchToolList(newType)
  },
  { immediate: true }
)

const getFromShopTypes = (item: ToolItemView) => {
  return item.fromShopTypes.filter(type => type !== shopType.value)
}
</script>

<style scoped lang="scss">
.felxdis {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.imgflex {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px 20px;
  box-sizing: border-box;
}

.tipslist {
  background: var(--el-background-color);
  height: 160px;
  // margin-bottom: 20px;
  // margin-right: 15px;
  width: 100%;
  // background-image: url("../image/tixiao/backimg.png");
  display: flex;
  padding: 20px;
  padding-bottom: 10px;
  box-sizing: border-box;
  position: relative;
  border-radius: 10px;
  overflow: hidden;

  .postion {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }

  .conten {
    flex: 1;
    font-size: 12px;
    color: #999999;
    width: 100%;
    box-sizing: border-box;
    padding-right: 20px;
    overflow: hidden;

    .contentit {
      font-weight: 500;
      font-size: 16px;
      color: #333333;
      margin-bottom: 10px;
      width: 100%;
      overflow: hidden;
      display: -webkit-box;
      /* 将对象作为弹性伸缩盒子模型显示 */
      -webkit-line-clamp: 2;
      /* 行数，值可以改，表示展示X行后多余的缩略展示 */
      -webkit-box-orient: vertical;
      /* 设置或检索伸缩盒对象的子元素的排列方式 */
      word-break: break-all;
      height: 36px;
    }

    .supspan {
      font-size: 14px;
      color: #C08C8C;
    }
  }

  .buton {
    width: 90px;
  }

  .addmdbut {
    width: 90px;
    height: 34px;
    // line-height: 30px;
    background: #2CCA87;
    color: #fff;
    border-radius: 6px;
    border: none;
    font-size: 14px;
    line-height: 34px;
    margin-right: 10px;
    text-align: center;
  }

  .addmdbut1 {
    border-radius: 6px;
    border: 1px solid #2CCA87;
    margin-right: 10px;
    width: 90px;
    height: 34px;
    // line-height: 30px;
    background: #fff;
    color: #2CCA87;
    border-radius: 6px;
    font-size: 14px;
    line-height: 32px;
    margin-right: 10px;
    text-align: center;
    margin-top: 10px;
  }
}

.item-btn {
  width: 80px;
  margin-left: 0;
  margin-bottom: 10px;
}

/* 当视口宽度小于等于600px时应用 */
@media (max-width: 1800px) {
  .homecont {
    .tipslist {
      // width: calc((100% - 15px) / 2)!important;
      width: 100% !important;
    }

    .tipslist:nth-child(3n) {
      margin-right: 15px !important;
    }

    .tipslist:nth-child(2n) {
      margin-right: 0 !important;
    }
  }
}

@media (max-width: 1500px) {
  .homecont {
    .tipslist {
      width: 100% !important;
    }

    .tipslist:nth-child(3n) {
      margin-right: 15px !important;
    }

    .tipslist:nth-child(2n) {
      margin-right: 15px !important;
    }
  }
}

.shop-icon {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.shop-icon-container {
  display: flex;
  align-items: center;
}

.arrow-icon {
  width: 20px;
  height: 20px;
  margin-left: 10px;
}

// 教程对话框样式，确保全屏功能可用
:deep(.tutorial-dialog) {
  .el-dialog__body {
    padding: 20px;
  }

  .player-container {
    width: 100%;
    height: 100%;
    position: relative;

    // 确保播放器全屏时的 z-index 足够高
    :deep(.xgplayer) {
      z-index: auto;

      &.xgplayer-is-fullscreen {
        z-index: 9999 !important;
      }
    }
  }
}
</style>
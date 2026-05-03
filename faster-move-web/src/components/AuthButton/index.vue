<template>
  <el-dropdown split-button :type="buttonType" :size="size" :disabled="disabled" @click="handleAddShop"
    @command="handleCommand" trigger="hover" class="auth-button">
    {{ buttonText }}
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="manual" v-if="isElectron">
          <el-icon style="margin-right: 4px">
            <Key />
          </el-icon>
          手动授权
        </el-dropdown-item>
        <el-dropdown-item command="bind">
          <el-icon style="margin-right: 4px">
            <Connection />
          </el-icon>
          绑定门店
        </el-dropdown-item>
        <el-dropdown-item command="generate">
          <el-icon style="margin-right: 4px">
            <Link />
          </el-icon>
          生成授权链接
        </el-dropdown-item>
        <el-dropdown-item command="cookies">
          <el-icon style="margin-right: 4px">
            <Document />
          </el-icon>
          填入Cookies添加
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <AddByCookiesDialog v-model="showCookiesDialog" :shop-type="props.shopType"
    @shop-added="(data) => emit('shop-added', data)" @refresh="emit('refresh')" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import { addShop } from '/@/api/shop'
import { gp } from '/@vab/plugins/vab'
import { apiManager } from '@/TsModel/Api/ApiManager'
import { Key, Link, Document, Connection } from '@element-plus/icons-vue'
import AddByCookiesDialog from './AddByCookiesDialog.vue'

interface Props {
  shopType?: ShopType  // 店铺类型，可选，不传则使用当前店铺类型
  buttonText?: string  // 按钮文本，默认"添加门店"
  buttonType?: any     // 按钮类型，默认"primary"
  size?: string        // 按钮大小
  disabled?: boolean   // 是否禁用
  name?: string        // 店铺名称（用于修复店铺场景）
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: '添加门店',
  buttonType: 'primary',
  size: 'default',
  disabled: false,
  name: ''
})

// 定义事件
const emit = defineEmits<{
  success: []  // 授权成功事件
  refresh: []  // 刷新列表事件
  'shop-added': [data: any]  // 店铺添加成功事件，传递店铺数据
  bind: []  // 绑定门店
}>()

// 检测是否在Electron环境
const isElectron = computed(() => {
  return !!(globalThis as any).electron
})

const showCookiesDialog = ref(false)

/**
 * 添加门店（主按钮点击）
 */
const handleAddShop = async () => {
  await openApp(props.name, props.shopType)
}

/**
 * 下拉菜单命令处理
 */
const handleCommand = (command: string) => {
  if (command === 'manual') {
    openManualAuthWindow(props.shopType)
  } else if (command === 'bind') {
    emit('bind')
  } else if (command === 'generate') {
    generateAuthLink()
  } else if (command === 'cookies') {
    showCookiesDialog.value = true
  }
}

/**
 * 添加门店逻辑（复用现有代码）
 */
const openApp = async (name: any, shopType?: ShopType) => {
  // 如果没有传入shopType，尝试从localStorage获取当前店铺类型
  let targetShopType = shopType
  if (targetShopType === undefined) {
    const currentShopTypeStr = localStorage.getItem('currentShopType')
    targetShopType = currentShopTypeStr ? parseInt(currentShopTypeStr) : ShopType.美团
  }

  // 饿了么官方（shopType=8）从后端获取授权地址
  if (targetShopType === ShopType.饿了么官方) {
    try {
      const authResult = await apiManager.shopmgApi.GetOfficeAuth(ShopType.饿了么官方)
      window.open(authResult.Url, '_blank')
      gp.$baseMessage('请在新窗口中完成授权', 'info', 'hey')
      return
    } catch (error: any) {
      gp.$baseMessage('获取授权地址失败: ' + error.message, 'error', 'hey')
      return
    }
  }

  // 非Electron环境检查
  if (!isElectron.value) {
    gp.$baseMessage('当前环境不支持浏览操作', 'error', 'hey')
    return
  }

  const invokeMap: Record<number, string> = {
    1: 'open-mt-wm',      // 美团外卖
    2: 'open-elm-wm',     // 饿了么
    3: 'open-mt-wm',      // 美团闪购
    4: 'open-mt-wm',      // 美团医药
    5: 'open-elm-retail', // 饿百零售
    6: 'open-jd-home',    // 京东到家
    7: 'open-dy-retail',  // 抖店即时零售
    8: 'open-elm-wm',     // 饿了么官方
    1000: 'open-mt-groupbuy',   // 美团团购
    1001: 'open-jd-home', // 京东团购
    1002: 'open-dy-tuangou-capture', // 抖音团购
  }

  const userInfoStr = localStorage.getItem('userInfo')
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {}
  const userId = userInfo.admin?.id || ''

  const params = {
    name: name || '',
    shop_type: targetShopType,
    userId
  }

  const electron = (globalThis as any).electron
  electron.openBrowser(invokeMap[targetShopType as number], params, async (res: any) => {
    const data = {
      shop_type: params.shop_type,
      shop_user: '',
      shop_pwd: '',
      cookies: res.cookies
    }

    try {
      const res1: any = await addShop(data)
      if (res1.code === 200) {
        if (params.name) {
          gp.$baseMessage('店铺修复成功!', 'success', 'hey')
        } else {
          gp.$baseMessage('店铺添加成功!', 'success', 'hey')
          // 触发店铺添加成功事件，传递店铺数据用于显示弹窗
          emit('shop-added', {
            name: res1.data.name,
            office_id: res1.data.office_id,
            shop_type: params.shop_type,
            shop_user: '',
            shop_pwd: '',
            cookies: res.cookies,
            reset_power: false
          })
        }
        // 触发成功和刷新事件
        emit('success')
        emit('refresh')
      } else {
        gp.$baseMessage(res1.msg || '添加店铺失败', 'error', 'hey')
      }
    } catch (error: any) {
      gp.$baseMessage('添加店铺异常: ' + error.message, 'error', 'hey')
    }
  })
}

/**
 * 手动授权逻辑（复用现有代码）
 */
const openManualAuthWindow = async (shopType?: ShopType) => {
  const electron = (globalThis as any).electron
  if (!electron || !electron.openAuthWindow) {
    gp.$baseMessage('当前环境不支持手动授权操作', 'error', 'hey')
    return
  }

  // 如果没有传入shopType，尝试从localStorage获取当前店铺类型
  let targetShopType = shopType
  if (targetShopType === undefined) {
    const currentShopTypeStr = localStorage.getItem('currentShopType')
    targetShopType = currentShopTypeStr ? parseInt(currentShopTypeStr) : ShopType.美团
  }

  const platformNames: Record<number, string> = {
    1: '美团外卖',
    2: '饿了么',
    3: '美团闪购',
    4: '美团医药',
    5: '饿百零售',
    6: '京东到家',
    7: '抖店即时零售',
    8: '饿了么官方',
    1000: '美团团购',
    1001: '京东团购'
  }

  try {
    const userInfoStr = localStorage.getItem('userInfo')
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {}
    const userId = userInfo.admin?.id || ''

    const result = await electron.openAuthWindow({
      shopType: targetShopType,
      name: platformNames[targetShopType] || '店铺',
      userId
    })

    if (result.success) {
      if (targetShopType === ShopType.京东团购) {
        gp.$baseMessage('授权窗口已打开，请登录京东店铺后点击"确认授权"，系统将自动完成添加', 'success', 'hey')
      } else {
        gp.$baseMessage('授权窗口已打开，请登录后点击"授权店铺"按钮', 'success', 'hey')
      }
      // 触发刷新事件（用户完成授权后可能需要刷新）
      emit('refresh')
    } else {
      gp.$baseMessage(result.message || '打开授权窗口失败', 'error', 'hey')
    }
  } catch (error: any) {
    gp.$baseMessage('打开授权窗口异常: ' + error.message, 'error', 'hey')
  }
}

/**
 * 生成授权链接（新功能）
 */
const generateAuthLink = async () => {
  try {
    // 1. 获取线路地址
    const baseUrlStr = localStorage.getItem('baseUrl')
    if (!baseUrlStr) {
      gp.$baseMessage('获取线路地址失败，请先配置线路', 'error', 'hey')
      return
    }
    const baseUrlObj = JSON.parse(baseUrlStr)
    let baseUrl = baseUrlObj.default || ''

    // 移除URL末尾的斜杠
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1)
    }

    // 2. 获取用户ID
    const userInfoStr = localStorage.getItem('userInfo')
    if (!userInfoStr) {
      gp.$baseMessage('获取用户信息失败，请重新登录', 'error', 'hey')
      return
    }
    const userInfo = JSON.parse(userInfoStr)
    const userId = userInfo.admin?.id || ''

    if (!userId) {
      gp.$baseMessage('获取用户ID失败，请重新登录', 'error', 'hey')
      return
    }

    // 3. 获取店铺类型（数字）
    let shopTypeValue = props.shopType
    if (shopTypeValue === undefined) {
      const currentShopTypeStr = localStorage.getItem('currentShopType')
      shopTypeValue = currentShopTypeStr ? parseInt(currentShopTypeStr) : ShopType.美团
    }

    // 4. 生成链接
    let authLink = ''

    if (shopTypeValue === ShopType.饿了么官方) {
      // 饿了么官方（shopType=8）需要从后端获取授权地址
      try {
        const authResult = await apiManager.shopmgApi.GetOfficeAuth(ShopType.饿了么官方)
        authLink = authResult.Url
      } catch (error: any) {
        gp.$baseMessage('获取授权地址失败: ' + error.message, 'error', 'hey')
        return
      }
    } else if (shopTypeValue === 1001) {
      // 京东团购：使用固定的京东授权地址
      const invokeId = `${userId}_1001`
      authLink = `https://store-hub.jddj.com/store/middle?encryptAppId=17rE%2FqhgPIz6vTPvgxHtMw%3D%3D&invokeId=${invokeId}`
    } else {
      // 其他店铺类型使用标准格式
      authLink = `${baseUrl}/login/${shopTypeValue}/${userId}`
    }

    // 5. 复制到剪贴板
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // 现代浏览器方式
      navigator.clipboard.writeText(authLink).then(() => {
        gp.$baseMessage(
          `授权链接已复制：${authLink}\n\n请发送给商家，引导商家打开链接授权店铺`,
          'success',
          'hey',
          { duration: 5000 }
        )
      }).catch((err) => {
        // 降级到旧方法
        fallbackCopyTextToClipboard(authLink)
      })
    } else {
      // 降级方案
      fallbackCopyTextToClipboard(authLink)
    }
  } catch (error: any) {
    gp.$baseMessage('生成授权链接失败: ' + error.message, 'error', 'hey')
  }
}

/**
 * 降级方案：使用 textarea 复制文本
 */
const fallbackCopyTextToClipboard = (text: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    const successful = document.execCommand('copy')
    if (successful) {
      gp.$baseMessage(
        `授权链接已复制：${text}\n\n请发送给商家，引导商家打开链接授权店铺`,
        'success',
        'hey',
        { duration: 5000 }
      )
    } else {
      gp.$baseMessage('复制失败，请手动复制链接：' + text, 'warning', 'hey')
    }
  } catch (err) {
    gp.$baseMessage('复制失败，请手动复制链接：' + text, 'warning', 'hey')
  }

  document.body.removeChild(textarea)
}
</script>

<style scoped>
.auth-button {
  margin-left: 8px;
  margin-right: 8px;
}
</style>
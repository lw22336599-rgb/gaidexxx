<template>
  <vab-app />
  <electron-update v-if="isElectron" />
</template>

<script lang="ts" setup>
import DisableDevtool from 'disable-devtool'
import { disableDebugger } from '/@/config'
import { useSettingsStore } from '/@/store/modules/settings'
import { useUserStore } from '/@/store/modules/user'
import { addShop } from '/@/api/shop'
import ElectronUpdate from '/@/plugins/ElectronUpdate/index.vue'

defineOptions({
  name: 'App'
})

// 检测是否在 Electron 环境中运行
const isElectron = computed(() => {
  return !!(globalThis as any).electron
})

const settingsStore = useSettingsStore()
const userStore = useUserStore()
const { updateTheme } = settingsStore
const route = useRoute()

// 同步 token 到 Electron 主进程
const syncTokenToElectron = async () => {
  const electron = (globalThis as any).electron
  if (electron?.ipcRenderer && userStore.token) {
    try {
      await electron.ipcRenderer.invoke('update-app-config', {
        token: userStore.token
      })
    } catch (error) {
      console.error('[App] 同步 Token 失败:', error)
    }
  }
}

// 监听 token 变化
watch(
  () => userStore.token,
  async newToken => {
    if (isElectron.value && newToken) {
      await syncTokenToElectron()
    }
  }
)

const resizeContainer = () => {
  let vh = window.innerHeight * 0.01
  const el = ref<HTMLElement | null>(null)
  useCssVar('--vh', el).value = `${vh}px`
}

onBeforeMount(() => {
  updateTheme()
  /**
   * @description: 修复ios、android等移动端浏览器100vh兼容问题
   * @author sundan
   */

  globalThis.addEventListener('orientationchange', resizeContainer)
  globalThis.addEventListener('resize', resizeContainer)
  resizeContainer()
})

onMounted(() => {
  nextTick(() => {
    // 是否允许生产环境进行代码调试，请前往config/cli.config.ts文件配置
    setTimeout(() => {
      if (
        !location.hostname.includes('127') &&
        !location.hostname.includes('localhost') &&
        (location.hostname.includes('vuejs-core') || disableDebugger) &&
        route.query &&
        route.query.debugger !== 'auto'
      )
        DisableDevtool({
          url: 'https://vuejs-core.cn/debugger',
          timeOutUrl: 'https://vuejs-core.cn/debugger'
        })
    }, 1000)
  })

  // 如果在 Electron 环境中，初始同步 token
  if (isElectron.value) {
    syncTokenToElectron()
  }

  // 监听来自主进程的添加店铺请求（手动授权窗口触发）
  const electron = (globalThis as any).electron
  if (electron?.onAddShopRequest) {
    electron.onAddShopRequest(async (request: any) => {
      const { data, responseChannel } = request

      // 确保总是发送响应，即使出错
      let responseSent = false
      const sendResponse = (response: any) => {
        if (responseSent) return
        responseSent = true
        try {
          electron?.sendAddShopResponse(responseChannel, response)
        } catch (err) {
          console.error('[App] 发送响应失败:', err)
        }
      }

      try {
        const result: any = await addShop(data)

        if (result && result.code === 200) {
          const response = {
            success: true,
            data: result.data
          }
          sendResponse(response)
          // 发布店铺添加成功事件，用于显示弹窗
          const gp = (globalThis as any).$basePub
          if (gp) {
            gp('shop-added-from-auth', {
              name: result.data.name,
              office_id: result.data.office_id,
              shop_type: data.shop_type,
              shop_user: '',
              shop_pwd: '',
              cookies: '',
              reset_power: false
            })
          }
        } else {
          const response = {
            success: false,
            message: result?.msg || result?.message || '添加店铺失败'
          }
          sendResponse(response)
        }
      } catch (error: any) {
        console.error('[App] addShop 异常:', error)
        const response = {
          success: false,
          message: error?.response?.data?.msg || error?.message || '添加店铺异常'
        }
        sendResponse(response)
      }
    })
  }
})
</script>

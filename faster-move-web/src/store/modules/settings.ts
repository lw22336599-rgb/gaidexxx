/**
 * @description 所有全局配置的状态管理，如无必要请勿修改
 */

import {
  persistenceTab as _persistenceTab,
  color,
  colorWeakness,
  columnStyle,
  fixedHeader,
  foldSidebar,
  fontSize,
  i18n,
  isFollow,
  layout,
  logo,
  menuWidth,
  pageTransition,
  radius,
  rightToolsDrag,
  showColorPicker,
  showDark,
  showFontSize,
  showFooter,
  showFullScreen,
  showLanguage,
  showLock,
  showNotice,
  showProgressBar,
  showRefresh,
  showSearch,
  showTabs,
  showTabsIcon,
  showTheme,
  showThemeSetting,
  tabDrag,
  tabsBarStyle,
  themeName,
  title,
} from '/@/config'
import { colorRgba, lightenColorChrome } from '/@/utils/lightenColor'
import { getLocalStorage } from '/@/utils/localStorage'

const defaultTheme: ThemeType = {
  color,
  colorWeakness,
  columnStyle,
  fixedHeader,
  foldSidebar,
  isFollow,
  layout,
  menuWidth,
  pageTransition,
  radius,
  showColorPicker,
  showDark,
  showFooter,
  showFullScreen,
  showLanguage,
  showLock,
  showNotice,
  showProgressBar,
  showRefresh,
  showSearch,
  showTabs,
  showTabsIcon,
  showTheme,
  showThemeSetting,
  tabsBarStyle,
  themeName,
  showFontSize,
  tabDrag,
  fontSize,
  rightToolsDrag,
}

const { collapse = foldSidebar } = getLocalStorage('collapse')
const { persistenceTab = _persistenceTab } = getLocalStorage('persistenceTab')

// 检测是否在 Electron 环境中
const isElectron = !!(globalThis as any).electron
// 检测是否为开发模式
const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development'

// 获取主题配置：在 Electron 开发模式下，确保关键配置与 theme.config.ts 一致
const getThemeConfig = () => {
  const savedTheme = getLocalStorage('shop-vite-theme')

  // 在 Electron 开发模式下，确保关键配置与 theme.config.ts 一致
  if (savedTheme && isElectron && isDev) {
    // 定义关键配置项列表（这些配置会影响页面布局和显示）
    const criticalConfigKeys: (keyof ThemeType)[] = [
      'layout',        // 布局类型
      'menuWidth',     // 菜单宽度（影响页面布局宽度）
      'columnStyle',   // 分栏风格
      'fixedHeader',   // 是否固定头部
      'showTabs',      // 是否显示标签页
      'showFooter',   // 是否显示页脚
      'foldSidebar',  // 是否默认收起侧边栏
    ]

    // 检查关键配置项是否与默认配置不一致
    const inconsistentKeys: string[] = []
    const forcedConfig: Partial<ThemeType> = {}

    criticalConfigKeys.forEach((key) => {
      const savedValue = savedTheme[key]
      const defaultValue = defaultTheme[key]

      // 比较值是否不同（处理各种类型）
      if (savedValue !== undefined && savedValue !== defaultValue) {
        inconsistentKeys.push(key)
        forcedConfig[key] = defaultValue
      }
    })

    // 如果发现不一致的配置，使用默认配置并输出警告
    if (inconsistentKeys.length > 0) {
      console.warn(
        `[Electron Dev] 检测到主题配置不一致，将使用 theme.config.ts 中的默认配置：\n` +
        inconsistentKeys.map(key => {
          const saved = savedTheme[key]
          const def = defaultTheme[key]
          return `  - ${key}: localStorage="${saved}" → 使用默认值="${def}"`
        }).join('\n') +
        `\n提示：已自动更新 localStorage 中的配置，下次启动将不再显示此警告。`
      )

      // 强制使用默认配置的关键项，但保留其他非关键的自定义配置
      const correctedTheme = { ...defaultTheme, ...savedTheme, ...forcedConfig }

      // 自动更新 localStorage，避免下次启动时再次显示警告
      try {
        localStorage.setItem('shop-vite-theme', JSON.stringify(correctedTheme))
      } catch (error) {
        console.warn('[Electron Dev] 更新 localStorage 失败:', error)
      }

      return correctedTheme
    }
  }

  // 正常情况：合并默认配置和保存的配置
  return { ...defaultTheme, ...savedTheme }
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsModuleType => ({
    collapse,
    device: 'desktop',
    language: getLocalStorage('language').language || i18n,
    lock: getLocalStorage('lock').lock || false,
    logo: getLocalStorage('logo').logo || logo,
    mode: localStorage.getItem('vueuse-color-scheme') || 'light',
    persistenceTab,
    theme: getThemeConfig(),
    title: getLocalStorage('title').title || title,
    scrollTop: JSON.parse(localStorage.getItem('scrollTop') || '[]'),
    demoMode: getLocalStorage('demoMode').demoMode || false,
  }),
  getters: {
    getCollapse: (state) => state.collapse,
    getDevice: (state) => state.device,
    getPersistenceTab: (state) => state.persistenceTab,
    getLanguage: (state) => state.language,
    getLock: (state) => state.lock,
    getLogo: (state) => state.logo,
    getMode: (state) => state.mode,
    getTheme: (state) => state.theme,
    getTitle: (state) => state.title,
    getScrollTop: (state) => state.scrollTop,
    getDemoMode: (state) => state.demoMode,
  },
  actions: {
    updateState(obj: any) {
      Object.getOwnPropertyNames(obj).forEach((key) => {
        // @ts-ignore
        this[key] = obj[key]
        localStorage.setItem(key, typeof obj[key] == 'string' ? `{"${key}":"${obj[key]}"}` : `{"${key}":${obj[key]}}`)
      })
    },
    updateMode(value: any) {
      this.mode = value
    },
    saveTheme() {
      localStorage.setItem('shop-vite-theme', JSON.stringify(this.theme))
    },
    resetTheme() {
      this.theme = { ...defaultTheme }
      this.persistenceTab = _persistenceTab
      this.changeLanguage(i18n)
      if (this.device === 'mobile')
        this.theme = {
          ...defaultTheme,
          layout: 'vertical',
        }
      localStorage.removeItem('shop-vite-theme')
      this.updateTheme()
    },
    updateTheme() {
      document.querySelectorAll('body')[0].className = `vab-theme-${this.theme.themeName}`

      if (this.theme.themeName === 'default') {
        const colorScheme = localStorage.getItem('vueuse-color-scheme')
        const htmlElement = document.querySelectorAll('html')[0]
        htmlElement.className += ` ${colorScheme}`
        this.mode = colorScheme as string
      } else {
        document.querySelectorAll('html')[0].className = ''
        localStorage.setItem('vueuse-color-scheme', 'light')
        this.mode = 'light'
      }

      this.setCssVar()
    },
    setCssVar() {
      /**
       * @description 主题配置，如不精通前端css样式请勿修改
       * @author sundan
       */
      const el = ref<HTMLElement | null>(null)

      //菜单宽度
      if (this.theme.menuWidth && this.theme.menuWidth.endsWith('px')) useCssVar('--el-left-menu-width', el).value = this.theme.menuWidth
      else useCssVar('--el-left-menu-width', el).value = '266px'
      //tabs处理
      if (this.theme.showTabs) {
        useCssVar('--el-tabs-height', el).value = '50px'
      } else {
        useCssVar('--el-tabs-height', el).value = '0px'
      }
      //页脚处理
      if (this.theme.showFooter) {
        useCssVar('--el-footer-height', el).value = '50px'
      } else {
        useCssVar('--el-footer-height', el).value = '-20px'
      }
      //圆角处理
      if (this.theme.radius) {
        useCssVar('--el-border-radius-base', el).value = `${this.theme.radius}px`
      } else {
        useCssVar('--el-border-radius-base', el).value = '5px'
      }
      //分栏一级菜单跟随背景色处理
      if (this.theme.isFollow) {
        useCssVar('--el-menu-background-color', el).value = lightenColorChrome(this.theme.color, 18)
      } else {
        useCssVar('--el-menu-background-color', el).value = '#282c34'
      }
      //主题色处理
      useCssVar('--el-color-primary-dark-2', el).value = this.theme.color
      useCssVar('--el-color-primary', el).value = this.theme.color
      for (let index = 1; index < 10; index++) {
        useCssVar(`--el-color-primary-light-${index}`, el).value = colorRgba(this.theme.color, 1 - index * 0.1)
      }
      //色弱处理
      if (this.theme.colorWeakness) document.querySelectorAll('body')[0].classList.add('color-weakness')
      else document.querySelectorAll('body')[0].classList.remove('color-weakness')
      //字体大小处理
      useCssVar('--el-font-size-base', el).value = this.theme.fontSize
    },
    toggleCollapse() {
      this.collapse = !this.collapse
      localStorage.setItem('collapse', `{"collapse":${this.collapse}}`)
    },
    toggleDevice(device: string) {
      this.updateState({ device })
    },
    openSideBar() {
      this.updateState({ collapse: false })
    },
    foldSideBar() {
      this.updateState({ collapse: true })
    },
    changeLanguage(language: string) {
      this.updateState({ language })
    },
    handleLock() {
      this.updateState({ lock: true })
    },
    handleUnLock() {
      this.updateState({ lock: false })
    },
    updateCaughtTabs(value: any) {
      this.updateState({ persistenceTab: value })
      if (!value) localStorage.removeItem('caughtRoutes')
    },
    changeLogo(logo: string) {
      this.updateState({ logo })
    },
    changeTitle(title: string) {
      this.updateState({ title })
    },
    updateScrollTop(scrollTop: number, routeName: any) {
      const originalArray = [...JSON.parse(localStorage.getItem('scrollTop') || '[]')]
      interface Item {
        routeName: string
        scrollTop: number
      }

      function updateArray(arr: Item[], routeNameToCheck: string, newScrollTopValue: number): Item[] {
        let found = false
        const newArr = arr.map((item) => {
          if (item.routeName === routeNameToCheck) {
            found = true
            return {
              ...item,
              scrollTop: newScrollTopValue,
            }
          }
          return item
        })
        if (!found) {
          newArr.push({ routeName: routeNameToCheck, scrollTop: newScrollTopValue })
        }
        return newArr
      }
      const modifiedArray = updateArray(originalArray, routeName, scrollTop)
      function removeItemsWithZeroScrollTop(arr: Item[]): Item[] {
        return arr.filter((item) => item.scrollTop !== 0)
      }

      const filteredArray = removeItemsWithZeroScrollTop(modifiedArray)

      localStorage.setItem('scrollTop', JSON.stringify(filteredArray))
    },
    updateDemoMode(value: boolean) {
      this.demoMode = value
      localStorage.setItem('demoMode', JSON.stringify({ demoMode: value }))
    },
  },
})

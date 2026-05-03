/**
 * @description 路由守卫，目前两种模式：all模式与intelligence模式
 */
import VabProgress from 'nprogress'
import 'nprogress/nprogress.css'
import type { Router } from 'vue-router'
import { authentication, loginInterception, routesWhiteList, supportVisit } from '/@/config'
import { useRoutesStore } from '/@/store/modules/routes'
import { useSettingsStore } from '/@/store/modules/settings'
import { useUserStore } from '/@/store/modules/user'
import getPageTitle from '/@/utils/pageTitle'
import { toLoginRoute } from '/@/utils/routes'
import { version } from '~/package.json'

/**
 * 获取父路由的最后访问子路由
 * @param parentRouteName 父路由名称
 */
const getLastChildRoute = (parentRouteName: string): string | null => {
  return sessionStorage.getItem(`lastChildRoute_${parentRouteName}`)
}

/**
 * 保存父路由的最后访问子路由
 * @param parentRouteName 父路由名称
 * @param childRouteName 子路由名称
 */
const saveLastChildRoute = (parentRouteName: string, childRouteName: string | null) => {
  if (childRouteName) {
    sessionStorage.setItem(`lastChildRoute_${parentRouteName}`, childRouteName)
  } else {
    sessionStorage.removeItem(`lastChildRoute_${parentRouteName}`)
  }
}

/**
 * 获取路由的父路由信息
 * @param route 路由对象
 * @returns 父路由信息 {name, path} 或 null
 */
const getParentRoute = (route: any): { name: string; path: string } | null => {
  if (route.matched && route.matched.length >= 2) {
    // matched 数组最后一个元素是当前路由，倒数第二个是父路由
    const parentMatched = route.matched[route.matched.length - 2]
    if (parentMatched && parentMatched.name) {
      return {
        name: parentMatched.name as string,
        path: parentMatched.path
      }
    }
  }
  return null
}

/**
 * 检查路由是否是父路由的默认子路由（第一个子路由）
 * @param route 当前路由
 * @param parentRoute 父路由信息
 * @param router Vue Router 实例
 */
const isDefaultChildRoute = (route: any, parentRoute: { name: string; path: string }, router: Router): boolean => {
  // 如果路由路径等于父路由路径，说明是父路由本身
  if (route.path === parentRoute.path) {
    return false
  }
  // 获取默认子路由名称
  const defaultChildName = getDefaultChildRouteName(parentRoute.name, router)
  return defaultChildName === route.name
}

/**
 * 根据路由名称动态解析路由路径
 * 使用 Vue Router 的 resolve 方法，无需硬编码
 * @param router Vue Router 实例
 * @param routeName 路由名称
 */
const getRoutePathByName = (router: Router, routeName: string): string | null => {
  try {
    const resolved = router.resolve({ name: routeName })
    return resolved.path || null
  } catch (error) {
    console.warn(`[路由守卫] 无法解析路由名称: ${routeName}`, error)
    return null
  }
}

/**
 * 获取父路由的默认子路由名称（第一个子路由）
 * 通过路由配置来判断
 */
const getDefaultChildRouteName = (parentRouteName: string, router: Router): string | null => {
  try {
    // 尝试解析父路由，获取其子路由信息
    const parentRoute = router.resolve({ name: parentRouteName })
    // 由于无法直接获取子路由，我们通过常见的默认路由名称来判断
    // 这个可以根据实际路由配置来调整，或者通过路由 store 来获取
    const defaultRouteNames: Record<string, string> = {
      'Shop': 'MtFeature', // 门店管理的默认子路由
      'ShopCopy': 'MtShopCopy', // 店铺复制的默认子路由
      'Survey': 'MtSurvey', // 店铺调研的默认子路由
      'Shopwechat': 'Tswechat', // 门店推送的默认子路由
      'Team': 'Point', // 团队管理的默认子路由
    }
    return defaultRouteNames[parentRouteName] || null
  } catch {
    return null
  }
}

export const setupPermissions = (router: Router) => {
  VabProgress.configure({
    easing: 'ease',
    speed: 500,
    trickleSpeed: 200,
    showSpinner: false,
  })
  router.beforeEach(async (to, from, next) => {
    // 如果访问 /shop-v2 父路由，直接重定向到功能版页面，避免显示二级菜单
    const SHOP_V2_PATH = '/shop-v2'
    const SHOP_V2_FUNCTIONAL_PATH = '/shop-v2/functional'
    const SHOP_V2_NAME = 'ShopV2'

    if (to.path === SHOP_V2_PATH && to.name === SHOP_V2_NAME) {
      next({ path: SHOP_V2_FUNCTIONAL_PATH, replace: true })
      return
    }

    // 通用路由记忆机制
    const parentRoute = getParentRoute(to)

    // 如果当前路由有父路由，说明是子路由
    if (parentRoute && to.name) {
      // 判断是否是从其他路由（非该父路由的子路由）跳转过来
      const fromParentRoute = getParentRoute(from)
      const isFromOtherRoute = !fromParentRoute || fromParentRoute.name !== parentRoute.name

      // 判断是否是访问父路由本身或默认子路由
      const isToParentRoute = to.path === parentRoute.path
      const isToDefaultChild = isDefaultChildRoute(to, parentRoute, router)

      // 调试输出
      if (isToParentRoute || isToDefaultChild) {
        console.log('🔍 [路由守卫] 通用路由记忆检查:', {
          'parentRoute': parentRoute,
          'fromParentRoute': fromParentRoute,
          'isFromOtherRoute': isFromOtherRoute,
          'isToParentRoute': isToParentRoute,
          'isToDefaultChild': isToDefaultChild,
          'to.path': to.path,
          'to.name': to.name,
          'from.path': from.path,
          'from.name': from.name,
        })
      }

      // 如果是从其他路由跳转到父路由或默认子路由，检查是否需要恢复
      if (isFromOtherRoute && (isToParentRoute || isToDefaultChild)) {
        const lastChildRoute = getLastChildRoute(parentRoute.name)
        console.log('🔍 [路由守卫] 检查恢复子路由:', {
          'parentRoute': parentRoute.name,
          'lastChildRoute': lastChildRoute,
          'to.name': to.name,
          '需要重定向': lastChildRoute && lastChildRoute !== to.name,
        })

        // 如果记录的子路由存在，且不是当前路由，则重定向到记录的子路由
        if (lastChildRoute && lastChildRoute !== to.name) {
          // 动态解析子路由路径
          const childRoutePath = getRoutePathByName(router, lastChildRoute)
          if (childRoutePath) {
            console.log('🔄 [路由守卫] 执行重定向到:', childRoutePath)
            next({ path: childRoutePath, replace: true })
            return
          }
        }
      }
      // 如果是从父路由重定向到默认子路由，也需要检查
      else if (isToDefaultChild && from.name === parentRoute.name && from.path === parentRoute.path) {
        const lastChildRoute = getLastChildRoute(parentRoute.name)
        console.log('🔍 [路由守卫] 从父路由重定向检查:', {
          'parentRoute': parentRoute.name,
          'lastChildRoute': lastChildRoute,
          'to.name': to.name,
          '需要重定向': lastChildRoute && lastChildRoute !== to.name,
        })

        if (lastChildRoute && lastChildRoute !== to.name) {
          // 动态解析子路由路径
          const childRoutePath = getRoutePathByName(router, lastChildRoute)
          if (childRoutePath) {
            console.log('🔄 [路由守卫] 执行重定向到（从父路由）:', childRoutePath)
            next({ path: childRoutePath, replace: true })
            return
          }
        }
      }

      // 记录子路由访问（只有在不需要恢复时才记录）
      // 只有当不是访问父路由本身时才记录
      if (!isToParentRoute) {
        console.log('✅ [路由守卫] 记录子路由:', {
          'parentRoute': parentRoute.name,
          'childRoute': to.name,
        })
        saveLastChildRoute(parentRoute.name, to.name as string)
      }
    }

    // console.log(to,'to');
    // let url=''
    // let baseUrl=localStorage.getItem('baseUrl')
    // let baseUrl1=JSON.parse(baseUrl)
    // acquiesce
    // if(baseUrl&&baseUrl1?.type=='acquiesce'){
    //   if(to.meta&&to.meta?.type){
    //     if(to.meta?.type==1){
    //        url='http://type1.kuocaih.cn/'
    //     }else if(to.meta?.type==2){
    //       url='http://type2.kuocaih.cn/'
    //     }else if(to.meta?.type==6){
    //       url='http://type6.kuocaih.cn/'
    //     }else{
    //       url='http://fz.kuocaih.cn/'
    //     }
    //     if(baseUrl1.move=='http://fz.kuocaih.cn/'||baseUrl1.move=='http://type1.kuocaih.cn/'||baseUrl1.move=='http://type2.kuocaih.cn/'||baseUrl1.move=='http://type6.kuocaih.cn/'){
    //       baseUrl1.move=url
    //     }
    //     localStorage.setItem('baseUrl', JSON.stringify(baseUrl1))
    //   }else{
    //     url='http://fz.kuocaih.cn/'
    //     baseUrl1.move=url
    //     localStorage.setItem('baseUrl', JSON.stringify(baseUrl1))
    //   }
    // }
    const {
      getTheme: { showProgressBar },
    } = useSettingsStore()
    const { routes, setRoutes } = useRoutesStore()
    const { token, getUserInfo, setVirtualRoles, resetAll } = useUserStore()

    if (showProgressBar) VabProgress.start()

    let hasToken = token

    if (!loginInterception) hasToken = true

    if (hasToken) {
      if (routes.length > 0) {
        // 禁止已登录用户返回登录页
        if (to.path === '/login') {
          next({ path: '/' })
          if (showProgressBar) VabProgress.done()
        } else {
          // 路由恢复逻辑已经在前面处理了，这里直接继续
          next()
        }
      } else {
        try {
          if (loginInterception) await getUserInfo()
          // config/setting.config.js loginInterception为false(关闭登录拦截时)时，创建虚拟角色
          else await setVirtualRoles()
          // 根据路由模式获取路由并根据权限过滤
          await setRoutes(authentication)
          next({ ...to, replace: true })
        } catch (error) {
          console.error('vue-shop-vite 错误拦截:', error)
          await resetAll()
          next(toLoginRoute(to.fullPath))
        }
      }
    } else {
      if (routesWhiteList.includes(to.path)) {
        // 设置游客路由(不需要可以删除)
        if (supportVisit && routes.length === 0) {
          await setRoutes('visit')
          next({ path: to.path, replace: true })
        } else next()
      } else next(toLoginRoute(to.fullPath))
    }
  })
  router.afterEach((to) => {
    if (typeof to.meta.title === 'string') {
      const title = getPageTitle(to.meta.title)
      document.title = `${title} 当前版本号：v${version}`
    }
    if (VabProgress.status) VabProgress.done()
  })

  router.onError((error: any) => {
    console.error('vue-shop-vite 错误拦截:', error.message)
  })

  return router
}

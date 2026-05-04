/**
 * @description 路由拦截状态管理，目前两种模式：all模式与intelligence模式，其中partialRoutes是菜单暂未使用
 */
import { getList } from '/@/api/router'
import { authentication, rolesControl } from '/@/config'
import { asyncRoutes, constantRoutes, resetRouter } from '/@/router'
import type { SystemConfigAllDto } from '/@/TsModel/Alien/Entity/Function/SystemConfig/SystemConfigAllDto'
import type { ShopType } from '/@/TsModel/Alien/Entity/Enums/ShopType'
import { convertRouter, filterRoutes } from '/@/utils/routes'
import { isArray } from '/@/utils/validate'
import { gp } from '/@vab/plugins/vab'
import { useSystemConfigStore } from './systemConfig'

const filterHidden = (data: any) => {
  return data.reduce((acc: any, item: any) => {
    if (item.meta && item.meta.hidden) return acc
    const newItem = { ...item }
    if (item.children && item.children.length > 0) newItem.children = filterHidden(item.children)
    return [...acc, newItem]
  }, [])
}

const filterBreadcrumb = (data: any) => {
  return data.reduce((acc: any, item: any) => {
    const newItem = { ...item }
    if (item.children && item.children.length > 0) newItem.children = filterBreadcrumb(item.children)
    return [...acc, newItem]
  }, [])
}

const filterByPlatformConfig = (routes: VabRouteRecord[], config: SystemConfigAllDto | null): VabRouteRecord[] => {
  const managePlatforms = config?.ShopManagePlatforms || []
  const researchPlatforms = config?.ShopResearchPlatforms || []

  const matchType = (route: VabRouteRecord, allowList: ShopType[]) => {
    if (!route.meta || typeof route.meta.type === 'undefined') return true
    return allowList.includes(route.meta.type as ShopType)
  }

  return routes
    .map((route: VabRouteRecord) => {
      const clone: VabRouteRecord = { ...route }
      if (clone.children && clone.name === 'Shop')
        clone.children = clone.children.filter((child: VabRouteRecord) => matchType(child, managePlatforms))
      if (clone.children && clone.name === 'Survey')
        clone.children = clone.children.filter((child: VabRouteRecord) => matchType(child, researchPlatforms))
      if (clone.children && clone.children.length > 0) clone.children = filterByPlatformConfig(clone.children, config)

      // 若指定模块过滤后无可用子路由，则隐藏父级
      const shouldHideChildren =
        (clone.name === 'Shop' || clone.name === 'Survey') && (!clone.children || clone.children.length === 0)
      if (shouldHideChildren) return null
      return clone
    })
    .filter((item): item is VabRouteRecord => !!item)
}

export const useRoutesStore = defineStore('routes', {
  state: (): RoutesModuleType => ({
    tab: {
      data: undefined
    },
    tabMenu: undefined,
    activeMenu: {
      data: undefined
    },
    routes: [],
    allRoutes: [],
    breadcrumbRoutes: []
  }),
  getters: {
    getTab: state => state.tab,
    getTabMenu: state =>
      state.tab.data ? state.routes.find(route => route.name === state.tab.data) : { meta: { title: '' } },
    getActiveMenu: state => state.activeMenu,
    getRoutes: state => state.routes.filter(_route => _route.meta && _route.meta.hidden !== true),
    getAllRoutes: state => state.allRoutes.filter(_route => _route.meta && _route.meta.hidden !== true),
    getBreadcrumbRoutes: state => state.breadcrumbRoutes.filter(_route => _route.meta && _route.meta.hidden !== true),
    getPartialRoutes: state =>
      state.tab.data
        ? state.routes.find(route => route.name === state.tab.data) &&
          state.routes.find(route => route.name === state.tab.data).children
        : []
  },
  actions: {
    /**
     * @description 多模式设置路由
     * @param mode
     * @returns
     */
    async setRoutes(mode = 'none') {
      // 默认前端路由
      let routes = [...asyncRoutes]
      // 设置游客路由关闭路由拦截(不需要可以删除)
      const control = mode === 'visit' ? false : rolesControl
      // 设置后端路由(不需要可以删除)
      if (authentication === 'all') {
        const {
          data: { list }
        } = await getList()
        if (!isArray(list)) gp.$baseMessage('路由格式返回有误！', 'error', 'hey')
        if (list.at(-1).path !== '/:pathMatch(.*)*')
          list.push({
            path: '/:pathMatch(.*)*',
            redirect: '/404',
            name: 'NotFound',
            meta: { hidden: true }
          })
        routes = convertRouter(list)
      }
      const systemConfigStore = useSystemConfigStore()
      const systemConfig = await systemConfigStore.ensureConfig()
      routes = filterByPlatformConfig(routes, systemConfig)
      // 根据权限和rolesControl过滤路由
      const accessRoutes = filterRoutes([...constantRoutes, ...routes], control)
      // 设置菜单所需路由
      this.routes = filterHidden(accessRoutes)
      this.allRoutes = accessRoutes
      this.breadcrumbRoutes = filterBreadcrumb(accessRoutes)
      // 根据可访问路由重置Vue Router
      await resetRouter(accessRoutes)
    },
    changeMenuMeta(options: any) {
      function handleRoutes(routes: any[]) {
        return routes.map(route => {
          if (route.name === options.name) Object.assign(route.meta, options.meta)
          if (route.children && route.children.length > 0) route.children = handleRoutes(route.children)
          return route
        })
      }

      this.routes = handleRoutes(this.routes)
    },
    /**
     * @description 修改 activeName
     * @param activeMenu 当前激活菜单
     */
    changeActiveMenu(activeMenu: string) {
      this.activeMenu.data = activeMenu
    }
  }
})

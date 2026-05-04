import Layout from '/@vab/layouts/index.vue'

// 路由常量
const SHOP_V2_PATH = '/shop-v2'
const SHOP_V2_FUNCTIONAL_PATH = '/shop-v2/functional'
const SHOP_V2_NAME = 'ShopV2'

// 公共 meta 配置
const commonNoColumnMeta = {
  noColumn: true // 隐藏侧边栏
}

const commonHiddenFeatureMeta = {
  levelHidden: true,
  hidden: true // 完全隐藏，不在菜单显示
}

const routerConfig: VabRouteRecord = {
  path: SHOP_V2_PATH,
  name: SHOP_V2_NAME,
  component: Layout,
  meta: {
    title: '门店管理',
    icon: 'home-4-fill',
    badge: 'NEW',
    levelHidden: true, // 隐藏一级路由，直接显示子路由，避免切换时显示二级菜单
    noColumn: true // 隐藏侧边栏，避免切换时显示二级菜单
  },
  redirect: SHOP_V2_FUNCTIONAL_PATH, // 默认跳转到功能版页面
  children: [
    {
      path: 'index',
      name: 'ShopV2Index',
      component: () => import('/@/views/shop/MtFeatureV2Functional.vue'),
      meta: {
        title: '门店管理',
        icon: 'home-4-fill',
        ...commonNoColumnMeta
      }
    },
    {
      path: 'functional',
      name: 'ShopV2Functional',
      component: () => import('/@/views/shop/MtFeatureV2Functional.vue'),
      meta: {
        title: '门店管理',
        icon: 'home-4-fill',
        ...commonNoColumnMeta
      }
    },
    {
      path: 'operation',
      name: 'ShopV2Operation',
      component: () => import('/@/views/shop/MtFeatureV2Operation.vue'),
      meta: {
        title: '门店管理🆕-运营版',
        icon: 'home-4-fill',
        ...commonNoColumnMeta
      }
    },
    // 功能版路由（隐藏，不在菜单显示）
    {
      path: 'feature/type=mt-feature',
      name: 'MtFeatureV2',
      component: () => import('/@/views/shop/MtFeatureV2.vue'),
      meta: {
        icon: 'mt',
        isCustomSvg: true,
        title: '美团外卖',
        typeStr: 'mt-feature',
        type: 1,
        ...commonHiddenFeatureMeta
      }
    },
    {
      path: 'feature/type=elm-feature',
      name: 'ElmFeatureV2',
      component: () => import('/@/views/shop/MtFeatureV2.vue'),
      meta: {
        icon: 'tbsg_wm',
        isCustomSvg: true,
        title: '淘宝闪购外卖',
        typeStr: 'elm-feature',
        type: 2,
        ...commonHiddenFeatureMeta,
        guard: {
          role: ['KA'],
          mode: 'except' // 有KA权限的不能访问
        }
      }
    },
    {
      path: 'feature/type=elm-feature-official',
      name: 'ElmFeature_officialV2',
      component: () => import('/@/views/shop/MtFeatureV2.vue'),
      meta: {
        icon: 'tbsg_wm',
        isCustomSvg: true,
        title: '淘宝闪购复制版',
        typeStr: 'elm-feature',
        type: 8,
        ...commonHiddenFeatureMeta,
        guard: {
          role: ['KA'],
          mode: 'except' // 有KA权限的不能访问
        }
      }
    },
    {
      path: 'feature/type=jd-home-feature',
      name: 'JdHomeFeatureV2',
      component: () => import('/@/views/shop/MtFeatureV2.vue'),
      meta: {
        title: '京东到家',
        icon: 'jd-home',
        isCustomSvg: true,
        typeStr: 'jd-home-feature',
        type: 6,
        hidden: true
      }
    },
    {
      path: 'feature/type=mt-shop-feature',
      name: 'MtShopFeatureV2',
      component: () => import('/@/views/shop/MtFeatureV2.vue'),
      meta: {
        icon: 'mt-shop',
        isCustomSvg: true,
        title: '美团闪购',
        typeStr: 'mt-shop-feature',
        type: 3,
        hidden: true
      }
    },
    {
      path: 'feature/type=mt-medicine-feature',
      name: 'MtMedicineFeatureV2',
      component: () => import('/@/views/shop/MtFeatureV2.vue'),
      meta: {
        title: '美团医药',
        icon: 'mt-medicine',
        isCustomSvg: true,
        typeStr: 'mt-medicine-feature',
        type: 4,
        hidden: true
      }
    },
    {
      path: 'feature/type=elm-retail-feature',
      name: 'ElmRetailFeatureV2',
      component: () => import('/@/views/shop/MtFeatureV2.vue'),
      meta: {
        title: '淘宝闪购零售',
        icon: 'tbsg_ls',
        isCustomSvg: true,
        typeStr: 'elm-retail-feature',
        type: 5,
        hidden: true
      }
    },
    {
      path: 'feature/type=dy-retail-feature',
      name: 'DyRetailFeatureV2',
      component: () => import('/@/views/shop/MtFeatureV2.vue'),
      meta: {
        title: '抖音即时零售',
        icon: 'dy-retail',
        isCustomSvg: true,
        typeStr: 'dy-retail-feature',
        type: 7,
        hidden: true
      }
    },
    {
      path: 'webhook-config',
      name: 'WebhookConfigV2',
      component: () => import('/@/views/shop/WebhookConfigIndexV2.vue'),
      meta: {
        title: '授权异常推送',
        icon: 'webhook-alert',
        levelHidden: true,
        isCustomSvg: true
      }
    }
  ]
}

// 店铺后台管理器路由（独立窗口）
export const shopBackendManagerRoute = {
  path: '/shop-backend-manager',
  name: 'ShopBackendManager',
  component: () => import('/@/views/shop/ShopBackendManager.vue'),
  meta: {
    hidden: true,
    title: '店铺后台管理'
  }
}

export default routerConfig

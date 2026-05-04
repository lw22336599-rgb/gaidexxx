import Layout from '/@vab/layouts/index.vue'

const routerConfig: VabRouteRecord = {
  path: '/shop',
  name: 'Shop',
  component: Layout,
  meta: {
    title: '门店管理',
    icon: 'home-4-fill'
  },
  children: [
    {
      path: 'feature/type=mt-feature',
      name: 'MtFeature',
      component: () => import('/@/views/shop/MtFeature.vue'),
      meta: {
        icon: 'mt',
        isCustomSvg: true,
        title: '美团外卖',
        typeStr: 'mt-feature',
        type: 1,
        levelHidden: true,
        noKeepAlive: true
      }
    },
    {
      path: 'feature/type=elm-feature',
      name: 'ElmFeature',
      component: () => import('/@/views/shop/MtFeature.vue'),
      meta: {
        icon: 'tbsg_wm',
        isCustomSvg: true,
        title: '淘宝闪购外卖',
        typeStr: 'elm-feature',
        type: 2,
        levelHidden: true,
        noKeepAlive: true,
        guard: {
          role: ['KA'],
          mode: 'except' // 有KA权限的不能访问
        }
      }
    },
    {
      path: 'feature/type=elm-feature-official',
      name: 'ElmFeature_official',
      component: () => import('/@/views/shop/MtFeature.vue'),
      meta: {
        icon: 'tbsg_wm',
        isCustomSvg: true,
        title: '淘宝闪购复制版',
        typeStr: 'elm-feature',
        type: 8,
        levelHidden: true,
        noKeepAlive: true,
        guard: {
          role: ['KA'],
          mode: 'except' // 有KA权限的不能访问
        }
      }
    },
    {
      path: 'feature/type=jd-home-feature',
      name: 'JdHomeFeature',
      component: () => import('/@/views/shop/MtFeature.vue'),
      meta: {
        title: '京东到家',
        icon: 'jd-home',
        isCustomSvg: true,
        typeStr: 'jd-home-feature',
        type: 6,
        noKeepAlive: true
      }
    },
    {
      path: 'feature/type=mt-shop-feature',
      name: 'MtShopFeature',
      component: () => import('/@/views/shop/MtFeature.vue'),
      meta: {
        icon: 'mt-shop',
        isCustomSvg: true,
        title: '美团闪购',
        typeStr: 'mt-shop-feature',
        type: 3,
        noKeepAlive: true
      }
    },
    {
      path: 'feature/type=mt-medicine-feature',
      name: 'MtMedicineFeature',
      component: () => import('/@/views/shop/MtFeature.vue'),
      meta: {
        title: '美团医药',
        icon: 'mt-medicine',
        isCustomSvg: true,
        typeStr: 'mt-medicine-feature',
        type: 4,
        noKeepAlive: true
      }
    },
    {
      path: 'feature/type=elm-retail-feature',
      name: 'ElmRetailFeature',
      component: () => import('/@/views/shop/MtFeature.vue'),
      meta: {
        title: '淘宝闪购零售',
        icon: 'tbsg_ls',
        isCustomSvg: true,
        typeStr: 'elm-retail-feature',
        type: 5,
        noKeepAlive: true
      }
    },
    {
      path: 'feature/type=dy-retail-feature',
      name: 'DyRetailFeature',
      component: () => import('/@/views/shop/MtFeature.vue'),
      meta: {
        title: '抖音即时零售',
        icon: 'dy-retail',
        isCustomSvg: true,

        typeStr: 'dy-retail-feature',
        type: 7,
        noKeepAlive: true
      }
    },
    {
      path: 'webhook-config',
      name: 'WebhookConfig',
      component: () => import('/@/views/shop/WebhookConfigIndex.vue'),
      meta: {
        title: '授权异常推送',
        icon: 'webhook-alert',
        levelHidden: true,
        isCustomSvg: true
      }
    }
  ]
}

export default routerConfig

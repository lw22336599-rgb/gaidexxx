import Layout from '/@vab/layouts/index.vue'

const routerConfig: VabRouteRecord = {
  path: '/shop-copy',
  name: 'ShopCopy',
  component: Layout,
  meta: {
    title: '店铺复制',
    icon: 'shop-copy',
    isCustomSvg: true
  },
  children: [
    {
      path: 'mt-shop-copy',
      name: 'MtShopCopy',
      component: () => import('/@/views/shopCopy/MtShopCopyIndex.vue'),
      meta: {
        title: '美团外卖',
        icon: 'mt',
        levelHidden: true,
        isCustomSvg: true,
        type: 1,

        guard: {
          role: ['KA'],
          mode: 'except', // 有KA权限的不能访问
        }
      },
    },
    {
      path: 'elm-shop-copy',
      name: 'ElmShopCopy',
      component: () => import('/@/views/shopCopy/MtShopCopyIndex.vue'),
      meta: {
        title: '淘宝闪购外卖',
        icon: 'tbsg_wm',
        levelHidden: true,
        isCustomSvg: true,
        type: 2,

        guard: {
          role: ['KA'],
          mode: 'except', // 有KA权限的不能访问
        }
      },
    },
    {
      path: 'elm-shop-copy-new',
      name: 'ElmShopCopyNew',
      component: () => import('/@/views/shopCopy/MtShopCopyIndex.vue'),
      meta: {
        title: '淘宝闪购复制版',
        icon: 'tbsg_wm',
        levelHidden: true,
        isCustomSvg: true,

        componentName: 'MtShopCopy',
        type: 8,
        guard: {
          role: ['KA'],
          mode: 'except', // 有KA权限的不能访问
        }
      },
    },
    {
      path: 'jd-distribution-shop-copy',
      name: 'JdDistributionShopCopy',
      component: () => import('/@/views/shopCopy/MtShopCopyIndex.vue'),
      meta: {
        title: '京东到家',
        icon: 'jd-home',
        levelHidden: true,
        isCustomSvg: true,

        componentName: 'MtShopCopy',
        type: 6,
        guard: ['ADMIN', 'AGENCY']
      },
    },
    {
      path: 'mt-purchase-shop-copy',
      name: 'MtPurchaseShopCopy',
      component: () => import('/@/views/shopCopy/MtShopCopyIndex.vue'),
      meta: {
        title: '美团闪购',
        icon: 'mt-shop',
        levelHidden: true,
        isCustomSvg: true,
        type: 3,

      },
    },
    {
      path: 'mt-medicine-shop-copy',
      name: 'MtMedicineShopCopy',
      component: () => import('/@/views/shopCopy/MtShopCopyIndex.vue'),
      meta: {
        title: '美团医药',
        icon: 'mt-medicine',
        levelHidden: true,
        isCustomSvg: true,
        type: 4,

      },
    },
    {
      path: 'elm-retail-shop-copy',
      name: 'ElmRetailShopCopy',
      component: () => import('/@/views/shopCopy/MtShopCopyIndex.vue'),
      meta: {
        title: '淘宝闪购零售',
        icon: 'tbsg_ls',
        levelHidden: true,
        isCustomSvg: true,

        componentName: 'MtShopCopy',
        type: 5
      },
    },
    {
      path: 'dy-retail-shop-copy',
      name: 'DyRetailShopCopy',
      component: () => import('/@/views/shopCopy/MtShopCopyIndex.vue'),
      meta: {
        title: '抖音即时零售',
        icon: 'dy-retail',
        levelHidden: true,
        isCustomSvg: true,

        componentName: 'MtShopCopy',
        type: 7
      },
    },
    {
      path: 'jd-groupbuy-shop-copy',
      name: 'JdGroupbuyShopCopy',
      component: () => import('/@/views/shopCopy/MtShopCopyIndex.vue'),
      meta: {
        title: '京东团购',
        icon: 'jd-home',
        levelHidden: true,
        isCustomSvg: true,

        componentName: 'MtShopCopy',
        type: 1001,
        guard: ['ADMIN', 'AGENCY']
      },
    },
    {
      path: 'dy-tuangou-shop-copy',
      name: 'DyTuangouShopCopy',
      component: () => import('/@/views/shopCopy/MtShopCopyIndex.vue'),
      meta: {
        title: '抖音团购',
        icon: 'dy-retail',
        levelHidden: true,
        isCustomSvg: true,

        componentName: 'MtShopCopy',
        type: 1002
      },
    },
  ]
};



export default routerConfig;

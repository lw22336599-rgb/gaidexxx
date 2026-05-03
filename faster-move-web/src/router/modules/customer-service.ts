import Layout from '/@vab/layouts/index.vue'

const routerConfig: VabRouteRecord = {
  path: '/customer-service',
  name: 'CustomerServiceRoot',
  component: Layout,
  meta: {
    title: 'IM客服',
    icon: 'customer-service',
    isCustomSvg: true,
    //  guard: ['ADMIN', 'KEFU'],
  },
  children: [
    // {
    //   path: 'management',
    //   name: 'CustomerServiceManagement',
    //   meta: {
    //     title: '客服管理',
    //     icon: 'customer-service',
    //     isCustomSvg: true,
    //     // guard: ['ADMIN', 'KEFU'],
    //   },
    //   component: () => import('/@/views/team/CustomerServiceManagement.vue'),
    // },
    {
      path: 'management1',
      name: 'CustomerServiceManagement1',
      meta: {
        title: '客服管理',
        icon: 'customer-service',
        isCustomSvg: true,
        // guard: ['ADMIN', 'KEFU'],
      },
      component: () => import('/@/views/team/CustomerServiceManagement1.vue'),
    },
    {
      path: 'shop-management',
      name: 'CustomerServiceShopManagement',
      meta: {
        title: '店铺管理',
        icon: 'home-4-fill',
        // guard: ['ADMIN', 'KEFU'],
      },
      component: () => import('/@/views/customer-service/ShopManagement.vue'),
    },
    {
      path: 'chat',
      name: 'CustomerService',
      meta: {
        title: '客服聊天',
        icon: 'chat',
        hidden: true, // 不在菜单中显示
      },
      component: () => import('/@/customer-service/views/CustomerService.vue'),
    },
    {
      path: 'tutorial',
      name: 'ImServiceTutorial',
      component: () => import('/@/views/common/Tutorial.vue'),
      meta: {
        title: '使用教程',
        icon: 'book-3-line',
        tutorialType: 'ImServiceTutorialUrl',
      },
    },
  ],
}

export default routerConfig

import Layout from '/@vab/layouts/index.vue'

const routerConfig: VabRouteRecord = {
  path: '/shopwechat',
  name: 'Shopwechat',
  component: Layout,
  meta: {
    title: '门店推送',
    icon: 'telegram-2-fill'
    //guard: ['ADMIN']
  },
  children: [
    // {
    //   path: 'mt-shop-wechat',
    //   name: 'Mtwechat',
    //   component: () => import('/@/views/shopwechat/Mtwechat.vue'),
    //   meta: {
    //     title: '美团外卖',
    //     icon: 'mt',
    //     levelHidden: true,
    //     isCustomSvg: true,
    //     type: 1
    //   },
    // },
    {
      path: 'tswechat',
      name: 'Tswechat',
      component: () => import('/@/views/shopwechat/Tswechat.vue'),
      meta: {
        title: '美团外卖',
        icon: 'mt',
        levelHidden: true,
        isCustomSvg: true,
        type: 1,
        noKeepAlive: true
      }
    },
    {
      path: 'shangoutswechat',
      name: 'Shangoutswechat',
      component: () => import('/@/views/shopwechat/Tswechat.vue'),
      meta: {
        title: '美团闪购',
        icon: 'mt-shop',
        levelHidden: true,
        isCustomSvg: true,
        type: 3
      }
    },
    {
      path: 'elmtswechat',
      name: 'Elmtswechat',
      component: () => import('/@/views/shopwechat/Tswechat.vue'),
      meta: {
        title: '饿了么',
        icon: 'elm',
        levelHidden: true,
        isCustomSvg: true,
        type: 2,
        noKeepAlive: true,
        guard: ['ADMIN']
      }
    },
    {
      path: 'jdtswechat',
      name: 'Jdtswechat',
      component: () => import('/@/views/shopwechat/Tswechat.vue'),
      meta: {
        title: '京东到家',
        icon: 'jd-home',
        levelHidden: true,
        isCustomSvg: true,
        type: 6,
        noKeepAlive: true
      }
    },
    // {
    //   path: 'wechat',
    //   name: 'Wechat',
    //   component: () => import('/@/views/shopwechat/wechat.vue'),
    //   meta: {
    //     title: '微信机器人配置',
    //     icon: 'wechat',
    //     levelHidden: true,
    //     isCustomSvg: true,
    //     type: 8
    //   },
    // },
    {
      path: 'robot-management',
      name: 'RobotManagement',
      component: () => import('/@/views/shopwechat/RobotManagement.vue'),
      meta: {
        title: '机器人管理',
        icon: 'robot-2-fill',
        levelHidden: false
      }
    },
    {
      path: 'tutorial',
      name: 'ShopPushTutorial',
      component: () => import('/@/views/common/Tutorial.vue'),
      meta: {
        title: '使用教程',
        icon: 'book-3-line',
        levelHidden: false,
        tutorialType: 'ShopPushTutorialUrl'
      }
    }
  ]
}

export default routerConfig

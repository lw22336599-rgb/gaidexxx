import Layout from '/@vab/layouts/index.vue'

const routerConfig: VabRouteRecord = {
  path: '/team',
  name: 'Team',
  component: Layout,
  meta: {
    title: '团队管理',
    icon: 'team-fill'
  },
  children: [
    {
      path: 'point',
      name: 'Point',
      meta: {
        title: '积分管理',
        icon: 'point',
        isCustomSvg: true
      },
      component: () => import('/@/views/team/Point.vue')
    },
    {
      path: 'group',
      name: 'Group',
      meta: {
        title: '分组管理',
        icon: 'group',
        isCustomSvg: true
      },
      component: () => import('/@/views/team/Group.vue')
    },
    {
      path: 'information',
      name: 'Information',
      meta: {
        title: '信息设置',
        icon: 'information',
        isCustomSvg: true
      },
      component: () => import('/@/views/team/Information.vue')
    },
    {
      path: 'member',
      name: 'Member',
      meta: {
        title: '成员管理',
        icon: 'member',
        isCustomSvg: true
      },
      component: () => import('/@/views/team/Member.vue')
    },
    {
      path: 'apply',
      name: 'Apply',
      meta: {
        title: '应用管理',
        icon: 'apply',
        isCustomSvg: true,
        guard: ['ADMIN']
      },
      component: () => import('/@/views/team/Apply.vue')
    },
    {
      path: 'function-price',
      name: 'FunctionPrice',
      meta: {
        title: '功能价格管理',
        icon: 'apply',
        isCustomSvg: true,
        guard: ['ADMIN']
      },
      component: () => import('/@/views/team/FunctionPrice.vue')
    },
    {
      path: 'notification',
      name: 'Notification',
      meta: {
        title: '通知管理',
        icon: 'notification',
        isCustomSvg: true,
        guard: ['ADMIN']
      },
      component: () => import('/@/views/team/Notification.vue')
    },
    {
      path: 'food-move-rule',
      name: 'FoodMoveRule',
      meta: {
        title: '商品复制规则',
        icon: 'apply',
        isCustomSvg: true,
        guard: ['ADMIN']
      },
      component: () => import('/@/views/team/FoodMoveRule.vue')
    },
    {
      path: 'tool-box',
      name: 'ToolBox',
      meta: {
        title: '工具箱管理',
        icon: 'apply',
        isCustomSvg: true,
        guard: ['ADMIN']
      },
      component: () => import('/@/views/team/ToolBox.vue')
    },
    {
      path: 'system-config',
      name: 'SystemConfig',
      meta: {
        title: '系统设置',
        icon: 'apply',
        isCustomSvg: true,
        guard: ['ADMIN']
      },
      component: () => import('/@/views/team/SystemConfig.vue')
    }
  ]
}

export default routerConfig

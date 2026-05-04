import Layout from '/@vab/layouts/index.vue'

const routerConfig: VabRouteRecord = {
  path: '/user-operate',
  name: 'UserOperate',
  component: Layout,
  meta: {
    title: '用户运营',
    icon: 'team-fill'
  },
  children: [
    {
      path: 'users',
      name: 'UserOperateUserList',
      component: () => import('/@/views/userOperate/UserList.vue'),
      meta: {
        title: '用户列表',
        icon: 'user-3-line'
      }
    },
    {
      path: 'stores',
      name: 'UserOperateStoreList',
      component: () => import('/@/views/userOperate/StoreList.vue'),
      meta: {
        title: '门店列表',
        icon: 'store-2-line'
      }
    },
    {
      path: 'todos',
      name: 'UserOperateTodoList',
      component: () => import('/@/views/userOperate/TodoList.vue'),
      meta: {
        title: '待办列表',
        icon: 'task-line'
      }
    }
  ]
}

export default routerConfig

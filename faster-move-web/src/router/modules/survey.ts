import Layout from '/@vab/layouts/index.vue'

const routerConfig: VabRouteRecord = {
  path: '/survey',
  name: 'Survey',
  component: Layout,
  meta: {
    title: '店铺调研',
    icon: 'survey',
    isCustomSvg: true,
    guard: ['ADMIN', 'AGENCY']
  },
  children: [
    {
      path: 'mt-survey',
      name: 'MtSurvey',
      component: () => import('/@/views/survey/IntegralMt.vue'),
      meta: {
        title: '美团外卖',
        icon: 'mt',
        levelHidden: true,
        isCustomSvg: true,
        type: 1,
      },
    },
    {
      path: 'elm-survey',
      name: 'ElmSurvey',
      component: () => import('/@/views/survey/IntegralElm.vue'),
      meta: {
        title: '饿了么',
        icon: 'elm',
        levelHidden: true,
        isCustomSvg: true,
        type: 2,
      },
    },
    {
      path: 'jd-survey',
      name: 'JdSurvey',
      component: () => import('/@/views/survey/IntegralJd.vue'),
      meta: {
        title: '京东到家',
        icon: 'jd-home',
        levelHidden: true,
        isCustomSvg: true,
        type: 6,
      },
    },
  ]
};
export default routerConfig;
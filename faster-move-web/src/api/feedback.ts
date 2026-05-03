import request from '/@/utils/request'

export const getListOrderByCtime = (params: any) => {
  return request({
    url: '/system/business/calendar/getlistorderbyctime',
    method: 'get',
    params
  })
}

export const getHomeData = () => {
  return request({
    url: '/homedata/v2/gethomedata',
    method: 'get'
  })
}

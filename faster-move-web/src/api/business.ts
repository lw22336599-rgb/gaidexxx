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

export const addFeedback = (data: any) => {
  return request({
    url: '/feedback/addfeedback',
    method: 'post',
    data
  })
}

export const addCalendar = (data: any) => {
  return request({
    url: '/system/business/calendar/add',
    method: 'post',
    data,
  })
}

export const editCalendar = (data: any) => {
  return request({
    url: '/system/business/calendar/update',
    method: 'post',
    data,
  })
}

export const delCalendar = (id: any) => {
  return request({
    url: `/system/business/calendar/delete?id=${id}`,
    method: 'post',
  })
}

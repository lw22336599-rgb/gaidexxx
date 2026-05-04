import request from '/@/utils/request'

export const getLogBalance = (params: any) => {
  return request({
    url: '/logcontrolller/getlogbalance',
    method: 'get',
    params
  })
}

export const giveIntegral = (data: any) => {
  return request({
    url: '/admin/giveintegral',
    method: 'post',
    data
  })
}

export const changefromold_http = () => {
  return request({
    url: '/fdmvmanager/changefromold',
    method: 'post'
  })
}

export const getAdminList = (data: any) => {
  return request({
    url: '/admingroup/getadminlist',
    method: 'post',
    data
  })
}

export const addGroup = (data: any) => {
  return request({
    url: '/group/addgroup',
    method: 'post',
    data
  })
}

export const updateGroup = (data: any) => {
  return request({
    url: `/group/updategroup`,
    method: 'post',
    data
  })
}

export const delGroup = (id: any) => {
  return request({
    url: `/group/deletegroup?id=${id}`,
    method: 'post'
  })
}

export const updateAgency = (data: any) => {
  return request({
    url: `/admin/updateagency`,
    method: 'post',
    data
  })
}
export const addUser = (data: any) => {
  const { is_boss, phone } = data
  return request({
    url: `/admin/adduser?phone=${phone}&is_boss=${is_boss}`,
    method: 'post'
  })
}

export const connectGroup = (data: any) => {
  return request({
    url: `/admingroup/connectgroup`,
    method: 'post',
    data
  })
}

export const linkShopGroup = (data: any) => {
  return request({
    url: `/admingroup/linkshopgroup`,
    method: 'post',
    data
  })
}

export const getCourseGroups = () => {
  return request({
    url: `/course/getgroups`,
    method: 'get'
  })
}

export const getCourseCourses = (params: any) => {
  return request({
    url: `/course/getcourses`,
    method: 'get',
    params
  })
}

export const getMsg = (params: any) => {
  return request({
    url: `/bossmsg/getmsg`,
    method: 'get',
    params
  })
}

export const getFeedback = (params: any) => {
  return request({
    url: `/feedback/getfeedback`,
    method: 'get',
    params
  })
}

export const getTeamInfo = () => {
  return request({
    url: `/teaminfo/getteaminfo`,
    method: 'get'
  })
}

export const saveTeamInfo = (data: any) => {
  return request({
    url: `/teaminfo/saveteaminfo`,
    method: 'post',
    data
  })
}

export const delMsg = (id: any) => {
  return request({
    url: `/bossmsg/deletemsg?id=${id}`,
    method: 'post'
  })
}

export const setRead = (data: any) => {
  const { id, is_read } = data
  return request({
    url: `/feedback/setread?id=${id}&is_read=${is_read}`,
    method: 'post'
  })
}

export const addMsg = (data: any) => {
  return request({
    url: `/bossmsg/addmsg`,
    method: 'post',
    data
  })
}

export const addCourse = (data: any) => {
  return request({
    url: `/course/addcourse`,
    method: 'post',
    data
  })
}

export const updateCourse = (data: any) => {
  return request({
    url: `/course/updatecourse`,
    method: 'post',
    data
  })
}

export const delCourse = (id: any) => {
  return request({
    url: `/course/deletecourse?id=${id}`,
    method: 'post'
  })
}

export const getBindShopList = (params: any) => {
  return request({
    url: `/shopusergroup/getshoplist`,
    method: 'get',
    params
  })
}

export const removeGroup = (data: any) => {
  return request({
    url: `/shopusergroup/removegroup`,
    method: 'post',
    data
  })
}

export const connectShopUserGroup = (data: any) => {
  return request({
    url: `/shopusergroup/connectgroup`,
    method: 'post',
    data
  })
}

export const connectShopUserRemoveGroup = (data: any) => {
  return request({
    url: `/shopusergroup/removegroup`,
    method: 'post',
    data
  })
}

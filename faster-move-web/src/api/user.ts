import { loginRSA } from '/@/config'
import { encryptedData } from '/@/utils/encrypt'
import request from '/@/utils/request'

export const login = async (data: any) => {
  if (loginRSA) data = { ...data, pwd: await encryptedData(data) }
  return request({
    url: '/admin/agencylogin',
    method: 'post',
    data
  })
}

export const getUserInfo = () => {
  return request({
    url: '/admin/getagencyinfo',
    method: 'get'
  })
}

//获取当前用户的用户表信息
export const getUserBaseInfo = () => {
  return request({
    url: '/admin/GetUserBaseInfo',
    method: 'get'
  })
}
export const logout = () => {
  return request({
    url: '/logout',
    method: 'get'
  })
}

export const register = (data: any) => {
  return request({
    url: '/admin/agencyreg',
    method: 'post',
    data
  })
}

export const password = (data: any) => {
  return request({
    url: '/admin/agencyforget',
    method: 'post',
    data
  })
}

export const lock = () => {
  return request({
    url: '/lock',
    method: 'get'
  })
}

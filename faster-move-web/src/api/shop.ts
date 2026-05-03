
import { ShopType } from '../types/shop'
import request from '/@/utils/request'

export const getShop = (data: any) => {
  return request({
    url: '/shopmg/getshoplistall',
    method: 'post',
    data
  })
}
export const getShopFdmv = (data: any) => {
  return request({
    url: '/shopmg/getshoplist',
    method: 'post',
    data
  })
}
export const getShopV2 = (data: any) => {
  return request({
    url: '/shopmg/v2/getshoplist',
    method: 'post',
    data
  })
}

export const getGroup = (params: any) => {
  return request({
    url: '/group/getgroups',
    method: 'get',
    params
  })
}

export const getCity = () => {
  return request({
    url: '/system/service/getprovincewithcitys',
    method: 'get'
  })
}

export const getFuncCount = (params: any) => {
  return request({
    url: '/shopmg/getfunccount',
    method: 'get',
    params
  })
}

export const recoverBindShop = (data: any) => {
  return request({
    url: '/shopmg/recoverbindshop',
    method: 'post',
    data
  })
}

export const bindShop = (code: any) => {
  return request({
    url: `/shopmg/bindshop?code=${code}`,
    method: 'post'
  })
}

export const updateShopMsg = (data: any) => {
  return request({
    url: `/shopmg/updateshop`,
    method: 'post',
    data
  })
}

export const createBindCode = (id: any) => {
  return request({
    url: `/shopmg/createbindingcode?shopid=${id}`,
    method: 'post'
  })
}

export const setShopIsTop = (data: any) => {
  const { shop, top } = data
  return request({
    url: `/shopmg/setshoptop?shop=${shop}&top=${top}`,
    method: 'post',
  })
}

export const getFunctionPriceList = (params: any) => {
  return request({
    url: `/functionprice/getfunctionprices`,
    method: 'get',
    params
  })
}

export const payForShopFunc = (data: any) => {
  return request({
    url: `/functionprice/payforshopfunc`,
    method: 'post',
    data
  })
}

export const enableFunc = (data: any) => {
  return request({
    url: `/functionuser/enable_func`,
    method: 'post',
    data
  })
}

export const setConf = (data: any) => {
  return request({
    url: `/functionuser/setconf_func`,
    method: 'post',
    data
  })
}

export const getConf = (params: any) => {
  return request({
    url: `/functionuser/getfuncinfo`,
    method: 'get',
    params
  })
}

export const getConfLog = (data: any) => {
  return request({
    url: `/functionuser/getlog`,
    method: 'post',
    data
  })
}

export const unBindShop = (data: any) => {
  return request({
    url: `/shopmg/unbindshop`,
    method: 'post',
    data
  })
}

export const getConfFunc = (data: any) => {
  return request({
    url: `/functionuser/getconf_func`,
    method: 'post',
    data
  })
}

export const getFuncCall = (data: any) => {
  return request({
    url: `/functionuser/call`,
    method: 'post',
    data
  })
}

export const getGifListData = (data: any) => {
  return request({
    url: `/foodgif/getgiflist`,
    method: 'post',
    data
  })
}

// 图片上传
export const filerequ = (data: any): Promise<{ url: string }> => {
  return request({
    url: '/system/method/file/upload',
    method: 'post',
    headers: {
      "Content-Type": "multipart/form-data"
    },
    data
  })
}

export const addShop = (data: any) => {
  return request({
    url: `/shopmg/addshop`,
    method: 'post',
    data
  })
}

// 更新店铺运营信息
export const updateShopExtra = (data: any) => {
  return request({
    url: '/shopmg/updateshopextra',
    method: 'post',
    data,
  })
}

export const getShopListHas = (data: any) => {
  return request({
    url: `/shopusergroup/getshoplisthas`,
    method: 'POST',
    data
  })
}

export const getMyFunctions = () => {
  return request({
    url: `/admin/getmyfunctions`,
    method: 'get'
  })
}
export const getMyFunctionsV2 = (params: any) => {
  return request({
    url: `/admin/v2/getmyfunctions`,
    method: 'get',
    params
  })
}
export const setconf_func = (data: any) => {
  return request({
    url: '/functionuser/setconf_func',
    method: 'post',
    data
  })
}

export const payForAdminFunc = (data: any) => {
  return request({
    url: `/functionprice/payforadminfunc`,
    method: 'post',
    data
  })
}
export const getpagelist = (params: any) => {
  return request({
    url: '/chatmg/getpagelist',
    method: 'get',
    params
  })
}
// 获取搬菜服务器
// 已废弃：请使用 apiManager.fdmvmanagerApi.CreateClient 替代
// export const createclient = (data: any) => {
//   return request({
//     url: '/fdmvmanager/createclient',
//     method: 'post',
//     data
//   })
// }
// 关闭
// export const disposetask=(taskid:any)=>{
//   return request({
//     url:`/foodmove/disposetask?taskid=${taskid}`,
//     method:'post',
//   })
// }
// /fdmvmanager/queryshops?words=冒碳五
// 已废弃：请使用 apiManager.fdmvmanagerApi.QueryShops 替代
// export const queryshops = (words: any, newShopType: ShopType) => {
//   return request({
//     url: `/fdmvmanager/queryshops?words=${words}&newShopType=${newShopType}`,
//     method: 'get',
//   })
// }

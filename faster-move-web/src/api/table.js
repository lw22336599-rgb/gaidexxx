import request from '../utils/request'

const Apis = {
  home: {
    metadata: '/homedata/gethomedata', //首页信息
  },
  user: {
    login: '/admin/agencylogin', //登录
    register: '/admin/agencyreg',//注册
    agencyforget: '/admin/agencyforget' //忘记密码
  },
  agent: {
    info: '/admin/getagencyinfo',  // 代理信息
    balance: '/admin/giveintegral', // 分配积分
    update: '/admin/updateagency', // 更新代理信息,
    group: {
      related: '/admingroup/connectgroup'
    }
  },
  shop: {
    get: {
      'list': '/shopmg/getshoplist', // 店铺列表
      "v2list": "/shopmg/v2/getshoplist",//运营版
      'list_by_group': '/shopusergroup/getshoplist', // 获取分组门店列表
      'group': '/group/getgroups',   // 店铺分组,
      'related': '/shopusergroup/getshoplisthas', // 分组关联门店列表
      'function': '/functionuser/getfuncinfo', // 获取功能信息
      'function_config': '/functionuser/getconf_func', // 获取功能配置
      'function_log': '/functionuser/getlog',
      'function_price': '/functionprice/getfunctionprices', // 获取功能价格
      'goods': '/functionuser/call',
      'gif': '/foodgif/getgiflist',
      'getfunccount': '/shopmg/getfunccount'
    },
    set: {
      'group': '/group/addgroup',
      'group_update': '/group/updategroup',
      'relate': '/shopusergroup/connectgroup',
      'related': '/admingroup/linkshopgroup',
      'function_config': '/functionuser/setconf_func',
      'function_enable': '/functionuser/enable_func',
    },
    remove: {
      group: '/group/deletegroup', //移除分组
      group_by_shop: '/shopusergroup/removegroup' //从分组移除店铺
    },
    renew: '/functionprice/payforshopfunc', // 续费功能
    bind: '/shopmg/bindshop', // 绑定店铺
    unbind: '/shopmg/unbindshop',
    recovery: '/shopmg/recoverbindshop',
    bind_query: '/shopmg/createbindingcode', // 店铺绑定查询
    add: '/shopmg/loginshop',
    update: '/shopmg/updateshop', // 更新店铺信息
    addshop: "/shopmg/addshop",
    team: {
      member: '/admingroup/getadminlist' // 获取团队成员
    },
    setshoptop: '/shopmg/setshoptop' // 店铺置顶和取消置顶
  },
  apps: {
    list: '/functionapp/getfunclist',
    update: '/functionapp/updatefunction',
    calendar: ''
  },
  course: {
    category: '/course/getgroups',
    add: '/course/addcourse',
    del: '/course/deletecourse',
    update: '/course/updatecourse',
    list: '/course/getcourses'
  },
  feedback: {
    list: '/feedback/getfeedback',
    add: '/feedback/addfeedback',
    del: '/feedback/deletefeedback',
    update: '/feedback/setread'
  },
  file: {
    upload: '/system/method/file/upload',
  },
  team: {
    info: '/teaminfo/getteaminfo',
    update: '/teaminfo/saveteaminfo'
  },
  message: {
    add: '/bossmsg/addmsg',
    update: '/bossmsg/updatemsg',
    del: '/bossmsg/deletemsg',
    list: '/bossmsg/getmsg'
  },
  log: {
    balance: '/logcontrolller/getlogbalance' // 获取余额变动日志
  }
};
export function getAccessToken() {
  if (window.electron.getCfg('token')) {
    return "Bearer " + window.electron.getCfg('token');
  }
}
export function getApi(name) {
  let uri = 'Apis.' + name;
  let url = null;
  if (name) {
    try {
      url = eval(uri);
    } catch (error) {
    }
  }
  return url;
}
// 通用 （登录√）
export function allrequest(data) {
  return request({
    url: '/admin/agencylogin',
    method: 'post',
    data,
  })
}
export function apis(method, uri, data = null, params = null, headers = {}) {
  method = method == 'POST' ? 'POST' : 'GET';
  const isGet = method == 'GET';

  // 使用对象路径获取 URL
  const getUrlFromPath = (path) => {
    const parts = path.split('.');
    let current = Apis;
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return null;
      }
    }
    return current;
  };

  const url = uri ? getUrlFromPath(uri) : null;

  if (!url) {
    console.error(`API endpoint not found for uri: ${uri}`);
    return Promise.reject(new Error(`API endpoint not found for uri: ${uri}`));
  }

  const options = {
    url,
    method: method.toLowerCase(),
    headers,
  };

  if (isGet) {
    options.params = data || params;
  } else {
    options.params = params;
    options.data = data;
  }

  return request(options);
}
// pc端接口
// 1获取已完成和未完成数量√
// 2更新记录√
// 3月成员排行
// 积分
// 成员
// 店铺
//
export function pcrequest() {
  return request({
    url: '/homedata/gethomedata',
    method: 'get',
    // data,
  })
}

// 更新店铺运营信息
export function updateShopExtra(data) {
  return request({
    url: '/shopmg/updateshopextra',
    method: 'post',
    data,
  })
}

export function pcrequestv2() {
  return request({
    url: '/homedata/v2/gethomedata',
    method: 'get',
    // data,
  })
}

//获取店铺分享数据
export function getshare(storeId) {
  return request({
    url: `/system/service/wmt/shop/share/getshareinfo?shopid=${storeId}`,
    method: 'get',
  })
}
//保存分享配置
export function createShare(data) {
  return request({
    url: '/system/service/wmt/shop/share/saveshareinfo',
    method: 'post',
    data,
  })
}

//首页列表查询倒叙√
export function getlistorderbyctime(params) {
  return request({
    url: `/system/business/calendar/getlistorderbyctime`,
    method: 'get',
    params
  })
}
//  增加事项√
export function addcalendar(data) {
  return request({
    url: '/system/business/calendar/add',
    method: 'post',
    data,
  })
}
//  更改事项√
export function editcalendar(data) {
  return request({
    url: '/system/business/calendar/update',
    method: 'post',
    data,
  })
}
//  删除√
export function deletecalendar(id) {
  return request({
    url: `/system/business/calendar/delete?id=${id}`,
    method: 'post',
  })
}
//  城市列表
export function getprovincewithcitys(params) {
  return request({
    url: `/system/service/getprovincewithcitys`,
    method: 'get',
    params
  })
}
//  分组列表
export function gettagpagelist(params) {
  return request({
    url: `/system/service/wmt/tag/gettagpagelist`,
    method: 'get',
    params
  })
}
//  新增分组
export function addtag(data) {
  return request({
    url: `/system/service/wmt/tag/addtag`,
    method: 'post',
    data,
  })
}
//  编辑分组
export function updatetag(data) {
  return request({
    url: `/system/service/wmt/tag/updatetag`,
    method: 'post',
    data,
  })
}
//  删除
export function deletetag(id) {
  return request({
    url: `/system/service/wmt/tag/deletetag?id=${id}`,
    method: 'post',
  })
}
//  标签门店
export function getshoptaglist(params) {
  return request({
    url: `/system/service/wmt/shop/tag/getshoptaglist`,
    method: 'get',
    params
  })
}
export function getshoplist(params) {
  return request({
    url: `/system/service/wmt/shop/tag/getshoplist`,
    method: 'get',
    params
  })
}
//  解邦店铺标签
export function unbindshoptag(tetx) {
  return request({
    url: `/system/service/wmt/shop/tag/unbindshoptag?${tetx}`,
    method: 'post',
  })
}
export function bindshoptag(tetx) {
  return request({
    url: `/system/service/wmt/shop/tag/bindshoptag?${tetx}`,
    method: 'post',
  })
}
// 图片上传
export function filerequ(data) {
  return request({
    url: '/system/method/file/upload',
    method: 'post',
    headers: {
      "Content-Type": "multipart/form-data"
    },
    data
  })
}
// 分组列表
export function getgrouppagelist(params) {
  return request({
    url: `/system/service/wmt/group/getgrouppagelist`,
    method: 'get',
    params
  })
}
//  添加分组
export function addgroup(data) {
  return request({
    url: `/system/service/wmt/group/addgroup`,
    method: 'post',
    data,
  })
}
//  更新组
export function updategroup(data) {
  return request({
    url: `/system/service/wmt/group/updategroup`,
    method: 'post',
    data,
  })
}
//  删除分组

export function deletegroup(tetx) {
  return request({
    url: `/system/service/wmt/group/deletegroup?id=${tetx}`,
    method: 'post',
  })
}
//  获取分组下的子账号列表
export function getgroupadminlist(params) {
  return request({
    url: `/system/service/wmt/admin/group/getgroupadminlist`,
    method: 'get',
    params
  })
}
export function getlist(params) {
  return request({
    url: `/system/service/wmt/admin/tag/getlist`,
    method: 'get',
    params
  })
}
export function changegroup({ admin, group }) {
  return request({
    url: `/system/service/wmt/admin/group/changegroup?admin=${admin}&tag=${group}`,
    method: 'post',
  })
}
export function updateadmintag(text) {
  return request({
    url: `/system/service/wmt/admin/tag/updateadmintag?${text}`,
    method: 'post',
  })
}
export function addchild(data) {
  return request({
    url: `/system/service/wmt/admin/group/addchild`,
    method: 'post',
    data,
  })
}
export function groupdelete({ admin, group }) {
  return request({
    url: `/system/service/wmt/admin/group/deletegroup?group=${group}&admin=${admin}`,
    method: 'post',
  })
}
export function deleteadmintag(text) {
  return request({
    url: `/system/service/wmt/admin/tag/deleteadmintag?${text}`,
    method: 'post',
  })
}
export function GetNoGroupAdminList(params) {
  return request({
    url: `/system/service/wmt/admin/group/GetNoGroupAdminList`,
    method: 'get',
    params
  })
}
export function adminaddgroup(text) {
  return request({
    url: `/system/service/wmt/admin/group/addgroup?${text}`,
    method: 'post',
  })
}
export function addlist(text) {
  return request({
    url: `/system/service/wmt/admin/tag/addlist?${text}`,
    method: 'post',
  })
}
export function addShop(parms) {
  return request({
    url: `/shopmg/addshop`,
    method: 'post',
    data: parms
  })
}
export function addUser(data) {
  const {is_boss, phone} = data
  return request({
    url: `/admin/adduser?phone=${phone}&is_boss=${is_boss}`,
    method: 'post'
  })
}

export function getMyFunctions() {
  return request({
    url: `/admin/getmyfunctions`,
    method: 'get'
  })
}

export function payForAdminFunc(data) {
  return request({
    url: `/functionprice/payforadminfunc`,
    method: 'post',
    data
  })
}
//获取功能配置

export function getShopFuncConf(funcCode, shopId) {
  return request({
    url: `/functionuser/getconf_func`,
    method: 'post',
    data: {
      "code": funcCode,
      "shop": shopId
    }
  })
}

//启用或关闭功能
export function enableFunc(funcCode, enableVal, shopid) {
  return request({
    url: `/functionuser/enable_func`,
    method: 'post',
    data: {
      "code": funcCode,
      "enable": enableVal,
      "shop": shopid
    }
  })
}

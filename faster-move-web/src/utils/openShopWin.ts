import { gp } from '/@vab/plugins/vab.ts'
import { apiManager } from '/@/TsModel/Api/ApiManager'

/**
 * 打开店铺入口方法（带授权状态校验）
 * 这里不会直接使用行内的 cookies，而是通过后端接口实时获取最新 cookies
 */
export const openWindow = async (row: any) => {
  if (row.state && row.state === 3) {
    gp.$baseMessage('店铺授权失效请修复!', 'error', 'hey')
    return
  }
  await openWindowShop(row)
}

/**
 * 店铺复制等功能共用的打开店铺入口（同样先通过接口获取 cookies）
 */
export const openShopWindow = async (row: any) => {
  if (row.state && row.state === 3) {
    gp.$baseMessage('店铺授权失效请修复!', 'error', 'hey')
    return
  }
  await openWindowShop(row)
}

/**
 * 真实打开店铺的方法
 * 先通过 ShopMgApi.GetShopCk 根据店铺主键获取 cookies，再根据平台类型选择对应后台地址
 * 使用独立窗口集中管理多个店铺后台
 */
const openWindowShop = async (row: any) => {
  // 检查是否为饿了么复制版（shop_type = 8），该类型不支持打开后台
  if (row.shop_type === 8) {
    gp.$baseMessage('饿了么复制版不支持打开后台，请使用饿了么餐饮绑定店铺', 'warning', 'hey')
    return
  }

  // 通过后端接口获取最新 cookies（后端已不再返回行内 cookies）
  if (row && row.id) {
    // GetShopCk 返回的是字符串，这里直接覆盖到 row.cookies 上
    row.cookies = await apiManager.shopmgApi.GetShopCk(String(row.id))
  }

  row.cookies = removeStartEnd(row.cookies)

  const electronApi = (globalThis as any).electron

  // 检查是否支持新的店铺后台管理器
  if (electronApi?.openShopBackendManager) {
    // 使用新的店铺后台管理器（集中管理多个店铺）
    electronApi.openShopBackendManager({
      id: row.id,
      name: row.name,
      office_id: row.office_id,
      shop_type: row.shop_type,
      cookies: row.cookies
    })
  } else {
    // 降级方案：使用原有的独立窗口方式
    if (row.shop_type === 1) {
      // 美团外卖
      electronApi.openWin('https://e.waimai.meituan.com', row.office_id, row.cookies, row.name, undefined, row.shop_type)
    } else if (row.shop_type === 3) {
      // 美团闪购
      electronApi.openWin('https://shangoue.meituan.com', row.office_id, row.cookies, row.name, undefined, row.shop_type)
    } else if (row.shop_type === 4) {
      // 美团医药
      electronApi.openWin('https://yiyao.meituan.com/main/frame', row.office_id, row.cookies, row.name, undefined, row.shop_type)
    } else if (row.shop_type == 2) {
      // 饿了么外卖
      electronApi.openWin(
        `https://melody.shop.ele.me/app/shop/${row.office_id}/dashboard#app.shop.dashboard`,
        row.office_id,
        row.cookies,
        row.name,
        undefined,
        row.shop_type
      )
    } else if (row.shop_type === 5) {
      // 饿百零售：需要拆解 cookies 组装成浏览器使用的数据结构
      const out: {
        url: string
        name: string
        value: string
        domain: string
      }[] = []
      const jar = parseCookie(row.cookies)
      for (const [key, value] of jar) {
        if (key === `cna`) {
          continue
        }
        out.push({
          url: 'https://nr.ele.me',
          name: encodeURIComponent(key),
          value: encodeURIComponent(value),
          domain: '.ele.me'
        })
      }
      electronApi.openWin('https://nr.ele.me', row.office_id, row.cookies, row.name, JSON.stringify(out), row.shop_type)
    } else if (row.shop_type == 6) {
      // 京东到家
      electronApi.openWin(`https://store.jddj.com`, row.office_id, row.cookies, row.name, undefined, row.shop_type)
    } else if (row.shop_type == 7) {
      // 抖店即时零售
      electronApi.openWin('https://jsls.jinritemai.com', row.office_id, row.cookies, row.name, undefined, row.shop_type)
    }
  }
}
const removeStartEnd = (str: any) => {
  if (str && str.length > 0) {
    if (str.charAt(0) == '"') {
      str = str.substring(1)
    }
    if (str.at(-1) == '"') {
      str = str.substring(0, str.length - 1)
    }
  }
  return str
}

const parseCookie = (cookie: string) => {
  const map = new Map<string, string>()
  for (const item of cookie.split(/\s*;\s*/)) {
    if (item.length === 0) {
      continue
    }
    const [key, value] = <(string | undefined)[]>item.split(/\s*=\s*/)
    if (key === undefined || value === undefined || key.length === 0) {
      continue
    }
    map.set(decodeURIComponent(key), decodeURIComponent(value))
  }
  return map
}

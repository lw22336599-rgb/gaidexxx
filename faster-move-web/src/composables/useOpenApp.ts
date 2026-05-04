import { ref, computed } from 'vue'
import { addShop, getShop } from '/@/api/shop.ts'
import { gp } from '/@vab/plugins/vab.ts'

export function useOpenApp() {
  const openApp = (name: any, shop_type: number) => {
    const invokeMap: Record<number, string> = {
      1: 'open-mt-wm',
      2: 'open-elm-wm',
      3: 'open-mt-wm',
      4: 'open-mt-wm',
      5: 'open-elm-retail',
      6: 'open-jd-home',
      7: 'open-dy-retail',
      8: 'open-elm-wm',
      1000: 'open-mt-groupbuy',
      1001: 'open-jd-home',
      1002: 'open-dy-tuangou-capture'
    }
    const params = {
      name: name || '',
      shop_type: shop_type
    }
    return new Promise((resolve, reject) => {
      globalThis.electron.openBrowser(invokeMap[shop_type], params, async (res: any) => {
        const data = {
          shop_type: params.shop_type,
          // shop_user: res?.info?.u,
          // shop_pwd: res?.info?.p,
          shop_user: '',
          shop_pwd: '',
          cookies: res.cookies
        }
        addShop(data).then((res1: any) => {
          if (res1.code === 200) {
            if (params.name) {
              // gp.$baseMessage('店铺修复成功!', 'success', 'hey')
            } else {
              // gp.$baseMessage('店铺添加成功!', 'success', 'hey')
              // showShopMsg.value = {
              //   name: res1.data.name,
              //   office_id: res1.data.office_id,
              //   shop_type: params.shop_type,
              //   // shop_user: res?.info?.u,
              //   // shop_pwd: res?.info?.p,
              //   shop_user: '',
              //   shop_pwd: '',
              //   cookies: res.cookies,
              //   reset_power: false
              // }
              // showShopMsgState.value = true
              // isBind.value = false
            }
            // getShopList()
            resolve(res1)
          } else {
            reject(res1)
          }
        })
      })
    })
  }

  return {
    openApp
  }
}

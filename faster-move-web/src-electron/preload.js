const { contextBridge, ipcRenderer } = require('electron')
const logger = require('electron-log')
const zlib = require('zlib');
contextBridge.exposeInMainWorld('electron', {
  // 添加店铺
  openBrowser(type, row, callback) {
    ipcRenderer.invoke(type, row).then(res => {
      if (res) {
        callback(res)
      }
    })
  },
  opennewurl: (url, name) => ipcRenderer.invoke('openurl', url, name),
  openDownLink: url => ipcRenderer.invoke('openurl', url),
  openWin: async (url, id, cookie, name, cookie2, shopType) => {
    const partition = `persist:${id}`
    let ckStr = cookie
    let ckObj = {}
    let cs = ckStr.split(';')
    for (const c_ of cs) {
      let c = c_.split('=')
      let key = c[0]
      let val = c[1]
      if (key.trim() !== '') {
        ckObj[key] = val.trim()
      }
    }
    // 先清空该 partition 下的所有 cookies
    await ipcRenderer.invoke('clear-cookies', partition, '*')
    if (ckStr.includes('ksid')) {
      await ipcRenderer.invoke('win_elm', url, partition, name, ckStr, id, shopType)
      return
    }
    let ebsshow = url.indexOf('https://nr.ele.me')
    if (cookie !== undefined) {
      if (ebsshow != -1) {
        logger.info(1)
        await ipcRenderer.invoke('set-cookie2', partition, url, cookie2)
      } else {
        logger.info(2)
        await ipcRenderer.invoke('set-cookie', partition, url, cookie)
      }
    }
    let show = url.indexOf('https://store.jddj.com')
    if (show != -1) {
      logger.info('to open jd......................................................:');
      logger.info(3)
      // 京东到家主要域名
      await ipcRenderer.invoke('set-cookie', partition, 'https://store.jddj.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://order.jddj.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://stock-store.jddj.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://sff.jddj.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://vender-center.jddj.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://kunce-store.jddj.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://pjsj.jddj.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://pms-store.jddj.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://jzt.jddj.com/*', cookie)

      // 京东主域名及营销活动域名（包括品牌饭卡等）
      await ipcRenderer.invoke('set-cookie', partition, 'https://trade.m.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://trade.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://api.m.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://log-o2o.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://wl.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://storage.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://fin-jdm.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://jra.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://sff.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://stream-outside.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://sso.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://uranus.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://cactus.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://passport.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://sgm-w.jd.com/*', cookie)

      // 京东CDN静态资源域名（图片、样式等）
      await ipcRenderer.invoke('set-cookie', partition, 'https://storage.360buyimg.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://img30.360buyimg.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://img.360buyimg.com/*', cookie)

      // 通配符域名（兜底）
      await ipcRenderer.invoke('set-cookie', partition, 'https://*.jd.com/*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://*.jddj.com/*', cookie)

      // API接口
      await ipcRenderer.invoke(
        'set-cookie',
        partition,
        'https://sff.jddj.com/api?v=1.0&appId=YNE4XWZFDHXOYGKZU5FN&api=dsm.login.o2o.gateway.set.clientCookie',
        cookie
      )
      await ipcRenderer.invoke(
        'set-cookie',
        partition,
        'https://sff.jddj.com/api?v=1.0&appId=YNE4XWZFDHXOYGKZU5FN&api=dsm.login.o2o.vender.user.getCaptcha',
        cookie
      )
    }
    let dyshow = url.indexOf('https://jsls.jinritemai.com')
    if (dyshow != -1) {
      logger.info(4)
      // https://fxg.jinritemai.com/sif/ https://mon.zijieapi.com
      // https://fxg.jinritemai.com/ecomauth/loginv1/sso_mode
      // https://fxg.jinritemai.com/ecomauth/loginv1/get_login_subject
      // https://doudian-sso.jinritemai.com/aff/check_login
      // https://doudian-sso.jinritemai.com/aff/check_login/
      // https://fxg.jinritemai.com/ttwid/check/
      // https://fxg-sso.jinritemai.com/aff/check_login
      // https://doudian-sso.jinritemai.com/account_login
      // https://fxg.jinritemai.com/index/login
      // https://fxg.jinritemai.com/passport/sso/login/callback
      // https://doudian-sso.jinritemai.com/account_login/v2
      // https://doudian-sso.jinritemai.com/passport/web/mobile/check_code
      // https://doudian-sso.jinritemai.com/aff/check_login
      // https://fxg-sso.jinritemai.com/aff/check_login/
      // https://jsls.jinritemai.com/passport/sso/aff/login/callback
      // https://doudian-sso.jinritemai.com/aff/subject/login
      // await ipcRenderer.invoke(
      //   'set-cookie',
      //   partition,
      //   'https://doudian-sso.jinritemai.com/passport/web/mobile/check_code*',
      //   cookie
      // )
      // await ipcRenderer.invoke(
      //   'set-cookie',
      //   partition,
      //   'https://jsls.jinritemai.com/passport/sso/aff/login/callback*',
      //   cookie
      // )
      // await ipcRenderer.invoke('set-cookie', partition, 'https://doudian-sso.jinritemai.com/aff/subject/login*', cookie)
      // await ipcRenderer.invoke('set-cookie', partition, 'https://fxg-sso.jinritemai.com/aff/check_login/*', cookie)
      // await ipcRenderer.invoke('set-cookie', partition, 'https://fxg.jinritemai.com/ttwid/check*', cookie)
      // await ipcRenderer.invoke('set-cookie', partition, 'https://doudian-sso.jinritemai.com/aff/check_login/*', cookie)
      // await ipcRenderer.invoke('set-cookie', partition, 'https://doudian-sso.jinritemai.com/aff/check_login*', cookie)
      // await ipcRenderer.invoke('set-cookie', partition, 'https://fxg.jinritemai.com/ecomauth/loginv1/*', cookie)
      // await ipcRenderer.invoke('set-cookie', partition, 'https://mon.zijieapi.com/*', cookie)
      // await ipcRenderer.invoke('set-cookie', partition, 'https://doudian-sso.jinritemai.com/account_login*', cookie)
      // await ipcRenderer.invoke('set-cookie', partition, 'https://fxg.jinritemai.com/byteshop/*', cookie)
      // https://fxg.jinritemai.com/sif/
      // await ipcRenderer.invoke('set-cookie', partition, 'https://fxg.jinritemai.com/report/submit_fe_barrier', cookie)
      // await ipcRenderer.invoke('set-cookie', partition, 'https://fxg.jinritemai.com/ecomauth/loginv1/common_login_check*', cookie)
      await ipcRenderer.invoke('set-cookie', partition, 'https://fxg.jinritemai.com/login/*', cookie)
    }
    // let ebsshow=url.indexOf('https://nr.ele.me');
    // if(ebsshow!=-1){
    //   await ipcRenderer.invoke('set-cookie', partition, 'https://nrshop.ele.me/h5/mtop.ele.newretail.touch.notice.gettouchdomainlist*', cookie)
    //   await ipcRenderer.invoke('set-cookie', partition, 'https://nrshop.ele.me/h5/mtop.ele.newretail.ebai.accountreadmtopservice.getshopuserinfo*', cookie)
    // }
    logger.info(5)
    await ipcRenderer.invoke('win', url, partition, name, id, shopType)
  },
  setCookies: async (webContentsId, accStr, url) => {
    await ipcRenderer.invoke('set-cookie', webContentsId, url, accStr)
  },
  setCookies2: async (webContentsId, accStr, url) => {
    await ipcRenderer.invoke('set-cookie2', webContentsId, url, accStr)
  },
  clearCookies: async (partition, url) => {
    await ipcRenderer.invoke('clear-cookies', partition, url)
  },
  clearAllShopCache: async () => {
    return await ipcRenderer.invoke('clear-all-shop-cache')
  },
  onClearCacheProgress: (callback) => {
    const listener = (event, data) => {
      callback(data)
    }
    ipcRenderer.on('clear-cache-progress', listener)
    return () => ipcRenderer.off('clear-cache-progress', listener)
  },
  //br压缩
  brotliCompressBr: (data) => {

    const compressedData = zlib.brotliCompressSync(data);
    //return ipcRenderer.invoke('brotliCompress',   data)
    return compressedData;
  },
  httpPostFormN: (urlStr, postObjStr) => {
    return new Promise((resolve, reject) => {
      const postObj = JSON.parse(postObjStr)
      const https = require('node:https')
      const urlObj = new URL(urlStr)
      const reqOptions = {
        hostname: urlObj.host,
        port: 443,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // 根据需要设置正确的Content-Type
          Referer: urlStr // 设置Referer头
        }
      }
      const req = https.request(reqOptions, res => {
        let responseBuffer = ''
        res.on('data', chunk => {
          responseBuffer += chunk
        })
        res.on('end', () => {
          logger.info('responseBuffer:', responseBuffer)
          resolve(responseBuffer)
        })
      })
      // 监听错误事件
      req.on('error', e => {
        logger.info(`请求遇到问题: ${e.message}`)
        reject(e)
      })
      // 写入POST请求的数据
      const searchParams = new URLSearchParams(postObj)
      const postData = searchParams.toString()
      req.write(postData)
      // 结束请求
      req.end()
    })
  },
  downImage: url => ipcRenderer.invoke('download-image', url),
  startProxy: () => ipcRenderer.invoke('start-proxy'),
  stopProxy: () => ipcRenderer.invoke('stop-proxy'),
  // ==================== Frida 相关 API 开始 ====================
  // 启动 Frida 注入
  fridaInject: (config) => ipcRenderer.invoke('frida-inject', config),
  // 重启应用并注入
  fridaInjectWithRestart: (config) => ipcRenderer.invoke('frida-inject-restart', config),
  // 停止 Frida
  fridaStop: () => ipcRenderer.invoke('frida-stop'),
  // 监听 Frida 日志
  onFridaLog: callback => {
    const listener = (event, data) => {
      callback(data)
    }
    ipcRenderer.on('frida-log', listener)
    return () => ipcRenderer.off('frida-log', listener)
  },
  // ==================== Frida 相关 API 结束 ====================
  // 监听抖音团购商品详情 HTTP 请求进度（用于复制页展示）
  onDyTuanGouFetchProgress: callback => {
    const listener = (event, data) => callback(data)
    ipcRenderer.on('dy-tuangou-fetch-progress', listener)
    return () => ipcRenderer.off('dy-tuangou-fetch-progress', listener)
  },
  onDyTuanGouCollectingPrompt: callback => {
    const listener = (event, data) => callback(data)
    ipcRenderer.on('dy-tuangou-collecting-prompt', listener)
    return () => ipcRenderer.off('dy-tuangou-collecting-prompt', listener)
  },
  onDyTuanGouWindowState: callback => {
    const listener = (event, data) => callback(data)
    ipcRenderer.on('dy-tuangou-window-state', listener)
    return () => ipcRenderer.off('dy-tuangou-window-state', listener)
  },
  dyTuanGouClearLogin: () => ipcRenderer.invoke('dy-tuangou-clear-login'),
  /** 后端处理完 detail_web 后触发，开始采集商品详情 */
  dyTuanGouStartProductFetch: (payload) => ipcRenderer.invoke('dy-tuangou-start-product-fetch', payload),
  // 监听来自主进程的数据
  onReceiveInterceptedData: callback => {
    const listener = (event, data) => {
      callback(data)
    }
    ipcRenderer.on('intercepted-data', listener)
    // 返回一个函数，用于取消监听
    return () => ipcRenderer.off('intercepted-data', listener)
  },
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  createFolder: (folderPath, folderName) => ipcRenderer.invoke('create-folder', folderPath, folderName),
  createAndSaveExcel: (filePath, header, data, columnWidths) =>
    ipcRenderer.invoke('create-and-save-excel', filePath, header, data, columnWidths),
  createAndSaveExcelOperate: (
    filePath,
    header1,
    headerRow1,
    columnWidths1,
    header2,
    headerRow2,
    columnWidths2,
    data1,
    data2
  ) =>
    ipcRenderer.invoke(
      'create-and-save-excel-operate',
      filePath,
      header1,
      headerRow1,
      columnWidths1,
      header2,
      headerRow2,
      columnWidths2,
      data1,
      data2
    ),
  downloadImageFile: (imageUrl, destinationFolderPath, imageName) =>
    ipcRenderer.invoke('download-image-file', imageUrl, destinationFolderPath, imageName),
  getDefaultExportPath: () => ipcRenderer.invoke('get-default-export-path'),
  pathMontage: pathArr => ipcRenderer.invoke('get-path-montage', pathArr),
  openNewWindowUrl: (url) => ipcRenderer.invoke('open-new-window-url', url),
  // 添加窗口焦点事件监听
  onWindowFocus: (callback) => {
    const listener = () => callback()
    ipcRenderer.on('window-focus', listener)
    return () => ipcRenderer.off('window-focus', listener)
  },
  onWindowBlur: (callback) => {
    const listener = () => callback()
    ipcRenderer.on('window-blur', listener)
    return () => ipcRenderer.off('window-blur', listener)
  },
  // 打开手动授权窗口
  openAuthWindow: (params) => {
    return ipcRenderer.invoke('open-auth-window', params)
  },
  // 监听添加店铺请求（由主进程发起）
  onAddShopRequest: (callback) => {
    ipcRenderer.on('add-shop-request', (event, data) => {
      callback(data)
    })
  },
  // 发送添加店铺响应
  sendAddShopResponse: (channel, response) => {
    ipcRenderer.send(channel, response)
  },
  // 监听更新可用通知
  onUpdateAvailable: (callback) => {
    const listener = (event, data) => {
      callback(data)
    }
    ipcRenderer.on('update-available', listener)
    return () => ipcRenderer.off('update-available', listener)
  },
  // 监听更新下载进度
  onUpdateDownloadProgress: (callback) => {
    const listener = (event, data) => {
      callback(data)
    }
    ipcRenderer.on('update-download-progress', listener)
    return () => ipcRenderer.off('update-download-progress', listener)
  },
  // 监听更新错误
  onUpdateError: (callback) => {
    const listener = (event, data) => {
      callback(data)
    }
    ipcRenderer.on('update-error', listener)
    return () => ipcRenderer.off('update-error', listener)
  },
  // 开始下载更新
  startDownloadUpdate: () => {
    return ipcRenderer.invoke('start-download-update')
  },
  // 通知主进程渲染进程已准备好
  notifyRendererReady: () => {
    ipcRenderer.send('renderer-ready')
  },
  // IPC invoke 通用方法（用于微信工作包管理等）
  ipcRenderer: {
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    on: (channel, func) => {
      // 直接使用原始的 ipcRenderer.on，不要包装
      // 这样 off 方法才能正确移除监听器
      const subscription = (event, ...args) => func(event, ...args)
      ipcRenderer.on(channel, subscription)
      return subscription
    },
    off: (channel, func) => {
      ipcRenderer.off(channel, func)
    },
    once: (channel, func) => {
      ipcRenderer.once(channel, (event, ...args) => func(event, ...args))
    },
    send: (channel, data) => {
      ipcRenderer.send(channel, data)
    }
  },
  // 令牌文件管理
  saveTokenFile: (username, token) => ipcRenderer.invoke('save-token-file', username, token),
  readTokenFile: (username) => ipcRenderer.invoke('read-token-file', username),
  deleteTokenFile: (username) => ipcRenderer.invoke('delete-token-file', username),
  listTokenFiles: () => ipcRenderer.invoke('list-token-files'),
  // 店铺后台管理器
  openShopBackendManager: (shopData) => ipcRenderer.invoke('open-shop-backend-manager', shopData),
  onOpenShop: (callback) => {
    const listener = (event, shopData) => {
      callback(shopData)
    }
    ipcRenderer.on('open-shop-in-manager', listener)
    return () => ipcRenderer.off('open-shop-in-manager', listener)
  },
  getPendingShopData: () => ipcRenderer.invoke('get-pending-shop-data'),
  closeCurrentWindow: () => ipcRenderer.invoke('close-current-window'),
  // 远程浏览器（方法名即 SignalR 调用名）
  remoteBrowserInvoke: (shopId, methodName, ...args) => ipcRenderer.invoke('remote-browser:invoke', shopId, methodName, args),
  remoteBrowserShowPage: (shopId, pageKey) => ipcRenderer.invoke('remote-browser:show-page', shopId, pageKey),
  remoteBrowserCloseShop: (shopId) => ipcRenderer.invoke('remote-browser:close-shop', shopId),
  openRemoteBrowser: (params) => ipcRenderer.invoke('open-remote-browser', params),
  closeRemoteBrowserShops: (shopIds) => ipcRenderer.invoke('close-remote-browser-shops', shopIds),
  remoteBrowserSetShopCookies: (shopId, cookies, shopType, officeId) =>
    ipcRenderer.invoke('remote-browser:set-shop-cookies', shopId, cookies, shopType, officeId),
  remoteBrowserReportViewportBounds: (bounds) => ipcRenderer.invoke('remote-browser:report-viewport-bounds', bounds),
  remoteBrowserOpenDevTools: (shopId, pageKey) =>
    ipcRenderer.invoke('remote-browser:open-devtools', shopId, pageKey),
  onRemoteBrowserWindowClosed: (callback) => {
    const listener = () => callback()
    ipcRenderer.on('remote-browser-window-closed', listener)
    return () => ipcRenderer.off('remote-browser-window-closed', listener)
  }
})

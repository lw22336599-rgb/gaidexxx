/**
 * 远程浏览器主进程：方法名即 SignalR 调用名（与 ChatClient 一致）
 */
const { BrowserView, session, Menu, clipboard } = require('electron')

// shopId -> { views: Map<pageKey, BrowserView>, pages: [] }
const shopViews = new Map()
let lastShownPage = { shopId: null, pageKey: null }
let reportedViewportBounds = null

function setViewportBounds(bounds) {
  if (bounds && typeof bounds.x === 'number' && typeof bounds.y === 'number' && bounds.width > 0 && bounds.height > 0) {
    reportedViewportBounds = bounds
  }
}

function getPartition(shopId) {
  return `persist:remotebrowser-${shopId}`
}

/**
 * 为远程浏览器设置店铺 cookies（与打开店铺后台逻辑一致）
 */
async function setShopCookies(shopId, cookies, shopType, officeId) {
  const partition = getPartition(shopId)
  const ses = session.fromPartition(partition, { cache: false })
  await ses.clearStorageData({ storages: ['cookies'] })

  const setOne = async (url) => {
    const jar = parseCookie(cookies)
    let domain = ''
    try {
      const urlObj = new URL(url)
      domain = urlObj.hostname
      if (domain === 'shangoue.meituan.com') domain = undefined
      else if (domain.split('.').length > 2) domain = '.' + domain.split('.').slice(-2).join('.')
    } catch (_) {}
    for (const [key, value] of jar) {
      try {
        await ses.cookies.set({
          url,
          domain: domain || undefined,
          name: key,
          value,
          path: '/',
          secure: url.startsWith('https'),
          httpOnly: false,
          sameSite: 'no_restriction',
        })
      } catch (_) {}
    }
  }

  const setOne2 = (items) => {
    return Promise.all(items.map((item) => ses.cookies.set(item)))
  }

  const st = Number(shopType)
  if (st === 1) {
    await setOne('https://e.waimai.meituan.com')
  } else if (st === 3) {
    await setOne('https://shangoue.meituan.com')
    await setOne('https://e.waimai.meituan.com')
    await setOne('https://waimaie.meituan.com')
  } else if (st === 4) {
    await setOne('https://yiyao.meituan.com/main/frame')
    await setOne('https://e.waimai.meituan.com')
    await setOne('https://waimaie.meituan.com')
  } else if (st === 2) {
    const url = officeId
      ? `https://melody.shop.ele.me/app/shop/${officeId}/dashboard#app.shop.dashboard`
      : 'https://melody.shop.ele.me'
    await setOne(url)
  } else if (st === 5) {
    const jar = parseCookie(cookies)
    const out = []
    for (const [key, value] of jar) {
      if (key === 'cna') continue
      out.push({
        url: 'https://nr.ele.me',
        name: encodeURIComponent(key),
        value: encodeURIComponent(value),
        domain: '.ele.me',
        path: '/',
        secure: true,
        httpOnly: false,
        sameSite: 'no_restriction',
      })
    }
    if (out.length) await setOne2(out)
  } else if (st === 6) {
    const urls = [
      'https://store.jddj.com', 'https://order.jddj.com', 'https://sff.jddj.com', 'https://trade.m.jd.com',
      'https://trade.jd.com', 'https://api.m.jd.com', 'https://log-o2o.jd.com', 'https://wl.jd.com',
      'https://storage.jd.com', 'https://jd.com', 'https://stock-store.jddj.com', 'https://vender-center.jddj.com',
      'https://passport.jd.com', 'https://sso.jd.com', 'https://uranus.jd.com', 'https://sgm-w.jd.com',
      'https://sff.jd.com', 'https://storage.360buyimg.com', 'https://img30.360buyimg.com', 'https://img.360buyimg.com',
    ]
    for (const u of urls) await setOne(u)
  } else if (st === 7) {
    await setOne('https://jsls.jinritemai.com')
  } else if (st === 1000) {
    await setOne('https://ecom.meituan.com')
    await setOne('https://meituan.com')
    await setOne('https://dianping.com')
    await setOne('https://e.dianping.com')
  } else if (st === 1001) {
    await setOne('https://store.jddj.com')
  }
}

function parseCookie(cookieStr) {
  const map = new Map()
  if (!cookieStr) return map
  for (const item of cookieStr.split(/\s*;\s*/)) {
    if (!item) continue
    const eq = item.indexOf('=')
    if (eq < 0) continue
    const key = item.slice(0, eq).trim()
    const value = item.slice(eq + 1).trim()
    if (key) map.set(key, value)
  }
  return map
}

function getOrCreateView(win, shopId, pageKey, initialUrl) {
  let shop = shopViews.get(shopId)
  if (!shop) {
    shop = { views: new Map(), pages: [] }
    shopViews.set(shopId, shop)
  }
  const key = pageKey || 'main'
  let view = shop.views.get(key)
  if (!view) {
    view = new BrowserView({
      webPreferences: {
        partition: getPartition(shopId),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
      },
    })
    win.addBrowserView(view)
    shop.views.set(key, view)
    view.webContents.on('context-menu', (_e, params) => {
      const wc = view.webContents
      const canGoBack = wc.canGoBack()
      const canGoForward = wc.canGoForward()
      const url = wc.getURL() || ''
      const menu = Menu.buildFromTemplate([
        {
          label: '后退',
          enabled: canGoBack,
          click: () => wc.canGoBack() && wc.goBack(),
        },
        {
          label: '前进',
          enabled: canGoForward,
          click: () => wc.canGoForward() && wc.goForward(),
        },
        {
          label: '刷新',
          click: () => wc.reload(),
        },
        { type: 'separator' },
        {
          label: '复制当前URL',
          enabled: !!url,
          click: () => url && clipboard.writeText(url),
        },
        { type: 'separator' },
        {
          label: '打开开发工具（调试内部网页）',
          click: () => {
            if (wc && !wc.isDestroyed()) wc.openDevTools({ mode: 'detach' })
          },
        },
      ])
      menu.popup({ window: win, x: params.x, y: params.y })
    })
    if (initialUrl) {
      view.webContents.loadURL(initialUrl)
    } else {
      view.webContents.loadURL('about:blank')
    }
  }
  return view
}

function waitForPageLoad(view) {
  return new Promise((resolve) => {
    if (view.webContents.isLoading()) {
      view.webContents.once('did-finish-load', () => resolve())
    } else {
      resolve()
    }
  })
}

function getView(shopId, pageKey) {
  const shop = shopViews.get(shopId)
  if (!shop) return null
  const key = pageKey || 'main'
  return shop.views.get(key) || null
}

function openDevToolsForView(win, shopId, pageKey) {
  let view = getView(shopId, pageKey)
  if (!view && lastShownPage.shopId === shopId) view = getView(shopId, lastShownPage.pageKey)
  if (!view) {
    const shop = shopViews.get(shopId)
    if (shop && shop.views.size > 0) view = shop.views.values().next().value
  }
  if (view && view.webContents && !view.webContents.isDestroyed()) {
    view.webContents.openDevTools({ mode: 'detach' })
  }
}

function buildFormDataBody(formData) {
  if (!formData || typeof formData !== 'object') return null
  const parts = []
  for (const k of Object.keys(formData)) {
    const v = formData[k]
    if (v != null && v !== '') {
      parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)))
    }
  }
  return parts.length ? parts.join('&') : null
}

function buildHttpRequestScript(req) {
  const url = (req.URL || '').replace(/'/g, "\\'")
  const method = (req.Method || 'GET').toUpperCase()
  const headers = req.Headers && Object.keys(req.Headers).length ? JSON.stringify(req.Headers) : '{}'
  const postDataType = req.PostDataType ?? 0
  const isFormData = postDataType === 3
  let postData = 'null'
  let contentType = (req.ContentType || 'text/html').replace(/'/g, "\\'")

  if (isFormData && req.Form_Data) {
    const formBody = buildFormDataBody(req.Form_Data)
    if (formBody) {
      postData = `'${formBody.replace(/'/g, "\\'")}'`
      contentType = 'application/x-www-form-urlencoded'
    }
  } else if (req.Postdata) {
    const t = req.Postdata.trim()
    if (t.startsWith('{') || t.startsWith('[')) {
      postData = req.Postdata
    } else {
      postData = `'${req.Postdata.replace(/'/g, "\\'").replace(/\r/g, '\\r').replace(/\n/g, '\\n')}'`
    }
  } else if (postDataType === 0 && req.Form_Data && Object.keys(req.Form_Data).length > 0) {
    const formBody = buildFormDataBody(req.Form_Data)
    if (formBody) {
      postData = `'${formBody.replace(/'/g, "\\'")}'`
      contentType = 'application/x-www-form-urlencoded'
    }
  }

  const cookie = req.Cookie ? `'${req.Cookie.replace(/'/g, "\\'")}'` : 'null'
  const accept = (req.Accept || 'text/html, application/xhtml+xml, */*').replace(/'/g, "\\'")

  return `
(function(){
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('${method}', '${url}', false);
    if ('${accept}') xhr.setRequestHeader('Accept', '${accept}');
    if ('${contentType}' && ('${method}'==='POST'||'${method}'==='PUT'||'${method}'==='PATCH')) xhr.setRequestHeader('Content-Type', '${contentType}');
    var h = ${headers};
    for (var k in h) if (h.hasOwnProperty(k)) xhr.setRequestHeader(k, h[k]);
    if (${cookie}) try { xhr.setRequestHeader('Cookie', ${cookie}); } catch(e){}
    var body = ${postData};
    xhr.send(body && (typeof body==='string'?body:JSON.stringify(body)));
    if (xhr.status>=200 && xhr.status<300) return xhr.responseText;
    return JSON.stringify({ __Error: true, status: xhr.status, body: xhr.responseText });
  } catch(e) {
    return JSON.stringify({ __Error: true, message: String(e && e.message) });
  }
})()
`
}

async function executeInView(view, script, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('执行超时')), timeoutMs)
    view.webContents
      .executeJavaScript(script, true)
      .then((r) => {
        clearTimeout(t)
        if (r == null) resolve('')
        else if (typeof r === 'string') resolve(r)
        else resolve(JSON.stringify(r))
      })
      .catch((e) => {
        clearTimeout(t)
        reject(e)
      })
  })
}

function destroyShopViews(shopId, win = null) {
  const shop = shopViews.get(shopId)
  if (!shop) return
  for (const [, view] of shop.views) {
    try {
      if (win) win.removeBrowserView(view)
      if (view.webContents && !view.webContents.isDestroyed()) {
        view.webContents.destroy()
      }
    } catch (_) { }
  }
  shop.views.clear()
  shop.pages = []
  shopViews.delete(shopId)
}

function getViewportRect(win) {
  if (reportedViewportBounds) {
    const [w, h] = win.getSize()
    return {
      x: reportedViewportBounds.x,
      y: reportedViewportBounds.y,
      width: Math.min(reportedViewportBounds.width, w - reportedViewportBounds.x),
      height: Math.min(reportedViewportBounds.height, h - reportedViewportBounds.y),
    }
  }
  const [w, h] = win.getSize()
  const sidebar = 200
  const tabs = 140
  return { x: sidebar, y: tabs, width: Math.max(0, w - sidebar), height: Math.max(0, h - tabs) }
}

/**
 * 按方法名执行（与 ChatClient 一致，方法名即 SignalR 调用名）
 */
async function executeMethod(win, shopId, methodName, args) {
  const a = args || []

  switch (methodName) {
    case 'Ping':
      return new Date().toISOString()

    case 'CloseShop':
      destroyShopViews(shopId, win)
      return true

    case 'SyncPages': {
      const pages = Array.isArray(a[0]) ? a[0] : []
      let shop = shopViews.get(shopId)
      if (!shop) {
        shop = { views: new Map(), pages: [] }
        shopViews.set(shopId, shop)
      }
      shop.pages = pages
      for (const p of pages) {
        const pk = p.PageKey || 'main'
        if (!shop.views.has(pk)) {
          const view = getOrCreateView(win, shopId, pk, p.InitialUrl || 'about:blank')
          view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
          await waitForPageLoad(view)
        }
      }
      if (pages.length > 0) {
        showPage(win, shopId, pages[0].PageKey || 'main')
      }
      return true
    }

    case 'InitializeMain': {
      const req = a[0]
      getOrCreateView(win, shopId, 'main', req?.HomeUrl || 'about:blank')
      showPage(win, shopId, 'main')
      return true
    }

    case 'HttpRequest': {
      const req = a[0]
      if (!req || !req.URL) throw new Error('HttpRequest 缺少 URL')
      let view = getView(shopId, req.PageKey)
      if (!view) view = getOrCreateView(win, shopId, req.PageKey || 'main', null)
      const script = buildHttpRequestScript(req)
      const timeout = req.Timeout > 0 ? req.Timeout : 100000
      const content = await executeInView(view, script, timeout)
      let errObj = null
      try {
        errObj = JSON.parse(content)
      } catch (_) { }
      if (errObj && errObj.__Error) {
        throw new Error(errObj.status ? `HTTP ${errObj.status}: ${(errObj.body || '').slice(0, 200)}` : (errObj.message || 'Request failed'))
      }
      return content
    }

    case 'HttpRequestSharPage': {
      const req = a[0]
      if (!req || !req.URL) throw new Error('HttpRequestSharPage 缺少 URL')
      if (req.SetCookieDomanInfos && req.SetCookieDomanInfos.length > 0 && req.Cookie) {
        const ses = session.fromPartition(getPartition(shopId), { cache: false })
        const jar = parseCookie(req.Cookie)
        for (const ci of req.SetCookieDomanInfos) {
          const url = ci.Url && ci.Url.startsWith('http') ? ci.Url : `https://${(ci.Doman || '').replace(/^\./, '')}`
          const domain = ci.Doman || undefined
          for (const [name, value] of jar) {
            try {
              await ses.cookies.set({
                url,
                domain: domain || undefined,
                name,
                value,
                path: '/',
                secure: url.startsWith('https'),
                httpOnly: false,
                sameSite: 'no_restriction',
              })
            } catch (_) { }
          }
        }
      }
      let view = getView(shopId, req.PageKey)
      if (!view) view = getOrCreateView(win, shopId, req.PageKey || 'main', null)
      const script = buildHttpRequestScript(req)
      const timeout = req.Timeout > 0 ? req.Timeout : 100000
      let content
      try {
        content = await executeInView(view, script, timeout)
      } catch (e) {
        return { Success: false, ErrorMessage: (e && e.message) || String(e), Content: '', Cookies: '' }
      }
      let errObj = null
      try {
        errObj = JSON.parse(content)
      } catch (_) { }
      if (errObj && errObj.__Error) {
        return {
          Success: false,
          ErrorMessage: errObj.status ? `HTTP ${errObj.status}` : (errObj.message || ''),
          Content: errObj.body || errObj.message || '',
          Cookies: ''
        }
      }
      let cookies = null
      if (req.ReturnCookies !== false) {
        try {
          cookies = await executeInView(view, 'document.cookie', 5000)
        } catch (_) { }
      }
      return { Success: true, Content: content, Cookies: cookies || '' }
    }

    case 'ExecuteScript': {
      const pageKey = a[0] ?? null
      const script = a[1] || ''
      if (!script) throw new Error('ExecuteScript 缺少 Script')
      let view = getView(shopId, pageKey)
      if (!view) view = getOrCreateView(win, shopId, pageKey || 'main', null)
      return executeInView(view, script, 100000)
    }

    case 'Navigate': {
      const pageKey = a[0] ?? null
      const url = a[1] || ''
      if (!url) throw new Error('Navigate 缺少 Url')
      let view = getView(shopId, pageKey)
      if (!view) view = getOrCreateView(win, shopId, pageKey || 'main', null)
      await view.webContents.loadURL(url)
      return true
    }

    case 'GetCookieString': {
      const pageKey = a[0] ?? null
      let view = getView(shopId, pageKey)
      if (!view) view = getOrCreateView(win, shopId, pageKey || 'main', null)
      const result = await executeInView(view, 'document.cookie', 10000)
      return result || ''
    }

    case 'GetCookieResult': {
      const request = a[0]
      let view = getView(shopId, null)
      if (!view) view = getOrCreateView(win, shopId, 'main', request?.HomeUrl || 'about:blank')
      const cookies = await executeInView(view, 'document.cookie', 10000)
      return { Success: true, Cookies: cookies || '', Content: '' }
    }

    case 'GetShopInfo':
      return { ShopId: shopId, IsOpen: shopViews.has(shopId), ShopName: '' }

    case 'GetHealthInfo':
      return { ShopId: shopId, IsOpen: shopViews.has(shopId) }

    case 'InterceptRequest':
      throw new Error('InterceptRequest 暂未实现')

    default:
      throw new Error(`未知方法: ${methodName}`)
  }
}

function onRemoteBrowserWindowClosed() {
  lastShownPage = { shopId: null, pageKey: null }
  reportedViewportBounds = null
  for (const shopId of [...shopViews.keys()]) {
    destroyShopViews(shopId)
  }
}

function showPage(win, shopId, pageKey) {
  lastShownPage = { shopId, pageKey: pageKey || 'main' }
  const rect = getViewportRect(win)
  const key = pageKey || 'main'
  for (const [sid, shop] of shopViews) {
    for (const [pk, view] of shop.views) {
      try {
        const visible = sid === shopId && pk === key
        view.setBounds(visible ? rect : { x: 0, y: 0, width: 0, height: 0 })
      } catch (_) { }
    }
  }
}

function getLastShownPage() {
  if (lastShownPage.shopId) return lastShownPage
  return null
}

function getOpenShopCount() {
  return shopViews.size
}

module.exports = {
  executeMethod,
  onRemoteBrowserWindowClosed,
  destroyShopViews,
  getViewportRect,
  showPage,
  getLastShownPage,
  getOpenShopCount,
  setShopCookies,
  setViewportBounds,
  openDevToolsForView,
}

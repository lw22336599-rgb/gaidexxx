const { app, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const logger = require('electron-log')

autoUpdater.logger = logger
autoUpdater.logger.transports.file.level = 'info'

// 防止报错no such file or directory dev-app-update.yml
if (!app.isPackaged) {
  autoUpdater.updateConfigPath = path.join(__dirname, '../dev-app-update.yml')
  autoUpdater.forceDevUpdateConfig = true // 强制使用开发配置
}

// ⚠️ 临时禁用 SHA512 校验（仅用于调试，生产环境请移除）
// autoUpdater.disableSignatureValidation = true

// 更新状态对象
let updateStatus = {
  checking: false, // 是否正在检查更新
  available: false, // 是否有可用更新
  version: null, // 新版本号
  error: null, // 错误信息
  progress: 0, // 下载进度
  downloaded: false, // 是否已下载完成
  installing: false // 是否正在安装
}

autoUpdater.autoDownload = false // 检查到新版本时自动下载
autoUpdater.autoInstallOnAppQuit = true // 应用退出时自动安装更新
autoUpdater.allowDowngrade = false // 禁止降级安装（避免版本号相同时触发更新）

function installUpdate() {
  try {
    autoUpdater.quitAndInstall(true, true)
    logger.error('安装更新成功')
    console.error('安装更新成功')
  } catch (error) {
    logger.error('安装更新失败:', error)
    console.error('安装更新失败:', error)
  }
}

// 检查到新版本
autoUpdater.on('update-available', info => {
  updateStatus.available = true
  updateStatus.version = info.version
  logger.info('发现新版本:', info)
  console.log('发现新版本:', info)

  // 向渲染进程发送更新通知
  const allWindows = BrowserWindow.getAllWindows()
  logger.info(`当前窗口数量: ${allWindows.length}`)
  console.log(`当前窗口数量: ${allWindows.length}`)

  if (allWindows.length > 0) {
    const mainWindow = allWindows[0]
    const updateData = {
      version: info.version,
      releaseNotes: info.releaseNotes || '',
      releaseDate: info.releaseDate || '',
      canDownload: info.can_download !== false
    }

    logger.info('准备发送更新通知到渲染进程:', updateData)
    console.log('准备发送更新通知到渲染进程:', updateData)

    try {
      mainWindow.webContents.send('update-available', updateData)
      logger.info('✅ 更新通知已发送到渲染进程')
      console.log('✅ 更新通知已发送到渲染进程')
    } catch (error) {
      logger.error('❌ 发送更新通知失败:', error)
      console.error('❌ 发送更新通知失败:', error)
    }
  } else {
    logger.warn('⚠️ 没有找到可用的窗口，无法发送更新通知')
    console.warn('⚠️ 没有找到可用的窗口，无法发送更新通知')
  }

  // 如果 autoDownload 未启用，则显式开始下载
  // if (!autoUpdater.autoDownload) {
  //   logger.info('开始手动下载更新');
  //   autoUpdater.downloadUpdate();
  // } else {
  //   logger.info('自动下载已启用，更新将自动下载')
  // }
})

// 更新下载完成后自动安装
autoUpdater.on('update-downloaded', info => {
  updateStatus.downloaded = true
  updateStatus.installing = true
  logger.info('更新包下载完成，准备安装:', info)
  console.log('开始安装')
  installUpdate()
})

// 检查更新前
autoUpdater.on('checking-for-update', () => {
  updateStatus.checking = true
  logger.info('正在检查更新...')
})

// 没有新版本
autoUpdater.on('update-not-available', info => {
  updateStatus.checking = false
  updateStatus.available = false
  logger.info('当前已是最新版本:', info)
})

// 更新下载进度
autoUpdater.on('download-progress', progressObj => {
  updateStatus.progress = progressObj.percent
  logger.info('下载进度:', progressObj)

  // 向渲染进程发送下载进度
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length > 0) {
    const mainWindow = allWindows[0]
    mainWindow.webContents.send('update-download-progress', {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total
    })
  }
})

// 更新下载完成
autoUpdater.on('update-downloaded', info => {
  updateStatus.downloaded = true
  logger.info('更新包下载完成:', info)
})

// 更新错误
autoUpdater.on('error', err => {
  updateStatus.error = err.message
  updateStatus.checking = false
  logger.error('更新出错:', err)

  // 向渲染进程发送错误通知
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length > 0) {
    const mainWindow = allWindows[0]
    mainWindow.webContents.send('update-error', {
      message: err.message
    })
  }
})

/**
 * 开始检查更新
 * @param {string} updateUrl 更新服务器地址
 * @param {Function} callback 状态回调函数
 * @returns {Promise<void>}
 */
async function checkForUpdates(callback) {
  const updateUrl = 'http://update.wmzdb.shop/windows'
  // const updateUrl = 'http://localhost:3000/upgrade'
  try {
    const serverOptions = {
      provider: 'generic',
      url: updateUrl
    }

    const requestHeaders = {
      'x-appname': process.env.VITE_APP_NAME || 'fastermove',
      'x-version': app.getVersion(),
      'x-arch': process.arch
    }

    console.log('***********', requestHeaders)

    autoUpdater.requestHeaders = requestHeaders
    autoUpdater.setFeedURL(serverOptions)

    // 重置状态
    updateStatus = {
      checking: false,
      available: false,
      version: null,
      error: null,
      progress: 0,
      downloaded: false,
      installing: false
    }

    // 设置状态回调
    if (typeof callback === 'function') {
      const statusHandler = () => callback(updateStatus)
      autoUpdater.on('checking-for-update', statusHandler)
      autoUpdater.on('update-available', info => {
        console.log('update-available:info:', info)
        if (info.can_download) {
          autoUpdater.downloadUpdate()
        }
      })
      autoUpdater.on('update-not-available', statusHandler)
      autoUpdater.on('download-progress', statusHandler)
      autoUpdater.on('update-downloaded', statusHandler)
      autoUpdater.on('error', statusHandler)
    }

    // 检查更新
    await autoUpdater.checkForUpdates()
  } catch (error) {
    logger.error('检查更新失败:', error)
    throw error
  }
}

// 导出更新下载函数供渲染进程调用
function startDownloadUpdate() {
  logger.info('开始下载更新...')
  autoUpdater.downloadUpdate()
}

// 移除 installUpdate 函数，因为现在是自动安装
module.exports = {
  checkForUpdates,
  startDownloadUpdate
}

/**
 * Web 资源更新模块
 * 用于检查、下载和更新 Web 静态资源（dist 目录）
 *
 * 功能：
 * 1. 检查远程版本
 * 2. 下载资源包
 * 3. 解压并替换资源
 * 4. 提示用户重启
 */

const { app, dialog } = require('electron')
const fs = require('node:fs')
const path = require('node:path')
const https = require('node:https')
const http = require('node:http')
const AdmZip = require('adm-zip')
const logger = require('electron-log')

// 配置
const UPDATE_CHECK_URL = 'http://update.wmzdb.shop/disk/version.json'
const TIMEOUT = 30000 // 30秒超时

/**
 * 获取外部资源目录
 */
function getExternalResourceDir() {
  return path.join(app.getPath('userData'), 'web-resources')
}

/**
 * 获取本地版本信息
 */
function getLocalVersion() {
  try {
    const versionPath = path.join(getExternalResourceDir(), 'version.json')
    if (fs.existsSync(versionPath)) {
      const data = fs.readFileSync(versionPath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    logger.warn('[Web更新] 读取本地版本失败:', error.message)
  }
  return null
}

/**
 * 保存本地版本信息
 */
function saveLocalVersion(versionData) {
  try {
    const versionPath = path.join(getExternalResourceDir(), 'version.json')
    fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2), 'utf8')
    logger.info('[Web更新] 版本信息已保存')
  } catch (error) {
    logger.error('[Web更新] 保存版本信息失败:', error.message)
  }
}

/**
 * HTTP(S) GET 请求（支持超时）
 */
function httpGet(url, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    const httpModule = url.startsWith('https') ? https : http

    const timer = setTimeout(() => {
      req.destroy()
      reject(new Error('请求超时'))
    }, timeout)

    const req = httpModule.get(url, (res) => {
      clearTimeout(timer)

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`))
        return
      }

      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
      res.on('error', reject)
    })

    req.on('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
  })
}

/**
 * 下载文件
 */
function downloadFile(url, destPath, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    const httpModule = url.startsWith('https') ? https : http
    const file = fs.createWriteStream(destPath)

    const timer = setTimeout(() => {
      req.destroy()
      file.close()
      fs.unlinkSync(destPath)
      reject(new Error('下载超时'))
    }, timeout)

    const req = httpModule.get(url, (res) => {
      if (res.statusCode !== 200) {
        clearTimeout(timer)
        file.close()
        fs.unlinkSync(destPath)
        reject(new Error(`HTTP ${res.statusCode}`))
        return
      }

      res.pipe(file)

      file.on('finish', () => {
        clearTimeout(timer)
        file.close()
        resolve()
      })

      file.on('error', (error) => {
        clearTimeout(timer)
        file.close()
        fs.unlinkSync(destPath)
        reject(error)
      })
    })

    req.on('error', (error) => {
      clearTimeout(timer)
      file.close()
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath)
      }
      reject(error)
    })
  })
}

/**
 * 检查远程版本
 */
async function checkRemoteVersion() {
  try {
    logger.info('[Web更新] 检查远程版本:', UPDATE_CHECK_URL)
    const data = await httpGet(UPDATE_CHECK_URL)
    const remoteVersion = JSON.parse(data)
    logger.info('[Web更新] 远程版本:', remoteVersion.version)
    return remoteVersion
  } catch (error) {
    logger.warn('[Web更新] 检查远程版本失败:', error.message)
    return null
  }
}

/**
 * 比较版本号
 */
function compareVersion(v1, v2) {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0
    const p2 = parts2[i] || 0
    if (p1 > p2) return 1
    if (p1 < p2) return -1
  }
  return 0
}

/**
 * 解压资源包
 */
function extractZip(zipPath, destDir) {
  try {
    logger.info('[Web更新] 开始解压:', zipPath)

    // 如果目标目录已存在，先备份
    const backupDir = destDir + '.backup'
    if (fs.existsSync(destDir)) {
      if (fs.existsSync(backupDir)) {
        fs.rmSync(backupDir, { recursive: true, force: true })
      }
      fs.renameSync(destDir, backupDir)
      logger.info('[Web更新] 已备份旧版本资源')
    }

    // 创建目标目录
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    // 解压
    const zip = new AdmZip(zipPath)
    zip.extractAllTo(destDir, true)

    // 验证解压结果
    const indexPath = path.join(destDir, 'index.html')
    if (!fs.existsSync(indexPath)) {
      throw new Error('解压后未找到 index.html')
    }

    // 删除备份
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true })
      logger.info('[Web更新] 已删除备份')
    }

    logger.info('[Web更新] 解压完成')
    return true
  } catch (error) {
    logger.error('[Web更新] 解压失败:', error.message)

    // 恢复备份
    const backupDir = destDir + '.backup'
    if (fs.existsSync(backupDir)) {
      if (fs.existsSync(destDir)) {
        fs.rmSync(destDir, { recursive: true, force: true })
      }
      fs.renameSync(backupDir, destDir)
      logger.info('[Web更新] 已恢复备份')
    }

    return false
  }
}

/**
 * 显示更新对话框
 */
function showUpdateDialog(versionData) {
  return new Promise((resolve) => {
    const options = {
      type: 'info',
      title: `发现新版本 v${versionData.version}`,
      message: '已下载最新的 Web 资源，是否立即重启应用以应用更新？',
      detail: versionData.releaseNotes || '暂无更新说明',
      buttons: ['立即重启', '稍后重启'],
      defaultId: 0,
      cancelId: 1,
      noLink: true
    }

    dialog.showMessageBox(options).then(({ response }) => {
      resolve(response === 0) // 0 = 立即重启
    })
  })
}

/**
 * 主更新流程
 */
async function checkForUpdates() {
  try {
    logger.info('[Web更新] 开始检查 Web 资源更新')

    // 1. 检查远程版本
    const remoteVersion = await checkRemoteVersion()
    if (!remoteVersion) {
      logger.info('[Web更新] 无法获取远程版本，跳过更新')
      return
    }

    // 2. 对比版本
    const localVersion = getLocalVersion()
    const localVersionNum = localVersion ? localVersion.version : '0.0.0'

    logger.info('[Web更新] 本地版本:', localVersionNum)
    logger.info('[Web更新] 远程版本:', remoteVersion.version)

    if (compareVersion(remoteVersion.version, localVersionNum) <= 0) {
      logger.info('[Web更新] 当前已是最新版本')
      return
    }

    logger.info('[Web更新] 发现新版本:', remoteVersion.version)

    // 3. 下载资源包
    const tempDir = app.getPath('temp')
    const zipPath = path.join(tempDir, 'web-resources-temp.zip')

    logger.info('[Web更新] 开始下载:', remoteVersion.downloadUrl)
    await downloadFile(remoteVersion.downloadUrl, zipPath, 60000) // 60秒超时
    logger.info('[Web更新] 下载完成')

    // 4. 解压资源
    const resourceDir = getExternalResourceDir()
    const success = extractZip(zipPath, resourceDir)

    // 删除临时文件
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath)
    }

    if (!success) {
      logger.error('[Web更新] 解压失败，更新终止')
      return
    }

    // 5. 保存版本信息
    saveLocalVersion(remoteVersion)

    // 6. 显示更新对话框
    const shouldRestart = await showUpdateDialog(remoteVersion)
    if (shouldRestart) {
      logger.info('[Web更新] 用户确认重启')
      app.relaunch()
      app.quit()
    } else {
      logger.info('[Web更新] 用户稍后重启')
    }

  } catch (error) {
    logger.error('[Web更新] 更新失败:', error.message)
    // 不抛出异常，确保不影响应用启动
  }
}

/**
 * 获取资源加载路径
 */
function getResourcePath() {
  const externalPath = path.join(getExternalResourceDir(), 'index.html')
  const internalPath = path.join(__dirname, '../dist/index.html')

  // 检查外部资源是否存在
  if (!fs.existsSync(externalPath)) {
    logger.info('[Web资源] 外部资源不存在，使用内置资源:', internalPath)
    return internalPath
  }

  // 获取主程序版本
  const appVersion = app.getVersion()
  
  // 获取本地前端包版本
  const localVersion = getLocalVersion()
  const localVersionNum = localVersion ? localVersion.version : '0.0.0'

  logger.info('[Web资源] 主程序版本:', appVersion)
  logger.info('[Web资源] 本地前端包版本:', localVersionNum)

  // 如果主程序版本大于本地前端包版本，使用内置资源
  if (compareVersion(appVersion, localVersionNum) > 0) {
    logger.info('[Web资源] 主程序版本较新，使用内置资源:', internalPath)
    return internalPath
  }

  // 否则使用外部资源
  logger.info('[Web资源] 使用外部资源:', externalPath)
  return externalPath
}

module.exports = {
  checkForUpdates,
  getResourcePath,
  getExternalResourceDir
}

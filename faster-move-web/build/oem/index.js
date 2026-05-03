const fs = require('fs')
const path = require('path')

const temp = {
  "productName": "example",
  "appId": "com.wmzdb.admin.test",
  "copyright": "com.wmzdb.admin © 2025",
  "compression": "maximum",
  "asar": true,
  "artifactName": "${productName}-${version}.${ext}",
  "directories": {
    "output": "release/example"
  },
  "nsis": {
    "oneClick": false,
    "guid": "极狐助手-测试版",
    "perMachine": true,
    "allowElevation": true,
    "allowToChangeInstallationDirectory": true,
    "installerIcon": "./build/oem/example/public/logo.ico",
    "uninstallerIcon": "./build/oem/example/public/logo.ico",
    "installerHeaderIcon": "./build/oem/example/public/logo.ico",
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "极狐助手-测试版"
  },
  "win": {
    "icon": "./build/oem/example/public/logo.ico",
    "target": [
      {
        "target": "nsis",
        "arch": ["x64", "ia32"]
      }
    ]
  },
  "mac": {
    "icon": "./build/oem/example/public/logo.png",
    "target": ["default"]
  },
  "linux": {
    "icon": "./build/oem/example/public/logo.ico"
  }
}

/**
 * 生成构建配置和命令
 * @param {Object} config 配置对象
 * @param {string} [config.domain] API域名
 * @param {string} [config.productName] 产品名称
 * @param {string} [config.logoPng] PNG图标(地址或base64)
 * @param {string} [config.logoIco] ICO图标(地址或base64)
 * @returns {string} 构建命令
 */
function generateBuildConfig(config = {}) {
  const {
    domain,
    productName = 'example',
    logoPng,
    logoIco
  } = config

  // 创建目录
  const dirPath = path.join(__dirname, productName)
  const publicPath = path.join(dirPath, 'public')
  fs.mkdirSync(publicPath, { recursive: true })

  // 生成配置文件
  const buildConfig = { ...temp }
  buildConfig.productName = productName
  buildConfig.directories.output = `release/${productName}`
  buildConfig.nsis.guid = `${productName}`
  buildConfig.nsis.shortcutName = `${productName}`

  // 更新图标路径
  const iconPathBase = `./build/oem/${productName}/public`
  buildConfig.nsis.installerIcon = `${iconPathBase}/logo.ico`
  buildConfig.nsis.uninstallerIcon = `${iconPathBase}/logo.ico`
  buildConfig.nsis.installerHeaderIcon = `${iconPathBase}/logo.ico`
  buildConfig.win.icon = `${iconPathBase}/logo.ico`
  buildConfig.mac.icon = `${iconPathBase}/logo.png`
  buildConfig.linux.icon = `${iconPathBase}/logo.ico`

  // 写入配置文件
  fs.writeFileSync(
    path.join(dirPath, `${productName}.json`),
    JSON.stringify(buildConfig, null, 2)
  )

  // 写入图标文件，仅在提供图标且不为undefined时处理
  if (logoPng !== undefined && logoPng !== null) {
    if (logoPng.startsWith('data:')) {
      fs.writeFileSync(
        path.join(publicPath, 'logo.png'),
        Buffer.from(logoPng.split(',')[1], 'base64')
      )
    } else {
      fs.copyFileSync(logoPng, path.join(publicPath, 'logo.png'))
    }
  }

  if (logoIco !== undefined && logoIco !== null) {
    if (logoIco.startsWith('data:')) {
      fs.writeFileSync(
        path.join(publicPath, 'logo.ico'),
        Buffer.from(logoIco.split(',')[1], 'base64')
      )
    } else {
      fs.copyFileSync(logoIco, path.join(publicPath, 'logo.ico'))
    }
  }

  // 生成构建命令
  let buildCmd = `npx vite build && npx electron-builder --config ./build/oem/${productName}/${productName}.json`
  if (domain !== undefined && domain !== null) {
    buildCmd = `VITE_API_DOMAIN=${domain} ${buildCmd}`
  }

  return buildCmd
}

module.exports = { generateBuildConfig }
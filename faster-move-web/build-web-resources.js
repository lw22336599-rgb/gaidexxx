/**
 * Web 资源打包脚本
 * 用于打包 Web 静态资源（dist 目录）并生成版本信息
 *
 * 功能：
 * 1. 自动递增版本号（修订号 +1）
 * 2. 读取 release-notes-web.txt 获取更新说明
 * 3. 生成 version.json 文件（包含版本号和更新说明）
 * 4. 将 dist 目录打包成 web-resources-[版本号].zip
 *
 * 使用：npm run build:web-resources
 */

const fs = require('node:fs')
const path = require('node:path')
const AdmZip = require('adm-zip')
const dayjs = require('dayjs')

// 文件路径
const packageJsonPath = path.join(__dirname, 'package.json')
const releaseNotesPath = path.join(__dirname, 'release-notes-web.txt') // Web 资源专用更新说明
const distDir = path.join(__dirname, 'dist')
const versionJsonPath = path.join(distDir, 'version.json')
// 注意：zipFilePath 将在获取版本号后动态生成

console.log('🚀 开始打包 Web 资源...\n')

/**
 * 读取 package.json 获取版本号
 */
function getVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    return packageJson.version
  } catch (error) {
    console.error('❌ 读取 package.json 失败:', error.message)
    process.exit(1)
  }
}

/**
 * 自动递增版本号（修订号 +1）
 * @param {string} version - 当前版本号（如 "5.3.9"）
 * @returns {string} 新版本号（如 "5.3.10"）
 */
function incrementPatchVersion(version) {
  const parts = version.split('.')
  if (parts.length !== 3) {
    throw new Error(`版本号格式错误: ${version}，应为 x.y.z 格式`)
  }

  const major = parseInt(parts[0])
  const minor = parseInt(parts[1])
  const patch = parseInt(parts[2])

  return `${major}.${minor}.${patch + 1}`
}

/**
 * 更新 package.json 中的版本号
 * @param {string} newVersion - 新版本号
 */
function updatePackageVersion(newVersion) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const oldVersion = packageJson.version
    packageJson.version = newVersion

    // 写回 package.json（保持格式化）
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8')

    console.log(`✅ 版本号已更新: ${oldVersion} → ${newVersion}`)
    return oldVersion
  } catch (error) {
    console.error('❌ 更新 package.json 失败:', error.message)
    process.exit(1)
  }
}

/**
 * 读取 release-notes-web.txt 获取更新说明
 */
function getReleaseNotes() {
  try {
    if (fs.existsSync(releaseNotesPath)) {
      const notes = fs.readFileSync(releaseNotesPath, 'utf8').trim()
      console.log('✅ Web 资源更新说明读取成功 (release-notes-web.txt)')
      console.log('─'.repeat(60))
      console.log(notes)
      console.log('─'.repeat(60))
      return notes
    } else {
      console.warn('⚠️  未找到 release-notes-web.txt')
      console.warn('💡 提示: 请创建 release-notes-web.txt 文件来维护 Web 资源更新说明')
      return ''
    }
  } catch (error) {
    console.error('❌ 读取 release-notes-web.txt 失败:', error.message)
    return ''
  }
}

/**
 * 生成 version.json 文件
 */
function generateVersionJson(version, releaseNotes) {
  try {
    // 检查 dist 目录是否存在
    if (!fs.existsSync(distDir)) {
      console.error('❌ dist 目录不存在，请先执行 vite build')
      process.exit(1)
    }

    const buildTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

    const versionData = {
      version: version,
      downloadUrl: `http://update.wmzdb.shop/disk/web-resources-${version}.zip`,
      updateTime: buildTime,
      buildTime: buildTime,
      releaseNotes: releaseNotes,
      description: 'Web 资源更新'
    }

    fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2), 'utf8')
    console.log('\n✅ version.json 生成成功')
    console.log('📄 文件路径:', versionJsonPath)
    console.log('📦 版本号:', version)
    console.log('🕐 构建时间:', buildTime)
  } catch (error) {
    console.error('❌ 生成 version.json 失败:', error.message)
    process.exit(1)
  }
}

/**
 * 将 dist 目录打包成 zip
 */
function createZipArchive(version) {
  try {
    console.log('\n🗜️  开始压缩 dist 目录...')

    // 生成包含版本号的 zip 文件名
    const zipFilePath = path.join(distDir, `web-resources-${version}.zip`)

    // 如果 zip 文件已存在，先删除
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath)
      console.log('🧹 删除旧的 zip 文件')
    }

    const zip = new AdmZip()

    // 添加 dist 目录下的所有文件（排除所有 .zip 文件）
    const files = fs.readdirSync(distDir)
    files.forEach(file => {
      // 排除所有 .zip 文件，避免把 zip 打包进 zip
      if (!file.endsWith('.zip')) {
        const filePath = path.join(distDir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
          zip.addLocalFolder(filePath, file)
        } else {
          zip.addLocalFile(filePath)
        }
      }
    })

    zip.writeZip(zipFilePath)

    const zipSize = fs.statSync(zipFilePath).size
    const zipSizeMB = (zipSize / 1024 / 1024).toFixed(2)

    console.log('✅ 压缩完成')
    console.log('📦 文件路径:', zipFilePath)
    console.log('📊 文件大小:', zipSizeMB, 'MB')

    return zipFilePath
  } catch (error) {
    console.error('❌ 压缩失败:', error.message)
    process.exit(1)
  }
}

/**
 * 主函数
 */
function main() {
  try {
    // 1. 自动递增版本号
    console.log('🚀 开始打包 Web 资源...\n')
    const oldVersion = getVersion()
    const newVersion = incrementPatchVersion(oldVersion)
    console.log('📌 版本号自动递增:')
    updatePackageVersion(newVersion)
    console.log('')

    // 1.5 清理 dist 目录中的旧 zip 文件
    console.log('🧹 清理旧的 zip 文件...')
    try {
      const files = fs.readdirSync(distDir)
      const zipFiles = files.filter(file => file.endsWith('.zip'))
      if (zipFiles.length > 0) {
        zipFiles.forEach(file => {
          const filePath = path.join(distDir, file)
          fs.unlinkSync(filePath)
          console.log(`   删除: ${file}`)
        })
        console.log(`✅ 已删除 ${zipFiles.length} 个旧 zip 文件`)
      } else {
        console.log('✅ 无需清理')
      }
    } catch (error) {
      // dist 目录可能还不存在，忽略错误
      console.log('✅ dist 目录为空或不存在')
    }
    console.log('')

    // 2. 更新版本号文件（vue-shop-vite-version.json）
    console.log('📝 更新版本号文件...')
    try {
      require('child_process').execSync('node write.version.js', {
        stdio: 'inherit',
        cwd: __dirname
      })
    } catch (error) {
      console.warn('⚠️  更新版本号文件失败:', error.message)
    }
    console.log('')

    // 3. 读取更新说明
    const releaseNotes = getReleaseNotes()

    // 4. 生成 version.json
    generateVersionJson(newVersion, releaseNotes)

    // 5. 打包成 zip（传入版本号）
    const zipFilePath = createZipArchive(newVersion)

    console.log('\n🎉 Web 资源打包完成！')
    console.log('\n📤 接下来请将以下文件上传到服务器:')
    console.log(`   1. ${path.basename(zipFilePath)} → http://update.wmzdb.shop/disk/`)
    console.log('   2. version.json → http://update.wmzdb.shop/disk/')
    console.log('\n💡 提示:')
    console.log(`   - 压缩包 URL: http://update.wmzdb.shop/disk/web-resources-${newVersion}.zip`)
    console.log('   - version.json 中的 downloadUrl 已自动匹配此文件名')
    console.log(`   - package.json 版本号已更新为: ${newVersion}`)
  } catch (error) {
    console.error('\n❌ 打包失败:', error.message)
    process.exit(1)
  }
}

// 执行主函数
main()

/**
 * 构建脚本：自动从 release-notes.txt 读取更新说明并注入到 package.json
 * 然后执行打包
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 读取 release-notes.txt
const releaseNotesPath = path.join(__dirname, 'release-notes.txt')
const packageJsonPath = path.join(__dirname, 'package.json')

console.log('📖 读取更新说明...')
let releaseNotes = ''
if (fs.existsSync(releaseNotesPath)) {
  releaseNotes = fs.readFileSync(releaseNotesPath, 'utf8').trim()
  console.log('✅ 更新说明读取成功')
  console.log('─'.repeat(50))
  console.log(releaseNotes)
  console.log('─'.repeat(50))
} else {
  console.warn('⚠️  未找到 release-notes.txt，将不包含更新说明')
}

// 读取 package.json
console.log('\n📝 更新 package.json...')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

// 注入 releaseNotes（放在 build 根级别，不是 publish 里面）
if (releaseNotes) {
  packageJson.build.releaseInfo = {
    releaseNotes: releaseNotes
  }

  // 写回 package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8')
  console.log('✅ 更新说明已注入到 package.json')
}

// 更新版本号文件
console.log('\n📝 更新版本号文件...')
try {
  execSync('node write.version.js', {
    stdio: 'inherit',
    cwd: __dirname
  })
} catch (error) {
  console.warn('⚠️  更新版本号文件失败:', error.message)
}

// 执行打包
console.log('\n🚀 开始打包...')
try {
  execSync('vite build', { stdio: 'inherit', cwd: __dirname })
  console.log('\n🔒 混淆 JS...')
  execSync('node scripts/obfuscate-all.js obfuscate', { stdio: 'inherit', cwd: __dirname })
  execSync('electron-builder --win', { stdio: 'inherit', cwd: __dirname })
  console.log('\n✅ 打包完成！')
} catch (error) {
  console.error('\n❌ 打包失败:', error.message)
  process.exit(1)
} finally {
  try {
    execSync('node scripts/obfuscate-all.js restore', { stdio: 'inherit', cwd: __dirname })
  } catch (e) {}
  // 清理：移除注入的 releaseNotes（可选）
  if (releaseNotes && packageJson.build.releaseInfo) {
    delete packageJson.build.releaseInfo
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8')
    console.log('\n🧹 已清理临时配置')
  }
}

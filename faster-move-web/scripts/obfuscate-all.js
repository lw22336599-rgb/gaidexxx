/**
 * 构建时混淆所有自定义 JS（排除 node_modules、TsModel）
 * 覆盖: src-electron, SunnyNet, frida-scripts
 * 用法: node scripts/obfuscate-all.js obfuscate|restore
 */
const fs = require('fs')
const path = require('path')
const JavaScriptObfuscator = require('javascript-obfuscator')

const ROOT = path.join(__dirname, '..')
const BACKUP_DIR = path.join(__dirname, 'obfuscate-backup')

const PACKED_DIRS = ['src-electron', 'SunnyNet', 'frida-scripts']
const EXCLUDE_PATTERNS = ['node_modules', 'TsModel']

const obfuscatorOptions = {
  target: 'node',
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: false,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  unicodeEscapeSequence: false,
}

function shouldExclude(filePath) {
  const normalized = filePath.replace(/\\/g, '/')
  return EXCLUDE_PATTERNS.some(p => normalized.includes(p))
}

function collectJsFiles() {
  const files = []
  for (const dir of PACKED_DIRS) {
    const dirPath = path.join(ROOT, dir)
    if (!fs.existsSync(dirPath)) continue
    const walk = (d) => {
      const entries = fs.readdirSync(d, { withFileTypes: true })
      for (const e of entries) {
        const full = path.join(d, e.name)
        if (e.isDirectory()) {
          if (!shouldExclude(full)) walk(full)
        } else if (e.name.endsWith('.js')) {
          if (!shouldExclude(full)) files.push(full)
        }
      }
    }
    walk(dirPath)
  }
  return files
}

function obfuscate() {
  const files = collectJsFiles()
  if (files.length === 0) {
    console.log('⚠️ 未找到待混淆的 JS 文件')
    return
  }
  if (fs.existsSync(BACKUP_DIR)) {
    fs.rmSync(BACKUP_DIR, { recursive: true })
  }
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
  const manifest = []
  for (const file of files) {
    const rel = path.relative(ROOT, file)
    const backupPath = path.join(BACKUP_DIR, rel + '.bak')
    fs.mkdirSync(path.dirname(backupPath), { recursive: true })
    const code = fs.readFileSync(file, 'utf8')
    fs.writeFileSync(backupPath, code, 'utf8')
    manifest.push({ src: file, backup: backupPath })
    try {
      const obfuscated = JavaScriptObfuscator.obfuscate(code, obfuscatorOptions).getObfuscatedCode()
      fs.writeFileSync(file, obfuscated, 'utf8')
      console.log('  ✓', rel)
    } catch (err) {
      console.error('  ✗', rel, err.message)
    }
  }
  fs.writeFileSync(path.join(BACKUP_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
  console.log(`✅ 已混淆 ${files.length} 个 JS 文件`)
}

function restore() {
  if (!fs.existsSync(BACKUP_DIR)) return
  const manifestPath = path.join(BACKUP_DIR, 'manifest.json')
  if (!fs.existsSync(manifestPath)) {
    fs.rmSync(BACKUP_DIR, { recursive: true })
    return
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  for (const { src, backup } of manifest) {
    if (fs.existsSync(backup)) {
      fs.copyFileSync(backup, src)
    }
  }
  fs.rmSync(BACKUP_DIR, { recursive: true })
  console.log('✅ 已恢复所有 JS 文件')
}

const cmd = process.argv[2] || 'obfuscate'
if (cmd === 'restore') {
  restore()
} else if (cmd === 'obfuscate') {
  obfuscate()
} else {
  console.error('用法: node scripts/obfuscate-all.js obfuscate|restore')
  process.exit(1)
}

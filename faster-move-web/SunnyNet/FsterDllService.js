const koffi = require('koffi')
const { app } = require('electron')
const path = require('path')
const os = require('os')
const os_type = os.type()
const __RuntimeEnvironment = process.arch === 'x64'
// 根据架构选择类型别名（简化后续声明）
const arch_type = __RuntimeEnvironment ? { intptr: 'int64' } : { intptr: 'int32' }

// DLL函数声明模板 ret：返回值类型 params：参数列表
const func_prototypes = {
  Init: {
    ret: 'void'
  },

  GetSystemInfoWrite: {
    ret: 'void'
  }
}

let lib

try {
  lib = getLib()
} catch (e) {
  console.error('载入DLL失败,请检测DLL文件:', e)
  process.exit(1)
}

function getLib() {
  let libName
  let dir = ''
  if (os_type === 'Windows_NT') {
    libName = __RuntimeEnvironment ? 'FsterDllService.dll' : 'FsterDllService.dll'
    dir = 'sunny_dll'
  } else {
    throw new Error('暂不支持您的系统')
  }

  // 获取应用资源目录（自动适配开发和生产环境）
  const resourcesPath = app.isPackaged ? process.resourcesPath : './src'
  const libPath = path.join(resourcesPath, dir, libName)
  console.log("libPath", libPath);
  return koffi.load(libPath)
}

// 动态声明函数原型
const FsterDll = {}
for (let [funcName, { ret, params = [] }] of Object.entries(func_prototypes)) {
  const protoStr = `${ret} ${funcName}(${params.join(',')})`
  FsterDll[funcName] = lib.func(protoStr)
}

module.exports = {
  FsterDll
}
const koffi = require('koffi')
// const refnapi = require('ref-napi');
const { app } = require('electron')
const path = require('path')
const os = require('os')
const os_type = os.type()
const __RuntimeEnvironment = process.arch === 'x64'
// 根据架构选择类型别名（简化后续声明）
const arch_type = __RuntimeEnvironment ? { intptr: 'int64' } : { intptr: 'int32' }
// DLL函数声明模板 ret：返回值类型忽略为自动解析 params：参数列表
const func_prototypes = {
  // sunnynet功能相关
  CreateSunnyNet: {
    ret: arch_type.intptr
  },
  GetSunnyVersion: {},
  SunnyNetSetPort: { ret: 'bool', params: [arch_type.intptr, arch_type.intptr] },
  SunnyNetStart: { ret: 'bool', params: [arch_type.intptr] },
  SunnyNetInstallCert: { params: [arch_type.intptr] },
  ProcessCancelAll: { params: [arch_type.intptr] },


  SetScriptPage: { params: [arch_type.intptr, 'string'] },
  OpenDrive: { ret: 'bool', params: [arch_type.intptr] },
  ProcessALLName: { params: [arch_type.intptr, 'bool', 'bool'] },
  ProcessAddName: { params: [arch_type.intptr, 'string'] },
  SetIeProxy: { ret: "bool", params: [arch_type.intptr] },
  CancelIEProxy: { ret: "bool", params: [arch_type.intptr] },
  SunnyNetClose: { params: [arch_type.intptr] },
  SetRandomTLS: { ret: 'bool', params: [arch_type.intptr, 'bool'] },
  SunnyNetMustTcp: { params: [arch_type.intptr, 'bool'] },
  SetDnsServer: { params: [arch_type.intptr, 'string'] },
  SunnyNetVerifyUser: { params: [arch_type.intptr, 'bool'] },
  SunnyNetSocket5AddUser: { params: [arch_type.intptr, 'string', 'string'] },
  SunnyNetSocket5DelUser: { params: [arch_type.intptr, 'string'] },
  SunnyNetSetCert: { ret: 'bool', params: [arch_type.intptr, arch_type.intptr] },
  ExportCert: { params: [arch_type.intptr] },
  SunnyNetError: { params: [arch_type.intptr] },
  SetHTTPRequestMaxUpdateLength: { ret: 'bool', params: [arch_type.intptr, arch_type.intptr] },
  DisableTCP: { ret: 'bool', params: [arch_type.intptr, 'bool'] },
  DisableUDP: { ret: 'bool', params: [arch_type.intptr, 'bool'] },
  SetGlobalProxy: { ret: 'bool', params: [arch_type.intptr, 'string'] },
  CompileProxyRegexp: { ret: 'bool', params: [arch_type.intptr, 'string'] },
  SetMustTcpRegexp: { ret: 'bool', params: [arch_type.intptr, 'string', 'bool'] },
  AddHttpCertificate: { params: ['string', arch_type.intptr, arch_type.intptr] },
  DelHttpCertificate: { ret: 'bool', params: ['string'] },
  Free: { params: [arch_type.intptr] },
  BytesToInt: { ret: arch_type.intptr, params: ['string', arch_type.intptr] },

  GzipCompress: { params: ['string', arch_type.intptr] },
  GzipUnCompress: { ret: arch_type.intptr, params: ['string', arch_type.intptr] },
  ZlibCompress: { params: ['string', arch_type.intptr] },
  ZlibUnCompress: { params: ['string', arch_type.intptr] },
  PbToJson: { params: ['string', arch_type.intptr] },
  JsonToPB: { params: ['string', arch_type.intptr] },

  BrCompress: { params: ['string', arch_type.intptr] },
  BrUnCompress: { params: ['string', arch_type.intptr] },
  DeflateCompress: { params: ['string', arch_type.intptr] },
  DeflateUnCompress: { params: ['string', arch_type.intptr] },
  ZSTDCompress: { params: ['string', arch_type.intptr] },
  ZSTDDecompress: { params: ['string', arch_type.intptr] },

  // request
  GetRequestClientIp: { params: [arch_type.intptr] },
  SunnyNetGetSocket5User: { params: [arch_type.intptr] },
  RawRequestDataToFile: { ret: 'bool', params: [arch_type.intptr, 'string', arch_type.intptr] },
  IsRequestRawBody: { ret: arch_type.intptr, params: [arch_type.intptr] },
  GetRequestBodyLen: { ret: arch_type.intptr, params: [arch_type.intptr] },
  GetRequestBody: { ret: arch_type.intptr, params: [arch_type.intptr] },
  SetRequestData: { ret: arch_type.intptr, params: [arch_type.intptr, 'string', arch_type.intptr] },
  SetRequestOutTime: { params: [arch_type.intptr, arch_type.intptr] },
  SetRequestHTTP2Config: { params: [arch_type.intptr, arch_type.intptr] },
  RandomRequestCipherSuites: { params: [arch_type.intptr] },
  SetRequestProxy: { params: [arch_type.intptr, 'string', arch_type.intptr] },
  SetRequestALLHeader: { params: [arch_type.intptr, 'string'] },
  SetRequestAllCookie: { params: [arch_type.intptr, 'string'] },
  SetRequestCookie: { params: [arch_type.intptr, 'string', 'string'] },
  SetRequestHeader: { params: [arch_type.intptr, 'string', 'string'] },
  SetRequestUrl: { ret: 'bool', params: [arch_type.intptr, 'string'] },
  DelRequestHeader: { params: [arch_type.intptr, 'string'] },
  GetRequestAllHeader: { params: [arch_type.intptr] },
  GetRequestHeader: { ret: 'string', params: [arch_type.intptr, 'string'] },
  GetRequestProto: { params: [arch_type.intptr] },
  GetRequestCookie: { params: [arch_type.intptr, 'string'] },
  GetRequestALLCookie: { params: [arch_type.intptr] },

  //response
  GetResponseStatusCode: { ret: arch_type.intptr, params: [arch_type.intptr] },
  SetResponseStatus: { ret: arch_type.intptr, params: [arch_type.intptr, arch_type.intptr] },
  GetResponseStatus: { params: [arch_type.intptr] },
  GetResponseServerAddress: { params: [arch_type.intptr] },
  GetResponseBody: { params: [arch_type.intptr] },
  GetResponseBodyLen: { ret: arch_type.intptr, params: [arch_type.intptr] },
  GetResponseHeader: { params: [arch_type.intptr, 'string'] },
  SetResponseData: { ret: arch_type.intptr, params: [arch_type.intptr, 'string', arch_type.intptr] },
  SetResponseHeader: { params: [arch_type.intptr, 'string', 'string'] },
  SetResponseAllHeader: { params: [arch_type.intptr, 'string'] },
  DelResponseHeader: { params: [arch_type.intptr, 'string'] },
  GetResponseAllHeader: { params: [arch_type.intptr] }
}

let lib

try {
  lib = getLib()
} catch (e) {
  console.error('载入DLL失败,请检测DLL文件:---------err2', e)
  process.exit(1)
}

function getLib() {
  let libName
  let dir = ''
  if (os_type === 'Windows_NT') {
    libName = __RuntimeEnvironment ? 'SunnyNet64.dll' : 'SunnyNet.dll'
    dir = 'sunny_dll'
  } else if (os_type === 'Darwin') {
    libName = process.arch === 'arm64' ? 'SunnyNetArm64.so' : 'SunnyAmd64.so'
    dir = 'sunny_so'
  } else {
    throw new Error('暂不支持您的系统')
  }

  // 获取应用资源目录（自动适配开发和生产环境）
  const resourcesPath = app.isPackaged ? process.resourcesPath : './src'
  const libPath = path.join(resourcesPath, dir, libName)
  return koffi.load(libPath)
}

// 动态声明函数原型
const SunnyDll = {}
for (let [funcName, { ret, params }] of Object.entries(func_prototypes)) {
  if (!params) params = []
  if (!ret) ret = 'char*'
  const protoStr = `${ret} ${funcName}(${params.join(',')})`
  SunnyDll[funcName] = lib.func(protoStr)
}
const http_callback = koffi.proto(
  `void http_callback(${[arch_type.intptr, arch_type.intptr, arch_type.intptr, arch_type.intptr, 'string', 'string', 'string', arch_type.intptr].join(',')})`
)
const tcp_callback = koffi.proto(
  `void tcp_callback(${[arch_type.intptr, 'string', 'string', arch_type.intptr, arch_type.intptr, arch_type.intptr, arch_type.intptr, arch_type.intptr, arch_type.intptr].join(',')})`
)
const udp_callback = koffi.proto(
  `void udp_callback(${[arch_type.intptr, 'string', 'string', arch_type.intptr, arch_type.intptr, arch_type.intptr, arch_type.intptr].join(',')})`
)
const ws_callback = koffi.proto(
  `void ws_callback(${[arch_type.intptr, arch_type.intptr, arch_type.intptr, arch_type.intptr, 'string', 'string', arch_type.intptr, arch_type.intptr].join(',')})`
)
SunnyDll.SunnyNetSetCallback = function (Context, HttpCallback, TcpCallback, WsCallback, UDPCallback) {
  const SunnyNetSetCallback = lib.func(
    `void SunnyNetSetCallback(${arch_type.intptr},http_callback *cb1,tcp_callback *cb2,ws_callback *cb3,udp_callback *cb4)`
  )

  const cb1 = koffi.register(HttpCallback, koffi.pointer(http_callback))
  const cb2 = koffi.register(TcpCallback, koffi.pointer(tcp_callback))
  const cb3 = koffi.register(WsCallback, koffi.pointer(ws_callback))
  const cb4 = koffi.register(UDPCallback, koffi.pointer(udp_callback))
  SunnyNetSetCallback(Context, cb1, cb2, cb3, cb4)
}

// 字节数组到字符串
function BytesToText(buffer) {
  try {
    return buffer.toString('utf-8')
  } catch (e) {
    return buffer.toString('gbk')
  }
}

module.exports = {
  SunnyDll,
  //  / PtrToByte,
  //   PtrToInt,
  //   PointerToText,
  BytesToText
  //   PointerToBytes
}

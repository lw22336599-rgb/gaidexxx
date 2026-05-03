// Frida 脚本：拦截 iOS 网络请求，并拦截指定 API 的响应数据
// 适配极狐助手项目 - 竞对采集功能

try {
  var hook4 = ObjC.classes.NVTunnelSetting['- defaultTunnel'];
  if (hook4) {
    Interceptor.attach(hook4.implementation, {
      onEnter: function () { console.log('[网络拦截] 方法调用: defaultTunnel'); },
      onLeave: function (retval) {
        retval.replace(0x3);
        console.log('[网络拦截] 返回值:', retval);
      },
    });
  }
} catch (e) { }

// 需要拦截的 API 地址列表
var TARGET_APIS = [
  // 微信小程序 - 美团外卖
  'wx.waimai.meituan.com/weapp/v1/poi/food',
  'wx.waimai.meituan.com/weapp/shop/v1/poi/productlist',
  'wx.waimai.meituan.com/weapp/poi/food/render',
  'wx.waimai.meituan.com/weapp/shop/v1/poi/attr',
  'wx.waimai.meituan.com/weapp/v7/poi/product/detail',
  'wx.waimai.meituan.com/weapp/shop/v1/poi/combogroup/info',

  // 微信小程序 - 美团闪购/医药
  'hcapi-wx.waimai.meituan.com/mtweapp/v1/poi/sputag/products',
  'hcapi-wx.waimai.meituan.com/mtweapp/v1/poi/product/smooth/render',
  'hcapi-wx.waimai.meituan.com/wxapp/v1/poi/sputag/products',
  'hcapi-wx.waimai.meituan.com/wxapp/v1/poi/product/smooth/render',
  'hcapi-wx.waimai.meituan.com/storm/graphql/tile/query/from_app_drug_detail',

  // iOS App API
  'wmapi.meituan.com/api/v8/poi/cart/info',
  'wmapi.meituan.com/api/shop/v1/poi/detail',
  'wmapi.meituan.com/api/shop/v1/poi/productlist',
  'wmapi.meituan.com/api/poi/food/render',
  'wmapi.meituan.com/api/shop/v1/poi/required/product'
];

var taskMap = {};
var hookedDidReceiveData = {};
var hookedDidComplete = {};
var hookedDelegateClasses = {};
var requestInfoMap = {}; // 存储请求的方法和body信息

function taskKey(task) {
  return task ? ptr(task).toString() : '';
}

function matchTargetApi(url) {
  if (!url || typeof url !== 'string') return null;
  for (var i = 0; i < TARGET_APIS.length; i++) {
    if (url.indexOf(TARGET_APIS[i]) !== -1) return TARGET_APIS[i];
  }
  return null;
}

function utf8Decode(arr) {
  var s = '';
  var i = 0;
  var n = arr.length;
  while (i < n) {
    var c = arr[i++];
    if (c < 0x80) s += String.fromCharCode(c);
    else if (c < 0xe0 && i < n) { s += String.fromCharCode(((c & 0x1f) << 6) | (arr[i++] & 0x3f)); }
    else if (c < 0xf0 && i + 1 < n) { s += String.fromCharCode(((c & 0xf) << 12) | ((arr[i++] & 0x3f) << 6) | (arr[i++] & 0x3f)); }
    else if (c < 0xf8 && i + 2 < n) { var u = ((c & 7) << 18) | ((arr[i++] & 0x3f) << 12) | ((arr[i++] & 0x3f) << 6) | (arr[i++] & 0x3f); u -= 0x10000; s += String.fromCharCode(0xd800 + (u >> 10), 0xdc00 + (u & 0x3ff)); }
    else s += String.fromCharCode(0xfffd);
  }
  return s;
}

function parseAndEmit(apiKey, url, nsData, method, requestBody) {
  try {
    var raw = ObjC.Object(nsData);
    var bytes = raw.bytes();
    var length = raw.length();
    if (!bytes || length <= 0) return;

    // 快速判断：检查前几个字节，确定是否可能是JSON
    var firstBytes = Memory.readByteArray(ptr(bytes), Math.min(10, length));
    if (!firstBytes) return;
    var arr = new Uint8Array(firstBytes);

    // JSON必须以 { 或 [ 开头（跳过可能的空白字符）
    var isJson = false;
    for (var i = 0; i < arr.length; i++) {
      var c = arr[i];
      if (c === 0x7B || c === 0x5B) { // { 或 [
        isJson = true;
        break;
      }
      // 跳过空白字符
      if (c !== 0x20 && c !== 0x09 && c !== 0x0A && c !== 0x0D) {
        break; // 不是空白也不是{/[，肯定不是JSON
      }
    }

    if (!isJson) return; // 不是JSON，直接返回

    // 转Base64
    var nsDataBase64 = raw.base64EncodedStringWithOptions_(0);
    if (!nsDataBase64) return;
    var dataBase64 = nsDataBase64.toString();

    parseAndEmitFromBase64(apiKey, url, dataBase64, method, requestBody);
  } catch (e) {
    console.log('[PARSE_ERROR] ' + (e.message || e));
  }
}

function parseAndEmitFromBase64(apiKey, url, dataBase64, method, requestBody) {
  // 使用setTimeout异步处理，不阻塞响应
  if (typeof setTimeout !== 'undefined') {
    setTimeout(function () {
      processAndSendLog(apiKey, url, dataBase64, method, requestBody);
    }, 0);
  } else {
    // 如果没有setTimeout，直接处理（但可能慢）
    processAndSendLog(apiKey, url, dataBase64, method, requestBody);
  }
}

function processAndSendLog(apiKey, url, dataBase64, method, requestBody) {
  try {
    var timestamp = new Date().toISOString();
    var chunkSize = 30000; // 每块30KB

    var requestBodyBase64 = '';
    if (requestBody) {
      try {
        var nsString = ObjC.classes.NSString.stringWithString_(requestBody);
        var nsData = nsString.dataUsingEncoding_(4);
        if (nsData) {
          var base64Str = nsData.base64EncodedStringWithOptions_(0);
          requestBodyBase64 = base64Str ? base64Str.toString() : '';
        }
      } catch (e) { }
    }

    if (dataBase64.length > chunkSize) {
      // 大响应：分块输出
      var totalChunks = Math.ceil(dataBase64.length / chunkSize);
      var logId = timestamp + '_' + Math.random().toString(36).substring(7);

      console.log('[HTTPLOG_HEAD]' + JSON.stringify({
        id: logId,
        timestamp: timestamp,
        method: method || 'GET',
        url: url,
        apiKey: apiKey || 'none',
        requestBodyBase64: requestBodyBase64,
        totalChunks: totalChunks,
        encoding: 'base64'
      }));

      for (var i = 0; i < totalChunks; i++) {
        var start = i * chunkSize;
        var end = Math.min(start + chunkSize, dataBase64.length);
        console.log('[HTTPLOG_CHUNK]' + JSON.stringify({
          id: logId,
          index: i,
          data: dataBase64.substring(start, end)
        }));
      }
    } else {
      // 小响应：一次性输出
      console.log('[HTTPLOG]' + JSON.stringify({
        timestamp: timestamp,
        method: method || 'GET',
        url: url,
        apiKey: apiKey || 'none',
        requestBodyBase64: requestBodyBase64,
        responseBase64: dataBase64,
        encoding: 'base64'
      }));
    }
  } catch (e) {
    // 静默失败，不输出错误（避免影响性能）
  }
}

function wrapBlockAndReplace(blockPtr, apiKey, url, method, requestBody) {
  try {
    if (!blockPtr || blockPtr.isNull()) return null;

    var origInvoke = null;
    try {
      origInvoke = blockPtr.add(16).readPointer();
    } catch (e) {
      return null;
    }

    if (!origInvoke || origInvoke.isNull()) {
      return null;
    }

    var invoke = new NativeFunction(origInvoke, 'void', ['pointer', 'pointer', 'pointer', 'pointer']);
    var wrapper = ObjC.block({
      retType: 'void',
      argTypes: ['pointer', 'pointer', 'pointer', 'pointer'],
      implementation: function (b, dataPtr, responsePtr, errorPtr) {
        try {
          if (dataPtr && !dataPtr.isNull()) {
            parseAndEmit(apiKey, url, dataPtr, method, requestBody);
          }
        } catch (e) {
          console.log('[HOOK_DEBUG] 响应处理异常: ' + (e.message || e));
        }
        try {
          invoke(blockPtr, dataPtr, responsePtr, errorPtr);
        } catch (e) {
          console.log('[HOOK_DEBUG] 调用原始block异常: ' + (e.message || e));
        }
      },
    });
    return wrapper.handle;
  } catch (e) {
    //console.log('[HOOK_DEBUG] wrapBlockAndReplace异常: ' + (e.message || e));
    return null;
  }
}

function installRequestCompletionHook() {
  var NSURLSession = ObjC.classes.NSURLSession;
  var sel = '- dataTaskWithRequest:completionHandler:';
  var m = NSURLSession && NSURLSession[sel];
  if (!m) return false;
  var impl = m.implementation;
  var orig = new NativeFunction(impl, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']);
  Interceptor.replace(impl, new NativeCallback(function (self, _cmd, request, block) {
    var url = '';
    var method = 'GET';
    var requestBody = '';

    try {
      var req = new ObjC.Object(request);
      var u = req.URL();
      if (u) url = u.absoluteString().toString();

      if (req.HTTPMethod()) {
        method = req.HTTPMethod().toString();
      }

      // 只在需要时获取POST数据
      if (method === 'POST' || method === 'PUT') {
        try {
          var bodyData = req.HTTPBody();
          if (bodyData && !bodyData.isNull()) {
            var bodyLen = bodyData.length();
            if (bodyLen > 0 && bodyLen < 10000) { // 只记录小于10KB的body
              var bodyBytes = bodyData.bytes();
              var bodyBuf = Memory.readByteArray(ptr(bodyBytes), bodyLen);
              if (bodyBuf) {
                var bodyArr = new Uint8Array(bodyBuf);
                var isBinary = bodyArr[0] === 0 || (bodyArr[0] > 127 && bodyArr[0] < 160);
                if (isBinary) {
                  requestBody = '[二进制数据]';
                } else {
                  requestBody = utf8Decode(bodyArr);
                }
              }
            }
          }
        } catch (e) { }
      }
    } catch (e) { }

    var apiKey = matchTargetApi(url);

    // 对所有请求都包装block（轻量级操作）
    var blockToPass = block;
    try {
      var wrapped = wrapBlockAndReplace(block, apiKey, url, method, requestBody);
      if (wrapped) {
        blockToPass = wrapped;
      }
    } catch (e) { }

    return orig(self, _cmd, request, blockToPass);
  }, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']));
  return true;
}

function installURLCompletionHook() {
  var NSURLSession = ObjC.classes.NSURLSession;
  var sel = '- dataTaskWithURL:completionHandler:';
  var m = NSURLSession && NSURLSession[sel];
  if (!m) return false;
  var impl = m.implementation;
  var orig = new NativeFunction(impl, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']);
  Interceptor.replace(impl, new NativeCallback(function (self, _cmd, urlObj, block) {
    var url = '';
    try {
      var u = new ObjC.Object(urlObj);
      url = u.absoluteString().toString();
    } catch (e) { }

    var apiKey = matchTargetApi(url);
    var method = 'GET';

    var blockToPass = block;
    try {
      var wrapped = wrapBlockAndReplace(block, apiKey, url, method, '');
      if (wrapped) {
        blockToPass = wrapped;
      }
    } catch (e) { }

    return orig(self, _cmd, urlObj, blockToPass);
  }, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']));
  return true;
}

// delegate 路径：存 task->url；并从 session.delegate 取类并 hook didReceiveData/didComplete
function installRequestOnlyHook() {
  var NSURLSession = ObjC.classes.NSURLSession;
  var sel = '- dataTaskWithRequest:';
  var m = NSURLSession && NSURLSession[sel];
  if (!m) return false;
  Interceptor.attach(m.implementation, {
    onEnter: function (args) {
      this.request = args[2];
      try {
        var session = new ObjC.Object(args[0]);
        var del = null;
        try { del = session.delegate(); } catch (e2) { }
        if (del) {
          var d = ObjC.Object(del);
          var cls = d.$class;
          if (cls) hookDelegateClass(cls);
        }
      } catch (e) { }
    },
    onLeave: function (retval) {
      try {
        var req = new ObjC.Object(this.request);
        var u = req.URL();
        if (!u) return;
        var url = u.absoluteString().toString();

        var method = 'GET';
        var requestBody = '';

        try {
          if (req.HTTPMethod()) {
            method = req.HTTPMethod().toString();
          }

          if (method === 'POST' || method === 'PUT') {
            var bodyData = req.HTTPBody();
            if (bodyData && !bodyData.isNull()) {
              var bodyLen = bodyData.length();
              if (bodyLen > 0 && bodyLen < 10000) {
                var bodyBytes = bodyData.bytes();
                var bodyBuf = Memory.readByteArray(ptr(bodyBytes), bodyLen);
                if (bodyBuf) {
                  var bodyArr = new Uint8Array(bodyBuf);
                  var isBinary = bodyArr[0] === 0 || (bodyArr[0] > 127 && bodyArr[0] < 160);
                  requestBody = isBinary ? '[二进制数据]' : utf8Decode(bodyArr);
                }
              }
            }
          }
        } catch (e) { }

        var apiKey = matchTargetApi(url);
        var key = taskKey(retval);
        if (!key) return;
        taskMap[key] = { url: url, apiKey: apiKey, chunks: [] };
        requestInfoMap[key] = { method: method, requestBody: requestBody };
      } catch (e) { }
    },
  });
  return true;
}

function mergeChunks(chunks) {
  if (!chunks || !chunks.length) return null;
  var n = 0;
  for (var i = 0; i < chunks.length; i++) n += chunks[i].length;
  var out = new Uint8Array(n);
  var off = 0;
  for (var i = 0; i < chunks.length; i++) {
    out.set(chunks[i], off);
    off += chunks[i].length;
  }
  return out;
}

var didReceiveDataHandler = {
  onEnter: function (args) {
    var task = args[3];
    var data = args[4];
    var key = taskKey(task);
    var ent = taskMap[key];
    if (!ent) return;
    try {
      var raw = ObjC.Object(data);
      var bytes = raw.bytes();
      var len = raw.length();
      if (!bytes || len <= 0) return;
      var ptrBytes = ptr(bytes);
      var buf = Memory.readByteArray(ptrBytes, len);
      if (!buf) return;
      ent.chunks.push(new Uint8Array(buf));
    } catch (e) {
      console.log('[HOOK_DEBUG] didReceiveData 异常: ' + (e.message || e));
    }
  },
};

var didCompleteHandler = {
  onEnter: function (args) {
    var task = args[3];
    var key = taskKey(task);
    var ent = taskMap[key];
    if (!ent) {
      return;
    }
    try {
      var merged = mergeChunks(ent.chunks);
      var reqInfo = requestInfoMap[key] || { method: 'UNKNOWN', requestBody: '' };
      delete taskMap[key];
      delete requestInfoMap[key];

      if (!merged || merged.length <= 0) {
        return;
      }

      // 快速判断是否是JSON（检查前几个字节）
      var isJson = false;
      var checkLen = Math.min(10, merged.length);
      for (var i = 0; i < checkLen; i++) {
        var c = merged[i];
        if (c === 0x7B || c === 0x5B) { // { 或 [
          isJson = true;
          break;
        }
        if (c !== 0x20 && c !== 0x09 && c !== 0x0A && c !== 0x0D) {
          break;
        }
      }

      if (!isJson) return; // 不是JSON，不处理

      // 转换为Base64
      var dataBase64 = '';
      try {
        var bufferPtr = Memory.alloc(merged.length);
        Memory.writeByteArray(bufferPtr, merged);
        var nsData = ObjC.classes.NSData.dataWithBytes_length_(bufferPtr, merged.length);
        var base64Str = nsData.base64EncodedStringWithOptions_(0);
        dataBase64 = base64Str ? base64Str.toString() : '';
      } catch (e) {
        console.log('[Base64转换失败] ' + (e.message || e));
        return;
      }

      var apiKey = ent.apiKey || matchTargetApi(ent.url);
      parseAndEmitFromBase64(apiKey, ent.url, dataBase64, reqInfo.method, reqInfo.requestBody);
    } catch (e) {
      console.log('[HOOK_DEBUG] [delegate] didComplete 处理异常: ' + (e.message || e));
    }
  },
};

function hookDelegateClass(cls) {
  if (!cls) return 0;
  var name = '';
  try { if (cls.name) name = cls.name.toString(); } catch (e) { }
  if (!name && cls.handle) name = cls.handle.toString();
  if (!name) return 0;
  if (hookedDelegateClasses[name]) return 0;
  var n = 0;
  try {
    var sel1 = '- URLSession:dataTask:didReceiveData:';
    var sel2 = '- URLSession:task:didCompleteWithError:';
    if (cls[sel1]) {
      var impl1 = cls[sel1].implementation;
      var k1 = impl1.toString();
      if (!hookedDidReceiveData[k1]) {
        hookedDidReceiveData[k1] = true;
        Interceptor.attach(impl1, didReceiveDataHandler);
        n++;
      }
    }
    if (cls[sel2]) {
      var impl2 = cls[sel2].implementation;
      var k2 = impl2.toString();
      if (!hookedDidComplete[k2]) {
        hookedDidComplete[k2] = true;
        Interceptor.attach(impl2, didCompleteHandler);
        n++;
      }
    }
    if (n > 0) {
      hookedDelegateClasses[name] = true;
      console.log('[Frida] 已 hook 该 session 的 delegate 类: ' + name);
    }
  } catch (e) {
    console.log('[Frida] hookDelegateClass 失败: ' + name + ' ' + (e.message || e));
  }
  return n;
}

function hookDelegateMethod(sel, handler) {
  var hooked = sel.indexOf('didReceiveData') !== -1 ? hookedDidReceiveData : hookedDidComplete;
  var count = 0;
  try {
    var enumerated = ObjC.enumerateLoadedClassesSync();
    for (var name in enumerated) {
      try {
        var c = ObjC.classes[name];
        if (!c || !c[sel]) continue;
        var impl = c[sel].implementation;
        var implKey = impl.toString();
        if (hooked[implKey]) continue;
        hooked[implKey] = true;
        Interceptor.attach(impl, handler);
        count++;
      } catch (e) { }
    }
  } catch (e) {
    console.log('[Frida] enumerateLoadedClassesSync 失败: ' + (e.message || e));
  }
  return count;
}

function installDelegateHooks() {
  var n1 = hookDelegateMethod('- URLSession:dataTask:didReceiveData:', didReceiveDataHandler);
  var n2 = hookDelegateMethod('- URLSession:task:didCompleteWithError:', didCompleteHandler);
  return n1 + n2;
}

var ok1 = false;
var ok2 = false;
var ok3 = false;
try {
  ok1 = installRequestCompletionHook();
  if (ok1) console.log('[Frida] 已 replace dataTaskWithRequest:completionHandler:');
} catch (e) {
  console.log('[Frida] dataTaskWithRequest:completionHandler: 失败: ' + (e.message || e));
}
try {
  ok2 = installURLCompletionHook();
  if (ok2) console.log('[Frida] 已 replace dataTaskWithURL:completionHandler:');
} catch (e) {
  console.log('[Frida] dataTaskWithURL:completionHandler: 失败: ' + (e.message || e));
}
try {
  ok3 = installRequestOnlyHook();
  if (ok3) console.log('[Frida] 已 attach dataTaskWithRequest: (delegate)，并记录 task->url');
} catch (e) { }
var ok4 = 0;
try {
  ok4 = installDelegateHooks();
  if (ok4 > 0) console.log('[Frida] 已 hook delegate didReceiveData/didComplete 共 ' + ok4 + ' 处，可解析 delegate 响应');
} catch (e) {
  console.log('[Frida] delegate hooks 失败: ' + (e.message || e));
}

if (typeof setTimeout !== 'undefined') {
  setTimeout(function () {
    try {
      var n = installDelegateHooks();
      if (n > 0) console.log('[Frida] 延迟 fallback: 再 hook delegate 共 ' + n + ' 处');
    } catch (e) { }
  }, 3000);
}

console.log('[Frida] 脚本已加载，监控并拦截目标 API。');
//console.log('[Frida] 拦截的数据将转发到 Electron 主进程。');

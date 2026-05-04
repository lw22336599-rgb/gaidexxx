import { version } from '~/package.json'

export function newaxios(config) {
  return new Promise((resolve, reject) => {
    const { method = 'GET', url, data, headers = {}, timeout = 0 } = config
    const xhr = new XMLHttpRequest()

    // 设置请求方法和URL
    xhr.open(method, url, true)

    // 设置请求头，自动添加客户端版本号
    const finalHeaders = {
      ...headers,
      'client-version': version
    }
    Object.keys(finalHeaders).forEach(key => {
      xhr.setRequestHeader(key, finalHeaders[key])
    })

    // 设置超时
    xhr.timeout = timeout

    // 处理响应
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              data: JSON.parse(xhr.responseText),
              status: xhr.status,
              statusText: xhr.statusText,
              headers: parseHeaders(xhr.getAllResponseHeaders()),
              config: config,
              request: xhr
            })
          } else {
            reject({
              status: xhr.status,
              statusText: xhr.statusText,
              data: xhr.responseText,
              config: config,
              request: xhr
            })
          }
        } catch (error) {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
            data: xhr.responseText,
            config: config,
            request: xhr,
            error: error.message
          })
        }
      }
    }

    // 处理网络错误
    xhr.onerror = function () {
      reject(new Error('Network Error'))
    }

    // 处理超时
    xhr.ontimeout = function () {
      reject(new Error(`Request timed out after ${timeout}ms`))
    }

    // 发送请求
    xhr.send(data ? JSON.stringify(data) : null)
  })
}

// 辅助函数：解析响应头
function parseHeaders(headersString) {
  const headers = {}
  if (!headersString) return headers

  headersString.split('\r\n').forEach(header => {
    const [key, value] = header.split(': ')
    if (key) {
      headers[key] = value
    }
  })

  return headers
}

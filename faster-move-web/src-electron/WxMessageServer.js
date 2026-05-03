/**
 * 微信消息服务器管理器
 * 为每个微信机器人创建独立的HTTP服务器接收hook消息
 */

const http = require('http')
const { WxMessageHandler } = require('./WxMessageHandler')

class WxMessageServerManager {
  constructor() {
    /** @type {Map<string, {server: http.Server, port: number, wxHttpConfig: any}>} */
    this.servers = new Map()
    this.messageHandler = new WxMessageHandler()
  }

  /**
   * 启动HTTP服务器
   * @param {string} robotId 机器人ID
   * @param {number} port 监听端口
   * @param {object} wxHttpConfig 微信HTTP服务配置
   * @param {object} robotInfo 机器人信息
   * @returns {Promise<number>} 返回端口号
   */
  async startServer(robotId, port, wxHttpConfig, robotInfo) {
    // 检查是否已经存在
    if (this.servers.has(robotId)) {
      console.log(`[WxMessageServer] 机器人 ${robotId} 的服务器已存在`)
      return this.servers.get(robotId).port
    }

    return new Promise((resolve, reject) => {
      try {
        const server = http.createServer((req, res) => {
          this.handleRequest(req, res, robotId, wxHttpConfig, robotInfo)
        })

        server.on('error', (error) => {
          console.error(`[WxMessageServer] 服务器启动失败:`, error)
          reject(error)
        })

        server.listen(port, '127.0.0.1', () => {
          console.log(`\n╔════════════════════════════════════════════════════════════════`)
          console.log(`║ [WxMessageServer] 消息服务器启动成功`)
          console.log(`╠════════════════════════════════════════════════════════════════`)
          console.log(`║ 机器人ID:     ${robotId}`)
          console.log(`║ 机器人名称:   ${robotInfo.name || '未知'}`)
          console.log(`║ 监听地址:     http://127.0.0.1:${port}`)
          console.log(`║ 测试地址:     http://127.0.0.1:${port}/test`)
          console.log(`║ 微信HTTP:     ${wxHttpConfig.wxHttpHost}`)
          console.log(`╠════════════════════════════════════════════════════════════════`)
          console.log(`║ 测试方法:`)
          console.log(`║   curl http://127.0.0.1:${port}/test`)
          console.log(`║   或在浏览器中访问: http://127.0.0.1:${port}/test`)
          console.log(`╚════════════════════════════════════════════════════════════════\n`)

          this.servers.set(robotId, { server, port, wxHttpConfig, robotInfo })
          resolve(port)
        })
      } catch (error) {
        console.error(`[WxMessageServer] 创建服务器失败:`, error)
        reject(error)
      }
    })
  }

  /**
   * 停止HTTP服务器
   * @param {string} robotId 机器人ID
   */
  stopServer(robotId) {
    const instance = this.servers.get(robotId)
    if (instance) {
      try {
        instance.server.close(() => {
          console.log(`[WxMessageServer] 机器人 ${robotId} 的消息服务器已停止`)
        })
        this.servers.delete(robotId)
      } catch (error) {
        console.error(`[WxMessageServer] 停止服务器失败:`, error)
      }
    }
  }

  /**
   * 获取服务器端口
   * @param {string} robotId 机器人ID
   * @returns {number|null}
   */
  getPort(robotId) {
    const instance = this.servers.get(robotId)
    return instance ? instance.port : null
  }

  /**
   * 更新机器人信息
   * @param {string} robotId 机器人ID
   * @param {object} robotInfo 新的机器人信息
   */
  updateRobotInfo(robotId, robotInfo) {
    const instance = this.servers.get(robotId)
    if (instance) {
      instance.robotInfo = robotInfo
      console.log(`[WxMessageServer] 机器人 ${robotId} 信息已更新`)
    }
  }

  /**
   * 处理HTTP请求
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @param {string} robotId
   * @param {object} wxHttpConfig
   * @param {object} robotInfo
   */
  async handleRequest(req, res, robotId, wxHttpConfig, robotInfo) {
    const requestTime = new Date().toISOString()
    const requestInfo = {
      time: requestTime,
      method: req.method,
      url: req.url,
      headers: req.headers,
      robotId: robotId
    }

    console.log(`\n========================================`)
    console.log(`[WxMessageServer] 收到请求`)
    console.log(`时间: ${requestTime}`)
    console.log(`机器人ID: ${robotId}`)
    console.log(`方法: ${req.method}`)
    console.log(`URL: ${req.url}`)
    console.log(`Headers:`, JSON.stringify(req.headers, null, 2))
    console.log(`========================================\n`)

    try {
      // 测试路由
      if (req.url === '/test' || req.url === '/ping') {
        console.log(`[WxMessageServer] ✅ 测试路由被访问`)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          code: 1,
          message: 'OK',
          data: {
            robotId: robotId,
            robotName: robotInfo.name,
            serverTime: requestTime,
            status: 'running'
          }
        }))
        return
      }

      // Webhook 路由（接收微信消息）
      if (req.url === '/webhook' || req.url.startsWith('/webhook')) {
        console.log(`[WxMessageServer] 🔔 Webhook路由被访问，这是微信消息回调`)
        // 继续处理POST请求
      }

      // 只处理POST请求（排除测试路由）
      if (req.method !== 'POST') {
        console.log(`[WxMessageServer] 非POST请求，方法: ${req.method}`)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          code: 0,
          message: 'Only POST method is supported',
          hint: 'Use /test or /ping for testing'
        }))
        return
      }

      // 读取请求体
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
        console.log(`[WxMessageServer] 接收数据块，大小: ${chunk.length} 字节`)
      })

      req.on('end', async () => {
        try {
          console.log(`[WxMessageServer] 请求体接收完成`)
          console.log(`[WxMessageServer] 完整消息体:`)
          console.log(body)
          console.log(`----------------------------------------`)

          // 解析消息
          const message = JSON.parse(body)
          console.log(`[WxMessageServer] 解析后的消息:`, JSON.stringify(message, null, 2))

          // 调用消息处理器
          await this.messageHandler.handleMessage(message, robotInfo, wxHttpConfig)

          // 返回成功响应
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ code: 1, message: 'OK' }))
          console.log(`[WxMessageServer] 消息处理完成，已返回响应\n`)
        } catch (error) {
          console.error(`[WxMessageServer] 处理消息失败:`, error)
          console.error(`[WxMessageServer] 错误堆栈:`, error.stack)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ code: 0, message: error.message }))
        }
      })

      req.on('error', (error) => {
        console.error(`[WxMessageServer] 请求错误:`, error)
        console.error(`[WxMessageServer] 错误堆栈:`, error.stack)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ code: 0, message: error.message }))
      })
    } catch (error) {
      console.error(`[WxMessageServer] 处理请求失败:`, error)
      console.error(`[WxMessageServer] 错误堆栈:`, error.stack)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ code: 0, message: error.message }))
    }
  }

  /**
   * 获取所有运行中的服务器信息
   * @returns {Array<{robotId: string, port: number, robotName: string}>}
   */
  getAllServers() {
    const servers = []
    for (const [robotId, instance] of this.servers) {
      servers.push({
        robotId: robotId,
        port: instance.port,
        robotName: instance.robotInfo.name || '未知',
        wxHttpHost: instance.wxHttpConfig.wxHttpHost
      })
    }
    return servers
  }

  /**
   * 输出所有服务器状态
   */
  printStatus() {
    const servers = this.getAllServers()
    if (servers.length === 0) {
      console.log(`[WxMessageServer] 当前没有运行中的消息服务器`)
      return
    }

    console.log(`\n╔════════════════════════════════════════════════════════════════`)
    console.log(`║ [WxMessageServer] 运行中的消息服务器 (${servers.length}个)`)
    console.log(`╠════════════════════════════════════════════════════════════════`)
    servers.forEach((server, index) => {
      console.log(`║ ${index + 1}. ${server.robotName}`)
      console.log(`║    机器人ID: ${server.robotId}`)
      console.log(`║    监听端口: ${server.port}`)
      console.log(`║    测试地址: http://127.0.0.1:${server.port}/test`)
      console.log(`║    微信HTTP: ${server.wxHttpHost}`)
      if (index < servers.length - 1) {
        console.log(`╟────────────────────────────────────────────────────────────────`)
      }
    })
    console.log(`╚════════════════════════════════════════════════════════════════\n`)
  }

  /**
   * 停止所有服务器
   */
  stopAll() {
    console.log(`[WxMessageServer] 停止所有消息服务器...`)
    for (const [robotId, instance] of this.servers) {
      try {
        instance.server.close()
        console.log(`[WxMessageServer] 机器人 ${robotId} 的服务器已停止`)
      } catch (error) {
        console.error(`[WxMessageServer] 停止服务器失败:`, error)
      }
    }
    this.servers.clear()
  }
}

module.exports = { WxMessageServerManager }

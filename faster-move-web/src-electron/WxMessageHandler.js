/**
 * 微信消息处理器
 * 处理各种微信消息命令（设置管理员、绑定门店等）
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')

class WxMessageHandler {
  constructor() {
    // 从本地存储读取配置
    this.loadConfig()
  }

  /**
   * 加载配置
   */
  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'config.json')
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        this.baseUrl = config.baseUrl || 'http://localhost:5265'
        this.token = config.token || ''
      } else {
        // 从 localStorage 读取（如果可用）
        this.baseUrl = 'http://localhost:5265'
        this.token = ''
      }
    } catch (error) {
      console.error('[WxMessageHandler] 加载配置失败:', error)
      this.baseUrl = 'http://localhost:5265'
      this.token = ''
    }
  }

  /**
   * 处理消息
   * @param {object} message 消息对象
   * @param {object} robotInfo 机器人信息
   * @param {object} wxHttpConfig 微信HTTP配置
   */
  async handleMessage(message, robotInfo, wxHttpConfig) {
    try {
      // 检查配置状态
      console.log('[WxMessageHandler] ========== 消息处理开始 ==========')
      console.log('[WxMessageHandler] global.appConfig 状态:')
      console.log('  baseUrl:', global.appConfig?.baseUrl || '未设置')
      console.log('  token存在:', !!global.appConfig?.token)
      console.log('  token长度:', global.appConfig?.token ? global.appConfig.token.length : 0)

      const { fromGroup, fromUser, content } = message

      console.log('[WxMessageHandler] 原始消息对象:', message)
      console.log(
        `[WxMessageHandler] 处理消息: from=${fromUser}, group=${fromGroup}, content=${content}`
      )

      // 提取 @用户列表
      // 注意：<atuserlist> 是在 XML 的 signature 字段里，而不是 content 里
      const signature = typeof message.signature === 'string' ? message.signature : ''
      const atUserMatch = signature.match(/<atuserlist>(.*?)<\/atuserlist>/)
      const atUser = atUserMatch ? atUserMatch[1] : null

      console.log(
        `[WxMessageHandler] 解析@信息: hasAt=${content.includes('@')}, atUser=${atUser || 'null'}`
      )

      // 检查权限（非群消息或管理员才能执行命令）
      if (fromUser !== fromGroup && !this.hasPermission(fromUser, robotInfo)) {
        console.log(`[WxMessageHandler] 无权限: ${fromUser}`)
        return
      }

      // 处理群消息中的@命令
      if (fromGroup.includes('@chatroom')) {
        if (content.includes('@') && atUser) {
          console.log('[WxMessageHandler] 检测到群聊@命令')
          if (content.includes('设置管理员')) {
            await this.handleSetManager(atUser, fromGroup, robotInfo, wxHttpConfig)
          } else if (content.includes('取消管理员')) {
            await this.handleRemoveManager(atUser, fromGroup, robotInfo, wxHttpConfig)
          }
        } else if (content.startsWith('绑定')) {
          await this.handleBindShop(content, fromGroup, true, robotInfo, wxHttpConfig)
        }
      }
      // 处理私聊命令
      else {
        if (content === '设置管理员' || content.endsWith('设置管理员')) {
          await this.handleSetManager(fromUser, fromUser, robotInfo, wxHttpConfig)
        } else if (content === '取消管理员' || content.endsWith('取消管理员')) {
          await this.handleRemoveManager(fromUser, fromUser, robotInfo, wxHttpConfig)
        } else if (content === '查看管理员列表' || content === '查看管理员') {
          await this.handleViewManagers(fromUser, robotInfo, wxHttpConfig)
        } else if (content.startsWith('绑定')) {
          await this.handleBindShop(content, fromUser, false, robotInfo, wxHttpConfig)
        }
      }
    } catch (error) {
      console.error('[WxMessageHandler] 处理消息失败:', error)
    }
  }

  /**
   * 检查用户是否有权限
   * @param {string} userId 用户ID
   * @param {object} robotInfo 机器人信息
   * @returns {boolean}
   */
  hasPermission(userId, robotInfo) {
    if (!robotInfo.MannagerOffIds || robotInfo.MannagerOffIds.length === 0) {
      return false
    }
    return robotInfo.MannagerOffIds.includes(userId)
  }

  /**
   * 设置管理员
   * @param {string} userId 用户ID
   * @param {string} targetId 目标ID（发送消息的对象）
   * @param {object} robotInfo 机器人信息
   * @param {object} wxHttpConfig 微信HTTP配置
   */
  async handleSetManager(userId, targetId, robotInfo, wxHttpConfig) {
    try {
      console.log(`[WxMessageHandler] 设置管理员: ${userId}`)

      // 检查 token 是否存在
      const token = this.getToken()
      if (!token) {
        const errorMsg = 'Token 未设置，无法设置管理员。请确保已登录并重新连接机器人。'
        console.error('[WxMessageHandler]', errorMsg)
        await this.sendMsg(targetId, errorMsg, wxHttpConfig)
        return
      }

      // 初始化管理员列表
      if (!robotInfo.MannagerOffIds) {
        robotInfo.MannagerOffIds = []
      }

      // 检查是否已经是管理员
      if (robotInfo.MannagerOffIds.includes(userId)) {
        await this.sendMsg(targetId, '该用户已经是管理员！', wxHttpConfig)
        return
      }

      // 添加管理员
      robotInfo.MannagerOffIds.push(userId)

      // 更新到后端
      await this.updateRobotInfo(robotInfo)

      // 发送成功消息
      await this.sendMsg(targetId, '设置管理员成功！', wxHttpConfig)
    } catch (error) {
      console.error('[WxMessageHandler] 设置管理员失败:', error)
      const errorMsg = error.response?.status === 401
        ? '设置管理员失败：认证失败，请检查登录状态'
        : `设置管理员失败: ${error.message}`
      await this.sendMsg(targetId, errorMsg, wxHttpConfig)
    }
  }

  /**
   * 取消管理员
   * @param {string} userId 用户ID
   * @param {string} targetId 目标ID（发送消息的对象）
   * @param {object} robotInfo 机器人信息
   * @param {object} wxHttpConfig 微信HTTP配置
   */
  async handleRemoveManager(userId, targetId, robotInfo, wxHttpConfig) {
    try {
      console.log(`[WxMessageHandler] 取消管理员: ${userId}`)

      if (!robotInfo.MannagerOffIds || !robotInfo.MannagerOffIds.includes(userId)) {
        await this.sendMsg(targetId, '该用户不是管理员！', wxHttpConfig)
        return
      }

      // 移除管理员
      robotInfo.MannagerOffIds = robotInfo.MannagerOffIds.filter(id => id !== userId)

      // 更新到后端
      await this.updateRobotInfo(robotInfo)

      // 发送成功消息
      await this.sendMsg(targetId, '取消管理员成功！', wxHttpConfig)
    } catch (error) {
      console.error('[WxMessageHandler] 取消管理员失败:', error)
      await this.sendMsg(targetId, `取消管理员失败: ${error.message}`, wxHttpConfig)
    }
  }

  /**
   * 查看管理员列表
   * @param {string} targetId 目标ID（发送消息的对象）
   * @param {object} robotInfo 机器人信息
   * @param {object} wxHttpConfig 微信HTTP配置
   */
  async handleViewManagers(targetId, robotInfo, wxHttpConfig) {
    try {
      console.log(`[WxMessageHandler] 查看管理员列表`)

      if (!robotInfo.MannagerOffIds || robotInfo.MannagerOffIds.length === 0) {
        await this.sendMsg(targetId, '您没有设置任何管理员', wxHttpConfig)
        return
      }

      // 获取成员列表
      const members = await this.getMemberList(robotInfo.id, robotInfo.MannagerOffIds)

      // 格式化消息
      let message = `当前已设置管理员数量：${robotInfo.MannagerOffIds.length}\n`
      members.forEach(member => {
        message += `微信名称: ${member.Name}\n`
      })

      // 发送消息（替换 \r\n 为 \n）
      await this.sendMsg(targetId, message.replace(/\r\n/g, '\n'), wxHttpConfig)
    } catch (error) {
      console.error('[WxMessageHandler] 查看管理员列表失败:', error)
      await this.sendMsg(targetId, `查看管理员列表失败: ${error.message}`, wxHttpConfig)
    }
  }

  /**
   * 绑定门店
   * @param {string} content 消息内容
   * @param {string} targetId 目标ID（发送消息的对象）
   * @param {boolean} isGroup 是否是群聊
   * @param {object} robotInfo 机器人信息
   * @param {object} wxHttpConfig 微信HTTP配置
   */
  async handleBindShop(content, targetId, isGroup, robotInfo, wxHttpConfig) {
    try {
      console.log(`[WxMessageHandler] 绑定门店: ${content}`)

      // 提取门店ID
      const match = content.trim().match(/(\d)+$/)
      if (!match) {
        await this.sendMsg(targetId, '门店ID格式错误，请使用：绑定 [门店ID]', wxHttpConfig)
        return
      }

      const shopOffId = match[0]

      // 调用后端API绑定门店（参考 ServiceHttp.BindShop 实现）
      const shopDb = await this.bindShop(shopOffId, targetId, isGroup, robotInfo)

      // 绑定成功后提醒
      const shopType = shopDb.shop_type != null ? String(shopDb.shop_type) : ''
      const shopName = shopDb.name || ''
      await this.sendMsg(
        targetId,
        `绑定成功！（${shopType}-${shopName}门店）`,
        wxHttpConfig
      )
    } catch (error) {
      console.error('[WxMessageHandler] 绑定门店失败:', error)
      await this.sendMsg(targetId, `绑定失败: ${error.message}`, wxHttpConfig)
    }
  }

  /**
   * 调用后端接口绑定门店（参考 ServiceHttp.BindShop 实现）
   * @param {string} shopOffId 门店编码（外卖平台店铺ID）
   * @param {string} memberOffId 被绑定的微信/群ID
   * @param {boolean} isGroup 是否为群聊
   * @param {object} robotInfo 当前机器人信息（包含 offid 等）
   * @returns {Promise<object>} 绑定成功后的店铺信息(t_wmt_shop_list)
   */
  async bindShop(shopOffId, memberOffId, isGroup, robotInfo) {
    const baseUrl = this.getLocalBaseUrl()
    const token = this.getToken()

    if (!token) {
      throw new Error('Token 未设置，无法绑定门店')
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }

    console.log('[WxMessageHandler] 开始绑定门店流程:', { shopOffId, memberOffId, isGroup })
    console.log('  baseUrl:', baseUrl)

    // 1. 根据 shopOffId 获取店铺信息 (GET /ChatMg/GetShop?shopOffId=xxx)
    let shopDb
    try {
      const shopRes = await axios.get(`${baseUrl}/ChatMg/GetShop`, {
        params: { shopOffId },
        headers,
        timeout: 10000
      })

      const body = shopRes.data || {}
      const code = body.code != null ? body.code : body.Code
      if (code && code !== 200) {
        const msg = body.message || body.msg || '获取店铺信息失败'
        throw new Error(msg)
      }

      // 后端返回格式一般为 { code, message, data: {...} }
      shopDb = body.data || body.Data || body
      if (!shopDb || !shopDb.id) {
        throw new Error('未获取到有效的店铺信息')
      }

      console.log('[WxMessageHandler] 获取店铺信息成功:', {
        id: shopDb.id,
        name: shopDb.name,
        shop_type: shopDb.shop_type
      })
    } catch (err) {
      console.error('[WxMessageHandler] 获取店铺信息失败:', err.message || err)
      throw err
    }

    // 2. 获取当前店铺的聊天推送功能配置 (POST /FunctionUser/GetConf_func)
    let conf
    try {
      const getConfRes = await axios.post(
        `${baseUrl}/FunctionUser/GetConf_func`,
        {
          shop: String(shopDb.id),
          code: 'CHATPUSH'
        },
        { headers, timeout: 10000 }
      )

      const body = getConfRes.data || {}
      const code = body.code != null ? body.code : body.Code
      if (code && code !== 200) {
        const msg = body.message || body.msg || '获取功能配置失败'
        throw new Error(msg)
      }

      // 通常格式为 { code, message, data: { conf_json: {...}, ... } }
      let confContainer = body.data || body.Data || body
      let confJson = confContainer.conf_json

      if (!confJson) {
        // 后端可能返回 null，初始化一个空的配置
        conf = {
          PushGroupOffIds: [],
          PushFriendOffids: [],
          PushNormalClose: null,
          PushNormalAd: null,
          PushBadComment: null,
          PushShopReport: null,
          PushShopEndTime: null,
          PushShopOut: null,
          PushStrFirst: null,
          PushStrLast: null,
          MarkTop: false,
          MarkLow: false,
          CommandBind: true
        }
      } else if (typeof confJson === 'string') {
        try {
          conf = JSON.parse(confJson)
        } catch (e) {
          console.warn('[WxMessageHandler] 解析 conf_json 失败，使用空配置:', e)
          conf = {
            PushGroupOffIds: [],
            PushFriendOffids: [],
            PushNormalClose: null,
            PushNormalAd: null,
            PushBadComment: null,
            PushShopReport: null,
            PushShopEndTime: null,
            MarkTop: false,
            MarkLow: false,
            CommandBind: true
          }
        }
      } else {
        conf = confJson
      }

      // 确保数组字段存在
      if (!Array.isArray(conf.PushGroupOffIds)) conf = { ...conf, PushGroupOffIds: [] }
      if (!Array.isArray(conf.PushFriendOffids)) conf = { ...conf, PushFriendOffids: [] }

      console.log(
        '[WxMessageHandler] 当前功能配置:',
        JSON.stringify(
          {
            PushGroupOffIds: conf.PushGroupOffIds,
            PushFriendOffids: conf.PushFriendOffids
          },
          null,
          2
        )
      )
    } catch (err) {
      console.error('[WxMessageHandler] 获取功能配置失败:', err.message || err)
      throw err
    }

    // 3. 根据是否群聊更新对应的 PushGroupOffIds / PushFriendOffids
    const chatOffId = robotInfo.offid || robotInfo.OffId || robotInfo.offId || ''

    if (!chatOffId) {
      throw new Error('机器人 OffId 为空，无法绑定门店')
    }

    if (isGroup) {
      const exists = (conf.PushGroupOffIds || []).some(
        (x) => x && x.MemberOffid === memberOffId
      )
      if (exists) {
        throw new Error('该店铺已经被绑定了')
      }

      conf.PushGroupOffIds.push({
        MemberOffid: memberOffId,
        ChatOffId: chatOffId
      })
    } else {
      const exists = (conf.PushFriendOffids || []).some(
        (x) => x && x.MemberOffid === memberOffId
      )
      if (exists) {
        throw new Error('该店铺已经被绑定了')
      }

      conf.PushFriendOffids.push({
        MemberOffid: memberOffId,
        ChatOffId: chatOffId
      })
    }

    // 4. 保存配置 (POST /FunctionUser/SetConf_func)
    try {
      await axios.post(
        `${baseUrl}/FunctionUser/SetConf_func`,
        {
          shop: String(shopDb.id),
          code: 'CHATPUSH',
          ConfObj: conf
        },
        { headers, timeout: 10000 }
      )

      console.log('[WxMessageHandler] 门店绑定配置已提交到后端')
    } catch (err) {
      console.error('[WxMessageHandler] 提交功能配置失败:', err.message || err)
      throw err
    }

    return shopDb
  }

  /**
   * 更新机器人信息到后端
   * @param {object} robotInfo 机器人信息
   */
  async updateRobotInfo(robotInfo) {
    try {
      // 读取最新的 baseUrl 和 token
      const localBaseUrl = this.getLocalBaseUrl()
      const token = this.getToken()

      console.log('[WxMessageHandler] 更新机器人信息:')
      console.log('  baseUrl:', localBaseUrl)
      console.log('  token存在:', !!token)
      console.log('  token长度:', token ? token.length : 0)
      console.log('  token前10字符:', token ? token.substring(0, 10) : 'null')

      if (!token) {
        throw new Error('Token 未设置，无法更新机器人信息')
      }

      const url = `${localBaseUrl}/ChatMg/UpdateChatInfo`

      console.log('[WxMessageHandler] 请求URL:', url)

      const response = await axios.post(url, robotInfo, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      })

      console.log('[WxMessageHandler] 机器人信息更新成功:', response.data)
      return response.data
    } catch (error) {
      console.error('[WxMessageHandler] 更新机器人信息失败:', error.message)
      if (error.response) {
        console.error('[WxMessageHandler] 响应状态:', error.response.status)
        console.error('[WxMessageHandler] 响应数据:', error.response.data)
      }
      throw error
    }
  }

  /**
   * 获取成员列表
   * @param {string} chatId 机器人ID
   * @param {string[]} offIds 成员ID列表
   * @returns {Promise<Array>}
   */
  async getMemberList(chatId, offIds) {
    try {
      const localBaseUrl = this.getLocalBaseUrl()
      const token = this.getToken()

      const url = `${localBaseUrl}/ChatMg/client/memberlist?chatId=${chatId}`

      const response = await axios.post(url, offIds, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      })

      return response.data || []
    } catch (error) {
      console.error('[WxMessageHandler] 获取成员列表失败:', error.message)
      return []
    }
  }

  /**
   * 发送消息
   * @param {string} targetId 目标ID
   * @param {string} message 消息内容
   * @param {object} wxHttpConfig 微信HTTP配置
   */
  async sendMsg(targetId, message, wxHttpConfig) {
    try {
      const url = `${wxHttpConfig.wxHttpHost}/api/?type=2`

      const response = await axios.post(url, {
        wxid: targetId,
        msg: message
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      })

      console.log('[WxMessageHandler] 消息发送成功:', response.data)
    } catch (error) {
      console.error('[WxMessageHandler] 发送消息失败:', error.message)
    }
  }

  /**
   * 获取本地 baseUrl
   * @returns {string}
   */
  getLocalBaseUrl() {
    // 从主进程的全局变量获取
    if (global.appConfig && global.appConfig.baseUrl) {
      console.log('[WxMessageHandler] 从 global.appConfig 获取 baseUrl:', global.appConfig.baseUrl)
      return global.appConfig.baseUrl
    }
    console.log('[WxMessageHandler] 使用默认 baseUrl:', this.baseUrl)
    return this.baseUrl
  }

  /**
   * 获取token
   * @returns {string}
   */
  getToken() {
    // 从主进程的全局变量获取
    if (global.appConfig && global.appConfig.token) {
      console.log('[WxMessageHandler] 从 global.appConfig 获取 token (长度:', global.appConfig.token.length, ')')
      return global.appConfig.token
    }
    console.log('[WxMessageHandler] 使用默认 token (长度:', this.token ? this.token.length : 0, ')')
    return this.token
  }
}

module.exports = { WxMessageHandler }

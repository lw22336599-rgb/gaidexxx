/**
 * 微信HTTP服务封装
 * 基于微信Hook的HTTP API，参考 docs/WxHttpFunctions.cs
 */

import axios, { type AxiosInstance, AxiosRequestConfig } from 'axios'
import type { ChatInfo } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatInfo'
import type { ChatMemberItem } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberItem'
import type { ChatMemberPageRequest } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberPageRequest'
import type { ChatMemberPageResult } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberPageResult'
import { ChatType } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType'
import { MemberType } from '@/TsModel/Alien/Entity/Function/CHATPUSH/MemberType'
import type { WxHttpServiceConfig } from '@/types/wechat'

/**
 * 微信HTTP响应结构
 */
interface WxHttpResponse<T = any> {
  code: number
  result: string
  data?: T
}

/**
 * 微信HTTP服务类
 */
export class WxHttpService {
  private client: AxiosInstance
  private host: string
  private myInfo: ChatInfo | null = null
  private hasBegin = false

  /**
   * 将微信返回的字段规范为字符串
   * 有些接口可能会返回 string[]，这里统一取第一个元素并转成字符串
   */
  private normalizeString(value: any): string {
    if (Array.isArray(value)) {
      return value.length > 0 ? String(value[0] ?? '') : ''
    }
    if (value === null || value === undefined) return ''
    return String(value)
  }

  /**
   * 构造函数
   * @param config 服务配置
   */
  constructor(config?: Partial<WxHttpServiceConfig>) {
    const defaultConfig: WxHttpServiceConfig = {
      host: 'http://127.0.0.1:19088',
      port: 19088,
      timeout: 30000
    }

    const finalConfig = { ...defaultConfig, ...config }
    this.host = finalConfig.host

    // 创建axios实例
    this.client = axios.create({
      baseURL: this.host,
      timeout: finalConfig.timeout,
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json'
        // 注意：User-Agent 和 Connection 在浏览器/Electron渲染进程中是受保护的header，
        // 浏览器会自动管理，无需手动设置
      }
    })
  }

  /**
   * 启动聊天Hook服务
   * @param config 可选配置参数
   * @param config.port 监听端口
   * @param config.ip 监听IP地址
   * @param config.url 回调URL
   * @param config.timeout 超时路径（已废弃，实际用作回调路径）
   * @param config.enableHttp 是否启用HTTP（0=是，1=否）
   */
  async startChat(config?: {
    port?: string | number
    ip?: string
    url?: string
    timeout?: string
    enableHttp?: number
  }): Promise<boolean> {
    try {
      const postObj = {
        port: String(config?.port || '19099'),
        ip: config?.ip || '127.0.0.1',
        url: config?.url || 'http://localhost:7014',
        timeout: config?.timeout || '/Chat/OnNewMsg',
        enableHttp: 1 //config?.enableHttp ?? 0,
      }

      console.log('[WxHttpService] 启动聊天Hook服务:', postObj)

      const response = await this.client.post<WxHttpResponse>('/api/?type=9', postObj)
      const data = response.data

      const result = data.result?.toLowerCase() === 'ok' || data.code === 1
      if (!result) {
        throw new Error(data.result || '启动聊天服务失败')
      }

      this.hasBegin = true
      console.log('[WxHttpService] 聊天Hook服务已启动')
      return result
    } catch (error) {
      console.error('[WxHttpService] 启动聊天服务失败:', error)
      throw error
    }
  }

  /**
   * 检查微信在线状态
   */
  async checkOnLine(): Promise<boolean> {
    try {
      const response = await this.client.post<WxHttpResponse>('/api/?type=0')
      const data = response.data
      return data.result?.toLowerCase() === 'ok'
    } catch (error) {
      console.error('检查在线状态失败:', error)
      return false
    }
  }

  /**
   * 获取个人信息
   */
  async getMyInfo(): Promise<ChatInfo> {
    try {
      const response = await this.client.post<WxHttpResponse>('/api/?type=1')
      const data = response.data.data
      const accountRaw = data.account
      const accountEffective = accountRaw != null && accountRaw !== '' ? String(accountRaw) : data.wxid || ''

      this.myInfo = {
        ChatType: ChatType.WechatPc,
        Name: data.name || '',
        HeadImg: data.headImage || null,
        OffId: data.wxid || '',
        OtherValues: {
          mobile: data.mobile || '',
          account: accountEffective, // account 为 null/"" 时用 wxid，用于判断是否登录
          city: data.city || '',
          country: data.country || '',
          province: data.province || '',
          signature: data.signature || ''
        }
      }

      return this.myInfo
    } catch (error) {
      console.error('获取个人信息失败:', error)
      throw error
    }
  }

  /**
   * 获取联系人列表（包括好友和群）
   */
  async getMemberList(): Promise<ChatMemberItem[]> {
    try {
      const response = await this.client.post<WxHttpResponse>('/api/?type=46', {
        wxids: 'notify@all',
        chatRoomId: '123@chatroom',
        msg: '你好啊'
      })

      const members = response.data.data.map((item: any) => {
        const wxId = this.normalizeString(item.wxid)
        const isGroup = wxId.includes('@chatroom')

        return {
          ChatType: ChatType.WechatPc,
          MemType: isGroup ? MemberType.群 : MemberType.好友,
          Name: this.normalizeString(item.userName || item.nickname || wxId),
          Remark: null,
          HeadImg: null,
          Offid: wxId,
          OtherValues: {
            custom_account: item.customAccount || ''
          }
        } as ChatMemberItem
      })

      // 获取备注信息
      const membersWithRemark = await this.getMemberRemark(members)
      return membersWithRemark
    } catch (error) {
      console.error('获取联系人列表失败:', error)
      throw error
    }
  }

  /**
   * 获取好友列表
   */
  async getFriendList(): Promise<ChatMemberItem[]> {
    const allMembers = await this.getMemberList()
    return allMembers.filter(m => m.MemType === MemberType.好友)
  }

  /**
   * 获取群列表
   */
  async getGroupList(): Promise<ChatMemberItem[]> {
    const allMembers = await this.getMemberList()
    return allMembers.filter(m => m.MemType === MemberType.群)
  }

  /**
   * 获取好友列表（支持分页和关键词过滤）
   * @param request 分页请求参数
   */
  async getFriendListWithPagination(request: ChatMemberPageRequest): Promise<ChatMemberPageResult> {
    // 获取所有好友
    const allFriends = await this.getFriendList()
    return this.filterAndPaginate(allFriends, request)
  }

  /**
   * 获取群列表（支持分页和关键词过滤）
   * @param request 分页请求参数
   */
  async getGroupListWithPagination(request: ChatMemberPageRequest): Promise<ChatMemberPageResult> {
    // 获取所有群
    const allGroups = await this.getGroupList()
    return this.filterAndPaginate(allGroups, request)
  }

  /**
   * 通用的过滤和分页函数
   * @param list 成员列表
   * @param request 分页请求参数
   */
  private filterAndPaginate(list: ChatMemberItem[], request: ChatMemberPageRequest): ChatMemberPageResult {
    let filteredList = list

    const reqAny = request as ChatMemberPageRequest & { onlyMemberOffIds?: string[] | null }
    const onlyRaw = request.OnlyMemberOffIds ?? reqAny.onlyMemberOffIds
    if (onlyRaw != null) {
      const allow = new Set(onlyRaw.map(id => this.normalizeString(id)).filter(id => id.length > 0))
      filteredList = allow.size === 0 ? [] : filteredList.filter(item => allow.has(item.Offid))
    }

    // 根据关键词过滤
    if (request.Keyword) {
      const keyword = request.Keyword.toLowerCase()
      filteredList = filteredList.filter(
        item =>
          item.Name.toLowerCase().includes(keyword) ||
          item.Remark?.toLowerCase().includes(keyword) ||
          item.Offid.toLowerCase().includes(keyword)
      )
    }

    // 2. 计算分页
    const total = filteredList.length
    const startIndex = (request.PageIndex - 1) * request.PageSize
    const endIndex = startIndex + request.PageSize
    const items = filteredList.slice(startIndex, endIndex)

    // 3. 返回分页结果
    return {
      Total: total,
      PageIndex: request.PageIndex,
      PageSize: request.PageSize,
      TotalPages: Math.ceil(total / request.PageSize),
      Items: items
    }
  }

  /**
   * 根据offIds获取成员信息
   */
  async getMemberListByIds(memberOffIds: string[]): Promise<ChatMemberItem[]> {
    const allMembers = await this.getMemberList()
    return memberOffIds.map(offId => {
      const normalizedOffId = this.normalizeString(offId)
      const member = allMembers.find(m => m.Offid === normalizedOffId)
      return (
        member || {
          ChatType: ChatType.WechatPc,
          MemType: MemberType.好友,
          Name: normalizedOffId,
          Offid: normalizedOffId,
          Remark: null,
          HeadImg: null,
          OtherValues: null
        }
      )
    })
  }

  /**
   * 发送消息
   * @param wxId 接收者微信ID
   * @param msgContent 消息内容
   */
  async sendMsg(wxId: string, msgContent: string): Promise<boolean> {
    try {
      const response = await this.client.post<WxHttpResponse>('/api/?type=2', {
        wxid: wxId,
        msg: msgContent
      })

      return response.data.result?.toLowerCase() === 'ok'
    } catch (error) {
      console.error('发送消息失败:', error)
      return false
    }
  }

  /**
   * 获取成员备注信息
   * @param members 成员列表
   */
  private async getMemberRemark(members: ChatMemberItem[]): Promise<ChatMemberItem[]> {
    try {
      // 查询数据库获取备注
      const dbHandle = await this.queryDbHandle('MicroMsg.db')
      const sql = 'select UserName,Remark,NickName from Contact'

      const response = await this.client.post<WxHttpResponse>('/api/?type=34', {
        dbHandle,
        sql
      })

      const rows = response.data.data as string[][]

      // 第一行是列名
      if (rows.length <= 1) {
        return members
      }

      // 构建备注映射
      const remarkMap = new Map<string, string>()
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        const userName = row[0] // UserName
        const remark = row[1] // Remark
        if (userName && remark) {
          remarkMap.set(userName, remark)
        }
      }

      // 填充备注
      return members.map(member => ({
        ...member,
        Remark: remarkMap.get(member.Offid) || member.Remark
      }))
    } catch (error) {
      console.error('获取备注信息失败:', error)
      // 即使获取备注失败，也返回原始数据
      return members
    }
  }

  /**
   * 查询数据库句柄
   * @param dbName 数据库名称
   */
  private async queryDbHandle(dbName: string): Promise<string> {
    try {
      const response = await this.client.post<WxHttpResponse>('/api/?type=32')
      const databases = response.data.data as Array<{ databaseName: string; handle: string }>

      const db = databases.find(d => d.databaseName === dbName)
      if (!db) {
        throw new Error(`数据库 ${dbName} 未找到`)
      }

      return db.handle
    } catch (error) {
      console.error('查询数据库句柄失败:', error)
      throw error
    }
  }

  /**
   * 获取当前账号信息
   */
  getMyInfoCached(): ChatInfo | null {
    return this.myInfo
  }

  /**
   * 是否已启动
   */
  isStarted(): boolean {
    return this.hasBegin
  }
}

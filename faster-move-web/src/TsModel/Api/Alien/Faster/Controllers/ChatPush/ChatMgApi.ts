/**
 * ChatMg API 请求类
 * 命名空间: Alien.Faster.Controllers.ChatPush
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

import type { ChatInfo } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatInfo'
import type { ChatMemberItem } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberItem'
import type { ChatMemberPageRequest } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberPageRequest'
import type { ChatMemberPageResult } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatMemberPageResult'
import type { ChatType } from '@/TsModel/Alien/Entity/Function/CHATPUSH/ChatType'
import type { t_chat_push_list } from '@/TsModel/Alien/Entity/Tables/function/chat_push/t_chat_push_list'
import type { t_wmt_shop_list } from '@/TsModel/Alien/Entity/Tables/shop/t_wmt_shop_list'
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo'

export class ChatMgApi {
  private baseUrl: string
  private axiosInstance: AxiosInstance

  constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
    this.axiosInstance = axiosInstance
    this.baseUrl = baseUrl
  }

  /** 获取推送账号列表 */
  async GetPageList(
    page: number,
    pageSize: number /** 需要筛选的机器人类型（可多选，可为空） */,
    chatTypes?: ChatType[]
  ): Promise<PageResultVo<t_chat_push_list>> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/ChatMg/GetPageList`,
      data: chatTypes,
      params: { page, pageSize }
    }

    const response: AxiosResponse<PageResultVo<t_chat_push_list>> = await this.axiosInstance(config)
    return response.data
  }

  /** 添加或更新账号 */
  async UpdateChatInfo(info: t_chat_push_list): Promise<t_chat_push_list> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/ChatMg/UpdateChatInfo`,
      data: info
    }

    const response: AxiosResponse<t_chat_push_list> = await this.axiosInstance(config)
    return response.data
  }

  /** 通过店铺官方id查店铺id */
  async GetShop(shopOffId: string): Promise<t_wmt_shop_list> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.baseUrl}/ChatMg/GetShop`,
      params: { shopOffId }
    }

    const response: AxiosResponse<t_wmt_shop_list> = await this.axiosInstance(config)
    return response.data
  }

  /** 获取聊天账号信息（通过 SignalR 调用客户端） */
  async GetMyInfo(/** 聊天账号ID (t_chat_push_list.id) */ chatId: string): Promise<ChatInfo> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: `${this.baseUrl}/ChatMg/client/myinfo`,
      params: { chatId }
    }

    const response: AxiosResponse<ChatInfo> = await this.axiosInstance(config)
    return response.data
  }

  /** 获取好友列表（通过 SignalR 调用客户端，支持分页和关键词过滤） */
  async GetFriendList(
    /** 聊天账号ID (t_chat_push_list.id) */
    chatId: string /** 页码（从1开始，默认1） */,
    pageIndex: number /** 每页数量（默认20） */,
    pageSize: number /** 关键词（搜索昵称、备注、ID，可选） */,
    keyword?: string /** 仅返回这些 OffId（白名单），可选 */,
    onlyMemberOffIds?: string[] | null
  ): Promise<ChatMemberPageResult> {
    const body: ChatMemberPageRequest = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      Keyword: keyword ?? null,
      OnlyMemberOffIds: onlyMemberOffIds != null && onlyMemberOffIds.length > 0 ? onlyMemberOffIds : null
    }
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/ChatMg/client/friendlist`,
      params: { chatId },
      data: body
    }

    const response: AxiosResponse<ChatMemberPageResult> = await this.axiosInstance(config)
    return response.data
  }

  /** 获取群列表（通过 SignalR 调用客户端，支持分页和关键词过滤） */
  async GetGroupList(
    /** 聊天账号ID (t_chat_push_list.id) */
    chatId: string /** 页码（从1开始，默认1） */,
    pageIndex: number /** 每页数量（默认20） */,
    pageSize: number /** 关键词（搜索昵称、备注、ID，可选） */,
    keyword?: string /** 仅返回这些 OffId（白名单），可选 */,
    onlyMemberOffIds?: string[] | null
  ): Promise<ChatMemberPageResult> {
    const body: ChatMemberPageRequest = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      Keyword: keyword ?? null,
      OnlyMemberOffIds: onlyMemberOffIds != null && onlyMemberOffIds.length > 0 ? onlyMemberOffIds : null
    }
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/ChatMg/client/grouplist`,
      params: { chatId },
      data: body
    }

    const response: AxiosResponse<ChatMemberPageResult> = await this.axiosInstance(config)
    return response.data
  }

  /** 获取指定成员列表（通过 SignalR 调用客户端） */
  async GetMemberList(
    /** 聊天账号ID (t_chat_push_list.id) */
    chatId: string /** 成员ID列表 */,
    offIds: string[]
  ): Promise<ChatMemberItem[]> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/ChatMg/client/memberlist`,
      data: offIds,
      params: { chatId }
    }

    const response: AxiosResponse<ChatMemberItem[]> = await this.axiosInstance(config)
    return response.data
  }

  /** 测试推送消息（通过 SignalR 调用客户端） */
  async PushTestMessage(
    /** 聊天账号ID (t_chat_push_list.id) */
    chatId: string /** 接收消息的成员ID（好友ID或群ID） */,
    memberOffId: string /** 消息内容 */,
    message: string
  ): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/ChatMg/client/pushmsg`,
      data: message,
      params: { chatId, memberOffId }
    }

    const response: AxiosResponse<void> = await this.axiosInstance(config)
    return response.data
  }

  /** 删除机器人 */
  async DeleteChatBot(/** 聊天账号ID (t_chat_push_list.id) */ chatId: string): Promise<boolean> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: `${this.baseUrl}/ChatMg/client/deletechatbot`,
      params: { chatId }
    }

    const response: AxiosResponse<boolean> = await this.axiosInstance(config)
    return response.data
  }
}

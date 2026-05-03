/**
 * ChatClientTypeDef API 请求类
 * 命名空间: Alien.Faster.Controllers.Developer
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {ChatClientTypeDef} from "@/TsModel/Alien/Faster/Controllers/Developer/ChatClientTypeDef";

/** 聊天客户端类型定义接口
用于生成 TypeScript 类型定义，方便前端开发
包含 SignalR 聊天客户端和 Webhook 推送所需的所有类型 */
export class ChatClientTypeDefApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取所有聊天客户端相关的类型定义
用于前端 TypeScript 生成，包含 ChatClientHub 所需的所有枚举、实体和配置类型 */
	async GetChatClientTypeDef(): Promise<ChatClientTypeDef> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ChatClientTypeDef/GetChatClientTypeDef`,
		};

		const response: AxiosResponse<ChatClientTypeDef> = await this.axiosInstance(config);
		return response.data;
	}

}

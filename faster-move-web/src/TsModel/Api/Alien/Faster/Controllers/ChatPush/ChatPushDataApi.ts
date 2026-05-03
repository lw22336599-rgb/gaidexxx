/**
 * ChatPushData API 请求类
 * 命名空间: Alien.Faster.Controllers.ChatPush
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {BatchChatPushPush_parm} from "@/TsModel/Alien/Entity/Function/CHATPUSH/BatchChatPushPush_parm";
import {BatchOperationResult} from "@/TsModel/Alien/Entity/Function/BatchOperationResult";

/** 推送数据服务控制器 */
export class ChatPushDataApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取店铺昨日数据 */
	async GetShopYesterdayData(/** 店铺ID */
		shopId: string, /** 是否包含评价数据(默认true) */
		includeComment: boolean): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ChatPushData/GetShopYesterdayData`,
			params: { shopId, includeComment },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 立即推送数据(不需要判断发送时机) */
	async PushDataNow(/** 店铺ID */
		shopId: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ChatPushData/PushDataNow`,
			params: { shopId },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量立即推送数据 */
	async BatchPushDataNow(parm: BatchChatPushPush_parm): Promise<BatchOperationResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ChatPushData/BatchPushDataNow`,
			data: parm,
		};

		const response: AxiosResponse<BatchOperationResult> = await this.axiosInstance(config);
		return response.data;
	}

}

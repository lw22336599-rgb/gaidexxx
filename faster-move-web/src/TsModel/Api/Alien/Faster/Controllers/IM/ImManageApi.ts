/**
 * ImManage API 请求类
 * 命名空间: Alien.Faster.Controllers.IM
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {SessionSummaryVo} from "@/TsModel/Alien/Faster/Controllers/IM/SessionSummaryVo";
import {UnreadCountVo} from "@/TsModel/Alien/Faster/Controllers/IM/UnreadCountVo";

/** IM 消息管理接口
提供会话管理、消息管理、统计等功能 */
export class ImManageApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 标记会话已读
将会话的未读消息数清零 */
	async MarkSessionRead(/** 会话ID */
		sessionId: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ImManage/session/${sessionId}/mark-read`,
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 标记消息已读 */
	async MarkMessageRead(/** 消息ID列表 */
		messageIds: string[]): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ImManage/messages/mark-read`,
			data: messageIds,
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取未读消息总数 */
	async GetUnreadCount(/** 店铺ID（可选） */
		shopId?: string): Promise<UnreadCountVo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ImManage/unread-count`,
			params: { shopId },
		};

		const response: AxiosResponse<UnreadCountVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取会话统计信息 */
	async GetSessionSummary(/** 店铺ID */
		shopId: string, /** 开始日期（可选） */
		startDate?: Date, /** 结束日期（可选） */
		endDate?: Date): Promise<SessionSummaryVo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ImManage/session-summary`,
			params: { shopId, startDate, endDate },
		};

		const response: AxiosResponse<SessionSummaryVo> = await this.axiosInstance(config);
		return response.data;
	}

}

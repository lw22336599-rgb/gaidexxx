/**
 * Feedback API 请求类
 * 命名空间: Alien.Controllers.Admin
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {t_wmt_feedback} from "@/TsModel/Alien/Entity/Tables/sys/t_wmt_feedback";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

/** 反馈列表管理 */
export class FeedbackApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 添加反馈 */
	async AddFeedBack(feedBack: t_wmt_feedback): Promise<t_wmt_feedback> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Feedback/AddFeedBack`,
			data: feedBack,
		};

		const response: AxiosResponse<t_wmt_feedback> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除反馈 */
	async DeleteFeedBack(id: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Feedback/DeleteFeedBack`,
			params: { id },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 已读反馈 */
	async SetRead(id: string, notes?: string): Promise<t_wmt_feedback> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Feedback/SetRead`,
			params: { id, notes },
		};

		const response: AxiosResponse<t_wmt_feedback> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取反馈列表 */
	async GetFeedBack(page: number, pageSize: number): Promise<PageResultVo<t_wmt_feedback>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Feedback/GetFeedBack`,
			params: { page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<t_wmt_feedback>> = await this.axiosInstance(config);
		return response.data;
	}

}

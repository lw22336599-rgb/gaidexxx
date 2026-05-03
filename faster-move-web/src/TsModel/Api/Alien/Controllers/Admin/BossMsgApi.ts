/**
 * BossMsg API 请求类
 * 命名空间: Alien.Controllers.Admin
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {t_wmt_boss_msg} from "@/TsModel/Alien/Entity/Tables/admin/t_wmt_boss_msg";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

/** 商家消息管理 */
export class BossMsgApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 添加消息 */
	async AddMsg(msg: t_wmt_boss_msg): Promise<t_wmt_boss_msg> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/BossMsg/AddMsg`,
			data: msg,
		};

		const response: AxiosResponse<t_wmt_boss_msg> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除消息 */
	async DeleteMsg(id: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/BossMsg/DeleteMsg`,
			params: { id },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新消息 */
	async UpdateMsg(course: t_wmt_boss_msg): Promise<t_wmt_boss_msg> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/BossMsg/UpdateMsg`,
			data: course,
		};

		const response: AxiosResponse<t_wmt_boss_msg> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取消息列表 */
	async GetMsg(page: number, pageSize: number): Promise<PageResultVo<t_wmt_boss_msg>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/BossMsg/GetMsg`,
			params: { page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<t_wmt_boss_msg>> = await this.axiosInstance(config);
		return response.data;
	}

}

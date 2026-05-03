/**
 * LogControlller API 请求类
 * 命名空间: Alien.Controllers.Log
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {t_wmt_log_balance} from "@/TsModel/Alien/Entity/Tables/log/t_wmt_log_balance";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

/** 日志支持 */
export class LogControlllerApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取余额变动日志 */
	async GetLogBalance(page: number, pageSize: number): Promise<PageResultVo<t_wmt_log_balance>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/LogControlller/GetLogBalance`,
			params: { page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<t_wmt_log_balance>> = await this.axiosInstance(config);
		return response.data;
	}

}

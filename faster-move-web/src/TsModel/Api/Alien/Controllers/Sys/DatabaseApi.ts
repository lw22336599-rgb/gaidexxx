/**
 * Database API 请求类
 * 命名空间: Alien.Controllers.Sys
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/** 数据库管理控制器 */
export class DatabaseApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 初始化商品复制数据库的类型 */
	async IniFdmvTableTypes(): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Database/IniFdmvTableTypes`,
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 同步表结构到数据库
扫描所有Entity程序集中的表实体，并初始化表结构 */
	async SyncTableStructure(): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Database/SyncTableStructure`,
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

}

/**
 * Debug API 请求类
 * 命名空间: Alien.Controllers.Sys
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {t_sc_admin} from "@/TsModel/Alien/Entity/Tables/Users/t_sc_admin";

export class DebugApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 用0积分续费的全部恢复 */
	async FixShopTime(): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Debug/FixShopTime`,
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取我的网络信息 */
	async GetMyHttpInfo(): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Debug/GetMyHttpInfo`,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取环境变量 */
	async GetEnvVal(key: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Debug/GetEnvVal`,
			params: { key },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 通过店铺id 检查功能异常项 */
	async GetClientInfo(shopId: string, funcCode?: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Debug/GetClientInfo`,
			params: { shopId, funcCode },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	async GetAdmin(userName: string): Promise<t_sc_admin> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Debug/GetAdmin`,
			params: { userName },
		};

		const response: AxiosResponse<t_sc_admin> = await this.axiosInstance(config);
		return response.data;
	}

}

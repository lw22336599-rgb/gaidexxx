/**
 * Service API 请求类
 * 命名空间: Alien.Faster.Controllers.Sys
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/** 服务端控制层方法下 */
export class ServiceApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	async GetProvinceWithCitys(): Promise<Record<string, string[]>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/system/service/GetProvinceWithCitys`,
		};

		const response: AxiosResponse<Record<string, string[]>> = await this.axiosInstance(config);
		return response.data;
	}

}

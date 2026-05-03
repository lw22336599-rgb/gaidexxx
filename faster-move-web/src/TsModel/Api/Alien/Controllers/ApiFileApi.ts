/**
 * ApiFile API 请求类
 * 命名空间: Alien.Controllers
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class ApiFileApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	async Upload(file: any): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/system/method/file/Upload`,
			data: file,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}

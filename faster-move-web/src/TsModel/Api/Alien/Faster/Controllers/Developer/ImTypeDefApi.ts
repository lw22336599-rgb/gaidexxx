/**
 * ImTypeDef API 请求类
 * 命名空间: Alien.Faster.Controllers.Developer
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {ImTypeDef} from "@/TsModel/Alien/Faster/Controllers/Developer/ImTypeDef";

/** IM类型定义接口
用于生成 TypeScript 类型定义，方便前端开发 */
export class ImTypeDefApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取所有 IM 相关的类型定义
用于前端 TypeScript 生成，包含 ImHub 所需的所有枚举、消息和API类型 */
	async GetImTypeDef(): Promise<ImTypeDef> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ImTypeDef/GetImTypeDef`,
		};

		const response: AxiosResponse<ImTypeDef> = await this.axiosInstance(config);
		return response.data;
	}

}

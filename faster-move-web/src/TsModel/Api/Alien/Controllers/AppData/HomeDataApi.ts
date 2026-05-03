/**
 * HomeData API 请求类
 * 命名空间: Alien.Controllers.AppData
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {AppHomeDataV2} from "@/TsModel/Alien/Controllers/AppData/AppHomeDataV2";
import {AppHomeDataVo} from "@/TsModel/Alien/Controllers/AppData/AppHomeDataVo";

export class HomeDataApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取PC端首页数据 */
	async GetHomeData_old(): Promise<AppHomeDataVo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/HomeData/GetHomeData_old`,
		};

		const response: AxiosResponse<AppHomeDataVo> = await this.axiosInstance(config);
		return response.data;
	}

	async GetHomeData(): Promise<AppHomeDataVo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/HomeData/GetHomeData`,
		};

		const response: AxiosResponse<AppHomeDataVo> = await this.axiosInstance(config);
		return response.data;
	}

	async GetHomeDataV2(): Promise<AppHomeDataV2> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/HomeData/GetHomeDataV2`,
		};

		const response: AxiosResponse<AppHomeDataV2> = await this.axiosInstance(config);
		return response.data;
	}

}

/**
 * FoodDataParse API 请求类
 * 命名空间: Alien.Faster.Controllers.FoodMove
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {ParseWxDataParms} from "@/TsModel/SiteType/Base/Models/FoodMove/ParseWxDataParms";
import {ParseWxDataResultVo} from "@/TsModel/SiteType/Base/Controllers/ParseWxDataResultVo";

export class FoodDataParseApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	async ParseWxData(parms: ParseWxDataParms): Promise<ParseWxDataResultVo> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodDataParse/ParseWxData`,
			data: parms,
		};

		const response: AxiosResponse<ParseWxDataResultVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 尝试转换指定数据到老店 */
	async ParseWxData_go(parms: ParseWxDataParms): Promise<ParseWxDataResultVo> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodDataParse/ParseWxData_go`,
			data: parms,
		};

		const response: AxiosResponse<ParseWxDataResultVo> = await this.axiosInstance(config);
		return response.data;
	}

}

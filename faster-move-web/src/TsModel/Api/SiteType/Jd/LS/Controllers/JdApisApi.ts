/**
 * JdApis API 请求类
 * 命名空间: SiteType.Jd.LS.Controllers
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {IUserManager} from "@/TsModel/Alien/Entity/Interfaces/IUserManager";

export class JdApisApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	async ImportJdLsToJdTg(jdLsShopIds: string[], call: IUserManager): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/jdapi/import-jdls-to-jdtg`,
			data: jdLsShopIds,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}

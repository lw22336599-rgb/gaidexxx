/**
 * ShopLogin API 请求类
 * 命名空间: Alien.Faster.Controllers.Shop
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {ShopLoginParms} from "@/TsModel/Alien/Entity/ShopLogin/ShopLoginParms";
import {ShopLoginResult} from "@/TsModel/Alien/Entity/ShopLogin/ShopLoginResult";

/** 店铺登录控制器 - 供公开访问的登录页面使用 */
export class ShopLoginApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 执行店铺登录 */
	async Login(/** 登录参数 */
		parms: ShopLoginParms, /** 用户ID */
		userId: number): Promise<ShopLoginResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}api/[controller]/login`,
			data: parms,
			params: { userId },
		};

		const response: AxiosResponse<ShopLoginResult> = await this.axiosInstance(config);
		return response.data;
	}

}

/**
 * FdmvManager API 请求类
 * 命名空间: Alien.Faster.Controllers.FoodMove
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {FoodMoveConf} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodMoveConf";
import {QueryShopItemVo} from "@/TsModel/SiteType/Base/Controllers/QueryShopItemVo";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

export class FdmvManagerApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 创建或分配服务器 */
	async CreateClient(conf: FoodMoveConf): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FdmvManager/CreateClient`,
			data: conf,
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 清空历史 */
	async ClearHistory(newOffid: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FdmvManager/ClearHistory`,
			params: { newOffid },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 查询名下店铺 */
	async QueryShops(words: string, queyShopType: ShopType, newShopType: ShopType): Promise<QueryShopItemVo[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FdmvManager/QueryShops`,
			params: { words, queyShopType, newShopType },
		};

		const response: AxiosResponse<QueryShopItemVo[]> = await this.axiosInstance(config);
		return response.data;
	}

}

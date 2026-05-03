/**
 * ShopUserGroup API 请求类
 * 命名空间: Alien.Controllers.Shop
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {ConnectGroupVoParms} from "@/TsModel/Alien/Controllers/Shop/ConnectGroupVoParms";
import {GetShopListParmsVo} from "@/TsModel/Alien/Controllers/Shop/GetShopListParmsVo";
import {GroupShopInfoVo} from "@/TsModel/Alien/Controllers/Shop/GroupShopInfoVo";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

/** 用户对店铺的分组 */
export class ShopUserGroupApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 将店铺加到分组 */
	async ConnectGroup(parms: ConnectGroupVoParms): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopUserGroup/ConnectGroup`,
			data: parms,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 将店铺移出分组 */
	async RemoveGroup(parms: ConnectGroupVoParms): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopUserGroup/RemoveGroup`,
			data: parms,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取指定分组下的店铺列表 */
	async GetShopList(groupId: string, page: number, pageSize: number): Promise<PageResultVo<GroupShopInfoVo>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopUserGroup/GetShopList`,
			params: { groupId, page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<GroupShopInfoVo>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取已关联店铺列表或没有关联店铺的列表 */
	async GetShopListHas(parms: GetShopListParmsVo): Promise<PageResultVo<GroupShopInfoVo>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopUserGroup/GetShopListHas`,
			data: parms,
		};

		const response: AxiosResponse<PageResultVo<GroupShopInfoVo>> = await this.axiosInstance(config);
		return response.data;
	}

}

/**
 * FoodGif API 请求类
 * 命名空间: Alien.Controllers.Function
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {ConnectGifGroupParms} from "@/TsModel/Alien/Controllers/Function/ConnectGifGroupParms";
import {GetGifListParmsVo} from "@/TsModel/Alien/Controllers/Function/GetGifListParmsVo";
import {t_wmt_fc_foodgif_list} from "@/TsModel/Alien/Entity/Tables/function/foodGif/t_wmt_fc_foodgif_list";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

export class FoodGifApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 将动图加到分组 */
	async ConnectGroup(parms: ConnectGifGroupParms): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodGif/ConnectGroup`,
			data: parms,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 将店铺移出分组 */
	async RemoveGroup(parms: ConnectGifGroupParms): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodGif/RemoveGroup`,
			data: parms,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 根据条件获取动图列表 */
	async GetGifList(parms: GetGifListParmsVo): Promise<PageResultVo<t_wmt_fc_foodgif_list>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodGif/GetGifList`,
			data: parms,
		};

		const response: AxiosResponse<PageResultVo<t_wmt_fc_foodgif_list>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 增加动图 */
	async AddGif(parms: t_wmt_fc_foodgif_list): Promise<t_wmt_fc_foodgif_list> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodGif/AddGif`,
			data: parms,
		};

		const response: AxiosResponse<t_wmt_fc_foodgif_list> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除动图 */
	async DeleteGif(/** 动图id */
		ids: string[]): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodGif/DeleteGif`,
			data: ids,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	async UpdateGif(parms: t_wmt_fc_foodgif_list): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodGif/UpdateGif`,
			data: parms,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

}

/**
 * FunctionApp API 请求类
 * 命名空间: Alien.Controllers.Function
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {FunctionSaveVo} from "@/TsModel/Alien/Controllers/Function/FunctionSaveVo";
import {GetFuncListItemVo} from "@/TsModel/Alien/Controllers/Function/GetFuncListItemVo";
import {ShopListFunctionColumnVo} from "@/TsModel/Alien/Controllers/Function/ShopListFunctionColumnVo";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {t_wmt_function} from "@/TsModel/Alien/Entity/Tables/function/t_wmt_function";

/** 功能应用管理(没有添加,只有改查) */
export class FunctionAppApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取功能列表 */
	async GetFuncList(/** 门店类型 */
		shopType: ShopType, /** 是否启用(空则全部) */
		avtag?: boolean): Promise<GetFuncListItemVo[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FunctionApp/GetFuncList`,
			params: { shopType, avtag },
		};

		const response: AxiosResponse<GetFuncListItemVo[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取店铺列表中需要显示的功能项列。固定返回：自动出餐、自动回复、自动回评、自动点金、菜品美化（若平台支持）；其余功能仅当实现 IFunctionUI 时返回。hasBlazorUI 表示是否有 Blazor 配置 UI，供前端决定是否显示「设置」入口。 */
	async GetShopListFunctionColumns(/** 平台/门店类型 */
		shopType: ShopType): Promise<ShopListFunctionColumnVo[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FunctionApp/GetShopListFunctionColumns`,
			params: { shopType },
		};

		const response: AxiosResponse<ShopListFunctionColumnVo[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 禁用或启用(上线或下线) 功能 */
	async SetAvtag(/** 功能id */
		id: string, /** 禁用或启用 */
		avtag: boolean): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionApp/SetAvtag`,
			params: { id, avtag },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 添加功能 */
	async AddFunction(func: t_wmt_function): Promise<t_wmt_function> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionApp/AddFunction`,
			data: func,
		};

		const response: AxiosResponse<t_wmt_function> = await this.axiosInstance(config);
		return response.data;
	}

	async UpdateFunction(vo: FunctionSaveVo): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionApp/UpdateFunction`,
			data: vo,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除功能
删除条件：没有在功能价格中引用且在功能店铺中不存在或已到期（已到期会自动删除） */
	async DeleteFunction(/** 功能id */
		id: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionApp/DeleteFunction`,
			params: { id },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

}

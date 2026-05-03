/**
 * FunctionPrice API 请求类
 * 命名空间: Alien.Controllers.Function
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {BatchPayShop_Result} from "@/TsModel/Alien/Controllers/Function/BatchPayShop_Result";
import {BatchPayShopV2_Parm} from "@/TsModel/Alien/Controllers/Function/BatchPayShopV2_Parm";
import {FunctionPriceWithFuncNameVo} from "@/TsModel/Alien/Controllers/Function/FunctionPriceWithFuncNameVo";
import {GetFunctionPricePageParm} from "@/TsModel/Alien/Controllers/Function/GetFunctionPricePageParm";
import {GetFunctionPrices_result_itemV2} from "@/TsModel/Alien/Controllers/Function/GetFunctionPrices_result_itemV2";
import {PayAdminFuncV2_Parm} from "@/TsModel/Alien/Controllers/Function/PayAdminFuncV2_Parm";
import {PayShop_resultV2} from "@/TsModel/Alien/Controllers/Shop/PayShop_resultV2";
import {PayShopV2_Parm} from "@/TsModel/Alien/Controllers/Function/PayShopV2_Parm";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {t_wmt_function_price} from "@/TsModel/Alien/Entity/Tables/function/t_wmt_function_price";
import {t_wmt_function} from "@/TsModel/Alien/Entity/Tables/function/t_wmt_function";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

/** 功能续费与价格一定程管理 */
export class FunctionPriceApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 为店铺续费指定功能 */
	async PayForShopFunc(parmObj: PayShopV2_Parm): Promise<PayShop_resultV2> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionPrice/PayForShopFunc`,
			data: parmObj,
		};

		const response: AxiosResponse<PayShop_resultV2> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量为店铺续费指定功能 */
	async BatchPayForShopFunc(parmObj: BatchPayShopV2_Parm): Promise<BatchPayShop_Result> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionPrice/BatchPayForShopFunc`,
			data: parmObj,
		};

		const response: AxiosResponse<BatchPayShop_Result> = await this.axiosInstance(config);
		return response.data;
	}

	/** 为用户续费指定功能 */
	async PayForAdminFunc(parmObj: PayAdminFuncV2_Parm): Promise<PayShop_resultV2> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionPrice/PayForAdminFunc`,
			data: parmObj,
		};

		const response: AxiosResponse<PayShop_resultV2> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取功能列表 */
	async GetFuncList(/** 门店类型 */
		shopType: ShopType): Promise<t_wmt_function[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FunctionPrice/GetFuncList`,
			params: { shopType },
		};

		const response: AxiosResponse<t_wmt_function[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 分页获取功能价格列表,可选按店铺类型筛选 */
	async GetPricePageList(/** 分页与筛选参数(包含可选价格名称与功能代码筛选) */
		parms: GetFunctionPricePageParm): Promise<PageResultVo<FunctionPriceWithFuncNameVo>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionPrice/GetPricePageList`,
			data: parms,
		};

		const response: AxiosResponse<PageResultVo<FunctionPriceWithFuncNameVo>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取代理向店铺续费时,能使用的套餐,规格类型 */
	async GetFunctionPrices(/** 平台类型 */
		shopType: ShopType, /** 规格名称(如果是指定功能就传功能项代码) */
		priceTitle: string, /** 关键词模式 */
		isKeyWord: boolean): Promise<GetFunctionPrices_result_itemV2[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FunctionPrice/GetFunctionPrices`,
			params: { shopType, priceTitle, isKeyWord },
		};

		const response: AxiosResponse<GetFunctionPrices_result_itemV2[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 针对功能项添加价格(仅限管理员) */
	async AddPrice(price: t_wmt_function_price): Promise<t_wmt_function_price> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionPrice/AddPrice`,
			data: price,
		};

		const response: AxiosResponse<t_wmt_function_price> = await this.axiosInstance(config);
		return response.data;
	}

	/** 启用或禁用某个功能价格(仅限管理员) */
	async SetPriceEnable(/** 价格ID */
		id: string, /** true 表示启用, false 表示禁用 */
		enable: boolean): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionPrice/SetPriceEnable`,
			params: { id, enable },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 修改功能价格信息(仅限管理员) */
	async UpdatePrice(/** 要修改的价格实体(必须包含有效的 id) */
		price: t_wmt_function_price): Promise<t_wmt_function_price> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionPrice/UpdatePrice`,
			data: price,
		};

		const response: AxiosResponse<t_wmt_function_price> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除指定的功能价格(仅限管理员) */
	async DeletePrice(/** 要删除的价格ID */
		id: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionPrice/DeletePrice`,
			params: { id },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 根据ID获取单个功能价格(包含友好的功能名称集合) */
	async GetPriceById(/** 价格ID */
		id: string): Promise<FunctionPriceWithFuncNameVo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FunctionPrice/GetPriceById`,
			params: { id },
		};

		const response: AxiosResponse<FunctionPriceWithFuncNameVo> = await this.axiosInstance(config);
		return response.data;
	}

}

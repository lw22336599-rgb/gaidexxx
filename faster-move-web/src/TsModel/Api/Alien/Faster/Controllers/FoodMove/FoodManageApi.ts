/**
 * FoodManage API 请求类
 * 命名空间: Alien.Faster.Controllers.FoodMove
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {DeleteFirstFoodImageParms} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/DeleteFirstFoodImageParms";
import {DeleteFoodsParms} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/DeleteFoodsParms";
import {FoodGroupVoItem} from "@/TsModel/SiteType/Base/Models/FoodMove/FoodGroupVoItem";
import {FoodItemVo} from "@/TsModel/SiteType/Base/Models/FoodMove/FoodItemVo";
import {FoodManageParmsBase} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/FoodManageParmsBase";
import {OfflineDiscountParms} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/OfflineDiscountParms";
import {PullShopFoodsV2Parms} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/PullShopFoodsV2Parms";
import {QueryFoodsParms} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/QueryFoodsParms";
import {RecoverFoodParms} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/RecoverFoodParms";
import {UpdateFoodDiscountParms} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/UpdateFoodDiscountParms";
import {UpdateFoodImageBorderParms} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/UpdateFoodImageBorderParms";
import {UpdateFoodNameParms} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/UpdateFoodNameParms";
import {UpdateFoodPriceParms} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/UpdateFoodPriceParms";
import {UpdateFoodStateParms} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/UpdateFoodStateParms";
import {UpdateFoodStockParms} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/UpdateFoodStockParms";
import {UpdateMinBuyParms} from "@/TsModel/Alien/Entity/Function/FOODMANAGE/UpdateMinBuyParms";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

/** 食品管理控制器V2 - 基于后台任务实现 */
export class FoodManageApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 进度条测试 */
	async ProgressTest(taskId: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/ProgressTest`,
			params: { taskId },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 从平台拉取商品数据并存储到数据库 */
	async PullShopFoods(taskId: string, forcedPull: boolean): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/PullShopFoods`,
			params: { taskId, forcedPull },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 强制从平台重新拉取商品数据并存储到数据库 */
	async PullShopFoodsV2(parms: PullShopFoodsV2Parms): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/PullShopFoodsV2`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除本地活动后强制从平台拉取活动 */
	async PullShopAct(parms: FoodManageParmsBase): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/PullShopAct`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取分组列表 */
	async GetGroups(taskId: string): Promise<FoodGroupVoItem[]> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/GetGroups`,
			params: { taskId },
		};

		const response: AxiosResponse<FoodGroupVoItem[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 分页查询商品列表 */
	async QueryFoodsPage(parms: QueryFoodsParms): Promise<PageResultVo<FoodItemVo>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/QueryFoodsPage`,
			data: parms,
		};

		const response: AxiosResponse<PageResultVo<FoodItemVo>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量更新商品名称 */
	async UpdateFoodName(parms: UpdateFoodNameParms): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/UpdateFoodName`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量更新商品折扣信息 */
	async UpdateFoodDiscount(parms: UpdateFoodDiscountParms): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/UpdateFoodDiscount`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量更新商品价格 */
	async UpdateFoodPrice(parms: UpdateFoodPriceParms): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/UpdateFoodPrice`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新商品上下架状态 */
	async UpdateFoodState(parms: UpdateFoodStateParms): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/UpdateFoodState`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新商品库存 */
	async UpdateFoodStock(parms: UpdateFoodStockParms): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/UpdateFoodStock`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新商品图片边框 */
	async UpdateFoodImageBorder(parms: UpdateFoodImageBorderParms): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/UpdateFoodImageBorder`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量删除商品 */
	async DeleteFoods(parms: DeleteFoodsParms): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/DeleteFoods`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 下架商品折扣 */
	async OfflineDiscount(parms: OfflineDiscountParms): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/OfflineDiscount`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量更新最小购买数 */
	async UpdateFoodMinBuy(parms: UpdateMinBuyParms): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/UpdateFoodMinBuy`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除第一张主图 */
	async DeleteFirstFoodImage(parms: DeleteFirstFoodImageParms): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/DeleteFirstFoodImage`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 恢复商品 */
	async RecoverFoods(parms: RecoverFoodParms): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodManage/RecoverFoods`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}

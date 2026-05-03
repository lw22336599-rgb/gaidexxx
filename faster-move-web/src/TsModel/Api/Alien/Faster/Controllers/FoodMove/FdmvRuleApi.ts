/**
 * FdmvRule API 请求类
 * 命名空间: Alien.Faster.Controllers.FoodMove
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {AddFdmvRuleParmsVo} from "@/TsModel/Alien/Faster/Controllers/FoodMove/AddFdmvRuleParmsVo";
import {ConnectRuleGroupParmsVo} from "@/TsModel/Alien/Faster/Controllers/FoodMove/ConnectRuleGroupParmsVo";
import {GetFdmvRuleListParmsVo} from "@/TsModel/Alien/Faster/Controllers/FoodMove/GetFdmvRuleListParmsVo";
import {RuleForType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/RuleForType";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {t_wmt_fc_fdmv_rule} from "@/TsModel/Alien/Entity/Tables/function/food_move/t_wmt_fc_fdmv_rule";
import {UpdateFdmvRuleParmsVo} from "@/TsModel/Alien/Faster/Controllers/FoodMove/UpdateFdmvRuleParmsVo";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

/** 商品复制规则管理接口 */
export class FdmvRuleApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 添加商品复制规则 */
	async AddRule(/** 规则信息 */
		rule: AddFdmvRuleParmsVo): Promise<t_wmt_fc_fdmv_rule> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FdmvRule/AddRule`,
			data: rule,
		};

		const response: AxiosResponse<t_wmt_fc_fdmv_rule> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新商品复制规则 */
	async UpdateRule(/** 规则信息 */
		rule: UpdateFdmvRuleParmsVo): Promise<boolean> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FdmvRule/UpdateRule`,
			data: rule,
		};

		const response: AxiosResponse<boolean> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除商品复制规则 */
	async DeleteRule(/** 规则ID */
		id: string): Promise<boolean> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FdmvRule/DeleteRule`,
			params: { id },
		};

		const response: AxiosResponse<boolean> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量删除商品复制规则 */
	async DeleteRules(/** 规则ID列表 */
		ids: string[]): Promise<boolean> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FdmvRule/DeleteRules`,
			data: ids,
		};

		const response: AxiosResponse<boolean> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取商品复制规则列表（分页） */
	async GetRuleList(/** 查询参数 */
		parms: GetFdmvRuleListParmsVo): Promise<PageResultVo<t_wmt_fc_fdmv_rule>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FdmvRule/GetRuleList`,
			data: parms,
		};

		const response: AxiosResponse<PageResultVo<t_wmt_fc_fdmv_rule>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 根据ID获取规则详情 */
	async GetRuleById(/** 规则ID */
		id: string): Promise<t_wmt_fc_fdmv_rule> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FdmvRule/GetRuleById`,
			params: { id },
		};

		const response: AxiosResponse<t_wmt_fc_fdmv_rule> = await this.axiosInstance(config);
		return response.data;
	}

	/** 将规则加入到分组 */
	async ConnectGroup(/** 分组参数 */
		parms: ConnectRuleGroupParmsVo): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FdmvRule/ConnectGroup`,
			data: parms,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 将规则移出分组 */
	async RemoveGroup(/** 分组参数 */
		parms: ConnectRuleGroupParmsVo): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FdmvRule/RemoveGroup`,
			data: parms,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取指定店铺类型的所有规则 */
	async GetRulesByShopType(/** 店铺类型 */
		shopType: ShopType, /** 规则类型（可选） */
		forType?: RuleForType): Promise<t_wmt_fc_fdmv_rule[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FdmvRule/GetRulesByShopType`,
			params: { shopType, forType },
		};

		const response: AxiosResponse<t_wmt_fc_fdmv_rule[]> = await this.axiosInstance(config);
		return response.data;
	}

}

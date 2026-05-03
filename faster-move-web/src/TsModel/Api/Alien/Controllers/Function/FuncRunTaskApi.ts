/**
 * FuncRunTask API 请求类
 * 命名空间: Alien.Controllers.Function
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {FoodGroupItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem";
import {FuncConfSchemaResult} from "@/TsModel/Alien/Controllers/Function/FuncConfSchemaResult";
import {GetFuncConfSchemasParm} from "@/TsModel/Alien/Controllers/Function/GetFuncConfSchemasParm";
import {GetFuncJobInfoPageParm} from "@/TsModel/Alien/Controllers/Function/GetFuncJobInfoPageParm";
import {GetFuncRunTaskPageParm} from "@/TsModel/Alien/Controllers/Function/GetFuncRunTaskPageParm";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {t_ls_job_info} from "@/TsModel/Alien/Entity/Tables/Job/t_ls_job_info";
import {t_wmt_func_run_task} from "@/TsModel/Alien/Entity/Tables/function/t_wmt_func_run_task";
import {TriggerFuncRunParm} from "@/TsModel/Alien/Controllers/Function/TriggerFuncRunParm";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

/** 功能执行中心 - 管理续费后自动执行的功能任务 */
export class FuncRunTaskApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取店铺分组列表（Redis 缓存 1 小时） */
	async GetShopGroups(/** 店铺ID */
		shopId: string): Promise<FoodGroupItem[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FuncRunTask/GetShopGroups`,
			params: { shopId },
		};

		const response: AxiosResponse<FoodGroupItem[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取功能配置项的 JSON Schema，前端据此生成参数输入表单 */
	async GetFuncConfSchema(/** 店铺类型 */
		shopType: ShopType, /** 功能代码 */
		funcCode: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FuncRunTask/GetFuncConfSchema`,
			params: { shopType, funcCode },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量获取多个功能的 JSON Schema 及续费后是否自动执行标志 */
	async GetFuncConfSchemas(/** 查询参数 */
		parm: GetFuncConfSchemasParm): Promise<FuncConfSchemaResult[]> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FuncRunTask/GetFuncConfSchemas`,
			data: parm,
		};

		const response: AxiosResponse<FuncConfSchemaResult[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 分页查询功能执行任务列表 */
	async GetFuncRunTaskPage(parm: GetFuncRunTaskPageParm): Promise<PageResultVo<t_wmt_func_run_task>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FuncRunTask/GetFuncRunTaskPage`,
			data: parm,
		};

		const response: AxiosResponse<PageResultVo<t_wmt_func_run_task>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 分页查询功能执行中心的 Hangfire 任务执行情况（来自 t_ls_job_info） */
	async GetFuncJobInfoPage(parm: GetFuncJobInfoPageParm): Promise<PageResultVo<t_ls_job_info>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FuncRunTask/GetFuncJobInfoPage`,
			data: parm,
		};

		const response: AxiosResponse<PageResultVo<t_ls_job_info>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 手动触发功能执行:为指定店铺列表重新创建任务记录并提交后台执行 */
	async TriggerFuncRun(parm: TriggerFuncRunParm): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FuncRunTask/TriggerFuncRun`,
			data: parm,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

}

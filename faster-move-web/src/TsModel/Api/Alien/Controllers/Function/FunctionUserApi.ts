/**
 * FunctionUser API 请求类
 * 命名空间: Alien.Controllers.Function
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {BatchEnable_func_parm} from "@/TsModel/Alien/Controllers/Function/BatchEnable_func_parm";
import {BatchOperationResult} from "@/TsModel/Alien/Entity/Function/BatchOperationResult";
import {BatchSetConf_func_parm} from "@/TsModel/Alien/Entity/Function/BatchSetConf_func_parm";
import {Call_func_parm} from "@/TsModel/Alien/Entity/Function/Call_func_parm";
import {Call_parm} from "@/TsModel/Alien/Entity/Function/Call_parm";
import {CallFuinctionParms} from "@/TsModel/Alien/Controllers/Function/CallFuinctionParms";
import {Enable_func_parm} from "@/TsModel/Alien/Controllers/Function/Enable_func_parm";
import {Get_FunctionLog_parm} from "@/TsModel/Alien/Entity/Function/Get_FunctionLog_parm";
import {GetConf_func_parm} from "@/TsModel/Alien/Entity/Function/GetConf_func_parm";
import {GetConf_func_res} from "@/TsModel/Alien/Entity/Function/GetConf_func_res";
import {SetConf_func_parm} from "@/TsModel/Alien/Entity/Function/SetConf_func_parm";

export class FunctionUserApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 启用或关闭功能,如启用IM回复,启用出餐助手 */
	async Enable_func(parmObj: Enable_func_parm): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionUser/Enable_func`,
			data: parmObj,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 执行功能的Call 非Start(哪怕没续费) */
	async CallFunction(parms: CallFuinctionParms): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionUser/CallFunction`,
			data: parms,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 向功能更新配置 */
	async SetConf_func(parmObj: SetConf_func_parm): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionUser/SetConf_func`,
			data: parmObj,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量启用或关闭功能 */
	async BatchEnable_func(parmObj: BatchEnable_func_parm): Promise<BatchOperationResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionUser/BatchEnable_func`,
			data: parmObj,
		};

		const response: AxiosResponse<BatchOperationResult> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量更新功能配置 */
	async BatchSetConf_func(parmObj: BatchSetConf_func_parm): Promise<BatchOperationResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionUser/BatchSetConf_func`,
			data: parmObj,
		};

		const response: AxiosResponse<BatchOperationResult> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取功能的配置项 */
	async GetConf_func(parmObj: GetConf_func_parm): Promise<GetConf_func_res> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionUser/GetConf_func`,
			data: parmObj,
		};

		const response: AxiosResponse<GetConf_func_res> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获得功能信息(包含基本信息,功能设置,日志等) */
	async GetFuncInfo(/** 功能code */
		funcCode: string, shopId: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FunctionUser/GetFuncInfo`,
			params: { funcCode, shopId },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取功能项日志 */
	async GetLog(parm: Get_FunctionLog_parm): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionUser/GetLog`,
			data: parm,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 从客户端执行某店铺的功能中的某个方法（动图上传等） */
	async Call(parm: Call_parm): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionUser/Call`,
			data: parm,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 调用功能的 Call 方法，通过 GetUserFunc 校验权限，经 OrleansHelper.GetFunctionGrain 获取 Grain 后调用 CallAsync */
	async Call_func(parm: Call_func_parm): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FunctionUser/Call_func`,
			data: parm,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}

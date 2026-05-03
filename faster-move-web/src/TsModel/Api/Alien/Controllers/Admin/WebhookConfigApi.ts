/**
 * WebhookConfig API 请求类
 * 命名空间: Alien.Controllers.Admin
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {AddWebhookInput} from "@/TsModel/Alien/Controllers/Admin/AddWebhookInput";
import {TestWebhookInput} from "@/TsModel/Alien/Controllers/Admin/TestWebhookInput";
import {ToggleWebhookInput} from "@/TsModel/Alien/Controllers/Admin/ToggleWebhookInput";
import {UpdateWebhookInput} from "@/TsModel/Alien/Controllers/Admin/UpdateWebhookInput";
import {WebhookConfigVo} from "@/TsModel/Alien/Controllers/Admin/WebhookConfigVo";
import {WebhookTestResult} from "@/TsModel/Alien/Controllers/Admin/WebhookTestResult";
import {WebhookTypeInfo} from "@/TsModel/Alien/Controllers/Admin/WebhookTypeInfo";

/** Webhook 配置管理接口
用于用户配置店铺掉线通知的 Webhook 地址 */
export class WebhookConfigApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取当前用户的所有 Webhook 配置 */
	async GetMyWebhooks(): Promise<WebhookConfigVo[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/WebhookConfig/GetMyWebhooks`,
		};

		const response: AxiosResponse<WebhookConfigVo[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 添加 Webhook 配置 */
	async AddWebhook(/** Webhook 配置信息 */
		input: AddWebhookInput): Promise<WebhookConfigVo> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/WebhookConfig/AddWebhook`,
			data: input,
		};

		const response: AxiosResponse<WebhookConfigVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新 Webhook 配置 */
	async UpdateWebhook(/** 更新的配置信息 */
		input: UpdateWebhookInput): Promise<WebhookConfigVo> {
		const config: AxiosRequestConfig = {
			method: 'PUT',
			url: `${this.baseUrl}/WebhookConfig/UpdateWebhook`,
			data: input,
		};

		const response: AxiosResponse<WebhookConfigVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除 Webhook 配置 */
	async DeleteWebhook(/** 配置ID */
		id: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'DELETE',
			url: `${this.baseUrl}/WebhookConfig/DeleteWebhook`,
			params: { id },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 启用/禁用 Webhook */
	async ToggleWebhook(/** 配置ID和启用状态 */
		input: ToggleWebhookInput): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/WebhookConfig/ToggleWebhook`,
			data: input,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 Webhook 连通性
发送一条测试消息到指定的 Webhook */
	async TestWebhook(/** 测试参数 */
		input: TestWebhookInput): Promise<WebhookTestResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/WebhookConfig/TestWebhook`,
			data: input,
		};

		const response: AxiosResponse<WebhookTestResult> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取支持的 Webhook 类型列表 */
	async GetWebhookTypes(): Promise<WebhookTypeInfo[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/WebhookConfig/GetWebhookTypes`,
		};

		const response: AxiosResponse<WebhookTypeInfo[]> = await this.axiosInstance(config);
		return response.data;
	}

}

/**
 * SystemConfig API 请求类
 * 命名空间: Alien.Controllers.Function
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {SystemConfigAllDto} from "@/TsModel/Alien/Entity/Function/SystemConfig/SystemConfigAllDto";
import {SystemConfigUpdateDto} from "@/TsModel/Alien/Entity/Function/SystemConfig/SystemConfigUpdateDto";

/** 系统配置管理接口 */
export class SystemConfigApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取系统配置整体实体（前端初始化时一次性获取，匿名可访问） */
	async GetAllConfig(): Promise<SystemConfigAllDto> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/api/system-config/init`,
		};

		const response: AxiosResponse<SystemConfigAllDto> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新系统配置整体实体（仅管理员） */
	async UpdateAllConfig(dto: SystemConfigAllDto): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'PUT',
			url: `${this.baseUrl}/api/system-config/UpdateAllConfig`,
			data: dto,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 初始化默认系统配置（仅管理员，如果配置不存在则创建） */
	async InitDefaultConfigs(): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/api/system-config/init-default`,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 根据 key 获取配置值 */
	async GetConfigByKey(/** 配置键 */
		key: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/api/system-config/${key}`,
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 根据 key 更新或创建配置（仅管理员） */
	async UpdateConfigByKey(/** 配置键 */
		key: string, /** 配置数据（包含配置值和可选的描述） */
		dto: SystemConfigUpdateDto): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'PUT',
			url: `${this.baseUrl}/api/system-config/${key}`,
			data: dto,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

}

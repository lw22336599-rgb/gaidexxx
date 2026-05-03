/**
 * Tool API 请求类
 * 命名空间: Alien.Controllers.Function
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ToolItemCreateDto} from "@/TsModel/Alien/Entity/Function/Tool/ToolItemCreateDto";
import {ToolItemDto} from "@/TsModel/Alien/Entity/Function/Tool/ToolItemDto";
import {ToolItemSortDto} from "@/TsModel/Alien/Entity/Function/Tool/ToolItemSortDto";
import {ToolItemStatusDto} from "@/TsModel/Alien/Entity/Function/Tool/ToolItemStatusDto";
import {ToolItemUpdateDto} from "@/TsModel/Alien/Entity/Function/Tool/ToolItemUpdateDto";

/** 工具功能管理接口 */
export class ToolApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取工具列表（按店铺类型过滤，匿名可访问） */
	async GetList(shopType: ShopType): Promise<ToolItemDto[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/api/tool/list`,
			params: { shopType },
		};

		const response: AxiosResponse<ToolItemDto[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 新增工具（仅管理员） */
	async Create(dto: ToolItemCreateDto): Promise<ToolItemDto> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/api/tool/Create`,
			data: dto,
		};

		const response: AxiosResponse<ToolItemDto> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量新增工具（仅管理员，按名称去重已存在的忽略） */
	async CreateBatch(items: ToolItemCreateDto[]): Promise<ToolItemDto[]> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/api/tool/batch`,
			data: items,
		};

		const response: AxiosResponse<ToolItemDto[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新工具（仅管理员） */
	async Update(id: string, dto: ToolItemUpdateDto): Promise<ToolItemDto> {
		const config: AxiosRequestConfig = {
			method: 'PUT',
			url: `${this.baseUrl}/api/tool/${id}`,
			data: dto,
		};

		const response: AxiosResponse<ToolItemDto> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除工具（仅管理员） */
	async Delete(id: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'DELETE',
			url: `${this.baseUrl}/api/tool/${id}`,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 启用/禁用工具（仅管理员） */
	async UpdateStatus(id: string, dto: ToolItemStatusDto): Promise<ToolItemDto> {
		const config: AxiosRequestConfig = {
			method: 'PATCH',
			url: `${this.baseUrl}/api/tool/${id}/status`,
			data: dto,
		};

		const response: AxiosResponse<ToolItemDto> = await this.axiosInstance(config);
		return response.data;
	}

	/** 调整排序（仅管理员） */
	async UpdateSort(id: string, dto: ToolItemSortDto): Promise<ToolItemDto> {
		const config: AxiosRequestConfig = {
			method: 'PATCH',
			url: `${this.baseUrl}/api/tool/${id}/sort`,
			data: dto,
		};

		const response: AxiosResponse<ToolItemDto> = await this.axiosInstance(config);
		return response.data;
	}

}

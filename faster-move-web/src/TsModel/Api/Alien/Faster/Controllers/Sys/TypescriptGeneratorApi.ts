/**
 * TypescriptGenerator API 请求类
 * 命名空间: Alien.Faster.Controllers.Sys
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {GenerateTypescriptRequest} from "@/TsModel/Alien/Faster/Controllers/Sys/GenerateTypescriptRequest";

/** TypeScript生成器控制器 - 开发者专用 */
export class TypescriptGeneratorApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 生成TypeScript类型定义并返回zip文件 */
	async GenerateTypescriptZip(/** 是否包含axios API类 */
		includeAxios: boolean, /** 是否包含模型类型 */
		includeModels: boolean, /** 是否包含枚举类型 */
		includeEnums: boolean, /** 是否生成统一的 ApiManager.ts 文件(默认 false, 传 true 时会在zip中包含该文件) */
		includeApiManager: boolean): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}api/[controller]/generate-typescript-zip`,
			params: { includeAxios, includeModels, includeEnums, includeApiManager },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 生成TypeScript类型定义到指定目录 */
	async GenerateTypescriptToDirectory(/** 生成配置请求体 */
		request: GenerateTypescriptRequest, /** 是否生成统一的 ApiManager.ts 文件(默认 false, 传 true 时会覆盖已有文件) */
		includeApiManager: boolean): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}api/[controller]/GenerateTypescriptToDirectory`,
			data: request,
			params: { includeApiManager },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取生成配置选项 */
	async GetConfig(): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}api/[controller]/config`,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 预览生成的TypeScript内容 */
	async PreviewTypescript(/** 预览类型 (models|api|enums) */
		type: string, /** 是否生成统一的 ApiManager.ts 文件(默认 false, 仅在需要预览该文件内容时设为 true) */
		includeApiManager: boolean): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}api/[controller]/preview`,
			params: { type, includeApiManager },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}

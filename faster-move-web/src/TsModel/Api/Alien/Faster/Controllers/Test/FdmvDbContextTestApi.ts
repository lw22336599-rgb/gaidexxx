/**
 * FdmvDbContextTest API 请求类
 * 命名空间: Alien.Faster.Controllers.Test
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** FdmvDbContext 连接测试控制器
用于测试 FdmvDbContext 中 CopyNew 方法在多线程环境下的连接数占用情况
仅限管理员访问 */
export class FdmvDbContextTestApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 多线程测试 FdmvDbContext 查询方法
并发调用200次，测试 CopyNew 方法在多线程环境下的连接数占用和延时情况 */
	async TestFdmvDbContextConcurrent(/** 店铺类型，默认为美团 */
		shopType: ShopType, /** 并发线程数，默认200 */
		threadCount: number): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FdmvDbContextTest/TestFdmvDbContextConcurrent`,
			params: { shopType, threadCount },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	async TestHttp(): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FdmvDbContextTest/TestHttp`,
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	async GetDeadlock(): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FdmvDbContextTest/GetDeadlock`,
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	async TestAsyncLazy(): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/FdmvDbContextTest/TestAsyncLazy`,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试主数据库连接的SQL延时查询
获取主数据库连接后，执行一个延时30秒的SQL查询，用于测试连接占用情况
PostgreSQL 使用 pg_sleep 函数实现SQL层面的延时，会阻塞数据库连接指定的秒数 */
	async TestFdmvDbSqlDelay(/** SQL延时秒数，默认30秒 */
		delaySeconds: number): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FdmvDbContextTest/TestFdmvDbSqlDelay`,
			params: { delaySeconds },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}

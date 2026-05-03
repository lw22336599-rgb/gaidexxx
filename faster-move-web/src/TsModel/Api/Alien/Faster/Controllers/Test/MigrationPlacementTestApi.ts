/**
 * MigrationPlacementTest API 请求类
 * 命名空间: Alien.Faster.Controllers.Test
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/** Grain放置策略和主动迁移测试控制器
用于测试CostOptimizedPlacement策略和三种迁移策略
仅限管理员访问 */
export class MigrationPlacementTestApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取所有Silo的指标 */
	async GetAllSiloMetricsAsync(): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/MigrationPlacementTest/GetAllSiloMetrics`,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取指定Silo的过载事件数 */
	async GetOverloadEventCountAsync(siloAddress: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/MigrationPlacementTest/GetOverloadEventCount`,
			params: { siloAddress },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取等待中的Grain列表 */
	async GetWaitingGrainsAsync(siloAddress: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/MigrationPlacementTest/GetWaitingGrains`,
			params: { siloAddress },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取今日迁移统计 */
	async GetMigrationStatsAsync(date?: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/MigrationPlacementTest/GetMigrationStats`,
			params: { date },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 清理Redis中的测试数据 */
	async CleanupTestDataAsync(): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/MigrationPlacementTest/CleanupTestData`,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 从多数据库中查询京东前N个已开启的功能,计算出grainKey并通过Grain调用加入到等待中 */
	async BatchAddJdWaitingGrainsAsync(/** 查询数量,默认100 */
		count: number): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/MigrationPlacementTest/BatchAddJdWaitingGrains`,
			params: { count },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}

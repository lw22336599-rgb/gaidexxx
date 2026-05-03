/**
 * TestGrainLoadTest API 请求类
 * 命名空间: Alien.Faster.Controllers.Test
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** TestGrain 负载测试控制器
用于测试 silo 的负载逻辑和等待队列情况
主要目标：研究动态负载的可能性，比如不固定 MaxEnqueuedRequestsHardLimit 值，
而是判断等待队列过长才进行拒绝
仅限管理员调用 */
export class TestGrainLoadTestApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 创建/激活 TestGrain 实例
实例创建后会在后台运行（定时器会保持实例激活状态） */
	async CreateInstance(/** Grain 键值，用于标识不同的测试实例 */
		grainKey: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/TestGrainLoadTest/CreateInstance`,
			params: { grainKey },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 调用 Test1 方法（非回调方法）
该方法会延迟 3 秒，用于测试等待队列情况
可以通过多次调用此方法来观察队列堆积情况 */
	async CallTest1(/** Grain 键值 */
		grainKey: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/TestGrainLoadTest/CallTest1`,
			params: { grainKey },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 调用 RetTest2 方法（非回调方法，立即返回）
用于快速测试，不会造成队列堆积 */
	async CallRetTest2(/** Grain 键值 */
		grainKey: string, /** 返回值内容 */
		retVal: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/TestGrainLoadTest/CallRetTest2`,
			params: { grainKey, retVal },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量调用 Test1 方法，用于测试队列堆积情况
可以观察当队列过长时，Orleans 是否会拒绝请求 */
	async BatchCallTest1(/** Grain 键值 */
		grainKey: string, /** 调用次数，默认 10 次 */
		count: number, /** 每次调用之间的延迟（毫秒），默认 0（立即连续调用） */
		delayMs: number): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/TestGrainLoadTest/BatchCallTest1`,
			params: { grainKey, count, delayMs },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 并发调用 Test1 方法，用于测试高并发情况下的队列处理 */
	async ConcurrentCallTest1(/** Grain 键值 */
		grainKey: string, /** 并发数，默认 10 */
		concurrency: number): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/TestGrainLoadTest/ConcurrentCallTest1`,
			params: { grainKey, concurrency },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取当前并发任务数（用于监控队列情况） */
	async GetActiveTaskCount(/** Grain 键值 */
		grainKey: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/TestGrainLoadTest/GetActiveTaskCount`,
			params: { grainKey },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 混合调用测试：同时调用 Test1（延迟方法）和 RetTest2（快速方法）
用于观察不同类型方法在队列中的处理情况 */
	async MixedCallTest(/** Grain 键值 */
		grainKey: string, /** Test1 调用次数 */
		test1Count: number, /** RetTest2 调用次数 */
		retTest2Count: number): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/TestGrainLoadTest/MixedCallTest`,
			params: { grainKey, test1Count, retTest2Count },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 启动长时间运行的任务，用于模拟队列积压导致消息过期
执行指定分钟数，期间会阻塞队列，导致后续请求在队列中等待
当等待时间超过 Orleans 消息过期时间（通常 5-10 分钟）时，会触发 "Dropping expired message" 错误 */
	async StartLongRunningTask(/** Grain 键值 */
		grainKey: string, /** 执行时长（分钟），默认 10 分钟 */
		minutes: number): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/TestGrainLoadTest/StartLongRunningTask`,
			params: { grainKey, minutes },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量发送请求，用于模拟队列积压场景
从外部客户端快速发送大量请求到同一个 Grain，导致队列积压
配合 StartLongRunningTask 使用，可以让后续请求在队列中等待很长时间
当等待时间超过消息过期时间时，会触发 "Dropping expired message" 错误
            
注意：此方法从外部客户端发送请求，确保请求真正经过 Orleans 消息系统 */
	async SimulateQueueBacklog(/** 目标 Grain 键值，向此 Grain 发送请求。如果为空，则使用随机 grainKey */
		targetGrainKey: string, /** 发送的请求数量，默认 10000 */
		count: number, /** 每个请求之间的延迟（毫秒），默认 10 毫秒 */
		delayBetweenRequests: number): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/TestGrainLoadTest/SimulateQueueBacklog`,
			params: { targetGrainKey, count, delayBetweenRequests },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 复现消息过期错误的完整测试场景
1. 先启动一个长时间运行的任务（阻塞队列）
2. 然后从外部客户端快速发送大量请求到同一个 Grain（这些请求会在队列中等待）
3. 当等待时间超过 Orleans 消息过期时间时，会触发 "Dropping expired message" 错误
            
注意：请求从外部客户端发送，确保请求真正经过 Orleans 消息系统，这样才能复现消息过期错误
            
使用说明：
- 建议先调用此方法启动测试场景
- 然后可以通过 GetActiveTaskCount 和 GetWorkItemGroupQueueInfo 监控队列状态
- 观察日志中的 "Dropping expired message" 错误信息 */
	async ReproduceExpiredMessageError(/** Grain 键值 */
		grainKey: string, /** 长时间运行任务的执行时长（分钟），默认 10 分钟 */
		longRunningMinutes: number, /** 批量请求数量，默认 10000 */
		requestCount: number, /** 每个请求之间的延迟（毫秒），默认 10 毫秒 */
		delayBetweenRequests: number): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/TestGrainLoadTest/ReproduceExpiredMessageError`,
			params: { grainKey, longRunningMinutes, requestCount, delayBetweenRequests },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取 WorkItemGroup 队列深度信息
返回 Orleans 内部 WorkItemGroup 的队列统计信息
用于监控队列积压情况，帮助诊断消息过期问题 */
	async GetWorkItemGroupQueueInfo(/** Grain 键值 */
		grainKey: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/TestGrainLoadTest/GetWorkItemGroupQueueInfo`,
			params: { grainKey },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取指定店铺功能的 grain 并调用 IsRunningAsync 方法
检查功能是否正在运行（轻量级检查，仅返回 bool 值） */
	async GetFunctionGrainIsRunning(/** 店铺类型 */
		shopType: ShopType, /** 功能编码 */
		functionCode: string, /** 店铺ID */
		shopId: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/TestGrainLoadTest/GetFunctionGrainIsRunning`,
			params: { shopType, functionCode, shopId },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}

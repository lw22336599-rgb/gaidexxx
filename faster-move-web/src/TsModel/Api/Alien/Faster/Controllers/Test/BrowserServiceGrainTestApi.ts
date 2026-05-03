/**
 * BrowserServiceGrainTest API 请求类
 * 命名空间: Alien.Faster.Controllers.Test
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {BrowserRequestResult} from "@/TsModel/Alien/Orleans/Interfaces/BrowserRequestResult";
import {BrowserServiceHealthInfo} from "@/TsModel/Alien/Orleans/Interfaces/BrowserServiceHealthInfo";
import {BrowserShopInfo} from "@/TsModel/Alien/Orleans/Interfaces/BrowserShopInfo";
import {HttpRequestItem} from "@/TsModel/Alien/Orleans/Entity/WebView/HttpRequestItem";
import {ShowBrowserRequest} from "@/TsModel/Alien/Orleans/Entity/WebView/ShowBrowserRequest";

/** 浏览器服务 Grain 测试控制器
用于测试 IBrowserServiceGrain 的各种功能
仅限管理员调用 */
export class BrowserServiceGrainTestApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 测试 Ping - 检查店铺浏览器是否在线 */
	async TestPing(/** 店铺ID */
		shopId: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestPing`,
			params: { shopId },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 Initialize - 初始化店铺浏览器 */
	async TestInitialize(/** 店铺初始化请求 */
		request: ShowBrowserRequest): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestInitialize`,
			data: request,
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 InitializeByShopId - 通过店铺ID初始化店铺浏览器
根据店铺ID从数据库查询店铺信息，自动构建初始化请求 */
	async TestInitializeByShopId(/** 店铺ID */
		shopId: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestInitializeByShopId`,
			params: { shopId },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 GetShopInfo - 获取店铺浏览器信息 */
	async TestGetShopInfo(/** 店铺ID */
		shopId: string): Promise<BrowserShopInfo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestGetShopInfo`,
			params: { shopId },
		};

		const response: AxiosResponse<BrowserShopInfo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 Close - 关闭店铺浏览器 */
	async TestClose(/** 店铺ID */
		shopId: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestClose`,
			params: { shopId },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 HttpRequest - 通过浏览器进行 HTTP 请求 */
	async TestHttpRequest(/** 店铺ID */
		shopId: string, /** HTTP 请求参数 */
		request: HttpRequestItem): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestHttpRequest`,
			data: request,
			params: { shopId },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 GetCookie - 获取店铺 Cookie */
	async TestGetCookie(/** 店铺ID */
		shopId: string, /** 店铺信息请求（可选） */
		request?: ShowBrowserRequest): Promise<BrowserRequestResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestGetCookie`,
			data: request,
			params: { shopId },
		};

		const response: AxiosResponse<BrowserRequestResult> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 ExecuteScript - 在浏览器中执行 JavaScript 脚本 */
	async TestExecuteScript(/** 店铺ID */
		shopId: string, /** JavaScript 脚本代码 */
		script: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestExecuteScript`,
			params: { shopId, script },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 Navigate - 跳转到指定地址 */
	async TestNavigate(/** 店铺ID */
		shopId: string, /** 目标 URL 地址 */
		url: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestNavigate`,
			params: { shopId, url },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 GetCookieString - 获取店铺浏览器的 Cookie 字符串 */
	async TestGetCookieString(/** 店铺ID */
		shopId: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestGetCookieString`,
			params: { shopId },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 IsOpen - 检查店铺浏览器是否已打开 */
	async TestIsOpen(/** 店铺ID */
		shopId: string): Promise<boolean> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestIsOpen`,
			params: { shopId },
		};

		const response: AxiosResponse<boolean> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 GetHealthInfo - 获取店铺浏览器健康状态和统计信息 */
	async TestGetHealthInfo(/** 店铺ID */
		shopId: string): Promise<BrowserServiceHealthInfo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestGetHealthInfo`,
			params: { shopId },
		};

		const response: AxiosResponse<BrowserServiceHealthInfo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 综合测试 - 完整测试浏览器服务流程
1. 初始化浏览器
2. 获取店铺信息
3. 检查是否打开
4. 获取健康信息
5. 获取 Cookie
6. 关闭浏览器 */
	async TestFullFlow(/** 店铺初始化请求 */
		request: ShowBrowserRequest): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestFullFlow`,
			data: request,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试执行简单脚本 - 获取页面标题 */
	async TestGetPageTitle(/** 店铺ID */
		shopId: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestGetPageTitle`,
			params: { shopId },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试执行简单脚本 - 获取当前 URL */
	async TestGetCurrentUrl(/** 店铺ID */
		shopId: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestGetCurrentUrl`,
			params: { shopId },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量测试多个店铺的 Ping 状态 */
	async TestBatchPing(/** 店铺ID列表 */
		shopIds: string[]): Promise<Record<string, string>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestBatchPing`,
			data: shopIds,
		};

		const response: AxiosResponse<Record<string, string>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量获取多个店铺的健康状态 */
	async TestBatchHealthInfo(/** 店铺ID列表 */
		shopIds: string[]): Promise<BrowserServiceHealthInfo[]> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/BrowserServiceGrainTest/TestBatchHealthInfo`,
			data: shopIds,
		};

		const response: AxiosResponse<BrowserServiceHealthInfo[]> = await this.axiosInstance(config);
		return response.data;
	}

}

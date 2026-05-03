/**
 * SharBrowserServiceGrainTest API 请求类
 * 命名空间: Alien.Faster.Controllers.Test
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {BrowserRequestResult} from "@/TsModel/Alien/Orleans/Interfaces/BrowserRequestResult";
import {HttpRequestItemSharPage} from "@/TsModel/Alien/Orleans/Entity/WebView/HttpRequestItemSharPage";

/** 共享浏览器服务 Grain 测试控制器
用于测试 ISharBrowserServiceGrain 的各种功能
仅限管理员调用 */
export class SharBrowserServiceGrainTestApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 测试 Initialize - 初始化共享浏览器 */
	async TestInitialize(/** 主页 URL */
		homeUrl: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/SharBrowserServiceGrainTest/TestInitialize`,
			params: { homeUrl },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 Close - 关闭共享浏览器 */
	async TestClose(/** 主页 URL */
		homeUrl: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/SharBrowserServiceGrainTest/TestClose`,
			params: { homeUrl },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 ExecuteScript - 在浏览器中执行 JavaScript 脚本 */
	async TestExecuteScript(/** 主页 URL */
		homeUrl: string, /** JavaScript 脚本代码 */
		script: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/SharBrowserServiceGrainTest/TestExecuteScript`,
			params: { homeUrl, script },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 HttpRequestAsyncOnSharPage - 从共享页面执行 HTTP 请求 */
	async TestHttpRequestOnSharPage(/** 主页 URL */
		homeUrl: string, /** HTTP 请求参数（包含 SetCookieDomanInfos） */
		item: HttpRequestItemSharPage): Promise<BrowserRequestResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/SharBrowserServiceGrainTest/TestHttpRequestOnSharPage`,
			data: item,
			params: { homeUrl },
		};

		const response: AxiosResponse<BrowserRequestResult> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试执行简单脚本 - 获取页面标题 */
	async TestGetPageTitle(/** 主页 URL */
		homeUrl: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/SharBrowserServiceGrainTest/TestGetPageTitle`,
			params: { homeUrl },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试执行简单脚本 - 获取当前 URL */
	async TestGetCurrentUrl(/** 主页 URL */
		homeUrl: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/SharBrowserServiceGrainTest/TestGetCurrentUrl`,
			params: { homeUrl },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试执行简单脚本 - 获取 Cookie 字符串 */
	async TestGetCookieString(/** 主页 URL */
		homeUrl: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/SharBrowserServiceGrainTest/TestGetCookieString`,
			params: { homeUrl },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 综合测试 - 完整测试共享浏览器服务流程
1. 初始化浏览器
2. 执行脚本获取页面标题
3. 执行 HTTP 请求
4. 关闭浏览器 */
	async TestFullFlow(/** 主页 URL */
		homeUrl: string, /** 测试用的 HTTP 请求参数（可选） */
		testRequest?: HttpRequestItemSharPage): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/SharBrowserServiceGrainTest/TestFullFlow`,
			data: testRequest,
			params: { homeUrl },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试并发请求 - 模拟多线程同时请求同一个 HomeUrl */
	async TestConcurrentRequests(/** 主页 URL */
		homeUrl: string, /** 并发数量 */
		concurrentCount: number, /** 请求的 URL */
		requestUrl?: string, /** Cookie 字符串 */
		cookie?: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/SharBrowserServiceGrainTest/TestConcurrentRequests`,
			params: { homeUrl, concurrentCount, requestUrl, cookie },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 Cookie 设置 - 验证 SetCookieDomanInfos 功能 */
	async TestCookieSetting(/** 主页 URL */
		homeUrl: string, /** Cookie 字符串 */
		cookie: string, /** 域名列表（格式：domain1,domain2 或 domain1|url1,domain2|url2） */
		domains?: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/SharBrowserServiceGrainTest/TestCookieSetting`,
			params: { homeUrl, cookie, domains },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量测试多个 HomeUrl 的初始化 */
	async TestBatchInitialize(/** 主页 URL 列表 */
		homeUrls: string[]): Promise<Record<string, string>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/SharBrowserServiceGrainTest/TestBatchInitialize`,
			data: homeUrls,
		};

		const response: AxiosResponse<Record<string, string>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试 InterceptRequestAsync - 拦截请求（通过网页中的 JS hook 二次加工后，在最终发起请求之前拦截并返回请求信息） */
	async TestInterceptRequest(/** 主页 URL */
		homeUrl: string, /** HTTP 请求参数（包含 SetCookieDomanInfos） */
		item: HttpRequestItemSharPage): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/SharBrowserServiceGrainTest/TestInterceptRequest`,
			data: item,
			params: { homeUrl },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 测试拦截请求并对比 - 对比原始请求和拦截到的请求，查看网页中的 JS hook 对请求做了哪些修改 */
	async TestInterceptRequestCompare(/** 主页 URL */
		homeUrl: string, /** 要请求的 URL */
		requestUrl: string, /** 请求方法（GET/POST等） */
		method: string, /** Cookie 字符串 */
		cookie?: string, /** POST 数据（可选） */
		postdata?: string, /** 请求头（可选，JSON 格式） */
		headers?: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/SharBrowserServiceGrainTest/TestInterceptRequestCompare`,
			params: { homeUrl, requestUrl, method, cookie, postdata, headers },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}

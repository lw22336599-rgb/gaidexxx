/**
 * ShopMgCallBack API 请求类
 * 命名空间: Alien.Controllers.Shop
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/** 第三方服务回调专用控制 */
export class ShopMgCallBackApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	async JdCallBack(token: string, user: string, shopId: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMgCallBack/JdCallBack`,
			params: { token, user, shopId },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	async storeQualifyApprova(): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMgCallBack/storeQualifyApprova`,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	async storeCrud(): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMgCallBack/storeCrud`,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	async storeQualifyApproval2Open(): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMgCallBack/storeQualifyApproval2Open`,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	async JdCallMsg(): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMgCallBack/JdCallMsg`,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	async EleCallBack(code: string, state: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopMgCallBack/EleCallBack`,
			params: { code, state },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 饿了么餐饮回调 */
	async EleCallBackLogin(/** 示例值：SplxlOBeZQQYbYS6WxSbIA 授权认证成功后开放平台颁发的授权码，该码的有效期只有10分钟，只能使用一次，过期或多次使用会被授权服务器拒绝。 */
		code: string, /** 应用自定义的值,例如xyz 如果客户端的请求中包含这个参数，认证服务器的回应会原样返回这个参数 */
		state: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopMgCallBack/EleCallBackLogin`,
			params: { code, state },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}

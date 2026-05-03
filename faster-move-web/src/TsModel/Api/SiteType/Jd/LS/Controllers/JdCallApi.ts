/**
 * JdCall API 请求类
 * 命名空间: SiteType.Jd.LS.Controllers
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {GetAuthUrlResult} from "@/TsModel/Alien/Entity/ShopLogin/GetAuthUrlResult";

export class JdCallApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	async AuthCallback(token: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/jd//jdcall/authcallback`,
			params: { token },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	async MessageCallback(token: string, app_key: string, sign: string, timestamp: string, format: string, v: string, jd_param_json: string, encrypt_jd_param_json: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/jd/djsw/MessageCallback`,
			params: { token, app_key, sign, timestamp, format, v, jd_param_json, encrypt_jd_param_json },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	async GetAuthUrl(userId: string): Promise<GetAuthUrlResult> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/jd/GetAuthUrl`,
			params: { userId },
		};

		const response: AxiosResponse<GetAuthUrlResult> = await this.axiosInstance(config);
		return response.data;
	}

	async MsChatMessageCallback(token: string, app_key: string, sign: string, timestamp: string, format: string, v: string, jd_param_json: string, encrypt_jd_param_json: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/jd/djsw/MessageCallback/djsw/msChatMessage`,
			params: { token, app_key, sign, timestamp, format, v, jd_param_json, encrypt_jd_param_json },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	async MsgReadAckCallback(token: string, app_key: string, sign: string, timestamp: string, format: string, v: string, jd_param_json: string, encrypt_jd_param_json: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/jd/djsw/MessageCallback/djsw/msgReadAck`,
			params: { token, app_key, sign, timestamp, format, v, jd_param_json, encrypt_jd_param_json },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}

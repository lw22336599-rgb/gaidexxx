/**
 * AdminGroup API 请求类
 * 命名空间: Alien.Controller
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {AlienGroupParmsVo} from "@/TsModel/Alien/Controller/AlienGroupParmsVo";
import {ConnectAdminGroupVoParms} from "@/TsModel/Alien/Controller/ConnectAdminGroupVoParms";
import {GetAdminListItemInfoVo} from "@/TsModel/Alien/Controller/GetAdminListItemInfoVo";
import {GetAdminListParmsVo} from "@/TsModel/Alien/Controller/GetAdminListParmsVo";
import {t_sc_admin} from "@/TsModel/Alien/Entity/Tables/Users/t_sc_admin";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

/** 子账号分组管理 */
export class AdminGroupApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 将数据加到分组 */
	async ConnectGroup(parms: ConnectAdminGroupVoParms): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/AdminGroup/ConnectGroup`,
			data: parms,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 将店铺移出分组 */
	async RemoveGroup(parms: ConnectAdminGroupVoParms): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/AdminGroup/RemoveGroup`,
			data: parms,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 根据条件获取用户钱表 */
	async GetAdminList(parms: GetAdminListParmsVo): Promise<PageResultVo<GetAdminListItemInfoVo>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/AdminGroup/GetAdminList`,
			data: parms,
		};

		const response: AxiosResponse<PageResultVo<GetAdminListItemInfoVo>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 关联店铺分组列表 */
	async AlienGroup(parms: AlienGroupParmsVo): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/AdminGroup/AlienGroup`,
			data: parms,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取未关联分组或已关联分组的用户 */
	async GetNoGroupAdminList(hasGroup: boolean, page: number, pageSize: number): Promise<PageResultVo<t_sc_admin>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/AdminGroup/GetNoGroupAdminList`,
			params: { hasGroup, page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<t_sc_admin>> = await this.axiosInstance(config);
		return response.data;
	}

}

/**
 * TeamInfo API 请求类
 * 命名空间: Alien.Controllers.Admin
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {t_wmt_team_info} from "@/TsModel/Alien/Entity/Tables/admin/t_wmt_team_info";

/** 团队信息 */
export class TeamInfoApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取团队信息 */
	async GetTeamInfo(): Promise<t_wmt_team_info> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/TeamInfo/GetTeamInfo`,
		};

		const response: AxiosResponse<t_wmt_team_info> = await this.axiosInstance(config);
		return response.data;
	}

	/** 保存团队信息 */
	async SaveTeamInfo(info: t_wmt_team_info): Promise<t_wmt_team_info> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/TeamInfo/SaveTeamInfo`,
			data: info,
		};

		const response: AxiosResponse<t_wmt_team_info> = await this.axiosInstance(config);
		return response.data;
	}

}

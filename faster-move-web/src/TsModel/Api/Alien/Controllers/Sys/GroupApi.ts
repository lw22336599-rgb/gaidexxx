/**
 * Group API 请求类
 * 命名空间: Alien.Controllers.Sys
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {GroupType} from "@/TsModel/Alien/Entity/Enums/GroupType";
import {t_wmt_group} from "@/TsModel/Alien/Entity/Tables/t_wmt_group";
import type { TreeData } from '@/TsModel/Alien/Entity/TreeData';

/** 全局分组管理 */
export class GroupApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 添加分组 */
	async AddGroup(group: t_wmt_group): Promise<t_wmt_group> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Group/AddGroup`,
			data: group,
		};

		const response: AxiosResponse<t_wmt_group> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除分组 */
	async DeleteGroup(/** id */
		id: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Group/DeleteGroup`,
			params: { id },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取分组树 */
	async GetGroups(groupType: GroupType, /** 递归子项 */
		recursionChild: boolean, /** 为空表示顶级 */
		parentId?: string): Promise<TreeData<t_wmt_group>[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Group/GetGroups`,
			params: { groupType, parentId, recursionChild },
		};

		const response: AxiosResponse<TreeData<t_wmt_group>[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新分组 */
	async UpdateGroup(newGroup: t_wmt_group): Promise<t_wmt_group> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Group/UpdateGroup`,
			data: newGroup,
		};

		const response: AxiosResponse<t_wmt_group> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新分组排序 */
	async UpdateGroupIndex(/** 分组id */
		id: string, /** 排序值 */
		index: number): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Group/UpdateGroupIndex`,
			params: { id, index },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

}

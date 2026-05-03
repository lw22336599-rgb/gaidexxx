/**
 * Course API 请求类
 * 命名空间: Alien.Controllers.Admin
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {t_wmt_course} from "@/TsModel/Alien/Entity/Tables/sys/t_wmt_course";
import {t_wmt_group} from "@/TsModel/Alien/Entity/Tables/t_wmt_group";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

/** 教程管理 */
export class CourseApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取教学分类 */
	async GetGroups(): Promise<t_wmt_group[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Course/GetGroups`,
		};

		const response: AxiosResponse<t_wmt_group[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 添加教学 */
	async AddCourse(course: t_wmt_course): Promise<t_wmt_course> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Course/AddCourse`,
			data: course,
		};

		const response: AxiosResponse<t_wmt_course> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除教学 */
	async DeleteCourse(id: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Course/DeleteCourse`,
			params: { id },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新教学 */
	async UpdateCourse(course: t_wmt_course): Promise<t_wmt_course> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Course/UpdateCourse`,
			data: course,
		};

		const response: AxiosResponse<t_wmt_course> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取教学列表 */
	async GetCourses(page: number, pageSize: number, /** 分组,不传代表全部 */
		group?: string): Promise<PageResultVo<t_wmt_course>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Course/GetCourses`,
			params: { group, page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<t_wmt_course>> = await this.axiosInstance(config);
		return response.data;
	}

}

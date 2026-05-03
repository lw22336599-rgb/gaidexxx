/**
 * Calendar API 请求类
 * 命名空间: Alien.Controllers.Business
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {CalendarState} from "@/TsModel/Alien/Entity/Enums/Business/CalendarState";
import {CalendarType} from "@/TsModel/Alien/Entity/Enums/Business/CalendarType";
import {t_biz_calendar} from "@/TsModel/Alien/Entity/Tables/Business/t_biz_calendar";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

export class CalendarApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	async Add(model: t_biz_calendar): Promise<t_biz_calendar> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/system/business/calendar/Add`,
			data: model,
		};

		const response: AxiosResponse<t_biz_calendar> = await this.axiosInstance(config);
		return response.data;
	}

	async Delete(id: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/system/business/calendar/Delete`,
			params: { id },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	async Update(model: t_biz_calendar): Promise<t_biz_calendar> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/system/business/calendar/Update`,
			data: model,
		};

		const response: AxiosResponse<t_biz_calendar> = await this.axiosInstance(config);
		return response.data;
	}

	/** 分页获取列表 */
	async GetList(pageIndex: number, pageSize: number, type: CalendarType, /** 如果为0 将获取全部状态 */
		state: CalendarState): Promise<PageResultVo<t_biz_calendar>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/system/business/calendar/GetList`,
			params: { pageIndex, pageSize, type, state },
		};

		const response: AxiosResponse<PageResultVo<t_biz_calendar>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取列表, 不按优先级排序按创建时间排序. */
	async GetListOrderByCtime(pageIndex: number, pageSize: number, type: CalendarType, state: CalendarState): Promise<PageResultVo<t_biz_calendar>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/system/business/calendar/GetListOrderByCtime`,
			params: { pageIndex, pageSize, type, state },
		};

		const response: AxiosResponse<PageResultVo<t_biz_calendar>> = await this.axiosInstance(config);
		return response.data;
	}

}

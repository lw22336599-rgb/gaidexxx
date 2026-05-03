/**
 * FoodMoveTask API 请求类
 * 命名空间: Alien.Faster.Controllers.FoodMove
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {CreateFdmvTasJobkVo} from "@/TsModel/Alien/Faster/Controllers/FoodMove/CreateFdmvTasJobkVo";
import {GetTaskJobListRequestVo} from "@/TsModel/Alien/Faster/Controllers/FoodMove/GetTaskJobListRequestVo";
import {MarkTaskStateVo} from "@/TsModel/Alien/Faster/Controllers/FoodMove/MarkTaskStateVo";
import {t_wmt_fc_fdmv_task} from "@/TsModel/Alien/Entity/Tables/function/food_move/t_wmt_fc_fdmv_task";
import {TaskJobItemInfoResultVo} from "@/TsModel/Alien/Faster/Controllers/FoodMove/TaskJobItemInfoResultVo";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

/** 商品搬家任务控制器 */
export class FoodMoveTaskApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 创建后台搬家任务 */
	async CreateFdmvTask(vo: CreateFdmvTasJobkVo): Promise<t_wmt_fc_fdmv_task> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodMoveTask/CreateFdmvTask`,
			data: vo,
		};

		const response: AxiosResponse<t_wmt_fc_fdmv_task> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取任务列表 */
	async GetTaskJobList(pageParm: GetTaskJobListRequestVo): Promise<PageResultVo<TaskJobItemInfoResultVo>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodMoveTask/GetTaskJobList`,
			data: pageParm,
		};

		const response: AxiosResponse<PageResultVo<TaskJobItemInfoResultVo>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 取消所有托管任务 */
	async CancelAllJobs(taskId: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodMoveTask/CancelAllJobs`,
			params: { taskId },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除任务及所有相关数据
删除主任务表记录和所有实现IFdmvTaskEntity接口的子表数据 */
	async DeleteTask(/** 任务ID */
		taskId: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodMoveTask/DeleteTask`,
			params: { taskId },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 标记或取消标记任务为需人工处理状态
标记后该任务将不会被自动删除任务清理，需要人工介入处理
取消标记后任务恢复正常状态，可以被自动删除
仅管理员可调用此接口 */
	async MarkTaskAsManualProcessing(/** 标记参数 */
		vo: MarkTaskStateVo): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/FoodMoveTask/MarkTaskAsManualProcessing`,
			data: vo,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

}

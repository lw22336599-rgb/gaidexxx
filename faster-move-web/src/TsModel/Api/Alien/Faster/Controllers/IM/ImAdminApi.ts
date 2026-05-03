/**
 * ImAdmin API 请求类
 * 命名空间: Alien.Faster.Controllers.IM
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {AdminWorkloadVo} from "@/TsModel/Alien/Faster/Controllers/IM/AdminWorkloadVo";
import {ImSessionStatus} from "@/TsModel/Alien/Entity/Enums/IM/ImSessionStatus";
import {ImUserConfigVo} from "@/TsModel/Alien/Faster/Controllers/IM/ImUserConfigVo";
import {MyWorkloadVo} from "@/TsModel/Alien/Faster/Controllers/IM/MyWorkloadVo";
import {OnlineAdminsVo} from "@/TsModel/Alien/Faster/Controllers/IM/OnlineAdminsVo";
import {t_wmt_im_session} from "@/TsModel/Alien/Entity/Tables/IM/t_wmt_im_session";
import {UpdateImConfigVo} from "@/TsModel/Alien/Faster/Controllers/IM/UpdateImConfigVo";
import type { PageResultVo } from '@/TsModel/Alien/Entity/GlobalModel/PageResultVo';

/** IM客服管理控制器
提供在线客服列表、工作负载、当前客服会话列表等功能 */
export class ImAdminApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取在线客服列表
自动从 UserManager 获取当前用户的上级ID，只返回同级在线客服 */
	async GetOnlineAdmins(): Promise<OnlineAdminsVo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/IM/Admin/online`,
		};

		const response: AxiosResponse<OnlineAdminsVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取指定客服的工作负载 */
	async GetAdminWorkload(/** 客服ID（可选，为空则查询当前客服） */
		adminId?: string): Promise<AdminWorkloadVo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/IM/Admin/${adminId}/workload`,
		};

		const response: AxiosResponse<AdminWorkloadVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取当前客服的会话列表（快捷方法） */
	async GetMySessions(/** 页码 */
		page: number, /** 每页数量 */
		pageSize: number, /** 会话状态（可选） */
		status?: ImSessionStatus): Promise<PageResultVo<t_wmt_im_session>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/IM/Admin/me/sessions`,
			params: { status, page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<t_wmt_im_session>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取当前客服的工作负载统计 */
	async GetMyWorkload(): Promise<MyWorkloadVo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/IM/Admin/me/workload`,
		};

		const response: AxiosResponse<MyWorkloadVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 开启IM客服功能
如果当前用户没有客服角色，会自动设置
需要检查上级的 no_auto_kefu 配置，如果上级禁止下级自动开启，则需要报错 */
	async EnableImService(): Promise<boolean> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/IM/Admin/enable-service`,
		};

		const response: AxiosResponse<boolean> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取当前用户的IM配置 */
	async GetImConfig(): Promise<ImUserConfigVo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/IM/Admin/im-config/get`,
		};

		const response: AxiosResponse<ImUserConfigVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新当前用户的IM配置 */
	async UpdateImConfig(/** IM配置参数 */
		parm: UpdateImConfigVo): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/IM/Admin/im-config/save`,
			data: parm,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}

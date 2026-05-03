/**
 * ImQuickReply API 请求类
 * 命名空间: Alien.Faster.Controllers.IM
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {CreateQuickReplyDto} from "@/TsModel/Alien/Faster/Controllers/IM/CreateQuickReplyDto";
import {ImportResultVo} from "@/TsModel/Alien/Faster/Controllers/IM/ImportResultVo";
import {ImportShareCodeDto} from "@/TsModel/Alien/Faster/Controllers/IM/ImportShareCodeDto";
import {QuickReplyVo} from "@/TsModel/Alien/Faster/Controllers/IM/QuickReplyVo";
import {ShareCodeInfoVo} from "@/TsModel/Alien/Faster/Controllers/IM/ShareCodeInfoVo";
import {ShareCodeVo} from "@/TsModel/Alien/Faster/Controllers/IM/ShareCodeVo";
import {UpdateQuickReplyDto} from "@/TsModel/Alien/Faster/Controllers/IM/UpdateQuickReplyDto";
import type { PageResultVo } from '@/TsModel/Alien/Entity/GlobalModel/PageResultVo';

/** IM快捷话术管理控制器
提供话术的增删改查、分类管理、分享码生成和导入功能 */
export class ImQuickReplyApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取所有可用话术（核心接口）
返回当前用户可见的所有话术（个人话术 + 团队话术） */
	async GetQuickReplyList(): Promise<QuickReplyVo[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/IM/QuickReply/list`,
		};

		const response: AxiosResponse<QuickReplyVo[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取团队话术（管理视角）
返回当前用户自己创建的话术 + 所有直属下级创建的话术 */
	async GetTeamQuickReplyList(/** 页码 */
		page: number, /** 每页数量 */
		pageSize: number): Promise<PageResultVo<QuickReplyVo>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/IM/QuickReply/team/list`,
			params: { page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<QuickReplyVo>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 创建话术 */
	async CreateQuickReply(dto: CreateQuickReplyDto): Promise<QuickReplyVo> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/IM/QuickReply/create`,
			data: dto,
		};

		const response: AxiosResponse<QuickReplyVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新话术 */
	async UpdateQuickReply(dto: UpdateQuickReplyDto): Promise<QuickReplyVo> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/IM/QuickReply/update`,
			data: dto,
		};

		const response: AxiosResponse<QuickReplyVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 将个人话术转换为团队话术
话术的所有者将变为当前用户的上级 */
	async ConvertToTeamQuickReply(/** 话术ID */
		id: string): Promise<QuickReplyVo> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/IM/QuickReply/convert-to-team`,
			params: { id },
		};

		const response: AxiosResponse<QuickReplyVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除话术 */
	async DeleteQuickReply(id: string): Promise<boolean> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/IM/QuickReply/delete`,
			params: { id },
		};

		const response: AxiosResponse<boolean> = await this.axiosInstance(config);
		return response.data;
	}

	/** 生成分享码 */
	async CreateShareCode(/** 过期天数（0表示永久有效，默认30天） */
		expireDays: number): Promise<ShareCodeVo> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/IM/QuickReply/share/create`,
			params: { expireDays },
		};

		const response: AxiosResponse<ShareCodeVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取分享码信息（导入前预览） */
	async GetShareCodeInfo(code: string): Promise<ShareCodeInfoVo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/IM/QuickReply/share/info`,
			params: { code },
		};

		const response: AxiosResponse<ShareCodeInfoVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 通过分享码导入话术 */
	async ImportFromShareCode(dto: ImportShareCodeDto): Promise<ImportResultVo> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/IM/QuickReply/share/import`,
			data: dto,
		};

		const response: AxiosResponse<ImportResultVo> = await this.axiosInstance(config);
		return response.data;
	}

}

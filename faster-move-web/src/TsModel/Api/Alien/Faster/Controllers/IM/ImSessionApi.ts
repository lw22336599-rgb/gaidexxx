/**
 * ImSession API 请求类
 * 命名空间: Alien.Faster.Controllers.IM
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {CloseSessionRequest} from "@/TsModel/Alien/Faster/Controllers/IM/CloseSessionRequest";
import {ImSessionStatus} from "@/TsModel/Alien/Entity/Enums/IM/ImSessionStatus";
import {RemarksRequest} from "@/TsModel/Alien/Faster/Controllers/IM/RemarksRequest";
import {ReplyMessageRequest} from "@/TsModel/Alien/Faster/Controllers/IM/ReplyMessageRequest";
import {t_wmt_im_message} from "@/TsModel/Alien/Entity/Tables/IM/t_wmt_im_message";
import {t_wmt_im_session} from "@/TsModel/Alien/Entity/Tables/IM/t_wmt_im_session";
import {TagRequest} from "@/TsModel/Alien/Faster/Controllers/IM/TagRequest";
import {TransferSessionRequest} from "@/TsModel/Alien/Faster/Controllers/IM/TransferSessionRequest";
import type { PageResultVo } from '@/TsModel/Alien/Entity/GlobalModel/PageResultVo';

/** IM会话管理控制器
提供会话列表、详情、消息列表、回复、标签、备注、关闭、转交等功能 */
export class ImSessionApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取会话列表
支持按状态、店铺筛选，分页查询（默认查询当前登录客服的会话） */
	async GetSessionList(/** 页码 */
		page: number, /** 每页数量 */
		pageSize: number, /** 会话状态（可选） */
		status?: ImSessionStatus, /** 仅显示服务中的会话（排除已关闭） */
		onlyServing?: boolean, /** 店铺ID（可选） */
		shopId?: string): Promise<PageResultVo<t_wmt_im_session>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/IM/Session/list`,
			params: { status, onlyServing, shopId, page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<t_wmt_im_session>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取会话详情
仅能获取分配给当前客服的会话 */
	async GetSessionDetail(/** 会话ID */
		id: string): Promise<t_wmt_im_session> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/IM/Session/${id}`,
		};

		const response: AxiosResponse<t_wmt_im_session> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取会话消息列表
仅能获取分配给当前客服的会话的消息 */
	async GetSessionMessages(/** 会话ID */
		sessionId: string, /** 页码 */
		page: number, /** 每页数量 */
		pageSize: number): Promise<PageResultVo<t_wmt_im_message>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/IM/Session/${sessionId}/messages`,
			params: { page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<t_wmt_im_message>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取会话消息列表（游标分页模式）
采用基于时间的游标分页，每次固定返回50条消息，按发送时间倒序排列（最新消息在前）
仅能获取分配给当前客服的会话的消息
性能优势：利用 idx_session_sent 索引，无需计算总数，响应更快 */
	async GetSessionMessagesStream(/** 会话ID */
		sessionId: string, /** 游标时间，获取此时间之前的消息（不包含此时间点）。不传则获取最新50条 */
		beforeTime?: Date): Promise<t_wmt_im_message[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/IM/Session/${sessionId}/messages/stream`,
			params: { beforeTime },
		};

		const response: AxiosResponse<t_wmt_im_message[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 回复客户消息
仅能回复分配给当前客服的会话 */
	async ReplyToCustomer(/** 会话ID */
		sessionId: string, /** 回复请求 */
		request: ReplyMessageRequest): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/IM/Session/${sessionId}/reply`,
			data: request,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 添加会话标签
仅能操作分配给当前客服的会话（服务层已验证权限） */
	async AddTag(/** 会话ID */
		sessionId: string, /** 标签请求 */
		request: TagRequest): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/IM/Session/${sessionId}/tags`,
			data: request,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除会话标签
仅能操作分配给当前客服的会话（服务层已验证权限） */
	async RemoveTag(/** 会话ID */
		sessionId: string, /** 标签 */
		tag: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'DELETE',
			url: `${this.baseUrl}/IM/Session/${sessionId}/tags/${tag}`,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新会话备注
仅能操作分配给当前客服的会话（服务层已验证权限） */
	async UpdateRemarks(/** 会话ID */
		sessionId: string, /** 备注请求 */
		request: RemarksRequest): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'PUT',
			url: `${this.baseUrl}/IM/Session/${sessionId}/remarks`,
			data: request,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 关闭会话
仅能操作分配给当前客服的会话（服务层已验证权限） */
	async CloseSession(/** 会话ID */
		sessionId: string, /** 关闭请求 */
		request: CloseSessionRequest): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/IM/Session/${sessionId}/close`,
			data: request,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 转交会话
仅能转交分配给当前客服的会话，且只能转交给同级客服（服务层已验证所有权限） */
	async TransferSession(/** 会话ID */
		sessionId: string, /** 转交请求 */
		request: TransferSessionRequest): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/IM/Session/${sessionId}/transfer`,
			data: request,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}

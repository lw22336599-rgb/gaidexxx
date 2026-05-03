/**
 * Admin API 请求类
 * 命名空间: Alien.Controllers.Admin
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {AdminFunctionVo} from "@/TsModel/Alien/Entity/Tables/function/AdminFunctionVo";
import {AgencyForgetResVo} from "@/TsModel/Alien/Controllers/Admin/AgencyForgetResVo";
import {AgencyForgetVo} from "@/TsModel/Alien/Controllers/Admin/AgencyForgetVo";
import {AgencyLoginByPhoneAndGaCodeVo} from "@/TsModel/Alien/Controllers/Admin/AgencyLoginByPhoneAndGaCodeVo";
import {AgencyLoginVo} from "@/TsModel/Alien/Controllers/Admin/AgencyLoginVo";
import {AgencyRegVo} from "@/TsModel/Alien/Controllers/Admin/AgencyRegVo";
import {AppUserLoginRes} from "@/TsModel/Alien/Entity/AppUserLoginRes";
import {DisableGoogleAuthenticatorVo} from "@/TsModel/Alien/Controllers/Admin/DisableGoogleAuthenticatorVo";
import {EnableGoogleAuthenticatorRes} from "@/TsModel/Alien/Controllers/Admin/EnableGoogleAuthenticatorRes";
import {GetAgencyInfoVo_Result} from "@/TsModel/Alien/Controllers/Admin/GetAgencyInfoVo_Result";
import {GetGoogleAuthenticatorSecretRes} from "@/TsModel/Alien/Controllers/Admin/GetGoogleAuthenticatorSecretRes";
import {GetUserGoogleAuthCodeRes} from "@/TsModel/Alien/Controllers/Admin/GetUserGoogleAuthCodeRes";
import {GetUserGoogleAuthCodeVo} from "@/TsModel/Alien/Controllers/Admin/GetUserGoogleAuthCodeVo";
import {GiveIntegral_parms} from "@/TsModel/Alien/Controllers/Admin/GiveIntegral_parms";
import {RemoveSubordinateRolesVo} from "@/TsModel/Alien/Controllers/Admin/RemoveSubordinateRolesVo";
import {ResetGoogleAuthenticatorVo} from "@/TsModel/Alien/Controllers/Admin/ResetGoogleAuthenticatorVo";
import {SetSubordinateRolesVo} from "@/TsModel/Alien/Controllers/Admin/SetSubordinateRolesVo";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {t_sc_admin} from "@/TsModel/Alien/Entity/Tables/Users/t_sc_admin";
import {VerifyGoogleAuthenticatorSetupOnLoginVo} from "@/TsModel/Alien/Controllers/Admin/VerifyGoogleAuthenticatorSetupOnLoginVo";
import {VerifyGoogleAuthenticatorSetupVo} from "@/TsModel/Alien/Controllers/Admin/VerifyGoogleAuthenticatorSetupVo";

export class AdminApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 忘记密码(通过 Google Authenticator 验证码重置密码) */
	async AgencyForget(parms: AgencyForgetVo): Promise<AgencyForgetResVo> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/AgencyForget`,
			data: parms,
		};

		const response: AxiosResponse<AgencyForgetResVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获得已要发送的手机验证码(测试权限) */
	async GetPhoneCode(phone: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Admin/GetPhoneCode`,
			params: { phone },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 注册用户 */
	async AgencyReg(parm: AgencyRegVo): Promise<AppUserLoginRes> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/AgencyReg`,
			data: parm,
		};

		const response: AxiosResponse<AppUserLoginRes> = await this.axiosInstance(config);
		return response.data;
	}

	/** 添加用户 */
	async AddUser(/** 手机号 */
		phone: string, is_boss: boolean): Promise<t_sc_admin> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/AddUser`,
			params: { phone, is_boss },
		};

		const response: AxiosResponse<t_sc_admin> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取我的功能列表 */
	async GetMyFunctions(): Promise<AdminFunctionVo[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Admin/GetMyFunctions`,
		};

		const response: AxiosResponse<AdminFunctionVo[]> = await this.axiosInstance(config);
		return response.data;
	}

	async GetMyFunctionsV2(shopType: ShopType): Promise<AdminFunctionVo[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Admin/GetMyFunctionsV2`,
			params: { shopType },
		};

		const response: AxiosResponse<AdminFunctionVo[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 代理登陆 */
	async AgencyLogin(parm: AgencyLoginVo): Promise<AppUserLoginRes> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/AgencyLogin`,
			data: parm,
		};

		const response: AxiosResponse<AppUserLoginRes> = await this.axiosInstance(config);
		return response.data;
	}

	/** 通过手机号和谷歌验证码登录 */
	async AgencyLoginByPhoneAndGaCode(/** 包含手机号和谷歌验证码的参数 */
		parm: AgencyLoginByPhoneAndGaCodeVo): Promise<AppUserLoginRes> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/AgencyLoginByPhoneAndGaCode`,
			data: parm,
		};

		const response: AxiosResponse<AppUserLoginRes> = await this.axiosInstance(config);
		return response.data;
	}

	async UpdateAgency(newAdmin: t_sc_admin): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/UpdateAgency`,
			data: newAdmin,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除代理 */
	async DeleteAgency(agencyId: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/DeleteAgency`,
			params: { agencyId },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 禁用自己 */
	async KillMySelfe(): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/KillMySelfe`,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取代理信息 */
	async GetAgencyInfo(): Promise<GetAgencyInfoVo_Result> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Admin/GetAgencyInfo`,
		};

		const response: AxiosResponse<GetAgencyInfoVo_Result> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取当前用户表信息 */
	async GetUserBaseInfo(): Promise<t_sc_admin> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Admin/GetUserBaseInfo`,
		};

		const response: AxiosResponse<t_sc_admin> = await this.axiosInstance(config);
		return response.data;
	}

	async GiveIntegral(parmObj: GiveIntegral_parms): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/GiveIntegral`,
			data: parmObj,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 启用 Google Authenticator（生成密钥和二维码）
用于已登录用户绑定 */
	async EnableGoogleAuthenticator(): Promise<EnableGoogleAuthenticatorRes> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/EnableGoogleAuthenticator`,
		};

		const response: AxiosResponse<EnableGoogleAuthenticatorRes> = await this.axiosInstance(config);
		return response.data;
	}

	/** 登录时绑定 Google Authenticator（允许匿名访问，需验证用户名和密码） */
	async BindGoogleAuthenticatorOnLogin(/** 包含用户名和密码的参数 */
		parm: AgencyLoginVo): Promise<EnableGoogleAuthenticatorRes> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/BindGoogleAuthenticatorOnLogin`,
			data: parm,
		};

		const response: AxiosResponse<EnableGoogleAuthenticatorRes> = await this.axiosInstance(config);
		return response.data;
	}

	/** 验证 Google Authenticator 设置（首次绑定时验证验证码） */
	async VerifyGoogleAuthenticatorSetup(/** 包含验证码的参数 */
		parm: VerifyGoogleAuthenticatorSetupVo): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/VerifyGoogleAuthenticatorSetup`,
			data: parm,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 登录时验证 Google Authenticator 设置（允许匿名访问，需验证用户名和密码） */
	async VerifyGoogleAuthenticatorSetupOnLogin(/** 包含用户名、密码和验证码的参数 */
		parm: VerifyGoogleAuthenticatorSetupOnLoginVo): Promise<AppUserLoginRes> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/VerifyGoogleAuthenticatorSetupOnLogin`,
			data: parm,
		};

		const response: AxiosResponse<AppUserLoginRes> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取 Google Authenticator 二维码（用于重新绑定） */
	async GetGoogleAuthenticatorQrCode(): Promise<EnableGoogleAuthenticatorRes> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Admin/GetGoogleAuthenticatorQrCode`,
		};

		const response: AxiosResponse<EnableGoogleAuthenticatorRes> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取用户自己的 Google Authenticator 密钥
用于保存到用户电脑上，以便自动计算验证码进行登录 */
	async GetMyGoogleAuthenticatorSecret(): Promise<GetGoogleAuthenticatorSecretRes> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/Admin/GetMyGoogleAuthenticatorSecret`,
		};

		const response: AxiosResponse<GetGoogleAuthenticatorSecretRes> = await this.axiosInstance(config);
		return response.data;
	}

	/** 禁用 Google Authenticator（需要验证当前密码） */
	async DisableGoogleAuthenticator(/** 包含当前密码的参数 */
		parm: DisableGoogleAuthenticatorVo): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/DisableGoogleAuthenticator`,
			data: parm,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 重置指定用户的谷歌验证码（管理员可以重置任何人，非管理员只能重置自己）
清除目标用户的谷歌验证码密钥和启用状态，用户需要重新绑定 */
	async ResetGoogleAuthenticator(/** 包含目标用户ID的参数 */
		parm: ResetGoogleAuthenticatorVo): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/ResetGoogleAuthenticator`,
			data: parm,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取指定用户当前的令牌验证码（仅管理员可用） */
	async GetUserGoogleAuthCode(/** 包含目标用户ID的参数 */
		parm: GetUserGoogleAuthCodeVo): Promise<GetUserGoogleAuthCodeRes> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/GetUserGoogleAuthCode`,
			data: parm,
		};

		const response: AxiosResponse<GetUserGoogleAuthCodeRes> = await this.axiosInstance(config);
		return response.data;
	}

	/** 给下级用户设置角色（只能设置自己拥有的角色，KEFU角色除外，用于IM客服管理，支持批量操作多个用户） */
	async SetSubordinateRoles(/** 包含目标用户ID列表和要设置的单个角色的参数 */
		parm: SetSubordinateRolesVo): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/SetSubordinateRoles`,
			data: parm,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 移除下级用户的角色（只能移除自己拥有的角色，KEFU角色除外，用于IM客服管理，支持批量操作多个用户） */
	async RemoveSubordinateRoles(/** 包含目标用户ID列表和要移除的单个角色的参数 */
		parm: RemoveSubordinateRolesVo): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/Admin/RemoveSubordinateRoles`,
			data: parm,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

}

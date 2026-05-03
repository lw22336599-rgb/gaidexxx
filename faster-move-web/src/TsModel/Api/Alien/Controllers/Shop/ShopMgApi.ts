/**
 * ShopMg API 请求类
 * 命名空间: Alien.Controllers.Shop
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {Add_Shop_Agency_parm} from "@/TsModel/Alien/Entity/ShopLogin/Add_Shop_Agency_parm";
import {BatchAssignShopsResult} from "@/TsModel/Alien/Controllers/Shop/BatchAssignShopsResult";
import {BatchAssignShopsVo} from "@/TsModel/Alien/Controllers/Shop/BatchAssignShopsVo";
import {BatchUnassignShopsResult} from "@/TsModel/Alien/Controllers/Shop/BatchUnassignShopsResult";
import {BatchUnassignShopsVo} from "@/TsModel/Alien/Controllers/Shop/BatchUnassignShopsVo";
import {Delete_Shop_parm} from "@/TsModel/Alien/Controllers/Shop/Delete_Shop_parm";
import {Delete_UnBonding_parm} from "@/TsModel/Alien/Controllers/Shop/Delete_UnBonding_parm";
import {FuncInfo_ResulItem} from "@/TsModel/Alien/Controllers/Shop/FuncInfo_ResulItem";
import {Get_ShopList_parm} from "@/TsModel/Alien/Controllers/Shop/Get_ShopList_parm";
import {GetShopsByOfficeIdsParm} from "@/TsModel/Alien/Controllers/Shop/GetShopsByOfficeIdsParm";
import {GetShopsByOfficeIdsResult} from "@/TsModel/Alien/Controllers/Shop/GetShopsByOfficeIdsResult";
import {Info} from "@/TsModel/Alien/Entity/Function/APPDATA/Info";
import {OfficeAuthResult} from "@/TsModel/Alien/Controllers/Shop/OfficeAuthResult";
import {ShopAuthErrorCount} from "@/TsModel/Alien/Controllers/Shop/ShopAuthErrorCount";
import {ShopComprehensiveStats} from "@/TsModel/Alien/Controllers/Shop/ShopComprehensiveStats";
import {ShopFuncCount} from "@/TsModel/Alien/Controllers/Shop/ShopFuncCount";
import {ShopList_ResulItem_Extra} from "@/TsModel/Alien/Controllers/Shop/ShopList_ResulItem_Extra";
import {ShopList_ResulItem} from "@/TsModel/Alien/Controllers/Shop/ShopList_ResulItem";
import {ShopLoginParms} from "@/TsModel/Alien/Entity/ShopLogin/ShopLoginParms";
import {ShopLoginResult} from "@/TsModel/Alien/Entity/ShopLogin/ShopLoginResult";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ShopUserBindVo} from "@/TsModel/Alien/Controllers/Shop/ShopUserBindVo";
import {t_wmt_shop_list} from "@/TsModel/Alien/Entity/Tables/shop/t_wmt_shop_list";
import {Update_Shop_parm} from "@/TsModel/Alien/Controllers/Shop/Update_Shop_parm";
import {UserAssignedShopVo} from "@/TsModel/Alien/Controllers/Shop/UserAssignedShopVo";
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo';

/** 店铺管理接口 */
export class ShopMgApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 代理添加店铺 */
	async AddShop(parmObj: Add_Shop_Agency_parm): Promise<t_wmt_shop_list> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/AddShop`,
			data: parmObj,
		};

		const response: AxiosResponse<t_wmt_shop_list> = await this.axiosInstance(config);
		return response.data;
	}

	/** 添加店铺,通过邦定码,等于是店铺转让的过程 */
	async BindShop(code: string): Promise<t_wmt_shop_list> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/BindShop`,
			params: { code },
		};

		const response: AxiosResponse<t_wmt_shop_list> = await this.axiosInstance(config);
		return response.data;
	}

	async GetShopCk(id: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopMg/GetShopCk`,
			params: { id },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 转移店铺功能权限时间等 */
	async MoveShopTime(oldShopId: string, newShopId: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/MoveShopTime`,
			params: { oldShopId, newShopId },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 创建店铺绑定码 */
	async CreateBindingCode(shopId: string): Promise<string> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/CreateBindingCode`,
			params: { shopId },
		};

		const response: AxiosResponse<string> = await this.axiosInstance(config);
		return response.data;
	}

	/** 删除店铺。 直接从数据库中移除.应只有管理员能操作 */
	async DeleteShop(parm: Delete_Shop_parm): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/DeleteShop`,
			data: parm,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取店铺数据(营业数据，营业时间，店铺头像，状态等) */
	async GetShopData(shopId: string): Promise<Info> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopMg/GetShopData`,
			params: { shopId },
		};

		const response: AxiosResponse<Info> = await this.axiosInstance(config);
		return response.data;
	}

	/** 置项店铺,因为是按更新时间排序的,所以接口的原理就是改更新时间 */
	async SetShopTop(/** 店铺id */
		shop: string, /** 是否置顶 true:置顶(更新时间往后加一年) false:取消置顶(更新时间置成现在) */
		top: boolean): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/SetShopTop`,
			params: { shop, top },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取绑定的指定店铺的用户列表(必须是最后更新这个店铺ck的人才有权限) */
	async GetShopBindInfo(shop: string): Promise<ShopUserBindVo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopMg/GetShopBindInfo`,
			params: { shop },
		};

		const response: AxiosResponse<ShopUserBindVo> = await this.axiosInstance(config);
		return response.data;
	}

	/** 解除用户对店铺的绑定 */
	async UnShopBind(/** 店铺id */
		shopId: string, /** 用户id */
		shopUserId: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/UnShopBind`,
			params: { shopId, shopUserId },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 设置店铺的登陆用户和密码(如果要取消自动修复,把账号和密码置空) */
	async SetShopUserInfo(/** 店铺id */
		shopId: string, /** 店铺用户名 */
		shopUser: string, /** 店铺密码 */
		shopPwd: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/SetShopUserInfo`,
			params: { shopId, shopUser, shopPwd },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取店铺的功能列表 */
	async GetShopFunctionList(shopId: string): Promise<FuncInfo_ResulItem[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopMg/GetShopFunctionList`,
			params: { shopId },
		};

		const response: AxiosResponse<FuncInfo_ResulItem[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取店铺列表 */
	async GetShopList(parms: Get_ShopList_parm): Promise<PageResultVo<ShopList_ResulItem>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/GetShopList`,
			data: parms,
		};

		const response: AxiosResponse<PageResultVo<ShopList_ResulItem>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 运营版获取 */
	async GetShopListV2(parms: Get_ShopList_parm): Promise<PageResultVo<ShopList_ResulItem_Extra>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/GetShopListV2`,
			data: parms,
		};

		const response: AxiosResponse<PageResultVo<ShopList_ResulItem_Extra>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 根据门店ID批量获取店铺信息（用于导入门店） */
	async GetShopsByOfficeIds(parm: GetShopsByOfficeIdsParm): Promise<GetShopsByOfficeIdsResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/GetShopsByOfficeIds`,
			data: parm,
		};

		const response: AxiosResponse<GetShopsByOfficeIdsResult> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取店铺列表(不过滤功能) */
	async GetShopListAll(parms: Get_ShopList_parm): Promise<PageResultVo<ShopList_ResulItem>> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/GetShopListAll`,
			data: parms,
		};

		const response: AxiosResponse<PageResultVo<ShopList_ResulItem>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 登陆店铺 */
	async LoginShop(parmObj: ShopLoginParms): Promise<ShopLoginResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/LoginShop`,
			data: parmObj,
		};

		const response: AxiosResponse<ShopLoginResult> = await this.axiosInstance(config);
		return response.data;
	}

	/** 解除邦定 */
	async UnBindShop(parm: Delete_UnBonding_parm): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/UnBindShop`,
			data: parm,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 从回收站中恢复店铺 */
	async RecoverBindShop(parm: Delete_UnBonding_parm): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/RecoverBindShop`,
			data: parm,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 更新店铺 */
	async UpdateShop(parm: Update_Shop_parm): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/UpdateShop`,
			data: parm,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	async UpdateShopExtra(parm: Update_Shop_parm): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/UpdateShopExtra`,
			data: parm,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取所有功能的到期信息统计 */
	async GetFuncCount(/** 店铺类型 */
		shopType?: ShopType): Promise<Record<string, ShopFuncCount>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopMg/GetFuncCount`,
			params: { shopType },
		};

		const response: AxiosResponse<Record<string, ShopFuncCount>> = await this.axiosInstance(config);
		return response.data;
	}

	async GetFuncCountV2(shopType: ShopType, funcCode: string): Promise<Record<string, ShopFuncCount>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopMg/ShopMg/GetFuncCountV2`,
			params: { shopType, funcCode },
		};

		const response: AxiosResponse<Record<string, ShopFuncCount>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取各平台授权异常的店铺数量统计 */
	async GetAuthErrorCount(/** 指定平台（可选，为null时统计所有平台） */
		shopType?: ShopType): Promise<ShopAuthErrorCount[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopMg/ShopMg/GetAuthErrorCount`,
			params: { shopType },
		};

		const response: AxiosResponse<ShopAuthErrorCount[]> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取店铺综合统计（授权异常 + 功能到期） */
	async GetComprehensiveStats(/** 店铺类型（可选，为null时统计所有平台） */
		shopType?: ShopType): Promise<ShopComprehensiveStats> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopMg/ShopMg/GetComprehensiveStats`,
			params: { shopType },
		};

		const response: AxiosResponse<ShopComprehensiveStats> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取支持平台支持官方接口时的授权回调信息,前端可调此接口获得授权地址,然后在浏览器中打开 */
	async GetOfficeAuth(shopType: ShopType): Promise<OfficeAuthResult> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopMg/GetOfficeAuth`,
			params: { shopType },
		};

		const response: AxiosResponse<OfficeAuthResult> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量分配店铺给用户
将指定的店铺批量授权给某个用户管理
只能给自己的下级用户分配，且只能分配自己管理的店铺 */
	async BatchAssignShopsToUser(/** 批量分配参数，包含用户ID和店铺ID列表 */
		parms: BatchAssignShopsVo): Promise<BatchAssignShopsResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/BatchAssignShopsToUser`,
			data: parms,
		};

		const response: AxiosResponse<BatchAssignShopsResult> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取未授权给指定用户的店铺列表
用于在批量分配店铺时，显示可以分配给用户的店铺列表
只返回当前用户有权限管理的店铺中，未分配给目标用户的店铺 */
	async GetUnassignedShopsForUser(/** 目标用户ID */
		userId: string, /** 页码 */
		page: number, /** 每页数量 */
		pageSize: number, /** 店铺类型筛选（可选） */
		shopType?: ShopType, /** 店铺名称或ID关键字搜索（可选） */
		keyword?: string): Promise<PageResultVo<UserAssignedShopVo>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopMg/GetUnassignedShopsForUser`,
			params: { userId, page, pageSize, shopType, keyword },
		};

		const response: AxiosResponse<PageResultVo<UserAssignedShopVo>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取指定用户已分配的店铺列表
用于查看某个客服管理了哪些店铺 */
	async GetUserAssignedShops(/** 用户ID */
		userId: string, /** 页码 */
		page: number, /** 每页数量 */
		pageSize: number, /** 店铺类型筛选（可选） */
		shopType?: ShopType): Promise<PageResultVo<UserAssignedShopVo>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/ShopMg/GetUserAssignedShops`,
			params: { userId, page, pageSize, shopType },
		};

		const response: AxiosResponse<PageResultVo<UserAssignedShopVo>> = await this.axiosInstance(config);
		return response.data;
	}

	/** 批量取消用户对店铺的管理权限
将指定的店铺从某个用户的管理列表中移除
只能操作自己的下级用户，且只能取消自己有权限管理的店铺 */
	async BatchUnassignShopsFromUser(/** 批量取消分配参数 */
		parms: BatchUnassignShopsVo): Promise<BatchUnassignShopsResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/ShopMg/BatchUnassignShopsFromUser`,
			data: parms,
		};

		const response: AxiosResponse<BatchUnassignShopsResult> = await this.axiosInstance(config);
		return response.data;
	}

}

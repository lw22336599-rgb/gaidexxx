import {UserType} from "@/TsModel/Alien/Entity/Enums/UserType";
import {OrderByType} from "@/TsModel/SqlSugar/OrderByType";

/** 获取店铺列表参数*/
export interface GetAdminListParmsVo {
		/** 用户类型*/
		userType?: UserType | null;
		/** 如果要取某分组下的(不为空时 this.hasGroup 失效)*/
		groupId?: string | null;
		/** 分页*/
		page: number;
		/** 分页大小*/
		pageSize: number;
		/** 过滤关键词(用户名)*/
		word?: string | null;
		/** 启用或停用*/
		avtag?: boolean | null;
		/** 剩余积分排序方式,如果不传代表不排序*/
		balance_sort?: OrderByType | null;
		/** 过滤角色（用于IM客服管理，筛选指定角色的用户）*/
		role?: string | null;
}

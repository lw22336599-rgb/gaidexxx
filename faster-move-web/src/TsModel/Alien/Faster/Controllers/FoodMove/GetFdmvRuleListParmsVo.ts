import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {RuleForEvent} from "@/TsModel/Alien/Entity/Function/FOODMOVE/RuleForEvent";
import {RuleForType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/RuleForType";

/** 查询规则列表参数*/
export interface GetFdmvRuleListParmsVo {
		/** 分组ID（可选）*/
		groupId?: string | null;
		/** 店铺类型（可选）*/
		shop_type?: ShopType | null;
		/** 针对事件型（可选）*/
		for_evnt?: RuleForEvent | null;
		/** 规则类型（可选）*/
		ForType?: RuleForType | null;
		/** 规则名称（模糊搜索）*/
		name?: string | null;
		/** 是否可用（可选）*/
		avtag?: boolean | null;
		/** 页码*/
		page: number;
		/** 每页条数*/
		pageSize: number;
}

import {Filter} from "@/TsModel/Alien/Controllers/Shop/Filter";
import {OrderDirection} from "@/TsModel/Alien/Controllers/Shop/OrderDirection";

export interface Get_ShopList_parm {
		page: number;
		pageSize: number;
		/** 过滤选项*/
		filter?: Filter | null;
		/** 表示不需要cookies 新版 后面可能要删除*/
		none_ck?: boolean | null;
		/** 排序字段名称*/
		order_by?: string | null;
		/** 排序方向，默认降序*/
		order_direction: OrderDirection;
}

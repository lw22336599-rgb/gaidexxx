import {FuncRunTaskStatus} from "@/TsModel/Alien/Entity/Enums/FuncRunTaskStatus";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 分页查询功能执行任务的请求参数*/
export interface GetFuncRunTaskPageParm {
		/** 页码，从1开始*/
		page: number;
		/** 每页数量，最大100*/
		pageSize: number;
		/** 功能代码（精确匹配，空则不过滤）*/
		func_code?: string | null;
		/** 店铺名称（模糊匹配，空则不过滤）*/
		shop_name?: string | null;
		/** 任务状态（空则不过滤）*/
		run_status?: FuncRunTaskStatus | null;
		/** 店铺类型（空则不过滤）*/
		shop_type?: ShopType | null;
		/** 门店id（精确匹配，空则不过滤）*/
		off_id?: string | null;
}

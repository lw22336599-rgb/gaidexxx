import {t_wmt_shop_list} from "@/TsModel/Alien/Entity/Tables/shop/t_wmt_shop_list";
import {LogType} from "@/TsModel/Alien/Entity/Enums/LogType";

export interface GetLog {
		/** 店铺id*/
		shop: t_wmt_shop_list;
		/** 分页*/
		page: number;
		/** 分页大小*/
		pageSize: number;
		/** 日志类型*/
		LogType: LogType;
		/** 功能编码*/
		FuncCode: string;
		/** 过滤选项- 日志分类*/
		LogName?: string | null;
		/** 消息关键词 - 将用like "%%" 来找*/
		MsgWord?: string | null;
}

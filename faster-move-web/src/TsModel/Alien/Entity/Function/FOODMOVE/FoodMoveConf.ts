import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ActivityType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityType";
import {CreateTaskTypeEnum} from "@/TsModel/Alien/Entity/Enums/CreateTaskTypeEnum";

/** 商品移动配置*/
import {FoodMoveConfBase} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodMoveConfBase";
export interface FoodMoveConf extends FoodMoveConfBase {
		/** 如果没有就是竞对复制  t_wmt_shop_list.id*/
		OldShop?: string | null;
		/** 如果是老到新就是门店id 如果是竞对就是前端指定 如（md5=店铺+地址）*/
		OldShopOffid?: string | null;
		/** 老店类型 竞对模式必填*/
		OldShopType?: ShopType | null;
		/** 竞对店铺时为店铺取个名,*/
		OldShopName?: string | null;
		/** 新店 t_wmt_shop_list.id*/
		NewShop: string;
		/** 开始搬家之前重置新店*/
		ResetNewShop: boolean;
		/** 同步活动列表*/
		SyncActivitys: boolean;
		/** 仅同步这些活动 如果为空就是全部活动*/
		OnlyActivitys?: ActivityType[] | null;
		/** 同步装修*/
		SyncDecoration: boolean;
		/** 最大线程数*/
		MaxThreads: number;
		/** 任务类型*/
		TaskType?: CreateTaskTypeEnum | null;
}

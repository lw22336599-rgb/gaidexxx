import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {FoodStatusType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodStatusType";
import {FoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodItem";
import {FoodType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodType";

import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_wmt_fc_fdmv_food extends BaseSysExTime {
		/** 所属任务ID,关联 t_wmt_fc_fdmv_task.id (多租户隔离字段)*/
		task: string;
		/** 所属店铺*/
		shop?: string | null;
		/** 店铺类型*/
		shop_type: ShopType;
		/** 如果是老到新就是门店id 如果是竞对就是前端指定 如（md5=店铺+地址）*/
		shop_offid: string;
		/** spu id*/
		spu: string;
		/** 商品名称 始终显示的是 this.Food.Name 也就是最新的*/
		food_name?: string | null;
		/** 商品sku 最步价格*/
		price_min?: number | null;
		/** 商品 sku 最低价格*/
		price_max?: number | null;
		/** 当前商品的最大库存*/
		stock_max?: number | null;
		/** 当前商品的最小库存*/
		stock_min?: number | null;
		/** 多规格商品*/
		multi_spec?: boolean | null;
		/** 是否已上架*/
		status?: FoodStatusType | null;
		/** 商品对像*/
		FoodSource: FoodItem;
		/** 编辑后的新商品 放弃sku表 和本表改 如果不为空 最终提交到平台的将会是此对像*/
		FoodUpdate?: FoodItem | null;
		/** 消息 商品批量更改时需要 临时性的办法*/
		Msg?: string | null;
		/** 商品的官方skuid列表*/
		sku_ids?: string | null;
		food_type: FoodType;
		/** 所属第一个分组的官方id*/
		group_offid?: string | null;
}

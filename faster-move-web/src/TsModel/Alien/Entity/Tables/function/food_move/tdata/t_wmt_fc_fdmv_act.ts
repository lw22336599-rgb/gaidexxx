import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ActivityType} from "@/TsModel/Alien/Entity/Function/FOODMOVE/Activities/ActivityType";

/** 店铺活动列表*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
import {IFdmvTaskEntity} from "@/TsModel/Alien/Entity/Interfaces/IFdmvTaskEntity";
export interface t_wmt_fc_fdmv_act extends BaseSysExTime, IFdmvTaskEntity {
		/** 所属任务ID,关联 t_wmt_fc_fdmv_task.id (多租户隔离字段)*/
		task: string;
		/** 所属店铺 竞对店铺没有*/
		shop?: string | null;
		shop_type: ShopType;
		/** 如果是老到新就是门店id 如果是竞对就是前端指定 如（md5=店铺+地址）*/
		shop_offid: string;
		/** 活动官方id*/
		office_id?: string | null;
		/** 活动名称*/
		name: string;
		/** 活动类型*/
		act_type: ActivityType;
		/** 如果活动是关联商品的,哪就是商品的spuid*/
		spu?: string | null;
		/** 如果活动是关联商品的,哪就是商品的skuid 也就是FoodSkuItem.SkuId*/
		sku?: string | null;
		/** 因为是多种类型指定活动类型来序列化*/
		json_data: string;
}

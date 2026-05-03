import {ShopTop} from "@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/ShopTop";
import {ShopWindow} from "@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/ShopWindow";
import {BossRecommend} from "@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/BossRecommend";
import {ShopPoster} from "@/TsModel/Alien/Entity/Function/FOODMOVE/ShopDecorate/ShopPoster";

/** 店铺装修信息*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
import {IFdmvTaskEntity} from "@/TsModel/Alien/Entity/Interfaces/IFdmvTaskEntity";
export interface t_wmt_fc_fdmv_decoration extends BaseSysExTime, IFdmvTaskEntity {
		/** 所属任务ID,关联 t_wmt_fc_fdmv_task.id (多租户隔离字段)*/
		task: string;
		/** 所属店铺 竞对店铺没有*/
		shop?: string | null;
		/** 如果是老到新就是门店id 如果是竞对就是前端指定 如（md5=店铺+地址）*/
		shop_offid: string;
		/** 店铺招牌*/
		Top?: ShopTop | null;
		/** 商品橱窗*/
		ShopWindow?: ShopWindow[] | null;
		/** 老板推荐 饿了么不支持*/
		BossRecommend?: BossRecommend | null;
		/** 菜单海报*/
		Poster?: ShopPoster[] | null;
}

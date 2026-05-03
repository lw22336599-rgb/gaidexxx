import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {ShopState} from "@/TsModel/Alien/Entity/Enums/ShopState";

import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_wmt_shop_list extends BaseSys {
		/** 店铺名称*/
		name: string;
		/** 店铺所在省份*/
		province?: string | null;
		/** 所店铺所在城市*/
		city?: string | null;
		/** 是谁创建的这个店铺(以最后一次更新ck的哪个人为准)*/
		user: string;
		/** 店铺类型*/
		shop_type: ShopType;
		/** 目前只能cookies 用户名和密码备用*/
		shop_user?: string | null;
		/** 店铺密码*/
		shop_pwd?: string | null;
		/** 用于在添加店铺时.判断是否被别账号邦定了*/
		office_id: string;
		/** 添加店铺或更新店铺时. 更新此cookies*/
		cookies: string;
		/** 上次ck更新日期*/
		ck_uptime?: Date | null;
		/** 店铺状态*/
		state: ShopState;
		/** API授权的token*/
		api_token?: string | null;
		/** API授权的状态*/
		api_state?: ShopState | null;
		/** API过期时间*/
		api_extime?: Date | null;
		/** 店铺服务到期时间*/
		EndTime: Date;
		/** 店铺头像*/
		img: string;
		/** 店铺评分*/
		score: number;
		/** 今日预计收入*/
		income?: number | null;
		/** 今日有效订单量*/
		order_num?: number | null;
		/** 曝光人数*/
		show_num?: number | null;
		MgAgencys: string[];
		/** 如果当前店铺是分店，哪么此字段指向主店*/
		MainShop?: string | null;
}

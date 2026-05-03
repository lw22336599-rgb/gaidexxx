import {UV_cus} from "@/TsModel/Alien/Entity/Function/ZNBB/UV_cus";
import {UV_Income} from "@/TsModel/Alien/Entity/Function/ZNBB/UV_Income";
import {UV_Order} from "@/TsModel/Alien/Entity/Function/ZNBB/UV_Order";
import {UV_Traffic} from "@/TsModel/Alien/Entity/Function/ZNBB/UV_Traffic";
import {Uv_Promote} from "@/TsModel/Alien/Entity/Function/ZNBB/Uv_Promote";

/** 智能报表的uv模型*/
export interface ZNBB_UV {
		/** 顾客*/
		Cus: UV_cus;
		/** 营收*/
		Income: UV_Income;
		/** 订单*/
		Order: UV_Order;
		/** 流量*/
		Traffic: UV_Traffic;
		/** 推广*/
		Promote: Uv_Promote;
}

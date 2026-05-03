import {ZNBB_Home} from "@/TsModel/Alien/Entity/Function/ZNBB/ZNBB_Home";
import {ZNBB_AD} from "@/TsModel/Alien/Entity/Function/ZNBB/ZNBB_AD";
import {ZNBB_Repurchase} from "@/TsModel/Alien/Entity/Function/ZNBB/ZNBB_Repurchase";
import {ZNBB_Traffic} from "@/TsModel/Alien/Entity/Function/ZNBB/ZNBB_Traffic";
import {ZNBB_UV} from "@/TsModel/Alien/Entity/Function/ZNBB/ZNBB_UV";
import {ZNBB_Result_Item} from "@/TsModel/Alien/Entity/Function/ZNBB/ZNBB_Result_Item";

/** 智能报表 数据模型*/
export interface ZNBB {
		/** 首页,也就是智能诊断*/
		Home: ZNBB_Home;
		/** 推广*/
		Ad: ZNBB_AD;
		/** 复购*/
		Repurchase: ZNBB_Repurchase;
		/** 流量*/
		Traffic: ZNBB_Traffic;
		/** Uv*/
		Uv: ZNBB_UV;
		/** 诊断结果*/
		Result: ZNBB_Result_Item[];
		/** 所有所有数据都成功了才附值这个*/
		UpTime: Date;
}

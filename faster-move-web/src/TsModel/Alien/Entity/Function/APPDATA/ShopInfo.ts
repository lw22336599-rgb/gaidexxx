import {ShopState} from "@/TsModel/Alien/Entity/Enums/ShopState";
import {DayType} from "@/TsModel/Alien/Entity/Enums/DayType";

/** app 中的店铺信息数据*/
export interface ShopInfo {
		/** 店铺名称*/
		name: string;
		/** 店铺招牌*/
		img: string;
		/** 店铺状态*/
		state: ShopState;
		/** 店铺评分*/
		score: number;
		/** 此店铺的账号名称,非Alien的*/
		user: string;
		/** 店铺地址*/
		shop_addr: string;
		/** 店铺公告*/
		shop_notice: string;
		/** 店铺手机号*/
		shop_phone: string;
		/** 店铺二维码(url地址)*/
		shop_qrcode: string;
		/** 店铺类目*/
		category: string;
		/** 一个周期间,在哪些天营业*/
		week_work: DayType[];
		/** 数据更新时间 一天更新一次*/
		uptime: Date;
}

import {TypeHomeDayType} from "@/TsModel/Alien/Entity/Tables/AppData/TypeHomeDayType";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 首页数据(按天计的)*/
import {BaseSysExTime} from "@/TsModel/Alien/Entity/Tabls/BaseSysExTime";
export interface t_wmt_home_day extends BaseSysExTime {
		/** 年月日的时间戳*/
		date: number;
		/** 针对父账号(下面统计此账号的下一级)*/
		parent: string;
		/** 下级账号*/
		admin?: string | null;
		/** 下级账号的邀请码或团队id*/
		admin_code?: number | null;
		/** 统计类型*/
		data_type: TypeHomeDayType;
		/** 平台类型(可能没有)*/
		site_type?: ShopType | null;
		/** 日志标题*/
		title: string;
		/** 当日数量或上月消耗积分*/
		count: number;
		/** 单位(人,家,单位)*/
		unit: string;
		/** 总计数*/
		total: number;
		/** 相对于前一日*/
		of_yday?: number | null;
}

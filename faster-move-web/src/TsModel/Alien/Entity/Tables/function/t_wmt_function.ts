import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 功能列表要初始化*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_wmt_function extends BaseSys {
		/** 功能排序*/
		index: number;
		shop_type: ShopType;
		code: string;
		name: string;
		notes: string;
		/** 如果为true只要店铺没到期.哪么就会执行*/
		auto_run: boolean;
		/** 多少秒执行 小于2 都代表不自动执行,如果店铺暂停营业。正常就是十分钟一次，到凌晨1点到六点，就是30分钟一次*/
		auto_run_sec: number;
		/** 添加店铺送少天*/
		giving_day: number;
		/** 图标*/
		logo?: string | null;
		/** 教程地址*/
		course?: string | null;
		/** 针对用户的功能非应包括铺*/
		for_admin?: boolean | null;
		/** 依赖的功能代码列表
当开启此功能时，会自动检查并开启这些依赖功能*/
		depend_codes?: string[] | null;
		/** 是否在前端显示续费按钮*/
		show_renew_btn?: boolean | null;
		/** 续费时显示的名称（为空时使用 name）*/
		renew_name?: string | null;
}

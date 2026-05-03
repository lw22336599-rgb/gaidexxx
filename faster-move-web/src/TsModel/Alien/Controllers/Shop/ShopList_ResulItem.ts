import {ShopExtraFuncInfo} from "@/TsModel/Alien/Entity/Tables/shop/ShopExtraFuncInfo";
import {WorkTime_Info} from "@/TsModel/Alien/Entity/Function/APPDATA/WorkTime_Info";

import {t_wmt_shop_list} from "@/TsModel/Alien/Entity/Tables/shop/t_wmt_shop_list";
export interface ShopList_ResulItem extends t_wmt_shop_list {
		/** 功能信息(json)*/
		func_info: ShopExtraFuncInfo[];
		/** 工作时间(json)*/
		work_time: WorkTime_Info;
		/** 分组名*/
		group_name: string;
		is_top: boolean;
}

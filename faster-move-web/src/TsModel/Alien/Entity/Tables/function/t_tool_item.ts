import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 工具功能实体，针对不同目标店铺类型配置可用工具*/
import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_tool_item extends BaseSys {
		/** 目标店铺类型（用于查询过滤）*/
		target_shop_type: ShopType;
		/** 功能标题*/
		name: string;
		/** 功能说明*/
		text: string;
		/** 积分*/
		points: number;
		/** 工具图标*/
		img: string;
		/** 是否显示站点图标*/
		show_site_icon: boolean;
		/** 关联的功能代码列表（系统功能 code 集合）*/
		function_codes: string[];
		/** 可复制的源店铺类型列表（JSON）*/
		from_shop_types: ShopType[];
		/** 教程视频地址*/
		tutorial_url: string;
		/** 排序，数字越小越靠前*/
		sort: number;
}
